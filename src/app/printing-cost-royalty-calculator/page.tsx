import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, BookOpen, Calculator, Sparkles } from "lucide-react";
import { RoyaltyCalculator } from "@/components/calculator/royalty-calculator";
import { FloatingAgentChat } from "@/components/support/floating-agent-chat";

export const metadata: Metadata = {
  title: "Printing Cost & Author Royalty Calculator | BookLeaf Publishing",
  description:
    "Accurately calculate your book printing cost, distribution fees, and author royalty across India, US, and international retail channels with 80% to 100% royalty options.",
};

export default function PrintingCostRoyaltyCalculatorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/60 via-slate-50 to-white text-slate-800 flex flex-col justify-between">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-[#F05262]" />
            Back to BookLeaf Home
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/author-dashboard?menu=Royalty%20Withdrawal"
              className="text-xs font-semibold px-3.5 py-1.5 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
            >
              Royalty Dashboard
            </Link>
            <Link
              href="/create_book"
              className="text-xs font-semibold px-3.5 py-1.5 rounded-full bg-[#F05262] text-white hover:bg-[#d94151] transition-colors shadow-xs"
            >
              Publish a Book
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-100/80 border border-rose-200 text-[#F05262] text-xs font-bold uppercase tracking-wider mb-4 shadow-2xs">
            <Calculator className="w-4 h-4" />
            Transparent Author Royalty Engine
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Printing Cost & Royalty Calculator
          </h1>
          <p className="mt-3 text-base text-slate-600">
            Estimate your exact per-copy printing expenses, distribution margins, and your net author earnings across Amazon, Flipkart, and the BookLeaf Bookstore.
          </p>
        </div>

        {/* Embedded Calculator */}
        <RoyaltyCalculator />

        {/* Information Grid */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-[#F05262] flex items-center justify-center font-bold mb-4">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              100% Profit Share Model
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              With our Bestseller Breakthrough package, you retain 100% of net profits on BookLeaf Store sales and retail platforms, maximizing your royalties from day one.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold mb-4">
              <Calculator className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Dynamic Cost Engine
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Paperback print costs are calculated at (Pages × ₹0.60) + ₹12, with standard packaging and quality control charges. No hidden surcharges or surprise print fees.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold mb-4">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Global Distribution Reach
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Whether selling in INR on Amazon India or in USD across Ingram, Barnes & Noble, and Amazon US, our multi-currency engine guarantees automated distribution.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <p>© 2026 BookLeaf Publishing. All rights reserved.</p>
      </footer>

      {/* Nishtha Support Assistant */}
      <FloatingAgentChat />
    </div>
  );
}
