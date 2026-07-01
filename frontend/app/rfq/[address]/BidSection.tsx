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
    if (!isValidUint64(bidInput))
      return "Bid must be a positive integer <= 18446744073709551615 (uint64 max).";
    return "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      setValidationError(err);
      return;
    }
    setValidationError("");
    encryptAndSubmit(rfqAddress, connectedAddress!, BigInt(bidInput));
  };

  const handleReset = () => {
    reset();
    setValidationError("");
  };

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-800">Submit Encrypted Bid</h2>

      {/* Sepolia gate */}
      {!isOnExpectedChain && (
        <p className="rounded-xl border border-orange-200 bg-orange-50 p-3 text-xs text-orange-800">
          Encrypted bidding requires Sepolia. Switch your wallet network to bid.
        </p>
      )}

      {/* Buyer gate */}
      {isOnExpectedChain && isBuyer && (
        <p className="text-xs text-slate-500">
          You created this RFQ. Only vendors can submit bids.
        </p>
      )}

      {/* Wallet connect */}
      {!isConnected && <WalletConnect />}

      {/* Form — shown when connected, Sepolia, not buyer */}
      {isConnected && isOnExpectedChain && !isBuyer && (
        <div className="space-y-3">
          {/* SDK init */}
          <div className="flex items-center gap-3">
            <button
              onClick={initSdk}
              disabled={
                sdkStatus === "ready" || sdkStatus === "initializing"
              }
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs hover:bg-slate-50 disabled:opacity-40 transition-colors"
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
                  : "text-slate-400"
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
                className="text-xs text-blue-600 underline"
              >
                Retry
              </button>
            )}
          </div>

          {/* Bid form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">
                Bid Amount (uint64)
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={bidInput}
                onChange={(e) => setBidInput(e.target.value)}
                placeholder="e.g. 1000"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
              />
              <p className="mt-0.5 text-xs text-gray-400">
                Positive integer, max 18446744073709551615. Bid amounts are
                encrypted onchain. Losing bid amounts remain private; the
                winning bid may be accessible to the buyer after finalization
                depending on contract permissions.
              </p>
            </div>

            {validationError && (
              <p className="text-xs text-red-600">{validationError}</p>
            )}

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={
                  sdkStatus !== "ready" ||
                  isPending ||
                  isConfirming ||
                  encryptStatus === "encrypting"
                }
                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-40 transition-colors"
              >
                {encryptStatus === "encrypting"
                  ? "Encrypting..."
                  : isPending
                  ? "Waiting for wallet..."
                  : isConfirming
                  ? "Confirming..."
                  : "Encrypt and Submit Bid"}
              </button>

              {(isSuccess || writeError || encryptStatus === "error") && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm hover:bg-slate-50 transition-colors"
                >
                  Reset
                </button>
              )}
            </div>
          </form>

          {/* Encryption status */}
          {encryptStatus !== "idle" && (
            <p
              className={`text-xs ${
                encryptStatus === "done"
                  ? "text-emerald-700"
                  : encryptStatus === "error"
                  ? "text-red-600"
                  : "text-indigo-600"
              }`}
            >
              {encryptStatus === "encrypting" &&
                "Encrypting bid with TFHE public key..."}
              {encryptStatus === "done" && "Encrypted. Submitting to contract..."}
              {encryptStatus === "error" &&
                `Encryption failed: ${encryptError}`}
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
            <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
              Bid submitted. Your encrypted bid has been recorded on-chain.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
