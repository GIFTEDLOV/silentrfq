"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoMark } from "@/components/Logo";
import { WalletConnect } from "@/components/WalletConnect";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/rfqs", label: "RFQs" },
  { href: "/create", label: "Create RFQ" },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.05] bg-[#01030A]/88 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="group flex items-center gap-2.5">
            <span className="relative flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
              <span
                className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: "radial-gradient(circle, rgba(255,138,76,0.35) 0%, transparent 70%)", filter: "blur(8px)" }}
              />
              <LogoMark size={30} className="relative h-6 w-6 sm:h-[30px] sm:w-[30px] shrink-0" />
            </span>
            <span className="font-display text-xl font-bold text-white tracking-tight">
              SilentRFQ
            </span>
            <span className="hidden sm:inline-block text-[10px] font-bold tracking-widest uppercase bg-zamaYellow/10 text-zamaYellow border border-zamaYellow/20 rounded-full px-2.5 py-0.5">
              Sepolia
            </span>
          </Link>
          <nav className="hidden sm:flex items-center gap-1">
            {NAV_LINKS.map(({ href, label }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`relative rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200 hover:-translate-y-[1px] ${
                    isActive
                      ? "text-white bg-white/[0.06]"
                      : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  {label}
                  <span
                    className={`absolute inset-x-3 -bottom-[1px] h-[1.5px] rounded-full bg-zamaYellow transition-all duration-300 ${
                      isActive ? "opacity-100 shadow-[0_0_8px_rgba(255,210,8,0.6)]" : "opacity-0"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>
        </div>
        <WalletConnect />
      </div>
    </header>
  );
}
