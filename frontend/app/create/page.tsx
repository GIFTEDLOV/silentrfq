"use client";

import Link from "next/link";
import { useState } from "react";
import { useAccount } from "wagmi";
import { CheckCircle, Zap } from "lucide-react";
import { NetworkGuard } from "@/components/NetworkGuard";
import { TxStatus } from "@/components/TxStatus";
import { WalletConnect } from "@/components/WalletConnect";
import { FACTORY_ADDRESS, FACTORY_MISSING_MESSAGE } from "@/config/contracts";
import { useCreateRFQ } from "@/hooks/useFactory";

const TEMPLATES = [
  { label: "Office Supplies", value: "500 reams of A4 paper, 80gsm, white" },
  { label: "Industrial Parts", value: "200 units of M8x30mm hex bolts, stainless steel" },
  { label: "Software License", value: "Enterprise SaaS license renewal, 50 seats, 12 months" },
  { label: "Logistics", value: "Monthly freight forwarding, 20ft container, Shanghai to Rotterdam" },
];

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
      <div className="max-w-xl space-y-5">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center shadow-sm">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle className="h-6 w-6 text-emerald-600" />
          </div>
          <h2 className="text-lg font-bold text-emerald-900">RFQ Created</h2>
          <p className="mt-1 text-sm text-emerald-700">
            Your confidential RFQ has been deployed on-chain.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/rfqs"
            className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-center text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            View all RFQs
          </Link>
          <button
            onClick={() => {
              reset();
              setDescription("");
              setDeadlineInput("");
            }}
            className="flex-1 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
          >
            Create Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Create Confidential RFQ</h1>
        <p className="mt-1 text-sm text-slate-500">
          Post a request and let vendors submit encrypted price quotes. Bid amounts are
          never visible on-chain.
        </p>
      </div>

      {!FACTORY_ADDRESS && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {FACTORY_MISSING_MESSAGE}
        </div>
      )}

      {/* Quick templates */}
      <div>
        <p className="mb-2 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
          <Zap className="h-3 w-3" />
          Quick templates
        </p>
        <div className="grid grid-cols-2 gap-2">
          {TEMPLATES.map((t) => (
            <button
              key={t.label}
              type="button"
              onClick={() => setDescription(t.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-xs font-medium text-slate-700 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 transition-all"
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {!isConnected ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 shadow-sm">
          <p className="text-sm text-slate-600">Connect your wallet to create an RFQ.</p>
          <WalletConnect />
        </div>
      ) : (
        <NetworkGuard>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. 500 units of industrial bolts, M8 x 30mm"
                  required
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Bid Deadline
                </label>
                <input
                  type="datetime-local"
                  value={deadlineInput}
                  onChange={handleDeadlineChange}
                  required
                  className={`w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:border-transparent ${
                    deadlineError
                      ? "border-red-400 focus:ring-red-300"
                      : "border-slate-300 focus:ring-indigo-400"
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
                className="w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-40 transition-colors"
              >
                {isPending
                  ? "Waiting for wallet..."
                  : isConfirming
                  ? "Confirming..."
                  : "Create RFQ"}
              </button>
            </form>
          </div>

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
