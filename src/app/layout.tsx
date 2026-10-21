import type { Metadata } from "next";
import { Public_Sans, Libre_Bodoni } from "next/font/google";
import "./globals.css";

const publicSans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const libreBodoni = Libre_Bodoni({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BookLeaf Publishing — Author Support & Communication Portal",
  description:
    "AI-Assisted Author Support & Operations Portal for BookLeaf Publishing. Manage books, royalty inquiries, production stages, and policy-grounded support responses.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${publicSans.variable} ${libreBodoni.variable}`}
    >
      <body className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased selection:bg-[#1B4D7E] selection:text-white">
        {children}
      </body>
    </html>
  );
}
