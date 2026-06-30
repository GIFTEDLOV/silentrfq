"use client";

import dynamic from "next/dynamic";

const BidForm = dynamic(
  () => import("./BidForm").then((mod) => ({ default: mod.BidForm })),
  {
    ssr: false,
    loading: () => (
      <p className="text-sm text-gray-500">Loading encrypted bid form...</p>
    ),
  }
);

export default function DebugBidPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">Debug: Encrypted Bid</h1>
        <p className="mt-1 text-xs text-gray-400">
          Phase 3B — proves encrypted bid submission end-to-end on Sepolia.
        </p>
      </div>
      <BidForm />
    </div>
  );
}
