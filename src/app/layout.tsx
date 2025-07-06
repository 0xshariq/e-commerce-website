import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Toaster } from "@/components/ui/sonner";
import AuthProvider from "@/lib/auth-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "E-commerce Website",
  keywords: [
    "e-commerce",
    "online shopping",
    "buy products",
    "sell products",
    "shopping cart",
    "checkout",
    "product listings",
    "user accounts",
  ],
  authors: [
    {
      name: "Sharique Chaudhary",
      url: "https://portfolio-sigma-rose-22.vercel.app/",
    },
  ],
  creator: "Sharique Chaudhary",
  description:
    "An e-commerce website built with Next.js, TypeScript, and Tailwind CSS, featuring a modern design and user-friendly interface. Browse products, add to cart, and enjoy a seamless shopping experience.",
    
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <Navbar />
          {children}
          <Footer />
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
