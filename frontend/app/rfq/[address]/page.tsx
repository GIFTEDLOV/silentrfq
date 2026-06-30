"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAccount } from "wagmi";
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
      <p className="text-xs font-medium text-gray-400">{label}</p>
      <div className="mt-0.5 text-sm text-gray-900">{value}</div>
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

  // Derive status badge
  let status: RFQStatus = "open";
  if (winnerRevealed) status = "revealed";
  else if (finalized) status = "finalized";
  else if (pastDeadline) status = "expired";

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-4 w-24 rounded bg-gray-200 animate-pulse" />
        <div className="h-8 w-64 rounded bg-gray-200 animate-pulse" />
        <div className="h-32 rounded-lg bg-gray-200 animate-pulse" />
      </div>
    );
  }

  if (isError || buyer === undefined) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-5 text-sm text-red-600">
        Failed to load RFQ. Check the address and your wallet network.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link href="/rfqs" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
        Back to All RFQs
      </Link>

      {/* Page header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">RFQ Detail</h1>
        <p className="mt-0.5 font-mono text-xs text-gray-400 break-all">{rfqAddress}</p>
      </div>

      {/* Lifecycle timeline */}
      <LifecycleTimeline
        pastDeadline={pastDeadline}
        finalized={finalized ?? false}
        winnerRevealed={winnerRevealed ?? false}
      />

      {/* Two-column grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">

        {/* ── Left column: info + privacy ─────────────────────────────── */}
        <div className="space-y-5 lg:col-span-3">

          {/* RFQ info card */}
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <div className="mb-4 flex items-start justify-between gap-3">
              <h2 className="text-base font-semibold text-gray-900">RFQ Details</h2>
              <StatusBadge status={status} />
            </div>
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
            <div className="rounded-lg border border-green-300 bg-green-50 p-5">
              <p className="text-sm font-semibold text-green-800">Winner Revealed</p>
              <div className="mt-2">
                <AddressCopy address={winnerAddr as `0x${string}`} />
              </div>
              <p className="mt-2 text-xs text-green-700">
                Losing bid amounts remain encrypted and private. Only the winning vendor
                index was publicly decrypted via the Zama KMS gateway.
              </p>
            </div>
          )}

          {/* Privacy model */}
          <PrivacyPanel />
        </div>

        {/* ── Right column: role + active action ──────────────────────── */}
        <div className="space-y-4 lg:col-span-2">

          {/* Role indicator */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Your role:</span>
            <RoleIndicator isConnected={isConnected} isBuyer={isBuyer} />
          </div>

          {/* BIDDING OPEN: show BidSection */}
          {!finalized && !pastDeadline && (
            <BidSection
              rfqAddress={rfqAddress}
              buyerAddress={buyer}
              onSuccess={refetch}
            />
          )}

          {/* DEADLINE PASSED, NOT YET FINALIZED: show finalize panel */}
          {pastDeadline && !finalized && (
            <div className="rounded-lg border border-gray-200 bg-white p-5 space-y-3">
              <h3 className="text-sm font-semibold text-gray-800">Finalize RFQ</h3>
              <p className="text-xs text-gray-500">
                The deadline has passed. The buyer finalizes to lock in the winning bid
                and authorize public decryption.
              </p>

              {!isConnected && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Connect your wallet to finalize.</p>
                  <WalletConnect />
                </div>
              )}

              {isConnected && !isBuyer && buyer !== undefined && (
                <p className="text-sm text-gray-500">
                  Only the buyer can finalize this RFQ.
                </p>
              )}

              {isConnected && isBuyer && (
                <NetworkGuard>
                  <div className="space-y-3">
                    {hasNoBids && (
                      <p className="text-sm text-gray-500">
                        No bids were submitted. Cannot finalize.
                      </p>
                    )}
                    <button
                      onClick={finalize}
                      disabled={!canFinalize || isPending || isConfirming}
                      className="w-full rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-40 transition-colors"
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

          {/* FINALIZED, WINNER NOT YET REVEALED: show RevealSection */}
          {finalized && !winnerRevealed && (
            <RevealSection rfqAddress={rfqAddress} onSuccess={refetch} />
          )}

          {/* COMPLETE: winner already revealed */}
          {winnerRevealed && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-5">
              <p className="text-sm font-semibold text-green-800">RFQ Complete</p>
              <p className="mt-1.5 text-xs text-green-700">
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
