"use client";

import Link from "next/link";
import { ArrowRight, Calendar, Users } from "lucide-react";
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
      <div className="group block rounded-2xl border border-slate-200 bg-white p-5 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer">
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-4 w-3/4 rounded bg-slate-100 animate-pulse" />
            <div className="h-3 w-1/2 rounded bg-slate-100 animate-pulse" />
            <div className="h-3 w-1/3 rounded bg-slate-100 animate-pulse" />
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-3">
              <p className="font-semibold text-sm text-slate-900 break-words leading-snug group-hover:text-indigo-700 transition-colors">
                {description ?? "(no description)"}
              </p>
              <div className="flex items-center gap-2 shrink-0">
                <StatusBadge status={status} />
                <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-indigo-400 transition-colors" />
              </div>
            </div>

            <p className="mt-2 font-mono text-xs text-slate-400 break-all">{address}</p>

            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-slate-500">
              {deadlineDate && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span className={pastDeadline ? "text-red-500" : "text-slate-600"}>
                    {deadlineDate.toLocaleString()}
                  </span>
                </span>
              )}
              {vendorCount !== undefined && (
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {vendorCount.toString()} vendor{vendorCount === 1n ? "" : "s"}
                </span>
              )}
              {winnerRevealed && (
                <span className="font-semibold text-indigo-600">Winner revealed</span>
              )}
            </div>
          </>
        )}
      </div>
    </Link>
  );
}
