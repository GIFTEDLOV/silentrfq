"use client";

import Link from "next/link";
import { useState } from "react";
import { useAccount } from "wagmi";
import { Plus, ShieldCheck, Wallet } from "lucide-react";
import { RFQCard } from "@/components/RFQCard";
import { RFQStatsBar } from "@/components/RFQStatsBar";
import { ScrollReveal } from "@/components/ScrollReveal";
import { WalletConnect } from "@/components/WalletConnect";
import { FACTORY_ADDRESS, FACTORY_MISSING_MESSAGE } from "@/config/contracts";
import { useGetRFQs, useGetRFQsByBuyer } from "@/hooks/useFactory";

type Tab = "all" | "mine";

const DEMO_RFQ_ADDRESS = "0x6272ea767fa6e6668173F5a4D532885ce1D2502E";

export default function RFQsPage() {
  const [tab, setTab] = useState<Tab>("all");
  const { isConnected, address: connectedAddress } = useAccount();

  const { data: allRFQs, isLoading: allLoading, isError: allError } = useGetRFQs();
  const { data: myRFQs, isLoading: myLoading, isError: myError } = useGetRFQsByBuyer(
    tab === "mine" && isConnected ? connectedAddress : undefined
  );

  const rfqAddresses = tab === "all" ? allRFQs : myRFQs;
  const isLoading = tab === "all" ? allLoading : myLoading;
  const isError = tab === "all" ? allError : myError;

  return (
    <div className="space-y-8">
      {/* Header */}
      <ScrollReveal delay={0}>
        <div className="flex items-start justify-between gap-4 pt-2">
          <div>
            <p className="mb-2 text-xs font-bold tracking-[0.2em] uppercase text-zamaYellow">
              Live on Sepolia
            </p>
            <h1 className="font-display text-4xl font-bold text-white">
              Confidential RFQ Dashboard
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Buyers post procurement requests. Vendors submit encrypted bids. Bid amounts are never exposed on-chain.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <Link
              href={`/rfq/${DEMO_RFQ_ADDRESS}`}
              className="inline-flex items-center gap-2 rounded-xl border border-fheBlue/30 px-4 py-2.5 text-sm font-bold text-fheBlueSoft hover:bg-fheBlue/[0.08] hover:border-fheBlue/50 transition-all"
            >
              <ShieldCheck className="h-4 w-4" />
              View Verified Demo
            </Link>
            <Link
              href="/create"
              className="inline-flex items-center gap-2 rounded-xl bg-zamaYellow px-4 py-2.5 text-sm font-bold text-ink hover:bg-yellow-300 hover:shadow-[0_0_20px_rgba(255,210,8,0.35)] transition-all"
            >
              <Plus className="h-4 w-4" />
              Create RFQ
            </Link>
          </div>
        </div>
      </ScrollReveal>

      {/* Factory missing */}
      {!FACTORY_ADDRESS && (
        <div className="rounded-xl border border-danger/20 bg-danger/[0.06] p-4 text-sm text-red-400">
          {FACTORY_MISSING_MESSAGE}
        </div>
      )}

      {/* Tabs */}
      <ScrollReveal delay={60}>
        <div className="flex items-center gap-1 rounded-xl border border-white/[0.08] bg-white/[0.02] p-1 w-fit">
          {(["all", "mine"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-lg px-5 py-1.5 text-sm font-medium transition-all ${
                tab === t
                  ? "bg-white/[0.09] text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {t === "all" ? "All RFQs" : "My RFQs"}
            </button>
          ))}
        </div>
      </ScrollReveal>

      {/* Stats — only on All tab */}
      {tab === "all" && allRFQs && allRFQs.length > 0 && (
        <ScrollReveal delay={80}>
          <RFQStatsBar addresses={allRFQs} />
        </ScrollReveal>
      )}

      {/* My RFQs — not connected */}
      {tab === "mine" && !isConnected && (
        <ScrollReveal delay={80}>
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-8 py-14 text-center space-y-5">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/[0.10] bg-white/[0.04]">
              <Wallet className="h-5 w-5 text-slate-500" />
            </div>
            <div>
              <p className="font-display text-xl font-bold text-white">Connect your wallet</p>
              <p className="mt-1.5 text-sm text-slate-400">
                See the RFQs you created as a buyer on Sepolia.
              </p>
            </div>
            <WalletConnect />
          </div>
        </ScrollReveal>
      )}

      {/* Loading */}
      {(tab === "all" || isConnected) && isLoading && (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-28 rounded-2xl border border-white/[0.06] bg-white/[0.02] animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Error */}
      {(tab === "all" || isConnected) && isError && (
        <div className="rounded-xl border border-danger/20 bg-danger/[0.06] p-4 text-sm text-red-400">
          Failed to load RFQs. Check your RPC connection and wallet network.
        </div>
      )}

      {/* Empty state */}
      {(tab === "all" || isConnected) && !isLoading && rfqAddresses && rfqAddresses.length === 0 && (
        <ScrollReveal delay={120}>
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-8 py-20 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-zamaYellow/20 bg-zamaYellow/10">
              <Plus className="h-6 w-6 text-zamaYellow" />
            </div>
            {tab === "all" ? (
              <>
                <p className="font-display text-xl font-bold text-white">No RFQs yet</p>
                <p className="mt-2 text-sm text-slate-400">
                  Be the first to post a confidential procurement request on this network.
                </p>
              </>
            ) : (
              <>
                <p className="font-display text-xl font-bold text-white">No RFQs created yet</p>
                <p className="mt-2 text-sm text-slate-400">
                  You haven&apos;t created any RFQs as a buyer on this network.
                </p>
              </>
            )}
            <Link
              href="/create"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-zamaYellow px-5 py-2.5 text-sm font-bold text-ink hover:bg-yellow-300 hover:shadow-[0_0_20px_rgba(255,210,8,0.35)] transition-all"
            >
              <Plus className="h-4 w-4" />
              Create RFQ
            </Link>
          </div>
        </ScrollReveal>
      )}

      {/* RFQ list */}
      {(tab === "all" || isConnected) && rfqAddresses && rfqAddresses.length > 0 && (
        <div>
          <ScrollReveal delay={100}>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px flex-1 bg-white/[0.06]" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-700">
                {tab === "all" ? "Confidential procurement pipeline" : "Your procurement pipeline"}
              </span>
              <div className="h-px flex-1 bg-white/[0.06]" />
            </div>
          </ScrollReveal>

          <div className="space-y-3">
            {[...rfqAddresses].reverse().map((addr, i) => (
              <ScrollReveal key={addr} delay={Math.min(120 + i * 80, 280)}>
                <RFQCard address={addr} />
              </ScrollReveal>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
