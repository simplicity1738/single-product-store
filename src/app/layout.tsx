import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Providers from "@/components/Providers";
import "./globals.css";

export const dynamic = "force-dynamic";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SimpliCity — Peptider av högsta kvalitet",
  description:
    "Peptider av högsta kvalitet. Noggrant utvalda produkter med fokus på kvalitet, renhet och konsekvens. För kunder som värdesätter höga standarder och pålitliga leveranser.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="sv"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-rose-50/30">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
