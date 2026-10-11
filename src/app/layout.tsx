import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

import { Toaster } from "@/components/ui/sonner";
import { siteConfig } from "@/config/site";
import { siteUrl } from "@/lib/site-url";

const instrumentSans = localFont({
  src: "./fonts/instrument-sans-latin.woff2",
  weight: "400 700",
  variable: "--font-instrument-sans",
  display: "swap",
});

const martianMono = localFont({
  src: "./fonts/martian-mono-latin.woff2",
  weight: "100 800",
  variable: "--font-martian-mono",
  display: "swap",
});

// Atelier theme: one editorial grotesk for display and headings.
const familjen = localFont({
  src: "./fonts/familjen-grotesk-latin.woff2",
  weight: "400 700",
  variable: "--font-familjen",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteConfig.title,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
  // Share images come from app/opengraph-image.tsx (file convention).
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
  },
};

// Browser chrome matches the canvas in both themes (Dark Mode v2).
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0B0A09" },
    { media: "(prefers-color-scheme: dark)", color: "#0B0A09" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${instrumentSans.variable} ${martianMono.variable} ${familjen.variable} dark h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
