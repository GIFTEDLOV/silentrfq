"use client";

import Link from "next/link";
import { RFQCard } from "@/components/RFQCard";
import { FACTORY_ADDRESS, FACTORY_MISSING_MESSAGE } from "@/config/contracts";
import { useGetRFQs } from "@/hooks/useFactory";

export default function RFQsPage() {
  const { data: rfqAddresses, isLoading, isError } = useGetRFQs();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">All RFQs</h1>
        <Link
          href="/create"
          className="rounded border border-gray-300 bg-white px-3 py-1.5 text-sm hover:bg-gray-50"
        >
          + Create RFQ
        </Link>
      </div>

      {!FACTORY_ADDRESS && (
        <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {FACTORY_MISSING_MESSAGE}
        </div>
      )}

      {isLoading && (
        <p className="text-sm text-gray-500">Loading RFQs...</p>
      )}

      {isError && (
        <p className="text-sm text-red-600">Failed to load RFQs. Check your RPC connection.</p>
      )}

      {!isLoading && rfqAddresses && rfqAddresses.length === 0 && (
        <p className="text-sm text-gray-500">
          No RFQs yet.{" "}
          <Link href="/create" className="underline">
            Create the first one.
          </Link>
        </p>
      )}

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
