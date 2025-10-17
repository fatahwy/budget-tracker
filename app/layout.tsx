"use client";

import { Providers } from './providers';
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "./components/header";
import { usePathname } from 'next/navigation';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const path = usePathname();
  const isPublic = path.startsWith('/login') || path.startsWith('/signup');

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {!isPublic && (
          <Header />
        )}
        <div className={isPublic ? '' : "pt-25 p-5 flex justify-center"}>
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  );
}
