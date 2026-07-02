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

  const { data: handle } = useReadContract({
    address: rfqAddress,
    abi: SILENT_RFQ_ABI,
    functionName: "getBestVendorIndex",
  });

  const isHandleZero = !handle || handle === BYTES32_ZERO;

  useEffect(() => {
    if (isSuccess) onSuccess();
  }, [isSuccess, onSuccess]);

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
    <div className="rounded-2xl border border-fheBlue/20 bg-fheBlue/[0.05] p-6 space-y-5 shadow-[0_0_30px_rgba(47,107,255,0.06)]">
      <div>
        <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-fheBlueSoft">
          KMS Gateway Decryption
        </p>
        <h2 className="font-display text-lg font-bold text-white">Reveal Winner</h2>
        <p className="mt-1 text-xs text-slate-400">
          Uses the Zama KMS gateway to publicly decrypt the winning vendor index. Requires Sepolia.
        </p>
      </div>

      {!isOnExpectedChain && (
        <div className="rounded-xl border border-zamaYellow/20 bg-zamaYellow/[0.06] p-3 text-xs font-medium text-zamaYellow">
          Gateway reveal requires Sepolia. Switch your wallet network to proceed.
        </div>
      )}

      {!isConnected && <WalletConnect />}

      {isConnected && isOnExpectedChain && (
        <div className="space-y-3">
          {/* SDK init */}
          <div className="rounded-xl border border-fheBlue/20 bg-fheBlue/[0.04] p-4 space-y-3">
            <p className="text-xs font-bold text-fheBlueSoft">Initialize SDK</p>
            <div className="flex items-center gap-3">
              <button
                onClick={initSdk}
                disabled={sdkStatus === "ready" || sdkStatus === "initializing"}
                className="rounded-xl border border-fheBlue/30 bg-fheBlue/[0.10] px-3 py-1.5 text-xs font-semibold text-fheBlueSoft hover:bg-fheBlue hover:text-white disabled:opacity-40 transition-all"
              >
                {sdkStatus === "initializing" ? "Initializing..." : "Initialize SDK"}
              </button>
              <span
                className={`text-xs font-medium ${
                  sdkStatus === "ready"
                    ? "text-emerald-400"
                    : sdkStatus === "error"
                    ? "text-red-400"
                    : sdkStatus === "initializing"
                    ? "text-fheBlueSoft"
                    : "text-slate-600"
                }`}
              >
                {sdkStatus === "idle" && "Not initialized"}
                {sdkStatus === "initializing" && "Connecting to Zama relayer..."}
                {sdkStatus === "ready" && "SDK ready"}
                {sdkStatus === "error" && `Error: ${sdkError}`}
              </span>
              {sdkStatus === "error" && (
                <button onClick={initSdk} className="text-xs text-fheBlueSoft underline">
                  Retry
                </button>
              )}
            </div>
          </div>

          {/* Step 1 */}
          <div className="rounded-xl border border-fheBlue/20 bg-fheBlue/[0.04] p-4 space-y-3">
            <p className="text-xs font-bold text-fheBlueSoft">Step 1 — Request KMS Decryption</p>
            <p className="text-xs text-slate-500">
              Sends the encrypted handle to the Zama KMS gateway for public decryption proof generation.
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handle && requestDecrypt(handle as `0x${string}`)}
                disabled={!canDecrypt}
                className="rounded-xl border border-fheBlue/30 bg-fheBlue/[0.10] px-3 py-1.5 text-xs font-semibold text-fheBlueSoft hover:bg-fheBlue hover:text-white disabled:opacity-40 transition-all"
              >
                {decryptStatus === "decrypting" ? "Requesting from KMS..." : "Request Decryption"}
              </button>
              {decryptStatus !== "idle" && (
                <button onClick={resetDecrypt} className="text-xs text-fheBlueSoft underline">
                  Reset
                </button>
              )}
            </div>

            {!canDecrypt && sdkStatus === "ready" && (
              <p className="text-xs text-slate-600">
                {isHandleZero && "No bids on this RFQ (handle is zero)."}
                {decryptStatus === "decrypting" && "Waiting for KMS response..."}
              </p>
            )}

            {decryptStatus === "error" && (
              <div className="rounded-xl border border-danger/20 bg-danger/[0.06] p-3 text-xs text-red-400">
                {isNotReadyError(decryptError) ? (
                  <>
                    <strong>Handle not ready for decryption yet.</strong>{" "}
                    The Zama relayer may still be indexing the{" "}
                    <code className="font-mono">finalize()</code> transaction. Wait 30–60 seconds,
                    click Reset, then retry.
                  </>
                ) : (
                  <>Decryption error: {decryptError}</>
                )}
              </div>
            )}

            {decryptStatus === "done" && decryptResult && (
              <div className="rounded-xl border border-success/20 bg-success/[0.06] p-3 text-xs space-y-1">
                <p className="font-bold text-emerald-400">Decryption successful.</p>
                {decryptedWinnerIndex !== null && (
                  <p className="text-slate-300">
                    Decrypted winner index:{" "}
                    <span className="font-mono font-bold text-white">
                      {decryptedWinnerIndex.toString()}
                    </span>
                  </p>
                )}
                <p className="text-slate-500">KMS-signed proof ready. Proceed to Step 2.</p>
              </div>
            )}
          </div>

          {/* Step 2 */}
          <div className="rounded-xl border border-fheBlue/20 bg-fheBlue/[0.04] p-4 space-y-3">
            <p className="text-xs font-bold text-fheBlueSoft">Step 2 — Submit Proof On-Chain</p>
            <p className="text-xs text-slate-500">
              Permissionless — any wallet can call this. The contract verifies the KMS signatures
              and records the winner.
            </p>
            <button
              onClick={() => {
                if (handle && decryptResult) {
                  submitReveal(rfqAddress, handle as `0x${string}`, decryptResult);
                }
              }}
              disabled={!canSubmit}
              className="rounded-xl bg-fheBlue px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-600 hover:shadow-[0_0_20px_rgba(47,107,255,0.4)] disabled:opacity-40 transition-all"
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
