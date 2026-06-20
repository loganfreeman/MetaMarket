import Link from "next/link";
import type { ReactNode } from "react";

import "./styles.css";

export const metadata = {
  title: "MetaMarket Admin",
  description: "Metadata publishing console"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen">
          <header className="border-b border-slate-200 bg-white">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
              <Link href="/" className="text-sm font-semibold text-slate-950">
                MetaMarket Admin
              </Link>
              <span className="text-sm text-slate-500">Metadata publishing console</span>
            </div>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
