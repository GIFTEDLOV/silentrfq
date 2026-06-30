"use client";

import { useEffect, useState } from "react";
import { decodeAbiParameters, isAddress } from "viem";
import { useAccount, useReadContract, useReadContracts } from "wagmi";
import { AddressCopy } from "@/components/AddressCopy";
import { TxStatus } from "@/components/TxStatus";
import { WalletConnect } from "@/components/WalletConnect";
import { SILENT_RFQ_ABI } from "@/config/contracts";
import { useGatewayReveal } from "@/hooks/useGatewayReveal";

const SEPOLIA_CHAIN_ID = 11155111;
const BYTES32_ZERO =
  "0x0000000000000000000000000000000000000000000000000000000000000000";

function chainLabel(id: number | undefined): string {
  if (id === 11155111) return "Sepolia";
  if (id === 31337) return "Hardhat Local";
  if (id) return `chain ${id}`;
  return "—";
}

// The relayer returns this label when makePubliclyDecryptable hasn't been indexed yet.
function isNotReadyError(msg: string): boolean {
  return (
    msg.includes("not_ready_for_decryption") ||
    msg.includes("not ready") ||
    msg.includes("not allowed on host acl")
  );
}

export function RevealForm() {
  const { address: connectedAddress, isConnected, chainId } = useAccount();
  const [rfqInput, setRfqInput] = useState("");

  // Pre-fill address from ?address= query param (browser-only, avoids Suspense requirement)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const addr = params.get("address");
    if (addr) setRfqInput(addr);
  }, []);

  const isOnSepolia = chainId === SEPOLIA_CHAIN_ID;
  const rfqAddress = isAddress(rfqInput) ? (rfqInput as `0x${string}`) : null;
  const ZERO_ADDR = "0x0000000000000000000000000000000000000000" as const;

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

  // ── Contract reads ────────────────────────────────────────────────────────
  const addr = rfqAddress ?? ZERO_ADDR;

  const { data: batchData, refetch: refetchBatch } = useReadContracts({
    contracts: [
      { address: addr, abi: SILENT_RFQ_ABI, functionName: "finalized" },
      { address: addr, abi: SILENT_RFQ_ABI, functionName: "winnerRevealed" },
      { address: addr, abi: SILENT_RFQ_ABI, functionName: "vendorCount" },
      { address: addr, abi: SILENT_RFQ_ABI, functionName: "getBestVendorIndex" },
      { address: addr, abi: SILENT_RFQ_ABI, functionName: "revealedWinnerIndex" },
    ],
    query: { enabled: !!rfqAddress },
  });

  const finalized = batchData?.[0]?.result as boolean | undefined;
  const winnerRevealed = batchData?.[1]?.result as boolean | undefined;
  const vendorCount = batchData?.[2]?.result as bigint | undefined;
  const handle = batchData?.[3]?.result as `0x${string}` | undefined;
  const revealedWinnerIndex = batchData?.[4]?.result as bigint | undefined;

  const isHandleZero = !handle || handle === BYTES32_ZERO;

  // winnerAddress — enabled once winner is revealed (on-chain or just confirmed)
  const showWinner = winnerRevealed === true || isSuccess;
  const { data: winnerAddr, refetch: refetchWinner } = useReadContract({
    address: addr,
    abi: SILENT_RFQ_ABI,
    functionName: "winnerAddress",
    query: { enabled: !!rfqAddress && showWinner },
  });

  // Refresh contract state after callbackRevealWinner confirms
  useEffect(() => {
    if (isSuccess) {
      refetchBatch();
      refetchWinner();
    }
  }, [isSuccess, refetchBatch, refetchWinner]);

  // Decode winner index from SDK result for display before on-chain confirmation
  let decryptedWinnerIndex: bigint | null = null;
  if (decryptResult?.abiEncodedClearValues) {
    try {
      const [idx] = decodeAbiParameters(
        [{ type: "uint256" }],
        decryptResult.abiEncodedClearValues
      );
      decryptedWinnerIndex = idx;
    } catch {
      // silently ignore malformed result
    }
  }

  // ── Guard conditions ──────────────────────────────────────────────────────
  const canDecrypt =
    isConnected &&
    isOnSepolia &&
    sdkStatus === "ready" &&
    finalized === true &&
    winnerRevealed === false &&
    !isHandleZero &&
    decryptStatus !== "decrypting";

  const canSubmit =
    isConnected &&
    isOnSepolia &&
    decryptResult !== null &&
    winnerRevealed === false &&
    !!rfqAddress &&
    !!handle &&
    !isHandleZero &&
    !isPending &&
    !isConfirming;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="rounded border border-orange-300 bg-orange-50 p-3 text-sm text-orange-800">
        <strong>Debug page — Sepolia only.</strong>
        <br />
        This gateway reveal page works only on Sepolia. Local Hardhat does not
        support the live Zama KMS relayer.
      </div>

      {/* Wallet */}
      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-gray-700">Wallet</h2>
        <WalletConnect />
        {isConnected && connectedAddress && (
          <div className="mt-1 space-y-1 text-xs text-gray-600">
            <p>
              Address: <AddressCopy address={connectedAddress} />
            </p>
            <p>
              Chain:{" "}
              <span
                className={
                  isOnSepolia
                    ? "font-medium text-green-700"
                    : "font-medium text-red-600"
                }
              >
                {chainLabel(chainId)}
              </span>
              {!isOnSepolia && (
                <span className="ml-1 text-red-500">— switch to Sepolia</span>
              )}
            </p>
          </div>
        )}
      </section>

      {/* SDK Init */}
      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-gray-700">
          SDK Initialization
        </h2>
        <div className="flex items-center gap-3">
          <button
            onClick={initSdk}
            disabled={
              sdkStatus === "ready" ||
              sdkStatus === "initializing" ||
              !isConnected ||
              !isOnSepolia
            }
            className="rounded border border-gray-300 bg-white px-3 py-1.5 text-xs hover:bg-gray-50 disabled:opacity-40"
          >
            {sdkStatus === "initializing"
              ? "Initializing..."
              : "Initialize SDK"}
          </button>
          <span
            className={`text-xs font-medium ${
              sdkStatus === "ready"
                ? "text-green-700"
                : sdkStatus === "error"
                ? "text-red-600"
                : sdkStatus === "initializing"
                ? "text-blue-600"
                : "text-gray-400"
            }`}
          >
            {sdkStatus === "idle" && "Not initialized"}
            {sdkStatus === "initializing" && "Connecting to Zama relayer..."}
            {sdkStatus === "ready" && "Ready"}
            {sdkStatus === "error" && `Error: ${sdkError}`}
          </span>
        </div>
        {sdkStatus === "error" && (
          <button
            onClick={initSdk}
            className="text-xs text-blue-600 underline"
          >
            Retry
          </button>
        )}
      </section>

      {/* RFQ Address + contract state */}
      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-gray-700">RFQ Contract</h2>
        <input
          type="text"
          value={rfqInput}
          onChange={(e) => setRfqInput(e.target.value)}
          placeholder="0x..."
          className={`w-full rounded border px-3 py-2 font-mono text-sm focus:outline-none focus:ring-1 ${
            rfqInput && !rfqAddress
              ? "border-red-400 focus:ring-red-300"
              : "border-gray-300 focus:ring-gray-400"
          }`}
        />
        {rfqInput && !rfqAddress && (
          <p className="text-xs text-red-600">Not a valid Ethereum address.</p>
        )}

        {rfqAddress && (
          <table className="mt-2 w-full rounded border border-gray-100 text-xs">
            <tbody>
              <tr className="border-b border-gray-50">
                <td className="w-44 py-1.5 px-3 text-gray-500">Finalized</td>
                <td className="py-1.5 px-3 font-medium">
                  {finalized === undefined ? (
                    "…"
                  ) : finalized ? (
                    <span className="text-green-700">Yes</span>
                  ) : (
                    <span className="text-red-600">
                      No — must finalize before reveal
                    </span>
                  )}
                </td>
              </tr>
              <tr className="border-b border-gray-50">
                <td className="py-1.5 px-3 text-gray-500">Winner revealed</td>
                <td className="py-1.5 px-3 font-medium">
                  {winnerRevealed === undefined ? (
                    "…"
                  ) : winnerRevealed ? (
                    <span className="text-blue-700">
                      Yes (index {revealedWinnerIndex?.toString() ?? "…"})
                    </span>
                  ) : (
                    <span className="text-gray-600">No</span>
                  )}
                </td>
              </tr>
              <tr className="border-b border-gray-50">
                <td className="py-1.5 px-3 text-gray-500">Vendor count</td>
                <td className="py-1.5 px-3">
                  {vendorCount?.toString() ?? "…"}
                </td>
              </tr>
              <tr>
                <td className="py-1.5 px-3 text-gray-500">
                  Best vendor handle
                </td>
                <td className="py-1.5 px-3 font-mono break-all">
                  {handle === undefined ? (
                    "…"
                  ) : isHandleZero ? (
                    <span className="text-gray-400">
                      bytes32(0) — no bids submitted
                    </span>
                  ) : (
                    <span className="text-gray-700">
                      {handle.slice(0, 20)}…
                    </span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        )}
      </section>

      {/* Step 1 — Public Decrypt */}
      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-gray-700">
          Step 1 — Request Public Decryption
        </h2>
        <p className="text-xs text-gray-500">
          Sends the handle to the Zama KMS relayer. Returns the decrypted
          winner index plus a KMS-signed proof.
        </p>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handle && requestDecrypt(handle)}
            disabled={!canDecrypt}
            className="rounded border border-gray-300 bg-white px-3 py-1.5 text-xs hover:bg-gray-50 disabled:opacity-40"
          >
            {decryptStatus === "decrypting"
              ? "Requesting from KMS relayer..."
              : "Request Decryption"}
          </button>
          {decryptStatus !== "idle" && (
            <button
              onClick={resetDecrypt}
              className="text-xs text-gray-500 underline"
            >
              Reset
            </button>
          )}
        </div>

        {/* Pre-flight hint */}
        {!canDecrypt && !!rfqAddress && finalized !== undefined && (
          <p className="text-xs text-gray-400">
            {!isConnected && "Connect wallet. "}
            {isConnected && !isOnSepolia && "Switch to Sepolia. "}
            {sdkStatus !== "ready" && "Initialize SDK. "}
            {finalized === false && "RFQ must be finalized first. "}
            {winnerRevealed === true && "Winner already revealed. "}
            {isHandleZero && "No bids on this RFQ (handle is bytes32(0)). "}
          </p>
        )}

        {/* Retry-friendly "not ready" error */}
        {decryptStatus === "error" && (
          <div className="rounded border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            {isNotReadyError(decryptError) ? (
              <>
                <strong>Handle not ready for decryption yet.</strong>
                <br />
                The Zama relayer may still be indexing the{" "}
                <code>finalize()</code> transaction. Wait 30–60 seconds and
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
            <p className="font-semibold text-green-800">Decryption successful.</p>
            {decryptedWinnerIndex !== null && (
              <p className="text-green-700">
                Decrypted winner index:{" "}
                <span className="font-mono font-bold">
                  {decryptedWinnerIndex.toString()}
                </span>
              </p>
            )}
            <p className="text-green-600 text-xs">
              KMS-signed proof is ready. Proceed to Step 2.
            </p>
          </div>
        )}
      </section>

      {/* Step 2 — Submit callbackRevealWinner */}
      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-gray-700">
          Step 2 — Submit callbackRevealWinner
        </h2>
        <p className="text-xs text-gray-500">
          Submits the KMS-signed proof on-chain. Permissionless — any wallet
          can call this. The contract verifies the signatures via{" "}
          <code>FHE.checkSignatures</code>.
        </p>

        {winnerRevealed === true && !isSuccess ? (
          <p className="text-xs text-gray-500">
            Winner already revealed on-chain — no need to submit again.
          </p>
        ) : (
          <button
            onClick={() => {
              if (rfqAddress && handle && decryptResult) {
                submitReveal(rfqAddress, handle, decryptResult);
              }
            }}
            disabled={!canSubmit}
            className="rounded bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-700 disabled:opacity-40"
          >
            {isPending
              ? "Waiting for wallet..."
              : isConfirming
              ? "Confirming..."
              : "Submit callbackRevealWinner"}
          </button>
        )}

        <TxStatus
          isPending={isPending}
          isConfirming={isConfirming}
          isSuccess={isSuccess}
          error={writeError}
          hash={hash}
        />
      </section>

      {/* Winner display */}
      {showWinner && winnerAddr && (
        <section className="rounded border border-blue-200 bg-blue-50 p-4 space-y-2">
          <h2 className="text-sm font-semibold text-blue-800">
            Winner Revealed
          </h2>
          <div className="text-xs text-blue-700 space-y-1">
            {(revealedWinnerIndex !== undefined || decryptedWinnerIndex !== null) && (
              <p>
                Winner index:{" "}
                <span className="font-mono font-bold">
                  {(revealedWinnerIndex ?? decryptedWinnerIndex)!.toString()}
                </span>
              </p>
            )}
            <p>
              Winner address:{" "}
              <AddressCopy address={winnerAddr as `0x${string}`} />
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
