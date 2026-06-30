import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { NavBar } from "@/components/NavBar";

export const metadata: Metadata = {
  title: "SilentRFQ",
  description: "Confidential procurement bidding on Zama FHEVM",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <Providers>
          <NavBar />
          <main className="max-w-5xl mx-auto px-6 py-8">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
