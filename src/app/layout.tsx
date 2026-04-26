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
