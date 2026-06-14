import type { Metadata } from "next";
import PlausibleProvider from "next-plausible";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

let title = "HyperSpeed – AI App Builder";
let description = "Build your next app with AI in minutes";
let url = "https://hyperspeed.vercel.app/";
let ogimage = "https://hyperspeed.vercel.app/og-image.png";
let sitename = "HyperSpeed";

export const metadata: Metadata = {
  metadataBase: new URL(url),
  title,
  description,
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    images: [ogimage],
    title,
    description,
    url: url,
    siteName: sitename,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    images: [ogimage],
    title,
    description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <PlausibleProvider domain="hyperspeed.vercel.app" />
      </head>
      <body className="h-full">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
