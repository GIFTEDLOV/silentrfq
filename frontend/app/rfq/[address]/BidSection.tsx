"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { TxStatus } from "@/components/TxStatus";
import { WalletConnect } from "@/components/WalletConnect";
import { EXPECTED_CHAIN_ID } from "@/config/contracts";
import { useEncryptedBid } from "@/hooks/useEncryptedBid";

const UINT64_MAX = BigInt("18446744073709551615");

function isValidUint64(value: string): boolean {
  try {
    const n = BigInt(value);
    return n > 0n && n <= UINT64_MAX;
  } catch {
    return false;
  }
}

type Props = {
  rfqAddress: `0x${string}`;
  buyerAddress: `0x${string}` | undefined;
  onSuccess: () => void;
};

export function BidSection({ rfqAddress, buyerAddress, onSuccess }: Props) {
  const { address: connectedAddress, isConnected, chainId } = useAccount();
  const [bidInput, setBidInput] = useState("");
  const [validationError, setValidationError] = useState("");

  const {
    sdkStatus,
    sdkError,
    encryptStatus,
    encryptError,
    initSdk,
    encryptAndSubmit,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    writeError,
    reset,
  } = useEncryptedBid();

  const isOnExpectedChain = chainId === EXPECTED_CHAIN_ID;
  const isBuyer =
    isConnected &&
    buyerAddress !== undefined &&
    connectedAddress?.toLowerCase() === buyerAddress.toLowerCase();

  useEffect(() => {
    if (isSuccess) onSuccess();
  }, [isSuccess, onSuccess]);

  const validate = (): string => {
    if (!isConnected) return "Connect your wallet to submit a bid.";
    if (!isOnExpectedChain) return "Switch to Sepolia to use encrypted bidding.";
    if (isBuyer) return "The buyer cannot submit a bid on their own RFQ.";
    if (!bidInput.trim()) return "Bid amount is required.";
    if (!isValidUint64(bidInput)) return "Bid must be a positive integer (max uint64).";
    return "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) { setValidationError(err); return; }
    setValidationError("");
    encryptAndSubmit(rfqAddress, connectedAddress!, BigInt(bidInput));
  };

  const handleReset = () => { reset(); setValidationError(""); };

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 space-y-5">
      <div>
        <h2 className="font-display text-lg font-bold text-white">Submit Encrypted Bid</h2>
        <p className="mt-1 text-xs text-slate-500">
          Your bid is encrypted client-side before touching the chain.
        </p>
      </div>

      {!isOnExpectedChain && (
        <div className="rounded-xl border border-zamaYellow/20 bg-zamaYellow/[0.06] p-3 text-xs font-medium text-zamaYellow">
          Encrypted bidding requires Sepolia. Switch your wallet network to bid.
        </div>
      )}

      {isOnExpectedChain && isBuyer && (
        <p className="text-xs text-slate-500">
          You created this RFQ. Only vendors can submit bids.
        </p>
      )}

      {!isConnected && <WalletConnect />}

      {isConnected && isOnExpectedChain && !isBuyer && (
        <div className="space-y-4">
          {/* Step 1: SDK */}
          <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 space-y-3">
            <p className="text-xs font-bold text-white">Step 1 — Initialize Zama FHE SDK</p>
            <div className="flex items-center gap-3">
              <button
                onClick={initSdk}
                disabled={sdkStatus === "ready" || sdkStatus === "initializing"}
                className="rounded-xl border border-fheBlue/30 bg-fheBlue/[0.08] px-3 py-1.5 text-xs font-semibold text-fheBlueSoft hover:bg-fheBlue/[0.15] hover:border-fheBlue/50 disabled:opacity-40 transition-all"
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

          {/* Step 2: Bid */}
          <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 space-y-3">
            <p className="text-xs font-bold text-white">Step 2 — Encrypt and Submit</p>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-400">
                  Bid Amount (uint64)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={bidInput}
                  onChange={(e) => setBidInput(e.target.value)}
                  placeholder="e.g. 1000"
                  className="w-full rounded-xl border border-white/[0.10] bg-white/[0.04] px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-zamaYellow/50 focus:ring-1 focus:ring-zamaYellow/30 focus:outline-none transition-all"
                />
                <p className="mt-1 text-xs text-slate-600">
                  Positive integer, max uint64. Encrypted before submission.
                </p>
              </div>

              {validationError && (
                <p className="text-xs text-red-400">{validationError}</p>
              )}

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={
                    sdkStatus !== "ready" || isPending || isConfirming || encryptStatus === "encrypting"
                  }
                  className="rounded-xl bg-zamaYellow px-4 py-2.5 text-sm font-bold text-ink hover:bg-yellow-300 hover:shadow-[0_0_20px_rgba(255,210,8,0.35)] disabled:opacity-40 transition-all"
                >
                  {encryptStatus === "encrypting"
                    ? "Encrypting..."
                    : isPending
                    ? "Waiting for wallet..."
                    : isConfirming
                    ? "Confirming..."
                    : "Encrypt & Submit Bid"}
                </button>

                {(isSuccess || writeError || encryptStatus === "error") && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="rounded-xl border border-white/[0.10] bg-white/[0.03] px-4 py-2.5 text-sm text-slate-300 hover:border-white/[0.18] transition-all"
                  >
                    Reset
                  </button>
                )}
              </div>
            </form>

            {encryptStatus !== "idle" && (
              <p
                className={`text-xs font-medium ${
                  encryptStatus === "done"
                    ? "text-emerald-400"
                    : encryptStatus === "error"
                    ? "text-red-400"
                    : "text-fheBlueSoft"
                }`}
              >
                {encryptStatus === "encrypting" && "Encrypting bid with TFHE public key..."}
                {encryptStatus === "done" && "Encrypted. Submitting to contract..."}
                {encryptStatus === "error" && `Encryption failed: ${encryptError}`}
              </p>
            )}

            <TxStatus
              isPending={isPending}
              isConfirming={isConfirming}
              isSuccess={isSuccess}
              error={writeError}
              hash={hash}
            />

            {isSuccess && (
              <div className="rounded-xl border border-success/20 bg-success/[0.06] p-3 text-sm font-medium text-emerald-400">
                Bid submitted. Your encrypted bid has been recorded on-chain.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
