import type { Metadata, Viewport } from "next";
import { Fraunces, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz", "SOFT"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: {
    default: "Love Garden — o jardim das memórias de vocês",
    template: "%s · Love Garden",
  },
  description:
    "Um site privado para guardar fotos, datas especiais e frases que contam a história do casal.",
  applicationName: "Love Garden",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Love Garden",
    title: "Love Garden — o jardim das memórias de vocês",
    description:
      "Um site privado para guardar fotos, datas especiais e frases que contam a história do casal.",
    images: ["/bg/floral-bg-v2.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#4c0519",
};

/**
 * Root layout component for the entire application.
 * Manages global fonts, metadata, and context providers.
 * Font variables live on <html> so the theme tokens declared on :root can resolve them.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable}`}
    >
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
