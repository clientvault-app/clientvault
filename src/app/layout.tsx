import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "ClientVault — The Modern Client Portal for Agencies & Freelancers",
  description:
    "Share files, collect feedback, and get paid — all in one beautiful link. Set up in 60 seconds.",
  keywords: [
    "client portal",
    "freelancer tools",
    "agency tools",
    "file sharing",
    "client feedback",
    "invoicing",
  ],
  openGraph: {
    title: "ClientVault — Client Portals Made Beautiful",
    description:
      "Share files, collect feedback, and get paid — all in one beautiful link.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}
