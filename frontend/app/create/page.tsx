"use client";

import Link from "next/link";
import { useState } from "react";
import { useAccount } from "wagmi";
import { NetworkGuard } from "@/components/NetworkGuard";
import { TxStatus } from "@/components/TxStatus";
import { WalletConnect } from "@/components/WalletConnect";
import { FACTORY_ADDRESS, FACTORY_MISSING_MESSAGE } from "@/config/contracts";
import { useCreateRFQ } from "@/hooks/useFactory";

export default function CreatePage() {
  const [description, setDescription] = useState("");
  const [deadlineInput, setDeadlineInput] = useState("");
  const [deadlineError, setDeadlineError] = useState("");
  const { isConnected } = useAccount();
  const { create, hash, isPending, isConfirming, isSuccess, error, reset } =
    useCreateRFQ();

  const validateDeadline = (value: string): string => {
    if (!value) return "";
    const selected = new Date(value).getTime();
    if (selected <= Date.now()) return "Deadline must be in the future.";
    return "";
  };

  const handleDeadlineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDeadlineInput(e.target.value);
    setDeadlineError(validateDeadline(e.target.value));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !deadlineInput) return;
    const err = validateDeadline(deadlineInput);
    if (err) {
      setDeadlineError(err);
      return;
    }
    const deadlineUnix = BigInt(
      Math.floor(new Date(deadlineInput).getTime() / 1000)
    );
    create(description.trim(), deadlineUnix);
  };

  if (isSuccess) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-bold">RFQ Created</h1>
        <p className="text-green-700 text-sm">
          Your RFQ has been deployed on-chain.
        </p>
        <div className="flex gap-3">
          <Link
            href="/rfqs"
            className="rounded border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50"
          >
            View all RFQs
          </Link>
          <button
            onClick={() => {
              reset();
              setDescription("");
              setDeadlineInput("");
            }}
            className="rounded border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50"
          >
            Create Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Create RFQ</h1>

      {!FACTORY_ADDRESS && (
        <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {FACTORY_MISSING_MESSAGE}
        </div>
      )}

      {!isConnected ? (
        <div className="rounded border border-gray-200 bg-white p-4 space-y-2">
          <p className="text-sm text-gray-600">
            Connect your wallet to create an RFQ.
          </p>
          <WalletConnect />
        </div>
      ) : (
        <NetworkGuard>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. 500 units of industrial bolts, M8 x 30mm"
                required
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bid Deadline
              </label>
              <input
                type="datetime-local"
                value={deadlineInput}
                onChange={handleDeadlineChange}
                required
                className={`w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
                  deadlineError
                    ? "border-red-400 focus:ring-red-300"
                    : "border-gray-300 focus:ring-gray-400"
                }`}
              />
              {deadlineError && (
                <p className="mt-1 text-xs text-red-600">{deadlineError}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={
                !FACTORY_ADDRESS || !!deadlineError || isPending || isConfirming
              }
              className="rounded bg-gray-900 text-white px-4 py-2 text-sm disabled:opacity-40 hover:bg-gray-700"
            >
              {isPending
                ? "Waiting for wallet..."
                : isConfirming
                ? "Confirming..."
                : "Create RFQ"}
            </button>
          </form>

          <TxStatus
            isPending={isPending}
            isConfirming={isConfirming}
            isSuccess={isSuccess}
            error={error}
            hash={hash}
          />
        </NetworkGuard>
      )}
    </div>
  );
}
