"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAccount } from "wagmi";
import { ChevronLeft, ExternalLink, Share2 } from "lucide-react";
import { AddressCopy } from "@/components/AddressCopy";
import { LifecycleTimeline } from "@/components/LifecycleTimeline";
import { NetworkGuard } from "@/components/NetworkGuard";
import { PrivacyPanel } from "@/components/PrivacyPanel";
import { RoleIndicator } from "@/components/RoleIndicator";
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
    <div>
      <p className="text-xs font-medium text-slate-400">{label}</p>
      <div className="mt-0.5 text-sm text-slate-900">{value}</div>
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

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-4 w-24 rounded bg-slate-200 animate-pulse" />
        <div className="h-8 w-64 rounded bg-slate-200 animate-pulse" />
        <div className="h-32 rounded-2xl bg-slate-200 animate-pulse" />
      </div>
    );
  }

  if (isError || buyer === undefined) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-600">
        Failed to load RFQ. Check the address and your wallet network.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/rfqs"
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        All RFQs
      </Link>

      {/* Page header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {description ?? "RFQ Detail"}
          </h1>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs text-slate-400 break-all">{rfqAddress}</span>
            {isSepoliaChain && (
              <a
                href={`https://sepolia.etherscan.io/address/${rfqAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800"
              >
                Etherscan
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>
        <StatusBadge status={status} />
      </div>

      {/* Lifecycle timeline */}
      <LifecycleTimeline
        pastDeadline={pastDeadline}
        finalized={finalized ?? false}
        winnerRevealed={winnerRevealed ?? false}
      />

      {/* Two-column grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">

        {/* Left column */}
        <div className="space-y-5 lg:col-span-3">

          {/* RFQ info card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-slate-800">RFQ Details</h2>
            <div className="space-y-4">
              <InfoRow label="Buyer" value={<AddressCopy address={buyer} />} />
              <InfoRow label="Description" value={description ?? "-"} />
              <InfoRow
                label="Deadline"
                value={
                  deadline !== undefined ? (
                    <span>
                      {formatDate(deadline)}{" "}
                      <span className={`text-xs ${pastDeadline ? "text-red-500" : "text-emerald-600"}`}>
                        ({pastDeadline ? "expired" : "active"})
                      </span>
                    </span>
                  ) : (
                    "-"
                  )
                }
              />
              <InfoRow
                label="Vendors"
                value={vendorCount !== undefined ? `${vendorCount.toString()} submitted` : "-"}
              />
            </div>
          </div>

          {/* Winner card */}
          {winnerRevealed && winnerAddr && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-bold text-emerald-900">Winner Revealed</p>
                <button
                  onClick={() => navigator.clipboard.writeText(window.location.href)}
                  className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-800 transition-colors"
                  title="Copy link to this RFQ"
                >
                  <Share2 className="h-3 w-3" />
                  Share
                </button>
              </div>
              <div className="mt-2">
                <AddressCopy address={winnerAddr as `0x${string}`} />
              </div>
              {isSepoliaChain && (
                <a
                  href={`https://sepolia.etherscan.io/address/${winnerAddr}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800"
                >
                  View on Etherscan
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
              <p className="mt-3 text-xs text-emerald-700">
                Losing bid amounts remain encrypted and private. Only the winning vendor
                index was publicly decrypted via the Zama KMS gateway.
              </p>
            </div>
          )}

          {/* Privacy model */}
          <PrivacyPanel />
        </div>

        {/* Right column */}
        <div className="space-y-4 lg:col-span-2">

          {/* Role indicator */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Your role:</span>
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
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
              <h3 className="text-sm font-semibold text-slate-800">Finalize RFQ</h3>
              <p className="text-xs text-slate-500">
                The deadline has passed. The buyer finalizes to lock in the winning bid
                and authorize public decryption.
              </p>

              {!isConnected && (
                <div className="space-y-2">
                  <p className="text-sm text-slate-600">Connect your wallet to finalize.</p>
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
                      className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-40 transition-colors"
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
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
              <p className="text-sm font-bold text-emerald-900">RFQ Complete</p>
              <p className="mt-1.5 text-xs text-emerald-700">
                The winner has been publicly revealed via Zama KMS gateway decryption.
                No further actions are available.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
