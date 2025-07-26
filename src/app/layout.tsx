import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/providers";

import { Header } from "@/components/layout/header";
import ProgressBar from "@/components/ProgressBar";
import { Suspense } from 'react';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PAJO PHARMA",
  description: "Système de gestion de pharmacie",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <Suspense>
            <ProgressBar />
          </Suspense>
          <Header />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}

