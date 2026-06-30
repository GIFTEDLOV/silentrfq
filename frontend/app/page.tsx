"use client";

import Link from "next/link";
import { WalletConnect } from "@/components/WalletConnect";
import { FACTORY_ADDRESS, FACTORY_MISSING_MESSAGE } from "@/config/contracts";

export default function HomePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">SilentRFQ</h1>
        <p className="mt-1 text-gray-600 text-sm">
          Confidential procurement bidding on Zama FHEVM. Vendors submit
          encrypted bids — losing amounts stay private forever.
        </p>
      </div>

      <div className="rounded border border-gray-200 bg-white p-4">
        <p className="mb-3 text-sm font-medium text-gray-700">
          Connect your wallet to get started.
        </p>
        <WalletConnect />
      </div>

      {!FACTORY_ADDRESS && (
        <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {FACTORY_MISSING_MESSAGE}
        </div>
      )}

      <div className="flex gap-3">
        <Link
          href="/create"
          className="rounded border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50"
        >
          Create RFQ
        </Link>
        <Link
          href="/rfqs"
          className="rounded border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50"
        >
          Browse RFQs
        </Link>
      </div>
    </div>
  );
}
