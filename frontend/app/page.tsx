import Link from "next/link";
import { Building2, CheckCircle, Lock, Shield, Trophy } from "lucide-react";

const HOW_IT_WORKS = [
  {
    icon: Building2,
    step: "1",
    title: "Buyer creates RFQ",
    desc: "Post a request with a description and deadline. The contract address is public; bid logic is private.",
  },
  {
    icon: Lock,
    step: "2",
    title: "Vendors submit encrypted bids",
    desc: "Each vendor encrypts their price locally using the Zama SDK. Only a ciphertext lands on-chain.",
  },
  {
    icon: Trophy,
    step: "3",
    title: "Gateway reveals the winner",
    desc: "After finalization, the Zama KMS decrypts only the winning vendor index. Losing amounts stay private forever.",
  },
];

const TRUST_ITEMS = [
  "Zama FHEVM",
  "Sepolia Testnet",
  "Solidity Smart Contracts",
  "KMS Gateway Verified",
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

const FOR_EVALUATORS = [
  {
    title: "TFHE homomorphic comparison",
    desc: "Bid amounts are encrypted using TFHE. Comparison is done homomorphically - no zero-knowledge proof needed and no trusted intermediary.",
  },
  {
    title: "Permissionless reveal",
    desc: "Any wallet can submit the KMS decryption proof on-chain. Winner selection cannot be gamed or withheld.",
  },
  {
    title: "Verifiable on Sepolia",
    desc: "All contract logic is open source and independently verifiable. Factory and RFQ addresses are public.",
  },
];

export default function HomePage() {
  return (
    <div className="space-y-16">
      {/* Hero */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-8 py-14 text-white">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-indigo-400">
          Zama FHEVM - Season 3 Builder Track
        </p>
        <h1 className="mb-4 text-4xl font-bold leading-tight tracking-tight">
          Confidential supplier bidding<br />
          <span className="text-indigo-400">powered by Zama FHE</span>
        </h1>
        <p className="mb-8 max-w-xl text-sm leading-relaxed text-slate-300">
          Vendors submit encrypted price quotes. The smart contract compares bids
          homomorphically - without ever decrypting them. Only the winner is revealed.
          Losing amounts stay private forever.
        </p>
        <div className="flex flex-wrap gap-3 mb-10">
          <Link
            href="/create"
            className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 hover:bg-slate-100 transition-colors"
          >
            Create RFQ
          </Link>
          <Link
            href="/rfqs"
            className="rounded-xl border border-slate-600 px-5 py-2.5 text-sm font-semibold text-white hover:border-slate-400 hover:bg-slate-800 transition-colors"
          >
            View RFQs
          </Link>
        </div>
        <div className="flex flex-wrap items-center gap-4 border-t border-slate-800 pt-5">
          {TRUST_ITEMS.map((item) => (
            <span key={item} className="flex items-center gap-1.5 text-xs text-slate-400">
              <CheckCircle className="h-3.5 w-3.5 text-indigo-400" />
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Problem */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-5">
        <h2 className="mb-2 text-sm font-semibold text-amber-900">
          The problem with public RFQs on-chain
        </h2>
        <p className="text-sm leading-relaxed text-amber-800">
          On a standard EVM chain, every bid amount is visible in calldata. Competitors can
          read a rival&apos;s price before the deadline and undercut it by one unit. Suppliers
          can build long-term pricing databases on each other. This breaks the sealed-bid
          model that makes competitive procurement work.
        </p>
      </div>

      {/* How it works */}
      <div>
        <h2 className="mb-5 text-xl font-bold text-slate-900">How it works</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {HOW_IT_WORKS.map(({ step, title, desc, icon: Icon }) => (
            <div key={step} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600">
                <Icon className="h-5 w-5 text-white" />
              </div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-slate-400">
                Step {step}
              </p>
              <h3 className="mb-2 text-sm font-bold text-slate-900">{title}</h3>
              <p className="text-xs leading-relaxed text-slate-500">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Privacy model */}
      <div>
        <h2 className="mb-4 text-xl font-bold text-slate-900">Privacy model</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Public On-Chain
            </p>
            <ul className="space-y-2">
              {PUBLIC_ITEMS.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-slate-700">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5 shadow-sm">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-indigo-600">
              Encrypted / Private
            </p>
            <ul className="space-y-2">
              {PRIVATE_ITEMS.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-indigo-800">
                  <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-indigo-400" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Demo walkthrough */}
      <div>
        <h2 className="mb-4 text-xl font-bold text-slate-900">Demo walkthrough</h2>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <ol className="space-y-3">
            {DEMO_STEPS.map((text, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white">
                  {i + 1}
                </span>
                {text}
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* For evaluators */}
      <div>
        <h2 className="mb-4 text-xl font-bold text-slate-900">Built for evaluators</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {FOR_EVALUATORS.map(({ title, desc }) => (
            <div key={title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-2 flex items-center gap-2">
                <Shield className="h-4 w-4 text-indigo-500" />
                <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
              </div>
              <p className="text-xs leading-relaxed text-slate-500">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
