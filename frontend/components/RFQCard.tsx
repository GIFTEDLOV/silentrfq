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
  const isRevealed = status === "revealed";

  return (
    <Link href={`/rfq/${address}`}>
      <div
        className={`group relative block overflow-hidden rounded-2xl border p-6 transition-all duration-300 cursor-pointer hover:-translate-y-1
          ${
            isRevealed
              ? "border-zamaYellow/30 bg-zamaYellow/[0.04] hover:border-zamaYellow/50 hover:bg-zamaYellow/[0.07] hover:shadow-[0_12px_40px_rgba(255,210,8,0.12)]"
              : status === "open"
              ? "border-white/[0.08] bg-white/[0.025] hover:border-emerald-400/25 hover:bg-white/[0.05] hover:shadow-[0_12px_30px_rgba(16,185,129,0.08)]"
              : "border-white/[0.08] bg-white/[0.025] hover:border-white/[0.16] hover:bg-white/[0.05] hover:shadow-[0_12px_30px_rgba(255,210,8,0.06)]"
          }`}
      >
        {/* Left accent bar */}
        <div
          className={`absolute left-0 top-3 bottom-3 w-[3px] rounded-full transition-all duration-300
            ${
              isRevealed
                ? "bg-zamaYellow shadow-[0_0_8px_rgba(255,210,8,0.6)]"
                : status === "open"
                ? "bg-transparent group-hover:bg-emerald-400/70"
                : "bg-transparent group-hover:bg-zamaYellow/60"
            }`}
        />

        {isLoading ? (
          <div className="space-y-3 pl-4">
            <div className="h-5 w-3/4 rounded-lg bg-white/[0.06] animate-pulse" />
            <div className="h-3 w-1/2 rounded-lg bg-white/[0.04] animate-pulse" />
            <div className="h-3 w-1/3 rounded-lg bg-white/[0.04] animate-pulse" />
          </div>
        ) : (
          <div className="pl-4">
            <div className="flex items-start justify-between gap-4">
              <p className="font-display font-bold text-base text-white leading-snug">
                {description ?? "(no description)"}
              </p>
              <div className="flex items-center gap-2 shrink-0 mt-0.5">
                <StatusBadge status={status} />
                <ArrowRight className="h-4 w-4 text-slate-700 group-hover:text-slate-300 transition-colors" />
              </div>
            </div>

            <p className="mt-2 font-mono text-[11px] text-slate-700 group-hover:text-slate-600 transition-colors break-all">
              {address}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-1.5 text-xs">
              {deadlineDate && (
                <span className={`flex items-center gap-1.5 font-medium ${pastDeadline ? "text-red-400" : "text-slate-500"}`}>
                  <Calendar className="h-3.5 w-3.5" />
                  {deadlineDate.toLocaleString()}
                </span>
              )}
              {vendorCount !== undefined && (
                <span className="flex items-center gap-1.5 font-medium text-slate-500">
                  <Users className="h-3.5 w-3.5" />
                  {vendorCount.toString()} vendor{vendorCount === 1n ? "" : "s"}
                </span>
              )}
              {isRevealed && (
                <span className="font-bold text-zamaYellow">Winner revealed</span>
              )}
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}
