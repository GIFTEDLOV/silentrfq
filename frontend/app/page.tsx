import Link from "next/link";
import {
  CheckCircle,
  Eye,
  FileLock2,
  List,
  Lock,
  PlayCircle,
  ShieldCheck,
  ShieldOff,
  Shield,
  Trophy,
  Zap,
} from "lucide-react";
import { ScrollReveal } from "@/components/ScrollReveal";

const DEMO_RFQ_ADDRESS = "0x6272ea767fa6e6668173F5a4D532885ce1D2502E";

const DEMO_GUIDE_STEPS = [
  {
    step: "1",
    icon: ShieldCheck,
    title: "Open the verified RFQ",
    desc: "See a completed RFQ with a real, live Sepolia contract address.",
    href: `/rfq/${DEMO_RFQ_ADDRESS}`,
  },
  {
    step: "2",
    icon: Trophy,
    title: "Check the revealed winner",
    desc: "The winning vendor address was publicly decrypted via the Zama KMS gateway.",
    href: `/rfq/${DEMO_RFQ_ADDRESS}`,
  },
  {
    step: "3",
    icon: Lock,
    title: "Confirm losing bids remain encrypted",
    desc: "Every other bid amount stays permanently unreadable on-chain.",
    href: `/rfq/${DEMO_RFQ_ADDRESS}`,
  },
  {
    step: "4",
    icon: List,
    title: "Browse all Sepolia RFQs",
    desc: "The full dashboard — every RFQ is real and independently verifiable.",
    href: "/rfqs",
  },
  {
    step: "5",
    icon: Zap,
    title: "Create your own RFQ",
    desc: "Deploy a confidential RFQ contract on Sepolia in under a minute.",
    href: "/create",
  },
];

const PROOF_STRIP = [
  { label: "Sepolia live", color: "#10B981" },
  { label: "Factory deployed", color: "#FFD208" },
  { label: "Encrypted bids", color: "#60A5FA" },
  { label: "Gateway reveal", color: "#60A5FA" },
  { label: "Public winner", color: "#FFD208" },
];

const WHY_WE_WIN = [
  {
    icon: Lock,
    title: "Bid amounts stay encrypted",
    desc: "Every bid is TFHE-ciphertext from the moment it leaves the vendor's browser. No plaintext price ever touches calldata.",
  },
  {
    icon: Eye,
    title: "Procurement remains auditable",
    desc: "RFQ metadata, vendor participation, and the final result are all public and independently verifiable on-chain.",
  },
  {
    icon: ShieldCheck,
    title: "Winner is publicly verifiable",
    desc: "The Zama KMS gateway decrypts only the winning index. Anyone can confirm the result without trusting the buyer.",
  },
  {
    icon: ShieldOff,
    title: "No offchain bid custody",
    desc: "There is no backend database, no offchain matcher, no custodian holding bid data. The contract is the only source of truth.",
  },
  {
    icon: FileLock2,
    title: "Built on Zama FHEVM",
    desc: "Homomorphic comparison happens directly on encrypted euint64 values using the audited Zama FHEVM primitives.",
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Buyer creates RFQ",
    desc: "Post a structured procurement request — goods, quantity, unit, currency, and requirements. Contract is deployed publicly — bid logic is private.",
  },
  {
    step: "02",
    title: "Vendors encrypt bids",
    desc: "Each vendor encrypts their price locally using the Zama SDK. Only a TFHE ciphertext lands on-chain. No plaintext, ever.",
  },
  {
    step: "03",
    title: "Buyer finalizes",
    desc: "After the deadline, the buyer calls finalize(). Bids have been compared homomorphically throughout the entire bidding period.",
  },
  {
    step: "04",
    title: "Gateway reveals winner",
    desc: "The Zama KMS decrypts only the winning vendor index. Any wallet submits the proof on-chain. Losing amounts stay private forever.",
  },
];

const TRUST_ITEMS = [
  "Sepolia tested",
  "42 tests passing",
  "Gateway reveal verified",
  "Losing bids stay private",
];

const FOR_EVALUATORS = [
  {
    title: "TFHE homomorphic comparison",
    desc: "Bid amounts are compared using TFHE operations on encrypted ciphertexts. No zero-knowledge proof needed. No trusted intermediary.",
  },
  {
    title: "Permissionless reveal",
    desc: "Any wallet can submit the KMS decryption proof on-chain. Winner selection cannot be gamed, withheld, or front-run.",
  },
  {
    title: "Verifiable on Sepolia",
    desc: "All contract logic is open source and independently verifiable. Factory and RFQ addresses are public on the testnet.",
  },
];

const MOCK_BIDS = [
  { id: "VENDOR_01", addr: "0x456c...f1dc", cipher: "0x1a4f8e...e839" },
  { id: "VENDOR_02", addr: "0x3BDC...6798", cipher: "0x8b2c1d...1f40" },
  { id: "VENDOR_03", addr: "0x9f2e...a011", cipher: "0x3d7ac9...c92e" },
];

function HeroVisual() {
  return (
    <div className="relative">
      <div
        className="absolute inset-0 rounded-3xl"
        style={{
          background:
            "radial-gradient(ellipse 80% 70% at 50% 50%, rgba(47,107,255,0.12) 0%, rgba(255,210,8,0.05) 70%, transparent 100%)",
          filter: "blur(24px)",
          transform: "scale(1.08)",
        }}
      />
      <div className="relative rounded-2xl border border-white/[0.08] bg-white/[0.02] overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06] bg-white/[0.02]">
          <div className="flex gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-white/[0.12]" />
            <div className="h-2.5 w-2.5 rounded-full bg-white/[0.08]" />
            <div className="h-2.5 w-2.5 rounded-full bg-white/[0.05]" />
          </div>
          <p className="ml-2 font-mono text-[10px] text-slate-600 flex-1">
            silentrfq / fhe-procurement-core
          </p>
          <div className="flex items-center gap-1.5">
            <div
              className="h-1.5 w-1.5 rounded-full bg-emerald-400"
              style={{ animation: "pulse-glow 2s ease-in-out infinite" }}
            />
            <span className="font-mono text-[10px] text-emerald-400">LIVE &middot; SEPOLIA</span>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-slate-700 mb-2.5">
              encrypted bid packets
            </p>
            <div className="space-y-1.5">
              {MOCK_BIDS.map((v, i) => (
                <div
                  key={v.id}
                  className="flex items-center gap-3 rounded-lg border border-white/[0.07] bg-white/[0.025] px-3 py-2.5"
                  style={{
                    animation: `packet-flow-in 700ms cubic-bezier(0.16,1,0.3,1) ${i * 250}ms both`,
                  }}
                >
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-fheBlue/25 bg-fheBlue/[0.10]">
                    <Lock className="h-2.5 w-2.5 text-fheBlueSoft" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[10px] font-bold text-slate-500">{v.id}</span>
                      <span className="font-mono text-[10px] text-slate-700">{v.addr}</span>
                    </div>
                    <p
                      className="font-mono text-[10px] text-fheBlueSoft/50 truncate"
                      style={{ animation: `pulse-glow 3s ease-in-out ${i * 0.4}s infinite` }}
                    >
                      bid: {v.cipher}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative rounded-xl border border-fheBlue/25 bg-fheBlue/[0.07] p-4 overflow-hidden">
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, transparent 0%, rgba(96,165,250,0.16) 45%, transparent 90%)",
                backgroundSize: "100% 300%",
                animation: "scan-glow 4.5s linear infinite",
              }}
            />
            <div className="relative flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-fheBlueSoft mb-1.5">
                  FHE comparison core
                </p>
                <p className="font-mono text-xs text-slate-300">
                  TFHE.min(euint64, euint64, euint64)
                </p>
                <p className="font-mono text-[10px] text-slate-600 mt-1">
                  Zama FHEVM &middot; 3 encrypted operands
                </p>
              </div>
              <div className="shrink-0 rounded-lg border border-fheBlue/20 bg-fheBlue/[0.10] px-2.5 py-1.5 text-right">
                <p className="font-mono text-[9px] text-slate-600">euint64</p>
                <p className="font-mono text-[9px] text-fheBlueSoft">private</p>
              </div>
            </div>
          </div>

          <div
            className="rounded-xl border border-zamaYellow/30 bg-zamaYellow/[0.07] p-4"
            style={{ animation: "winner-glow 3.2s ease-in-out infinite" }}
          >
            <div className="flex items-center justify-between gap-3 mb-2">
              <div>
                <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-zamaYellow/80 mb-1">
                  winner verified
                </p>
                <p className="font-mono text-sm font-bold text-white">0x3BDC...6798</p>
              </div>
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zamaYellow shadow-[0_0_12px_rgba(255,210,8,0.4)]"
                style={{ animation: "checkmark-pulse 2.4s ease-in-out infinite" }}
              >
                <CheckCircle className="h-4 w-4 text-ink" />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-mono text-[9px] text-slate-600">
                Losing bids: permanently encrypted
              </span>
              <span className="ml-auto font-mono text-[9px] text-zamaYellow/50">live Sepolia</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProofStrip() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-7 py-5">
      {PROOF_STRIP.map((item, i) => (
        <span
          key={item.label}
          className={`flex items-center gap-2.5 text-sm font-semibold text-slate-300 ${
            i > 0 ? "pl-6 border-l border-white/[0.08]" : ""
          }`}
        >
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{
              background: item.color,
              color: item.color,
              animation: "status-dot-pulse 2.4s ease-in-out infinite",
            }}
          />
          {item.label}
        </span>
      ))}
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="space-y-28">

      {/* Hero */}
      <section className="pt-10">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">

          {/* Left: text */}
          <div>
            <ScrollReveal delay={0}>
              <div className="inline-flex items-center gap-2.5 rounded-full border border-white/[0.10] bg-white/[0.04] px-4 py-2 mb-8">
                <span
                  className="h-1.5 w-1.5 rounded-full bg-zamaYellow"
                  style={{ animation: "pulse-glow 2s ease-in-out infinite" }}
                />
                <span className="text-xs font-bold tracking-[0.15em] uppercase text-slate-300">
                  Zama FHEVM&nbsp;&nbsp;&middot;&nbsp;&nbsp;Confidential Procurement&nbsp;&nbsp;&middot;&nbsp;&nbsp;Sepolia
                </span>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={80}>
              <h1 className="font-display text-5xl sm:text-6xl font-bold leading-[1.05] tracking-tight">
                <span className="text-white">Private supplier bids.</span>
                <br />
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage: "linear-gradient(90deg, #FFD208 0%, #FFE55C 50%, #FFD208 100%)",
                  }}
                >
                  Publicly verifiable winners.
                </span>
              </h1>
            </ScrollReveal>

            <ScrollReveal delay={120}>
              <p className="mt-6 max-w-lg text-base leading-relaxed text-slate-400">
                SilentRFQ lets buyers run supplier RFQs on-chain while vendors submit encrypted bid
                amounts. Zama FHE compares bids privately and reveals only the winning vendor.
              </p>
            </ScrollReveal>

            <ScrollReveal delay={160}>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/rfqs"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/[0.15] px-7 py-3.5 text-sm font-bold text-white hover:bg-white/[0.05] hover:border-white/[0.25] transition-all"
                >
                  Browse RFQs
                </Link>
                <Link
                  href="/create"
                  className="inline-flex items-center gap-2 rounded-xl bg-zamaYellow px-7 py-3.5 text-sm font-bold text-ink hover:bg-yellow-300 hover:shadow-[0_0_30px_rgba(255,210,8,0.35)] transition-all"
                >
                  <Zap className="h-4 w-4" />
                  Create RFQ
                </Link>
                <Link
                  href={`/rfq/${DEMO_RFQ_ADDRESS}`}
                  className="inline-flex items-center gap-2 rounded-xl border border-fheBlue/30 px-7 py-3.5 text-sm font-bold text-fheBlueSoft hover:bg-fheBlue/[0.08] hover:border-fheBlue/50 transition-all"
                >
                  View Verified Demo
                </Link>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2.5 border-t border-white/[0.07] pt-8">
                {TRUST_ITEMS.map((item) => (
                  <span key={item} className="flex items-center gap-2 text-xs font-medium text-slate-500">
                    <CheckCircle className="h-3.5 w-3.5 text-zamaYellow/70" />
                    {item}
                  </span>
                ))}
              </div>
            </ScrollReveal>
          </div>

          {/* Right: FHE visual */}
          <ScrollReveal delay={160}>
            <HeroVisual />
          </ScrollReveal>
        </div>

        {/* Proof strip */}
        <ScrollReveal delay={240}>
          <div className="mt-12">
            <ProofStrip />
          </div>
        </ScrollReveal>
      </section>

      {/* Demo guide — fastest judge path */}
      <section className="border-t border-white/[0.06] pt-20">
        <ScrollReveal>
          <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-5 text-xs font-bold tracking-[0.2em] uppercase text-fheBlueSoft">
                Judge demo guide
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-white leading-tight">
                Try the live demo.
              </h2>
            </div>
            <Link
              href={`/rfq/${DEMO_RFQ_ADDRESS}`}
              className="inline-flex items-center gap-2 rounded-xl border border-fheBlue/30 px-6 py-3 text-sm font-bold text-fheBlueSoft hover:bg-fheBlue/[0.08] hover:border-fheBlue/50 transition-all"
            >
              <PlayCircle className="h-4 w-4" />
              View Verified Demo
            </Link>
          </div>
        </ScrollReveal>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {DEMO_GUIDE_STEPS.map(({ step, icon: Icon, title, desc, href }, i) => (
            <ScrollReveal key={step} delay={Math.min(i * 70, 210)}>
              <Link href={href} className="group block h-full">
                <div className="rounded-2xl border border-fheBlue/15 bg-gradient-to-b from-fheBlue/[0.05] to-transparent p-6 hover:border-fheBlue/35 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(47,107,255,0.10)] transition-all h-full">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-fheBlue/25 bg-fheBlue/[0.08] group-hover:bg-fheBlue/[0.16] transition-colors">
                      <span className="font-display text-xs font-bold text-fheBlueSoft">{step}</span>
                    </div>
                    <Icon className="h-4 w-4 text-fheBlueSoft/60" />
                  </div>
                  <h3 className="mb-2 text-sm font-bold text-white">{title}</h3>
                  <p className="text-xs leading-relaxed text-slate-400">{desc}</p>
                </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Problem */}
      <ScrollReveal>
        <section className="border-t border-white/[0.06] pt-20">
          <div className="max-w-3xl">
            <p className="mb-5 text-xs font-bold tracking-[0.2em] uppercase text-zamaYellow">
              The Problem
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-6 leading-tight">
              Public on-chain RFQs leak supplier strategy.
            </h2>
            <p className="text-base leading-relaxed text-slate-400 mb-8">
              On a standard EVM chain, every bid amount lands in calldata — readable by anyone.
              Competitors read a rival&apos;s price before the deadline and undercut by one unit.
              Suppliers build long-term pricing databases on each other. This destroys the
              sealed-bid model that makes competitive procurement work.
            </p>
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
              <p className="text-sm font-bold text-white mb-4">SilentRFQ uses Zama FHEVM to fix this:</p>
              <ul className="space-y-2.5">
                {[
                  "Bid amounts are TFHE-encrypted before leaving the vendor's browser.",
                  "The smart contract compares bids homomorphically — no plaintext ever leaves FHE.",
                  "Only the winning vendor index is publicly decrypted via the Zama KMS gateway.",
                  "Losing bid amounts remain permanently encrypted on-chain.",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-slate-300">
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-zamaYellow" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* How it works */}
      <section className="border-t border-white/[0.06] pt-20">
        <ScrollReveal>
          <div className="mb-12">
            <p className="mb-5 text-xs font-bold tracking-[0.2em] uppercase text-zamaYellow">
              How it works
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white leading-tight">
              Four steps. Zero plaintext.
            </h2>
          </div>
        </ScrollReveal>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {HOW_IT_WORKS.map(({ step, title, desc }, i) => (
            <ScrollReveal key={step} delay={Math.min(i * 80, 200)}>
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 hover:bg-white/[0.05] hover:border-white/[0.12] hover:shadow-[0_0_24px_rgba(255,210,8,0.05)] transition-all h-full">
                <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-zamaYellow shadow-[0_0_16px_rgba(255,210,8,0.35)]">
                  <span className="font-display text-sm font-bold text-ink">{step}</span>
                </div>
                <h3 className="mb-2 text-sm font-bold text-white">{title}</h3>
                <p className="text-xs leading-relaxed text-slate-400">{desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Why SilentRFQ wins */}
      <section className="border-t border-white/[0.06] pt-20">
        <ScrollReveal>
          <div className="mb-12">
            <p className="mb-5 text-xs font-bold tracking-[0.2em] uppercase text-zamaYellow">
              Why SilentRFQ wins
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white leading-tight">
              Confidential by construction, verifiable by design.
            </h2>
          </div>
        </ScrollReveal>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
          {WHY_WE_WIN.map(({ icon: Icon, title, desc }, i) => (
            <ScrollReveal
              key={title}
              delay={Math.min(i * 70, 210)}
              className={i < 3 ? "lg:col-span-2" : "lg:col-span-3"}
            >
              <div className="group rounded-2xl border border-zamaYellow/15 bg-gradient-to-b from-zamaYellow/[0.05] to-transparent p-6 hover:border-zamaYellow/35 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(255,210,8,0.08)] transition-all h-full">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-zamaYellow/25 bg-zamaYellow/[0.08] group-hover:bg-zamaYellow/[0.14] transition-colors">
                  <Icon className="h-4.5 w-4.5 text-zamaYellow" />
                </div>
                <h3 className="mb-2 text-sm font-bold text-white">{title}</h3>
                <p className="text-xs leading-relaxed text-slate-400">{desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Privacy model */}
      <section className="border-t border-white/[0.06] pt-20">
        <ScrollReveal>
          <div className="mb-12">
            <p className="mb-5 text-xs font-bold tracking-[0.2em] uppercase text-zamaYellow">
              Privacy model
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white leading-tight">
              What stays public. What stays private.
            </h2>
          </div>
        </ScrollReveal>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <ScrollReveal delay={0}>
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 h-full">
              <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-slate-600">
                Public On-Chain
              </p>
              <ul className="space-y-3">
                {[
                  "RFQ description and deadline",
                  "Vendor wallet addresses",
                  "Total bid count",
                  "Winner address (after reveal only)",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-slate-400">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-600" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={80}>
            <div className="rounded-2xl border border-fheBlue/20 bg-fheBlue/[0.06] p-6 h-full">
              <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-fheBlueSoft">
                Encrypted / Private
              </p>
              <ul className="space-y-3">
                {[
                  "Individual bid amounts during bidding",
                  "Losing bid amounts (permanently encrypted)",
                  "Winning bid amount (buyer-only FHE access)",
                  "Live ranking during bidding period",
                  "Encrypted comparison path",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-slate-400">
                    <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-fheBlueSoft" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Built for evaluators */}
      <section className="border-t border-white/[0.06] pt-20 pb-8">
        <ScrollReveal>
          <div className="mb-12">
            <p className="mb-5 text-xs font-bold tracking-[0.2em] uppercase text-zamaYellow">
              Built for evaluators
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">
              What to verify.
            </h2>
            <p className="max-w-2xl text-slate-400">
              The full RFQ lifecycle has been tested end-to-end on Sepolia. Every step is
              independently verifiable on-chain.
            </p>
          </div>
        </ScrollReveal>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-10">
          {FOR_EVALUATORS.map(({ title, desc }, i) => (
            <ScrollReveal key={title} delay={Math.min(i * 80, 200)}>
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 hover:border-fheBlue/20 hover:bg-fheBlue/[0.03] transition-all h-full">
                <Shield className="h-4 w-4 text-fheBlueSoft mb-3" />
                <h3 className="mb-2 text-sm font-bold text-white">{title}</h3>
                <p className="text-xs leading-relaxed text-slate-400">{desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
        <ScrollReveal delay={120}>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/rfqs"
              className="inline-flex items-center gap-2 rounded-xl bg-zamaYellow px-5 py-2.5 text-sm font-bold text-ink hover:bg-yellow-300 hover:shadow-[0_0_25px_rgba(255,210,8,0.3)] transition-all"
            >
              <Trophy className="h-4 w-4" />
              Open RFQ Dashboard
            </Link>
            <Link
              href="/debug/bid"
              className="inline-flex items-center gap-2 rounded-xl border border-white/[0.10] bg-white/[0.03] px-5 py-2.5 text-sm font-medium text-slate-300 hover:border-white/[0.18] hover:bg-white/[0.06] transition-all"
            >
              Encrypted Bid Debug
            </Link>
            <Link
              href="/debug/reveal"
              className="inline-flex items-center gap-2 rounded-xl border border-white/[0.10] bg-white/[0.03] px-5 py-2.5 text-sm font-medium text-slate-300 hover:border-white/[0.18] hover:bg-white/[0.06] transition-all"
            >
              Gateway Reveal Debug
            </Link>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
