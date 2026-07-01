"use client";

import Link from "next/link";
import { WalletConnect } from "@/components/WalletConnect";

export function NavBar() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-sm">
      <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="font-bold text-lg tracking-tight text-slate-900">
            Silent<span className="text-indigo-600">RFQ</span>
          </Link>
          <nav className="hidden sm:flex items-center gap-6 text-sm text-slate-500">
            <Link href="/rfqs" className="hover:text-slate-900 transition-colors">
              Browse RFQs
            </Link>
            <Link href="/create" className="hover:text-slate-900 transition-colors">
              Create RFQ
            </Link>
          </nav>
        </div>
        <WalletConnect />
      </div>
    </header>
  );
}
