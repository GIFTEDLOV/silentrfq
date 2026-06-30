"use client";

import Link from "next/link";
import { useRFQ } from "@/hooks/useRFQ";

function formatDeadline(deadline: bigint): string {
  const date = new Date(Number(deadline) * 1000);
  const now = Date.now();
  const diff = date.getTime() - now;
  const expired = diff <= 0;
  return `${date.toLocaleString()} ${expired ? "(expired)" : "(active)"}`;
}

export function RFQCard({ address }: { address: `0x${string}` }) {
  const { description, deadline, finalized, isLoading } = useRFQ(address);

  return (
    <Link href={`/rfq/${address}`}>
      <div className="block rounded border border-gray-200 bg-white p-4 hover:border-gray-400 cursor-pointer">
        {isLoading ? (
          <p className="text-sm text-gray-400">Loading...</p>
        ) : (
          <>
            <div className="flex items-start justify-between gap-2">
              <p className="font-medium text-sm break-all">
                {description ?? "(no description)"}
              </p>
              <span
                className={`shrink-0 rounded px-2 py-0.5 text-xs font-semibold ${
                  finalized
                    ? "bg-gray-200 text-gray-600"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {finalized ? "Finalized" : "Open"}
              </span>
            </div>
            <p className="mt-1 text-xs text-gray-500 font-mono break-all">
              {address}
            </p>
            {deadline !== undefined && (
              <p className="mt-1 text-xs text-gray-500">
                Deadline: {formatDeadline(deadline)}
              </p>
            )}
          </>
        )}
      </div>
    </Link>
  );
}
