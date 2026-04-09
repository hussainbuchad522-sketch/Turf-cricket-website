import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Turf Cricket - Book Your Slot",
  description: "Book your cricket turf slot online. Premium turf, easy booking, instant confirmation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("antialiased", inter.variable, "font-sans", geist.variable)}>
      <body className="min-h-screen font-sans">{children}</body>
    </html>
  );
}
