import Link from "next/link";
import type { ReactNode } from "react";

import { AuthNav } from "./AuthNav";
import "./styles.css";

export const metadata = {
  title: "MetaMarket",
  description: "Metadata-driven local services marketplace"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen">
          <header className="border-b border-slate-200 bg-white">
            <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
              <Link href="/services" className="text-sm font-semibold text-slate-950">
                MetaMarket
              </Link>
              <nav className="flex items-center gap-4 text-sm">
                <span className="hidden text-slate-500 sm:inline">Metadata-driven services</span>
                <Link href="/search" className="font-medium text-slate-700 hover:text-slate-950">
                  Search
                </Link>
                <Link
                  href="/provider/dashboard"
                  className="font-medium text-slate-700 hover:text-slate-950"
                >
                  Provider
                </Link>
                <AuthNav />
              </nav>
            </div>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
