"use client";

import { useEffect } from "react";
import { decodeAbiParameters } from "viem";
import { useAccount, useReadContract } from "wagmi";
import { TxStatus } from "@/components/TxStatus";
import { WalletConnect } from "@/components/WalletConnect";
import { EXPECTED_CHAIN_ID, SILENT_RFQ_ABI } from "@/config/contracts";
import { useGatewayReveal } from "@/hooks/useGatewayReveal";
const BYTES32_ZERO =
  "0x0000000000000000000000000000000000000000000000000000000000000000";

function isNotReadyError(msg: string): boolean {
  return (
    msg.includes("not_ready_for_decryption") ||
    msg.includes("not ready") ||
    msg.includes("not allowed on host acl")
  );
}

type Props = {
  rfqAddress: `0x${string}`;
  onSuccess: () => void;
};

export function RevealSection({ rfqAddress, onSuccess }: Props) {
  const { isConnected, chainId } = useAccount();

  const {
    sdkStatus,
    sdkError,
    decryptStatus,
    decryptError,
    decryptResult,
    initSdk,
    requestDecrypt,
    submitReveal,
    resetDecrypt,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    writeError,
  } = useGatewayReveal();

  const isOnExpectedChain = chainId === EXPECTED_CHAIN_ID;

  // Read the encrypted best vendor index handle
  const { data: handle } = useReadContract({
    address: rfqAddress,
    abi: SILENT_RFQ_ABI,
    functionName: "getBestVendorIndex",
  });

  const isHandleZero = !handle || handle === BYTES32_ZERO;

  useEffect(() => {
    if (isSuccess) onSuccess();
  }, [isSuccess, onSuccess]);

  // Decode winner index from SDK result for preview before on-chain confirmation
  let decryptedWinnerIndex: bigint | null = null;
  if (decryptResult?.abiEncodedClearValues) {
    try {
      const [idx] = decodeAbiParameters(
        [{ type: "uint256" }],
        decryptResult.abiEncodedClearValues
      );
      decryptedWinnerIndex = idx;
    } catch {
      // ignore malformed result
    }
  }

  const canDecrypt =
    isConnected &&
    isOnExpectedChain &&
    sdkStatus === "ready" &&
    !isHandleZero &&
    decryptStatus !== "decrypting";

  const canSubmit =
    isConnected &&
    isOnExpectedChain &&
    decryptResult !== null &&
    handle &&
    !isHandleZero &&
    !isPending &&
    !isConfirming;

  return (
    <div className="space-y-4 rounded-2xl border border-indigo-200 bg-indigo-50 p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-indigo-900">Reveal Winner</h2>
      <p className="text-xs text-indigo-700">
        Uses the Zama KMS gateway to publicly decrypt the winning vendor index.
        Requires Sepolia.
      </p>

      {/* Sepolia gate */}
      {!isOnExpectedChain && (
        <p className="rounded-xl border border-orange-200 bg-orange-50 p-3 text-xs text-orange-800">
          Gateway reveal requires Sepolia. Switch your wallet network to proceed.
        </p>
      )}

      {/* Wallet connect */}
      {!isConnected && <WalletConnect />}

      {isConnected && isOnExpectedChain && (
        <div className="space-y-4">
          {/* SDK init */}
          <div className="flex items-center gap-3">
            <button
              onClick={initSdk}
              disabled={
                sdkStatus === "ready" || sdkStatus === "initializing"
              }
              className="rounded-xl border border-indigo-200 bg-white px-3 py-1.5 text-xs hover:bg-indigo-50 disabled:opacity-40 transition-colors"
            >
              {sdkStatus === "initializing"
                ? "Initializing..."
                : "Initialize SDK"}
            </button>
            <span
              className={`text-xs font-medium ${
                sdkStatus === "ready"
                  ? "text-emerald-700"
                  : sdkStatus === "error"
                  ? "text-red-600"
                  : sdkStatus === "initializing"
                  ? "text-indigo-600"
                  : "text-indigo-400"
              }`}
            >
              {sdkStatus === "idle" && "SDK not initialized"}
              {sdkStatus === "initializing" && "Connecting to Zama relayer..."}
              {sdkStatus === "ready" && "SDK ready"}
              {sdkStatus === "error" && `Error: ${sdkError}`}
            </span>
            {sdkStatus === "error" && (
              <button
                onClick={initSdk}
                className="text-xs text-indigo-600 underline"
              >
                Retry
              </button>
            )}
          </div>

          {/* Step 1 — Request decryption */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-indigo-800">
              Step 1 — Request public decryption from Zama KMS
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handle && requestDecrypt(handle as `0x${string}`)}
                disabled={!canDecrypt}
                className="rounded-xl border border-indigo-200 bg-white px-3 py-1.5 text-xs hover:bg-indigo-50 disabled:opacity-40 transition-colors"
              >
                {decryptStatus === "decrypting"
                  ? "Requesting from KMS..."
                  : "Request Decryption"}
              </button>
              {decryptStatus !== "idle" && (
                <button
                  onClick={resetDecrypt}
                  className="text-xs text-indigo-600 underline"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Pre-flight hint */}
            {!canDecrypt && sdkStatus === "ready" && (
              <p className="text-xs text-indigo-500">
                {isHandleZero && "No bids on this RFQ (handle is zero)."}
                {decryptStatus === "decrypting" && "Waiting for KMS response..."}
              </p>
            )}

            {/* Relayer not-ready error */}
            {decryptStatus === "error" && (
              <div className="rounded border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                {isNotReadyError(decryptError) ? (
                  <>
                    <strong>Handle not ready for decryption yet.</strong>
                    <br />
                    The Zama relayer may still be indexing the{" "}
                    <code>finalize()</code> transaction. Wait 30-60 seconds,
                    click Reset, then try again.
                  </>
                ) : (
                  <>Decryption error: {decryptError}</>
                )}
              </div>
            )}

            {/* Decrypt result */}
            {decryptStatus === "done" && decryptResult && (
              <div className="rounded border border-green-200 bg-green-50 p-3 text-xs space-y-1">
                <p className="font-semibold text-green-800">
                  Decryption successful.
                </p>
                {decryptedWinnerIndex !== null && (
                  <p className="text-green-700">
                    Decrypted winner index:{" "}
                    <span className="font-mono font-bold">
                      {decryptedWinnerIndex.toString()}
                    </span>
                  </p>
                )}
                <p className="text-green-600">
                  KMS-signed proof ready. Proceed to Step 2.
                </p>
              </div>
            )}
          </div>

          {/* Step 2 — Submit on-chain */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-indigo-800">
              Step 2 — Submit proof on-chain
            </p>
            <p className="text-xs text-indigo-600">
              Permissionless — any wallet can call this. The contract verifies
              the KMS signatures.
            </p>
            <button
              onClick={() => {
                if (handle && decryptResult) {
                  submitReveal(
                    rfqAddress,
                    handle as `0x${string}`,
                    decryptResult
                  );
                }
              }}
              disabled={!canSubmit}
              className="rounded-xl bg-indigo-700 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-600 disabled:opacity-40 transition-colors"
            >
              {isPending
                ? "Waiting for wallet..."
                : isConfirming
                ? "Confirming..."
                : "Submit callbackRevealWinner"}
            </button>

            <TxStatus
              isPending={isPending}
              isConfirming={isConfirming}
              isSuccess={isSuccess}
              error={writeError}
              hash={hash}
            />
          </div>
        </div>
      )}
    </div>
  );
}
