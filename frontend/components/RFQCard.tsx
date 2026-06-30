"use client";

import Link from "next/link";
import { useRFQ } from "@/hooks/useRFQ";
import { StatusBadge } from "@/components/StatusBadge";
import type { RFQStatus } from "@/components/StatusBadge";

function deriveStatus(
  finalized: boolean | undefined,
  winnerRevealed: boolean | undefined,
  pastDeadline: boolean
): RFQStatus {
  if (winnerRevealed) return "revealed";
  if (finalized) return "finalized";
  if (pastDeadline) return "expired";
  return "open";
}

export function RFQCard({ address }: { address: `0x${string}` }) {
  const { description, deadline, finalized, winnerRevealed, vendorCount, isLoading } =
    useRFQ(address);

  const nowSeconds = Math.floor(Date.now() / 1000);
  const pastDeadline = deadline !== undefined && nowSeconds >= Number(deadline);
  const status = deriveStatus(finalized, winnerRevealed, pastDeadline);

  const deadlineDate = deadline !== undefined ? new Date(Number(deadline) * 1000) : null;

  return (
    <Link href={`/rfq/${address}`}>
      <div className="block rounded-lg border border-gray-200 bg-white p-5 hover:border-gray-400 hover:shadow-sm transition-all cursor-pointer">
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-4 w-3/4 rounded bg-gray-100 animate-pulse" />
            <div className="h-3 w-1/2 rounded bg-gray-100 animate-pulse" />
            <div className="h-3 w-1/3 rounded bg-gray-100 animate-pulse" />
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-3">
              <p className="font-medium text-sm text-gray-900 break-words leading-snug">
                {description ?? "(no description)"}
              </p>
              <StatusBadge status={status} />
            </div>

            <p className="mt-2 font-mono text-xs text-gray-400 break-all">{address}</p>

            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-gray-500">
              {deadlineDate && (
                <span>
                  Deadline:{" "}
                  <span className={pastDeadline ? "text-red-500" : "text-gray-700"}>
                    {deadlineDate.toLocaleString()}
                  </span>
                </span>
              )}
              {vendorCount !== undefined && (
                <span>
                  {vendorCount.toString()} vendor{vendorCount === 1n ? "" : "s"}
                </span>
              )}
              {winnerRevealed && (
                <span className="font-medium text-blue-600">Winner revealed</span>
              )}
            </div>
          </>
        )}
      </div>
    </Link>
  );
}
