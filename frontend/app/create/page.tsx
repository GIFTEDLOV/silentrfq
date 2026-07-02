"use client";

import Link from "next/link";
import { useState } from "react";
import { useAccount } from "wagmi";
import { CheckCircle, FileText, Lock, Trophy, Zap } from "lucide-react";
import { NetworkGuard } from "@/components/NetworkGuard";
import { ScrollReveal } from "@/components/ScrollReveal";
import { TxStatus } from "@/components/TxStatus";
import { WalletConnect } from "@/components/WalletConnect";
import { FACTORY_ADDRESS, FACTORY_MISSING_MESSAGE } from "@/config/contracts";
import { useCreateRFQ } from "@/hooks/useFactory";

const TEMPLATES = [
  { label: "Office Supplies",  value: "500 reams of A4 paper, 80gsm, white" },
  { label: "Industrial Parts", value: "200 units of M8x30mm hex bolts, stainless steel" },
  { label: "Software License", value: "Enterprise SaaS license renewal, 50 seats, 12 months" },
  { label: "Logistics",        value: "Monthly freight forwarding, 20ft container, Shanghai to Rotterdam" },
];

const SETUP_STEPS = [
  {
    icon: Zap,
    title: "Create RFQ",
    desc: "Deploy a confidential RFQ contract on Sepolia with your procurement description and bid deadline.",
  },
  {
    icon: Lock,
    title: "Vendors submit encrypted bids",
    desc: "Vendors encrypt bid amounts locally using the Zama SDK. Only TFHE ciphertexts land on-chain. No plaintext, ever.",
  },
  {
    icon: Trophy,
    title: "Finalize and reveal winner",
    desc: "After the deadline, you finalize the RFQ. The Zama KMS gateway publicly decrypts only the winning vendor index.",
  },
];

export default function CreatePage() {
  const [description, setDescription] = useState("");
  const [deadlineInput, setDeadlineInput] = useState("");
  const [deadlineError, setDeadlineError] = useState("");
  const { isConnected } = useAccount();
  const { create, hash, isPending, isConfirming, isSuccess, error, reset } = useCreateRFQ();

  const validateDeadline = (value: string): string => {
    if (!value) return "";
    if (new Date(value).getTime() <= Date.now()) return "Deadline must be in the future.";
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
    if (err) { setDeadlineError(err); return; }
    const deadlineUnix = BigInt(Math.floor(new Date(deadlineInput).getTime() / 1000));
    create(description.trim(), deadlineUnix);
  };

  if (isSuccess) {
    return (
      <div className="max-w-lg space-y-5 pt-4">
        <ScrollReveal>
          <div className="rounded-2xl border border-success/20 bg-success/[0.06] p-8 text-center shadow-[0_0_40px_rgba(16,185,129,0.06)]">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success/10 border border-success/20">
              <CheckCircle className="h-7 w-7 text-emerald-400" />
            </div>
            <h2 className="font-display text-2xl font-bold text-white">RFQ Created</h2>
            <p className="mt-2 text-sm text-slate-400">
              Your confidential RFQ has been deployed on-chain. Vendors can now submit encrypted bids.
            </p>
          </div>
        </ScrollReveal>
        <ScrollReveal delay={80}>
          <div className="flex gap-3">
            <Link
              href="/rfqs"
              className="flex-1 rounded-xl border border-white/[0.10] bg-white/[0.03] px-4 py-2.5 text-center text-sm font-medium text-slate-300 hover:border-white/[0.18] hover:bg-white/[0.06] transition-all"
            >
              View all RFQs
            </Link>
            <button
              onClick={() => { reset(); setDescription(""); setDeadlineInput(""); }}
              className="flex-1 rounded-xl bg-zamaYellow px-4 py-2.5 text-sm font-bold text-ink hover:bg-yellow-300 hover:shadow-[0_0_20px_rgba(255,210,8,0.3)] transition-all"
            >
              Create Another
            </button>
          </div>
        </ScrollReveal>
      </div>
    );
  }

  return (
    <div className="pt-4">
      <ScrollReveal delay={0}>
        <div className="mb-8">
          <p className="mb-3 text-xs font-bold tracking-[0.2em] uppercase text-zamaYellow">
            New Procurement Request
          </p>
          <h1 className="font-display text-4xl font-bold text-white">Create Confidential RFQ</h1>
          <p className="mt-3 max-w-xl text-sm text-slate-400">
            Post a procurement request. Vendors submit encrypted price quotes using Zama FHE.
            Bid amounts are never visible on-chain.
          </p>
        </div>
      </ScrollReveal>

      {!FACTORY_ADDRESS && (
        <div className="mb-6 rounded-xl border border-danger/20 bg-danger/[0.06] p-4 text-sm text-red-400">
          {FACTORY_MISSING_MESSAGE}
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
        {/* Left: templates + explainer */}
        <div className="space-y-6 lg:col-span-2">
          <ScrollReveal delay={80}>
            <div>
              <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-600">
                Quick Templates
              </p>
              <div className="grid grid-cols-1 gap-2">
                {TEMPLATES.map((t) => (
                  <button
                    key={t.label}
                    type="button"
                    onClick={() => setDescription(t.value)}
                    className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-all
                      ${
                        description === t.value
                          ? "border-zamaYellow/40 bg-zamaYellow/[0.08] font-semibold text-zamaYellow shadow-[0_0_16px_rgba(255,210,8,0.08)]"
                          : "border-white/[0.08] bg-white/[0.03] text-slate-300 hover:border-zamaYellow/20 hover:bg-zamaYellow/[0.04] hover:text-white"
                      }`}
                  >
                    <FileText className={`h-4 w-4 shrink-0 ${description === t.value ? "text-zamaYellow" : "text-slate-600"}`} />
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={120}>
            <div className="rounded-2xl border border-fheBlue/20 bg-fheBlue/[0.05] p-5">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-fheBlueSoft">
                How encrypted bidding works
              </p>
              <ul className="space-y-2">
                {[
                  "Vendors encrypt amounts using the Zama SDK.",
                  "Only ciphertexts land on-chain.",
                  "The contract compares bids via TFHE.",
                  "Only the winner index is publicly decrypted.",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-xs text-slate-400">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-fheBlueSoft" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </ScrollReveal>
        </div>

        {/* Right: form or disconnected state */}
        <div className="lg:col-span-3">
          <ScrollReveal delay={160}>
            {!isConnected ? (
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-8 space-y-7">
                <div>
                  <p className="font-display text-xl font-bold text-white">Get started in three steps</p>
                  <p className="mt-1.5 text-sm text-slate-400">
                    Connect your Sepolia wallet to deploy a confidential RFQ contract.
                  </p>
                </div>

                <div className="space-y-4">
                  {SETUP_STEPS.map(({ icon: Icon, title, desc }, i) => (
                    <div key={title} className="flex gap-4">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-zamaYellow/25 bg-zamaYellow/[0.08] font-display text-sm font-bold text-zamaYellow">
                        {i + 1}
                      </div>
                      <div className="pt-0.5">
                        <div className="flex items-center gap-2 mb-1">
                          <Icon className="h-3.5 w-3.5 text-slate-500" />
                          <p className="text-sm font-bold text-white">{title}</p>
                        </div>
                        <p className="text-xs leading-relaxed text-slate-500">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-white/[0.06] pt-6 space-y-3">
                  <p className="text-xs font-medium text-slate-500">Connect to Sepolia to continue</p>
                  <WalletConnect />
                </div>
              </div>
            ) : (
              <NetworkGuard>
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-8">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="mb-2 block text-sm font-bold text-slate-200">
                        Procurement Description
                      </label>
                      <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="e.g. 500 units of industrial bolts, M8 x 30mm"
                        required
                        className="w-full rounded-xl border border-white/[0.10] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-zamaYellow/50 focus:ring-1 focus:ring-zamaYellow/30 focus:outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-bold text-slate-200">
                        Bid Deadline
                      </label>
                      <input
                        type="datetime-local"
                        value={deadlineInput}
                        onChange={handleDeadlineChange}
                        required
                        className={`w-full rounded-xl border bg-white/[0.04] px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 transition-all
                          [color-scheme:dark]
                          ${
                            deadlineError
                              ? "border-danger/40 focus:border-danger/60 focus:ring-danger/20"
                              : "border-white/[0.10] focus:border-zamaYellow/50 focus:ring-zamaYellow/30"
                          }`}
                      />
                      {deadlineError && (
                        <p className="mt-1.5 text-xs text-red-400">{deadlineError}</p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={!FACTORY_ADDRESS || !!deadlineError || isPending || isConfirming}
                      className="w-full rounded-xl bg-zamaYellow px-5 py-3 text-sm font-bold text-ink hover:bg-yellow-300 hover:shadow-[0_0_25px_rgba(255,210,8,0.3)] disabled:opacity-40 transition-all"
                    >
                      {isPending ? "Waiting for wallet..." : isConfirming ? "Confirming..." : "Create RFQ"}
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
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
}
