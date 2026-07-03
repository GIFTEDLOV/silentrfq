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

const SITE_URL = "https://silentrfq.xyz";
const SITE_TITLE = "SilentRFQ — Confidential RFQs on Zama FHE";
const SITE_DESCRIPTION = "Private supplier pricing. Publicly verifiable winner.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description:
    "Confidential supplier bidding for RFQs, powered by Zama FHE. Bids stay encrypted while the winner remains publicly verifiable.",
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: "SilentRFQ",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: SITE_TITLE }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/og-image.png"],
  },
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
