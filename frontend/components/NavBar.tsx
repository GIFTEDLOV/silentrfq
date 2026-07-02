"use client";

import Link from "next/link";
import { WalletConnect } from "@/components/WalletConnect";

export function NavBar() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-gray-950/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="font-display text-xl font-bold text-white tracking-tight">
              SilentRFQ
            </span>
            <span className="hidden sm:inline-block text-[10px] font-bold tracking-widest uppercase bg-zamaYellow/10 text-zamaYellow border border-zamaYellow/20 rounded-full px-2.5 py-0.5">
              Sepolia
            </span>
          </Link>
          <nav className="hidden sm:flex items-center gap-6">
            <Link
              href="/"
              className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
            >
              Home
            </Link>
            <Link
              href="/rfqs"
              className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
            >
              RFQs
            </Link>
            <Link
              href="/create"
              className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
            >
              Create RFQ
            </Link>
          </nav>
        </div>
        <WalletConnect />
      </div>
    </header>
  );
}
