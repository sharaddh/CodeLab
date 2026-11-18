import type { Metadata } from "next";
import { JetBrains_Mono, VT323 } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const vt323 = VT323({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-terminal",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LeetCode Revision Lab // TERMINAL",
  description: "LeetCode + DSA Learning + Revision + Coding IDE",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${jetbrainsMono.variable} ${vt323.variable}`}>
      <body className="font-mono terminal-body">
        <div className="crt-overlay" aria-hidden="true" />
        <div className="min-h-screen flex flex-col relative z-10">
          <Navbar />
          <main className="flex-1 terminal-main">{children}</main>
        </div>
      </body>
    </html>
  );
}
