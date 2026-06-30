"use client";

import Link from "next/link";
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
          <h1 className="text-xl font-bold text-gray-900">Procurement Dashboard</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            All confidential RFQs on the configured network
          </p>
        </div>
        <Link
          href="/create"
          className="shrink-0 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 transition-colors"
        >
          + Create RFQ
        </Link>
      </div>

      {/* Factory missing */}
      {!FACTORY_ADDRESS && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-700">
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
            <div key={i} className="h-24 rounded-lg border border-gray-200 bg-white animate-pulse" />
          ))}
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          Failed to load RFQs. Check your RPC connection and wallet network.
        </div>
      )}

      {/* Empty state */}
      {!isLoading && rfqAddresses && rfqAddresses.length === 0 && (
        <div className="rounded-lg border border-gray-200 bg-white px-6 py-12 text-center">
          <p className="text-sm font-medium text-gray-700">No RFQs yet</p>
          <p className="mt-1 text-xs text-gray-500">
            Create the first confidential RFQ on this network.
          </p>
          <Link
            href="/create"
            className="mt-4 inline-block rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
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
