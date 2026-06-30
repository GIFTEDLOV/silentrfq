"use client";

import dynamic from "next/dynamic";

const RevealForm = dynamic(
  () => import("./RevealForm").then((mod) => ({ default: mod.RevealForm })),
  {
    ssr: false,
    loading: () => (
      <p className="text-sm text-gray-500">Loading gateway reveal form...</p>
    ),
  }
);

export default function DebugRevealPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">Debug: Gateway Reveal</h1>
        <p className="mt-1 text-xs text-gray-400">
          Phase 3C — proves winner reveal via Zama public decryption gateway on Sepolia.
        </p>
      </div>
      <RevealForm />
    </div>
  );
}
