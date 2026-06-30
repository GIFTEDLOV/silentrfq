"use client";

import { useEffect, useState } from "react";
import { isAddress } from "viem";
import { useAccount, useReadContract } from "wagmi";
import { AddressCopy } from "@/components/AddressCopy";
import { TxStatus } from "@/components/TxStatus";
import { WalletConnect } from "@/components/WalletConnect";
import { SILENT_RFQ_ABI } from "@/config/contracts";
import { useEncryptedBid } from "@/hooks/useEncryptedBid";

const SEPOLIA_CHAIN_ID = 11155111;
const UINT64_MAX = BigInt("18446744073709551615");

function isValidUint64(value: string): boolean {
  try {
    const n = BigInt(value);
    return n > 0n && n <= UINT64_MAX;
  } catch {
    return false;
  }
}

function chainLabel(chainId: number | undefined): string {
  if (chainId === 11155111) return "Sepolia";
  if (chainId === 31337) return "Hardhat Local";
  if (chainId) return `chain ${chainId}`;
  return "—";
}

export function BidForm() {
  const { address: connectedAddress, isConnected, chainId } = useAccount();
  const [rfqInput, setRfqInput] = useState("");
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

  const isOnSepolia = chainId === SEPOLIA_CHAIN_ID;
  const rfqAddress = isAddress(rfqInput)
    ? (rfqInput as `0x${string}`)
    : null;

  const { data: vendorCount, refetch: refetchVendorCount } = useReadContract({
    address:
      rfqAddress ?? "0x0000000000000000000000000000000000000000",
    abi: SILENT_RFQ_ABI,
    functionName: "vendorCount",
    query: { enabled: !!rfqAddress },
  });

  useEffect(() => {
    if (isSuccess) refetchVendorCount();
  }, [isSuccess, refetchVendorCount]);

  const validate = (): string => {
    if (!isConnected) return "Wallet not connected.";
    if (!isOnSepolia) return "Switch wallet to Sepolia to use encrypted bidding.";
    if (!rfqAddress) return "RFQ address is not a valid Ethereum address.";
    if (!bidInput.trim()) return "Bid amount is required.";
    if (!isValidUint64(bidInput))
      return "Bid must be a positive integer ≤ 18446744073709551615 (uint64 max).";
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
    encryptAndSubmit(rfqAddress!, connectedAddress!, BigInt(bidInput));
  };

  const handleReset = () => {
    reset();
    setValidationError("");
  };

  return (
    <div className="space-y-6">
      {/* Sepolia-only banner */}
      <div className="rounded border border-orange-300 bg-orange-50 p-3 text-sm text-orange-800">
        <strong>Debug page — Sepolia only.</strong>
        <br />
        This encrypted bid debug page works only on Sepolia. Local Hardhat does
        not support browser relayer encryption.
      </div>

      {/* Wallet status */}
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

      {/* SDK initialization */}
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
            {sdkStatus === "initializing" ? "Initializing..." : "Initialize SDK"}
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
            {sdkStatus === "initializing" &&
              "Fetching TFHE public key from relayer..."}
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
        {sdkStatus === "idle" && (
          <p className="text-xs text-gray-400">
            Initialization fetches the TFHE public key from{" "}
            <code>relayer.testnet.zama.org</code>. Requires Sepolia wallet.
          </p>
        )}
      </section>

      {/* Bid form */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-700">Encrypted Bid</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">
              RFQ Contract Address
            </label>
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
              <p className="mt-1 text-xs text-red-600">
                Not a valid Ethereum address.
              </p>
            )}
          </div>

          {rfqAddress && (
            <p className="text-xs text-gray-500">
              Current vendor count:{" "}
              <span className="font-medium text-gray-800">
                {vendorCount !== undefined ? vendorCount.toString() : "…"}
              </span>
            </p>
          )}

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
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
            />
            <p className="mt-0.5 text-xs text-gray-400">
              Positive integer, max 18446744073709551615
            </p>
          </div>

          {validationError && (
            <p className="text-xs text-red-600">{validationError}</p>
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={
                !isConnected ||
                !isOnSepolia ||
                sdkStatus !== "ready" ||
                isPending ||
                isConfirming ||
                encryptStatus === "encrypting"
              }
              className="rounded bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-700 disabled:opacity-40"
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
                className="rounded border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50"
              >
                Reset
              </button>
            )}
          </div>
        </form>
      </section>

      {/* Encryption status */}
      {encryptStatus !== "idle" && (
        <section className="space-y-1">
          <h2 className="text-sm font-semibold text-gray-700">
            Encryption Status
          </h2>
          <p
            className={`text-xs ${
              encryptStatus === "done"
                ? "text-green-700"
                : encryptStatus === "error"
                ? "text-red-600"
                : "text-blue-600"
            }`}
          >
            {encryptStatus === "encrypting" &&
              "Encrypting bid and requesting coprocessor proof..."}
            {encryptStatus === "done" && "Encrypted. Submitting transaction..."}
            {encryptStatus === "error" && `Encryption failed: ${encryptError}`}
          </p>
        </section>
      )}

      {/* Transaction status */}
      <TxStatus
        isPending={isPending}
        isConfirming={isConfirming}
        isSuccess={isSuccess}
        error={writeError}
        hash={hash}
      />

      {isSuccess && (
        <p className="rounded border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          Bid submitted successfully. Vendor count updated above.
        </p>
      )}
    </div>
  );
}
