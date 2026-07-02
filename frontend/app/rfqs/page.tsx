"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { RFQCard } from "@/components/RFQCard";
import { RFQStatsBar } from "@/components/RFQStatsBar";
import { ScrollReveal } from "@/components/ScrollReveal";
import { FACTORY_ADDRESS, FACTORY_MISSING_MESSAGE } from "@/config/contracts";
import { useGetRFQs } from "@/hooks/useFactory";

export default function RFQsPage() {
  const { data: rfqAddresses, isLoading, isError } = useGetRFQs();

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
              Track live supplier RFQs without exposing bid amounts.
            </p>
          </div>
          <Link
            href="/create"
            className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-zamaYellow px-4 py-2.5 text-sm font-bold text-ink hover:bg-yellow-300 hover:shadow-[0_0_20px_rgba(255,210,8,0.35)] transition-all"
          >
            <Plus className="h-4 w-4" />
            Create RFQ
          </Link>
        </div>
      </ScrollReveal>

      {/* Factory missing */}
      {!FACTORY_ADDRESS && (
        <div className="rounded-xl border border-danger/20 bg-danger/[0.06] p-4 text-sm text-red-400">
          {FACTORY_MISSING_MESSAGE}
        </div>
      )}

      {/* Stats */}
      {rfqAddresses && rfqAddresses.length > 0 && (
        <ScrollReveal delay={80}>
          <RFQStatsBar addresses={rfqAddresses} />
        </ScrollReveal>
      )}

      {/* Loading */}
      {isLoading && (
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
      {isError && (
        <div className="rounded-xl border border-danger/20 bg-danger/[0.06] p-4 text-sm text-red-400">
          Failed to load RFQs. Check your RPC connection and wallet network.
        </div>
      )}

      {/* Empty state */}
      {!isLoading && rfqAddresses && rfqAddresses.length === 0 && (
        <ScrollReveal delay={120}>
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-8 py-20 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-zamaYellow/20 bg-zamaYellow/10">
              <Plus className="h-6 w-6 text-zamaYellow" />
            </div>
            <p className="font-display text-xl font-bold text-white">No RFQs yet</p>
            <p className="mt-2 text-sm text-slate-400">
              Be the first to post a confidential procurement request on this network.
            </p>
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
      {rfqAddresses && rfqAddresses.length > 0 && (
        <div>
          <ScrollReveal delay={100}>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px flex-1 bg-white/[0.06]" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-700">
                Confidential procurement pipeline
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
