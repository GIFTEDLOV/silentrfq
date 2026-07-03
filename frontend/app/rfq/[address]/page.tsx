"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAccount } from "wagmi";
import { CheckCircle, ChevronLeft, ExternalLink, Share2, ShieldCheck, Trophy } from "lucide-react";
import { AddressCopy } from "@/components/AddressCopy";
import { LifecycleTimeline } from "@/components/LifecycleTimeline";
import { LiveVerificationPanel } from "@/components/LiveVerificationPanel";
import type { VerificationStatus } from "@/components/LiveVerificationPanel";
import { NetworkGuard } from "@/components/NetworkGuard";
import { PrivacyPanel } from "@/components/PrivacyPanel";
import { RoleIndicator } from "@/components/RoleIndicator";
import { ScrollReveal } from "@/components/ScrollReveal";
import { StatusBadge } from "@/components/StatusBadge";
import { TxStatus } from "@/components/TxStatus";
import { WalletConnect } from "@/components/WalletConnect";
import { EXPECTED_CHAIN_ID } from "@/config/contracts";
import { useFinalize, useRFQ, useWinnerAddress } from "@/hooks/useRFQ";
import { BidSection } from "./BidSection";
import { RevealSection } from "./RevealSection";
import type { RFQStatus } from "@/components/StatusBadge";

function formatDate(unixSeconds: bigint): string {
  return new Date(Number(unixSeconds) * 1000).toLocaleString();
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600">{label}</p>
      <div className="text-sm text-slate-200">{value}</div>
    </div>
  );
}

export default function RFQDetailPage() {
  const { address } = useParams<{ address: string }>();
  const rfqAddress = address as `0x${string}`;

  const {
    buyer,
    description,
    deadline,
    finalized,
    winnerRevealed,
    vendorCount,
    isLoading,
    isError,
    refetch,
  } = useRFQ(rfqAddress);

  const { data: winnerAddr } = useWinnerAddress(rfqAddress, winnerRevealed === true);

  const {
    finalize,
    hash,
    isPending,
    isConfirming,
    isSuccess: finalizeSuccess,
    error,
  } = useFinalize(rfqAddress);

  const { isConnected, chainId, address: connectedAddress } = useAccount();

  useEffect(() => {
    if (finalizeSuccess) refetch();
  }, [finalizeSuccess, refetch]);

  const nowSeconds = Math.floor(Date.now() / 1000);
  const pastDeadline = deadline !== undefined && nowSeconds >= Number(deadline);
  const isWrongNetwork = isConnected && chainId !== EXPECTED_CHAIN_ID;
  const hasNoBids = vendorCount !== undefined && vendorCount === 0n;
  const isBuyer =
    isConnected &&
    buyer !== undefined &&
    connectedAddress?.toLowerCase() === buyer.toLowerCase();

  const canFinalize =
    isConnected &&
    isBuyer &&
    !isWrongNetwork &&
    finalized === false &&
    pastDeadline &&
    !hasNoBids;

  const isSepoliaChain = chainId === 11155111;

  let status: RFQStatus = "open";
  if (winnerRevealed) status = "revealed";
  else if (finalized) status = "finalized";
  else if (pastDeadline) status = "expired";

  let verificationStatus: VerificationStatus = "open";
  if (winnerRevealed) verificationStatus = "revealed";
  else if (finalized) verificationStatus = "finalized";

  if (isLoading) {
    return (
      <div className="space-y-4 pt-4">
        <div className="h-4 w-24 rounded-lg bg-white/[0.06] animate-pulse" />
        <div className="h-10 w-80 rounded-lg bg-white/[0.06] animate-pulse" />
        <div className="h-32 rounded-2xl bg-white/[0.06] animate-pulse" />
      </div>
    );
  }

  if (isError || buyer === undefined) {
    return (
      <div className="rounded-2xl border border-danger/20 bg-danger/[0.06] p-5 text-sm text-red-400">
        Failed to load RFQ. Check the address and your wallet network.
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-2">
      {/* Back link — no reveal, always visible */}
      <Link
        href="/rfqs"
        className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-white transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        All RFQs
      </Link>

      {/* Verified result banner */}
      {winnerRevealed && (
        <ScrollReveal delay={0}>
          <div
            className="rounded-xl border border-zamaYellow/25 bg-zamaYellow/[0.05] px-5 py-3.5 flex items-center gap-4"
            style={{ animation: "winner-glow 3.2s ease-in-out infinite" }}
          >
            <div
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zamaYellow shadow-[0_0_10px_rgba(255,210,8,0.4)]"
              style={{ animation: "checkmark-pulse 2.4s ease-in-out infinite" }}
            >
              <ShieldCheck className="h-3.5 w-3.5 text-ink" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white">Winner verified via Zama KMS gateway</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Losing bid amounts remain permanently encrypted on-chain
              </p>
            </div>
            <span className="shrink-0 font-mono text-[10px] font-bold text-zamaYellow/60 tracking-widest">
              VERIFIED &middot; SEPOLIA
            </span>
          </div>
        </ScrollReveal>
      )}

      {/* Page header */}
      <ScrollReveal delay={winnerRevealed ? 80 : 0}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-white leading-tight">
              {description ?? "RFQ Detail"}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs text-slate-600 break-all">{rfqAddress}</span>
              {isSepoliaChain && (
                <a
                  href={`https://sepolia.etherscan.io/address/${rfqAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium text-fheBlueSoft hover:underline"
                >
                  Etherscan <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
          <StatusBadge status={status} />
        </div>
      </ScrollReveal>

      {/* Lifecycle timeline */}
      <ScrollReveal delay={winnerRevealed ? 120 : 80}>
        <LifecycleTimeline
          pastDeadline={pastDeadline}
          finalized={finalized ?? false}
          winnerRevealed={winnerRevealed ?? false}
        />
      </ScrollReveal>

      {/* Live Verification */}
      <ScrollReveal delay={winnerRevealed ? 160 : 100}>
        <LiveVerificationPanel
          rfqAddress={rfqAddress}
          winnerAddress={winnerRevealed && winnerAddr ? (winnerAddr as `0x${string}`) : undefined}
          status={verificationStatus}
        />
      </ScrollReveal>

      {/* Two-column grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">

        {/* Left column */}
        <div className="space-y-5 lg:col-span-3">

          {/* RFQ info card */}
          <ScrollReveal delay={winnerRevealed ? 160 : 120}>
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
              <h2 className="mb-5 text-[10px] font-bold uppercase tracking-widest text-slate-600">
                RFQ Details
              </h2>
              <div className="space-y-5">
                <InfoRow label="Buyer" value={<AddressCopy address={buyer} />} />
                <InfoRow label="Description" value={description ?? "—"} />
                <InfoRow
                  label="Deadline"
                  value={
                    deadline !== undefined ? (
                      <span>
                        {formatDate(deadline)}{" "}
                        <span
                          className={`text-xs font-semibold ${
                            pastDeadline ? "text-red-400" : "text-emerald-400"
                          }`}
                        >
                          ({pastDeadline ? "expired" : "active"})
                        </span>
                      </span>
                    ) : (
                      "—"
                    )
                  }
                />
                <InfoRow
                  label="Vendors"
                  value={
                    vendorCount !== undefined
                      ? `${vendorCount.toString()} submitted`
                      : "—"
                  }
                />
              </div>
            </div>
          </ScrollReveal>

          {/* Winner card */}
          {winnerRevealed && winnerAddr && (
            <ScrollReveal delay={200}>
              <div
                className="rounded-2xl border border-zamaYellow/40 bg-zamaYellow/[0.06] p-6"
                style={{ animation: "winner-glow 3.2s ease-in-out infinite" }}
              >
                <div className="mb-5 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-full bg-zamaYellow shadow-[0_0_24px_rgba(255,210,8,0.45)]"
                      style={{ animation: "checkmark-pulse 2.4s ease-in-out infinite" }}
                    >
                      <Trophy className="h-6 w-6 text-ink" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-zamaYellow/60">
                        Verified Result
                      </p>
                      <p className="font-display text-xl font-bold text-white">Winner Revealed</p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigator.clipboard.writeText(window.location.href)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.12] px-3 py-1.5 text-xs font-medium text-slate-400 hover:border-white/[0.22] hover:text-white transition-colors"
                    title="Copy link to this RFQ"
                  >
                    <Share2 className="h-3 w-3" />
                    Share
                  </button>
                </div>

                <div className="rounded-xl border border-zamaYellow/20 bg-black/[0.20] p-5 mb-4">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-600">
                    Winning Vendor Address
                  </p>
                  <p className="font-mono text-sm font-bold text-white break-all leading-relaxed mb-3">
                    {winnerAddr}
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    <AddressCopy address={winnerAddr as `0x${string}`} />
                    {isSepoliaChain && (
                      <a
                        href={`https://sepolia.etherscan.io/address/${winnerAddr}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-medium text-fheBlueSoft hover:underline"
                      >
                        View on Etherscan <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>

                <p className="text-xs leading-relaxed text-slate-500">
                  Only the winning vendor address was publicly decrypted via the Zama KMS gateway.
                  All losing bid amounts remain permanently encrypted on-chain.
                </p>
              </div>
            </ScrollReveal>
          )}

          {/* Privacy model */}
          <ScrollReveal delay={winnerRevealed ? 200 : 160}>
            <PrivacyPanel />
          </ScrollReveal>
        </div>

        {/* Right column */}
        <div className="space-y-4 lg:col-span-2">
          <ScrollReveal delay={winnerRevealed ? 160 : 120}>
            <div className="space-y-4">
              {/* Role indicator */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-600">Your role:</span>
                <RoleIndicator isConnected={isConnected} isBuyer={isBuyer} />
              </div>

              {/* Bidding open */}
              {!finalized && !pastDeadline && (
                <BidSection
                  rfqAddress={rfqAddress}
                  buyerAddress={buyer}
                  onSuccess={refetch}
                />
              )}

              {/* Deadline passed, not yet finalized */}
              {pastDeadline && !finalized && (
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 space-y-4">
                  <div>
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-600">
                      Deadline Passed
                    </p>
                    <h3 className="font-display text-lg font-bold text-white">Finalize RFQ</h3>
                    <p className="mt-1 text-xs text-slate-500">
                      Lock the winning bid and authorize public decryption via the Zama KMS gateway.
                    </p>
                  </div>

                  {!isConnected && (
                    <div className="space-y-3">
                      <p className="text-sm text-slate-300">Connect your wallet to finalize.</p>
                      <WalletConnect />
                    </div>
                  )}

                  {isConnected && !isBuyer && buyer !== undefined && (
                    <p className="text-sm text-slate-500">
                      Only the buyer can finalize this RFQ.
                    </p>
                  )}

                  {isConnected && isBuyer && (
                    <NetworkGuard>
                      <div className="space-y-3">
                        {hasNoBids && (
                          <p className="text-sm text-slate-500">
                            No bids were submitted. Cannot finalize.
                          </p>
                        )}
                        <button
                          onClick={finalize}
                          disabled={!canFinalize || isPending || isConfirming}
                          className="w-full rounded-xl bg-white px-4 py-3 text-sm font-bold text-ink hover:bg-slate-100 disabled:opacity-40 transition-colors"
                        >
                          {isPending
                            ? "Waiting for wallet..."
                            : isConfirming
                            ? "Confirming..."
                            : "Finalize RFQ"}
                        </button>
                      </div>
                    </NetworkGuard>
                  )}

                  <TxStatus
                    isPending={isPending}
                    isConfirming={isConfirming}
                    isSuccess={finalizeSuccess}
                    error={error}
                    hash={hash}
                  />
                </div>
              )}

              {/* Finalized, winner not yet revealed */}
              {finalized && !winnerRevealed && (
                <RevealSection rfqAddress={rfqAddress} onSuccess={refetch} />
              )}

              {/* Complete */}
              {winnerRevealed && (
                <div className="rounded-2xl border border-zamaYellow/30 bg-zamaYellow/[0.05] p-6 space-y-3 shadow-[0_0_30px_rgba(255,210,8,0.07)]">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-zamaYellow" />
                    <p className="font-display text-lg font-bold text-white">RFQ Complete</p>
                  </div>
                  <p className="text-sm text-slate-400">
                    The winner has been publicly revealed via Zama KMS gateway decryption.
                    No further actions are available.
                  </p>
                </div>
              )}
            </div>
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
}
