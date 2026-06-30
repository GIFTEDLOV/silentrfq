"use client";

import Link from "next/link";

const HOW_IT_WORKS = [
  {
    step: "1",
    title: "Buyer creates RFQ",
    desc: "Post a request with a description and deadline. The contract address is public; bid logic is private.",
  },
  {
    step: "2",
    title: "Vendors submit encrypted bids",
    desc: "Each vendor encrypts their price locally using the Zama SDK. Only a ciphertext lands on-chain.",
  },
  {
    step: "3",
    title: "Gateway reveals the winner",
    desc: "After finalization, the Zama KMS decrypts only the winning vendor index. Losing amounts stay private forever.",
  },
];

const DEMO_STEPS = [
  "Buyer creates RFQ with a description and deadline.",
  "Vendors initialize the Zama SDK and submit encrypted bid amounts.",
  "Buyer calls finalize() after the deadline passes.",
  "Anyone submits the KMS-signed proof via callbackRevealWinner.",
  "Winner address is revealed. All other bid amounts remain encrypted permanently.",
];

const PUBLIC_ITEMS = [
  "RFQ description and deadline",
  "Vendor wallet addresses",
  "Total bid count",
  "Winner address (after reveal only)",
];

const PRIVATE_ITEMS = [
  "Individual bid amounts",
  "Losing bid amounts (permanently)",
  "Winning bid amount (buyer-only FHE access)",
  "Live ranking during bidding",
];

export default function HomePage() {
  return (
    <div className="space-y-12">
      {/* Hero */}
      <div className="rounded-xl bg-gray-900 px-8 py-12 text-white">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400">
          Zama FHEVM - Season 3 Builder Track
        </p>
        <h1 className="mb-4 text-3xl font-bold leading-tight tracking-tight">
          Confidential supplier bidding<br />
          powered by Zama FHE
        </h1>
        <p className="mb-8 max-w-xl text-sm leading-relaxed text-gray-300">
          Vendors submit encrypted price quotes. The smart contract compares bids
          homomorphically - without ever decrypting them. Only the winner is revealed.
          Losing amounts stay private forever.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/create"
            className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-100 transition-colors"
          >
            Create RFQ
          </Link>
          <Link
            href="/rfqs"
            className="rounded-lg border border-gray-600 px-5 py-2.5 text-sm font-semibold text-white hover:border-gray-400 hover:bg-gray-800 transition-colors"
          >
            View RFQs
          </Link>
        </div>
      </div>

      {/* Problem */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-6 py-5">
        <h2 className="mb-2 text-sm font-semibold text-amber-900">
          The problem with public RFQs on-chain
        </h2>
        <p className="text-sm leading-relaxed text-amber-800">
          On a standard EVM chain, every bid amount is visible in calldata. Competitors can
          read a rival's price before the deadline and undercut it by one unit. Suppliers
          can build long-term pricing databases on each other. This breaks the sealed-bid
          model that makes competitive procurement work.
        </p>
      </div>

      {/* How it works */}
      <div>
        <h2 className="mb-5 text-base font-semibold text-gray-900">How it works</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {HOW_IT_WORKS.map(({ step, title, desc }) => (
            <div key={step} className="rounded-lg border border-gray-200 bg-white p-5">
              <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-sm font-bold text-white">
                {step}
              </div>
              <h3 className="mb-1.5 text-sm font-semibold text-gray-900">{title}</h3>
              <p className="text-xs leading-relaxed text-gray-500">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Privacy model */}
      <div>
        <h2 className="mb-4 text-base font-semibold text-gray-900">Privacy model</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
              Public on-chain
            </p>
            <ul className="space-y-2">
              {PUBLIC_ITEMS.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="mt-0.5 shrink-0 text-gray-400">-</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-blue-500">
              Encrypted / private
            </p>
            <ul className="space-y-2">
              {PRIVATE_ITEMS.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-blue-800">
                  <span className="mt-0.5 shrink-0 text-blue-400">-</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Demo walkthrough */}
      <div>
        <h2 className="mb-4 text-base font-semibold text-gray-900">Demo walkthrough</h2>
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <ol className="space-y-3">
            {DEMO_STEPS.map((text, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600">
                  {i + 1}
                </span>
                {text}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
