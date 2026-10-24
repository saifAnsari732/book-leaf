import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Playfair_Display, Jost, Lato } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";
import { RealtimeTicketProvider } from "@/lib/use-ticket-realtime";
import { FloatingWhatsApp } from "@/components/support/floating-whatsapp";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const jost = Jost({
  subsets: ["latin"],
  variable: "--font-jost",
  display: "swap",
});

const lato = Lato({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-lato",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BookLeaf Publishing — World's #1 Self-Publishing Platform | Author Support",
  description:
    "Author Support & Publishing Operations Portal for BookLeaf Publishing. Manage books, royalty inquiries, production stages, and comprehensive author support.",
  icons: {
    icon: "/images/bookleaf/Slice_1pic.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${playfairDisplay.variable} ${jost.variable} ${lato.variable}`}
    >
      <body className="min-h-screen bg-[#F9FAF7] font-sans text-slate-800 antialiased selection:bg-[#0F4C3A] selection:text-white">
        <AuthProvider>
          <ToastProvider>
            <RealtimeTicketProvider>
              {children}
              <FloatingWhatsApp />
            </RealtimeTicketProvider>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
