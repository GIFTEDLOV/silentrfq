import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { NavBar } from "@/components/NavBar";
import { AnimatedBackground } from "@/components/AnimatedBackground";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SilentRFQ — Confidential RFQs on Zama FHE",
  description:
    "Confidential supplier bidding for RFQs, powered by Zama FHE. Bids stay encrypted while the winner remains publicly verifiable.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen font-sans antialiased bg-[#01030A]">
        <AnimatedBackground />
        <div className="relative z-10 min-h-screen">
          <Providers>
            <NavBar />
            <main className="max-w-6xl mx-auto px-6 py-10">{children}</main>
          </Providers>
        </div>
      </body>
    </html>
  );
}
