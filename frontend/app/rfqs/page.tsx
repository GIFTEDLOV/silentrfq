"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { RFQCard } from "@/components/RFQCard";
import { RFQStatsBar } from "@/components/RFQStatsBar";
import { FACTORY_ADDRESS, FACTORY_MISSING_MESSAGE } from "@/config/contracts";
import { useGetRFQs } from "@/hooks/useFactory";

export default function RFQsPage() {
  const { data: rfqAddresses, isLoading, isError } = useGetRFQs();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Procurement Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            All confidential RFQs on the configured network
          </p>
        </div>
        <Link
          href="/create"
          className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Create RFQ
        </Link>
      </div>

      {/* Factory missing */}
      {!FACTORY_ADDRESS && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {FACTORY_MISSING_MESSAGE}
        </div>
      )}

      {/* Stats */}
      {rfqAddresses && rfqAddresses.length > 0 && (
        <RFQStatsBar addresses={rfqAddresses} />
      )}

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-24 rounded-2xl border border-slate-200 bg-white animate-pulse" />
          ))}
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          Failed to load RFQs. Check your RPC connection and wallet network.
        </div>
      )}

      {/* Empty state */}
      {!isLoading && rfqAddresses && rfqAddresses.length === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
            <Plus className="h-6 w-6 text-slate-400" />
          </div>
          <p className="text-sm font-semibold text-slate-700">No RFQs yet</p>
          <p className="mt-1 text-xs text-slate-500">
            Create the first confidential RFQ on this network.
          </p>
          <Link
            href="/create"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Create RFQ
          </Link>
        </div>
      )}

      {/* RFQ list */}
      {rfqAddresses && rfqAddresses.length > 0 && (
        <div className="space-y-3">
          {[...rfqAddresses].reverse().map((addr) => (
            <RFQCard key={addr} address={addr} />
          ))}
        </div>
      )}
    </div>
  );
}
