"use client";

import React, { useState } from "react";
import { BookRecord, SafeUser } from "@/types/domain";
import { useToast } from "@/context/ToastContext";
import {
  ArrowRight,
  BarChart3,
  Check,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  Flame,
  Globe,
  Instagram,
  Loader2,
  Lock,
  Megaphone,
  Share2,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { RazorpayModal } from "@/components/payment/RazorpayModal";

interface AuthorDashboardPromotionViewProps {
  books: BookRecord[];
  author: SafeUser;
}

export function AuthorDashboardPromotionView({
  books,
  author,
}: AuthorDashboardPromotionViewProps) {
  const toast = useToast();
  const [selectedBookId, setSelectedBookId] = useState<string>(
    books[0]?.book_id || ""
  );
  const [selectedCampaign, setSelectedCampaign] = useState<{
    name: string;
    amount: number;
  } | null>(null);

  // Gemini AI Marketing Generator
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiCampaignResult, setAiCampaignResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const selectedBook =
    books.find((b) => b.book_id === selectedBookId) || books[0];

  async function handleGenerateAiMarketing() {
    if (!selectedBook?.title) {
      toast.warning("Select Book", "Please select a registered book to generate marketing copy.");
      return;
    }
    setIsGeneratingAi(true);
    setAiCampaignResult(null);

    try {
      const res = await fetch("/api/ai/marketing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookTitle: selectedBook.title,
          genre: selectedBook.genre || "Fiction",
          blurb: (selectedBook as any)?.description || (selectedBook as any)?.blurb || "",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to generate marketing campaign");
      }

      setAiCampaignResult(data.campaign);
      toast.success(
        "Marketing Pack Generated!",
        "Gemini 3.8 created Amazon KDP keywords, ad hooks, and press release."
      );
    } catch (err: any) {
      toast.error("Marketing Generator Error", err?.message || "Failed to generate campaign.");
    } finally {
      setIsGeneratingAi(false);
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-[#F05262] text-xs font-bold">
            <Megaphone className="w-3.5 h-3.5 text-[#F05262]" />
            <span>BookLeaf Author Growth &amp; Bestseller Marketing Suite</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Book Marketing, Amazon Ads &amp; PR Campaigns
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Drive targeted reader traffic to your Amazon &amp; Flipkart listings. Boost your
            Amazon Bestseller ranking with managed PPC ad campaigns, national press releases,
            and social media marketing kits.
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 shrink-0 text-center min-w-[200px]">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Lifetime Organic &amp; Ad Impressions
          </span>
          <span className="font-serif text-3xl font-bold text-[#0F4C3A]">84,200+</span>
          <span className="text-[10px] text-emerald-600 font-semibold block mt-1">
            +32% reader clicks this month
          </span>
        </div>
      </div>

      {/* 3 Managed Marketing Packs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pack 1: Amazon Ads Booster */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition">
          <div className="space-y-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              PPC Performance
            </span>
            <h3 className="font-serif text-xl font-bold text-slate-900">
              Amazon Ads Booster (15 Days)
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Targeted sponsored product ads placed in front of verified book buyers in your genre.
            </p>
            <div className="pt-2">
              <span className="font-serif text-2xl font-bold text-slate-900">₹2,499</span>
              <span className="text-xs text-slate-400"> / campaign</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              setSelectedCampaign({
                name: "Amazon Ads Booster (15 Days)",
                amount: 2499,
              })
            }
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-[#F05262] text-white text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Launch Amazon Campaign</span>
          </button>
        </div>

        {/* Pack 2: National Press Release (Most Popular) */}
        <div className="bg-white rounded-2xl border-2 border-[#F05262] p-6 shadow-md flex flex-col justify-between space-y-4 relative">
          <span className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-[#F05262] text-white text-[10px] font-extrabold uppercase tracking-wide">
            Recommended
          </span>
          <div className="space-y-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-[#F05262] border border-rose-200">
              Media Outreach
            </span>
            <h3 className="font-serif text-xl font-bold text-slate-900">
              National Press Release
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Distribution to 40+ national digital news portals (The Print, Hindustan Times syndicates, Zee5).
            </p>
            <div className="pt-2">
              <span className="font-serif text-2xl font-bold text-[#F05262]">₹4,999</span>
              <span className="text-xs text-slate-400"> / distribution</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              setSelectedCampaign({
                name: "National Press Release Distribution",
                amount: 4999,
              })
            }
            className="w-full py-2.5 rounded-xl bg-[#F05262] hover:bg-[#d94151] text-white text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Book Media Distribution</span>
          </button>
        </div>

        {/* Pack 3: Social Media & Mockup Kit */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition">
          <div className="space-y-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Free with Book
            </span>
            <h3 className="font-serif text-xl font-bold text-slate-900">
              Author Social Media Kit
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Instant 3D book renders, Instagram story templates, and quotation banners for your launch.
            </p>
            <div className="pt-2">
              <span className="font-serif text-2xl font-bold text-emerald-700">FREE</span>
              <span className="text-xs text-slate-400"> (Included in your plan)</span>
            </div>
          </div>

          <a
            href="/images/bookleaf/scraped/book-verses-human.png"
            download
            className="w-full py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center justify-center gap-1.5 text-center"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Social Kit (ZIP)</span>
          </a>
        </div>
      </div>

      {/* Gemini AI Powered Marketing Pack Generator */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[11px] font-bold mb-1">
              <Sparkles className="w-3 h-3 text-indigo-600" />
              <span>Free with All BookLeaf Publishing Plans</span>
            </div>
            <h3 className="font-serif text-xl font-bold text-slate-900">
              Gemini 3.8 Instant Amazon SEO &amp; Media Launch Pack
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Generate 7 high-traffic Amazon backend keywords, 3 sponsored ad hooks, and a media press release.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedBookId}
              onChange={(e) => setSelectedBookId(e.target.value)}
              className="px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-[#F05262] focus:outline-none"
            >
              {books.map((b) => (
                <option key={b.book_id} value={b.book_id}>
                  {b.title}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleGenerateAiMarketing}
              disabled={isGeneratingAi}
              className="px-5 py-2.5 rounded-xl bg-[#0F4C3A] hover:bg-[#0c3d2e] text-white text-xs font-bold transition flex items-center gap-2 shadow-xs shrink-0 disabled:opacity-50"
            >
              {isGeneratingAi ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Researching...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Generate with Gemini</span>
                </>
              )}
            </button>
          </div>
        </div>

        {aiCampaignResult && (
          <div className="p-5 rounded-2xl bg-[#F9FAF7] border border-slate-200/80 space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Custom Marketing Strategy for &quot;{selectedBook?.title}&quot;</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(aiCampaignResult);
                  setCopied(true);
                  toast.info("Copied", "Marketing strategy copied to clipboard.");
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#F05262] hover:text-[#d43f4f]"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied!" : "Copy All"}</span>
              </button>
            </div>
            <pre className="text-xs text-slate-700 whitespace-pre-wrap font-mono leading-relaxed bg-white p-4 rounded-xl border border-slate-200">
              {aiCampaignResult}
            </pre>
          </div>
        )}
      </div>

      {/* Razorpay Modal for Marketing Packages */}
      {selectedCampaign && (
        <RazorpayModal
          isOpen={Boolean(selectedCampaign)}
          onClose={() => setSelectedCampaign(null)}
          planName={selectedCampaign.name}
          amount={selectedCampaign.amount}
          purpose="BookLeaf Author Marketing Campaign"
        />
      )}
    </div>
  );
}
