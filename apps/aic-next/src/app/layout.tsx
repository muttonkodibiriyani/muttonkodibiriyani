import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AIC Portal Redesign",
  description: "Next.js migration shell for Alshaya Investment Council portal"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
