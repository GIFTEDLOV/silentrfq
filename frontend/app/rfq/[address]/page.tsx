"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useAccount } from "wagmi";
import { AddressCopy } from "@/components/AddressCopy";
import { NetworkGuard } from "@/components/NetworkGuard";
import { TxStatus } from "@/components/TxStatus";
import { WalletConnect } from "@/components/WalletConnect";
import { EXPECTED_CHAIN_ID } from "@/config/contracts";
import { useFinalize, useRFQ, useWinnerAddress } from "@/hooks/useRFQ";
import { BidSection } from "./BidSection";
import { RevealSection } from "./RevealSection";

function formatDate(unixSeconds: bigint): string {
  return new Date(Number(unixSeconds) * 1000).toLocaleString();
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

  const { data: winnerAddr } = useWinnerAddress(
    rfqAddress,
    winnerRevealed === true
  );

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
  const pastDeadline =
    deadline !== undefined && nowSeconds >= Number(deadline);
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

  if (isLoading) {
    return <p className="text-sm text-gray-500">Loading RFQ...</p>;
  }

  if (isError || buyer === undefined) {
    return (
      <p className="text-sm text-red-600">
        Failed to load RFQ. Is the address correct?
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── RFQ info table ─────────────────────────────────────────────── */}
      <div>
        <h1 className="text-xl font-bold break-all">RFQ Detail</h1>
        <p className="mt-1 font-mono text-xs text-gray-500 break-all">
          {rfqAddress}
        </p>
      </div>

      <table className="w-full text-sm border border-gray-200 rounded">
        <tbody>
          <tr className="border-b border-gray-100">
            <td className="py-2 px-3 text-gray-500 w-32">Buyer</td>
            <td className="py-2 px-3">
              <AddressCopy address={buyer} />
            </td>
          </tr>
          <tr className="border-b border-gray-100">
            <td className="py-2 px-3 text-gray-500">Description</td>
            <td className="py-2 px-3">{description}</td>
          </tr>
          <tr className="border-b border-gray-100">
            <td className="py-2 px-3 text-gray-500">Deadline</td>
            <td className="py-2 px-3">
              {deadline !== undefined ? formatDate(deadline) : "—"}
              {deadline !== undefined && (
                <span
                  className={`ml-2 text-xs ${
                    pastDeadline ? "text-red-500" : "text-green-600"
                  }`}
                >
                  ({pastDeadline ? "expired" : "active"})
                </span>
              )}
            </td>
          </tr>
          <tr className="border-b border-gray-100">
            <td className="py-2 px-3 text-gray-500">Status</td>
            <td className="py-2 px-3">
              {finalized ? (
                <span className="rounded bg-gray-200 px-2 py-0.5 text-xs text-gray-600">
                  Finalized
                </span>
              ) : (
                <span className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-700">
                  Open
                </span>
              )}
            </td>
          </tr>
          <tr className={winnerRevealed ? "border-b border-gray-100" : ""}>
            <td className="py-2 px-3 text-gray-500">Vendors</td>
            <td className="py-2 px-3">
              {vendorCount?.toString() ?? "—"}
            </td>
          </tr>
          {winnerRevealed && winnerAddr && (
            <tr>
              <td className="py-2 px-3 text-gray-500">Winner</td>
              <td className="py-2 px-3">
                <AddressCopy address={winnerAddr as `0x${string}`} />
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* ── Winner revealed state ───────────────────────────────────────── */}
      {winnerRevealed && winnerAddr && (
        <div className="rounded border border-green-300 bg-green-50 p-4 space-y-1">
          <p className="text-sm font-semibold text-green-800">
            Winner revealed
          </p>
          <AddressCopy address={winnerAddr as `0x${string}`} />
          <p className="text-xs text-green-700 mt-1">
            Only the winning vendor address is revealed. Losing bid amounts
            remain private.
          </p>
        </div>
      )}

      {/* ── Vendor bid section (open RFQ, deadline not passed) ─────────── */}
      {!finalized && !pastDeadline && (
        <BidSection
          rfqAddress={rfqAddress}
          buyerAddress={buyer}
          onSuccess={refetch}
        />
      )}

      {/* ── Buyer finalize section ──────────────────────────────────────── */}
      {!finalized && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-gray-700">Finalize RFQ</h2>

          {!isConnected && (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Connect your wallet to finalize.
              </p>
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
              <div className="space-y-2">
                {!pastDeadline && deadline !== undefined && (
                  <p className="text-sm text-gray-500">
                    Deadline has not passed yet. You can finalize after{" "}
                    {formatDate(deadline)}.
                  </p>
                )}
                {pastDeadline && hasNoBids && (
                  <p className="text-sm text-gray-500">
                    No bids were submitted. Cannot finalize.
                  </p>
                )}
                <button
                  onClick={finalize}
                  disabled={!canFinalize || isPending || isConfirming}
                  className="rounded bg-gray-900 text-white px-4 py-2 text-sm disabled:opacity-40 hover:bg-gray-700"
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

      {/* ── Reveal section (finalized, winner not yet revealed) ─────────── */}
      {finalized && !winnerRevealed && (
        <RevealSection rfqAddress={rfqAddress} onSuccess={refetch} />
      )}
    </div>
  );
}
