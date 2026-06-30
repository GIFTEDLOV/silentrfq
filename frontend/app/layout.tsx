import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

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
          <header className="border-b border-gray-200 bg-white px-6 py-3 flex items-center justify-between">
            <a href="/" className="font-bold text-lg">
              SilentRFQ
            </a>
            <nav className="flex gap-4 text-sm">
              <a href="/create" className="hover:underline">
                Create RFQ
              </a>
              <a href="/rfqs" className="hover:underline">
                Browse RFQs
              </a>
            </nav>
          </header>
          <main className="max-w-2xl mx-auto px-6 py-8">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
