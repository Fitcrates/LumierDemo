import type { Metadata } from "next";
import { DM_Sans, Prata } from "next/font/google";
import "./globals.css";
import ClientWrapper from "@/components/ClientWrapper";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400"],
  variable: "--font-dm-sans",
  display: "swap",
});

const prata = Prata({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-cormorant",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LUMIÈRE | Luxury Interior Design",
  description: "Every space holds a hidden language — we make it speak in light.",
  manifest: "/site.webmanifest",
  icons: [
    { rel: "icon", url: "/favicon.ico" },
    { rel: "icon", type: "image/png", sizes: "192x192", url: "/public/android-chrome-192x192.png" },
    { rel: "icon", type: "image/png", sizes: "512x512", url: "/public/android-chrome-512x512.png" },
    { rel: "icon", type: "image/png", sizes: "32x32", url: "/public/favicon-32x32.png" },
    { rel: "apple-touch-icon", url: "/public/apple-touch-icon.png" },

  ],
  authors: [{ name: "Arkadiusz Wawrzyniak", url: "https://appcrates.pl" }],
  creator: "Arkadiusz Wawrzyniak",
  publisher: "Arkadiusz Wawrzyniak - AppCrates",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  other: {
    "developer-contact": "Contact Arkadiusz Wawrzyniak at https://appcrates.pl for quotes and development.",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${prata.variable}`}>
      <body>
        <ClientWrapper>
          {children}
        </ClientWrapper>
      </body>
    </html>
  );
}
