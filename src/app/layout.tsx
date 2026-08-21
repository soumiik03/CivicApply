import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CivicFlow | CivicApply Automation",
  description: "AI-powered web automation and self-healing workflow orchestrator",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
