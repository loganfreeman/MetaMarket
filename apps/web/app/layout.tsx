import type { ReactNode } from "react";

import "./styles.css";

export const metadata = {
  title: "MetaMarket",
  description: "Metadata-driven local services marketplace"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
