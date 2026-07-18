import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "AI Emergency Response System",
    template: "%s | AI Emergency Response System",
  },
  description:
    "AI-powered emergency response platform for real-time triage, hospital coordination, and emergency management.",
  keywords: [
    "AI",
    "Emergency",
    "Healthcare",
    "Hospital",
    "Ambulance",
    "Gemini AI",
    "Next.js",
    "Django",
  ],
  authors: [{ name: "Shiwani Banjare" }],
  creator: "Shiwani Banjare",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
