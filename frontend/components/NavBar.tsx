"use client";

import Link from "next/link";
import { WalletConnect } from "@/components/WalletConnect";

export function NavBar() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="font-bold text-lg text-gray-900 tracking-tight">
            SilentRFQ
          </Link>
          <nav className="hidden sm:flex items-center gap-6 text-sm text-gray-600">
            <Link href="/rfqs" className="hover:text-gray-900 transition-colors">
              Browse RFQs
            </Link>
            <Link href="/create" className="hover:text-gray-900 transition-colors">
              Create RFQ
            </Link>
          </nav>
        </div>
        <WalletConnect />
      </div>
    </header>
  );
}
