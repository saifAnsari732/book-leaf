"use client";

import React, { useState } from "react";
import { BookRecord, SafeUser } from "@/types/domain";
import { useToast } from "@/context/ToastContext";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Bot,
  Calculator,
  Check,
  CheckCircle2,
  Copy,
  Globe,
  IndianRupee,
  Layers,
  Lightbulb,
  Loader2,
  Megaphone,
  MessageCircle,
  RefreshCw,
  Send,
  Share2,
  Sparkles,
  TrendingUp,
  User,
  Wand2,
} from "lucide-react";

interface AuthorDashboardAIViewProps {
  books: BookRecord[];
  author: SafeUser;
}

export function AuthorDashboardAIView({
  books,
  author,
}: AuthorDashboardAIViewProps) {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<"chat" | "seo" | "royalty">("chat");

  // =========================================================================
  // 1. Nishtha AI Chat State
  // =========================================================================
  const [messages, setMessages] = useState<
    Array<{ sender: "user" | "bot"; text: string; time: string }>
  >([
    {
      sender: "bot",
      text: `Hello ${author.name || "Author"}! I am Nishtha, your dedicated BookLeaf Gemini AI Publishing Assistant. How can I assist you with your published titles, royalties, Amazon SEO, or manuscript queries today?`,
      time: "Just now",
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const SUGGESTED_PROMPTS = [
    "How does BookLeaf 100% royalty calculation work?",
    "Give me 5 catchy marketing hooks for my book.",
    "What is the difference between ISBN registration and copyright?",
    "When will my quarterly royalty payout be credited?",
  ];

  async function handleSend(textToSend?: string) {
    const q = (textToSend || inputPrompt).trim();
    if (!q) return;

    const userMsg = {
      sender: "user" as const,
      text: q,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: q,
          history: messages.slice(-6),
          context: {
            authorName: author.name,
            authorId: author.author_id,
            booksCount: books.length,
          },
        }),
      });

      const resJson = await res.json();
      const replyText =
        resJson.reply ||
        resJson.response ||
        "BookLeaf ensures authors retain 100% of net royalties paid directly into your registered bank account.";

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: replyText,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "I am ready to assist. Please verify your internet connection or try again in a few moments.",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  }

  // =========================================================================
  // 2. Amazon SEO & Marketing Generator State
  // =========================================================================
  const [seoBookId, setSeoBookId] = useState<string>(books[0]?.book_id || "");
  const [isGeneratingSeo, setIsGeneratingSeo] = useState(false);
  const [marketingPack, setMarketingPack] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const selectedSeoBook = books.find((b) => b.book_id === seoBookId) || books[0];

  async function handleGenerateMarketingPack() {
    setIsGeneratingSeo(true);
    setMarketingPack(null);

    try {
      const res = await fetch("/api/ai/marketing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookTitle: selectedSeoBook?.title || "My Published Book",
          genre: selectedSeoBook?.genre || "Fiction",
          blurb: (selectedSeoBook as any)?.description || (selectedSeoBook as any)?.blurb || "",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to generate marketing campaign");
      }

      setMarketingPack(data.campaign);
      toast.success(
        "Marketing Pack Generated!",
        "Gemini 3.8 created Amazon KDP keywords, ad hooks, and press release."
      );
    } catch (err: any) {
      toast.error("SEO Generator Error", err?.message || "Failed to generate pack.");
    } finally {
      setIsGeneratingSeo(false);
    }
  }

  // =========================================================================
  // 3. Royalty & Revenue Forecaster State
  // =========================================================================
  const [projectedSales, setProjectedSales] = useState<number>(250);
  const [retailMrp, setRetailMrp] = useState<number>(399);
  const [intlPercent, setIntlPercent] = useState<number>(20);

  const domesticSales = Math.round(projectedSales * (1 - intlPercent / 100));
  const intlSales = projectedSales - domesticSales;

  // BookLeaf Royalty Model:
  // Print & production cost ~ ₹140 on ₹399 MRP. Net profit ~ ₹160 per copy.
  // Domestic 100% net profit royalty: ~₹160 * domesticSales
  // International 80/20 royalty: ~₹220 * intlSales
  const domesticRoyaltyPerCopy = Math.max(50, Math.round(retailMrp * 0.4));
  const intlRoyaltyPerCopy = Math.max(80, Math.round(retailMrp * 0.55));
  const totalProjectedDomesticRoyalty = domesticSales * domesticRoyaltyPerCopy;
  const totalProjectedIntlRoyalty = intlSales * intlRoyaltyPerCopy;
  const grandTotalRoyalty = totalProjectedDomesticRoyalty + totalProjectedIntlRoyalty;

  function copyText(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    toast.info("Copied to Clipboard", "Pasted content ready to use.");
    setTimeout(() => setCopiedKey(null), 2000);
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Google Gemini 3.8 Flash Multimodal Intelligence Engine</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Nishtha — Full Publishing AI Co-Pilot &amp; Intelligence Suite
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
            24/7 AI chatbot assistance, Amazon KDP keyword generator, sales forecasting,
            and instant policy resolutions—all grounded in BookLeaf SLAs.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-full">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-emerald-800">Gemini Live Active</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("chat")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition shrink-0 ${
            activeTab === "chat"
              ? "bg-[#0F4C3A] text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Bot className="w-4 h-4" />
          <span>24/7 Chatbot (Nishtha)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("seo")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition shrink-0 ${
            activeTab === "seo"
              ? "bg-[#0F4C3A] text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>Amazon SEO &amp; Marketing Suite</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("royalty")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition shrink-0 ${
            activeTab === "royalty"
              ? "bg-[#0F4C3A] text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>Royalty &amp; Revenue Forecaster</span>
        </button>
      </div>

      {/* ===================================================================
          TAB 1: NISHTHA CHATBOT
          =================================================================== */}
      {activeTab === "chat" && (
        <div className="space-y-4 animate-fade-in">
          {/* Suggested Quick Questions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {SUGGESTED_PROMPTS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(p)}
                className="p-3 text-left rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-xs text-slate-700 font-semibold transition flex items-center justify-between gap-2 shadow-2xs group"
              >
                <span className="line-clamp-1">{p}</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#F05262] group-hover:translate-x-0.5 transition-transform shrink-0" />
              </button>
            ))}
          </div>

          {/* Chat Canvas */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col h-[520px] overflow-hidden">
            {/* Messages Scroll Area */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-[#F9FAF7]">
              {messages.map((m, idx) => {
                const isUser = m.sender === "user";
                return (
                  <div
                    key={idx}
                    className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                        isUser
                          ? "bg-[#F05262] text-white"
                          : "bg-[#0F4C3A] text-white shadow-xs"
                      }`}
                    >
                      {isUser ? "You" : <Bot className="w-4 h-4 text-emerald-200" />}
                    </div>

                    <div
                      className={`max-w-[80%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-2xs ${
                        isUser
                          ? "bg-[#F05262] text-white rounded-tr-none"
                          : "bg-white text-slate-800 border border-slate-200/80 rounded-tl-none"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{m.text}</p>
                      <span
                        className={`block text-[10px] mt-1.5 ${
                          isUser ? "text-white/80 text-right" : "text-slate-400"
                        }`}
                      >
                        {m.time}
                      </span>
                    </div>
                  </div>
                );
              })}

              {isTyping && (
                <div className="flex gap-3 items-center text-xs text-slate-500">
                  <div className="w-8 h-8 rounded-full bg-[#0F4C3A] text-white flex items-center justify-center">
                    <Bot className="w-4 h-4 text-emerald-200 animate-pulse" />
                  </div>
                  <div className="bg-white p-3 rounded-2xl border border-slate-200 flex items-center gap-1.5 shadow-2xs">
                    <span className="w-2 h-2 rounded-full bg-[#F05262] animate-bounce" />
                    <span className="w-2 h-2 rounded-full bg-[#F05262] animate-bounce delay-100" />
                    <span className="w-2 h-2 rounded-full bg-[#F05262] animate-bounce delay-200" />
                    <span className="text-[11px] text-slate-500 font-medium ml-1">
                      Nishtha is drafting response with Gemini...
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="p-4 bg-white border-t border-slate-200 flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Ask Nishtha anything about BookLeaf publishing, royalty, ISBN, or marketing..."
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-[#F05262] focus:outline-none"
              />
              <button
                type="submit"
                disabled={!inputPrompt.trim() || isTyping}
                className="px-6 py-3 rounded-xl bg-[#0F4C3A] hover:bg-[#0A3B2D] text-white text-xs sm:text-sm font-bold flex items-center gap-2 disabled:opacity-50 transition shadow-xs"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Send</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================
          TAB 2: AMAZON SEO & MARKETING SUITE
          =================================================================== */}
      {activeTab === "seo" && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6 animate-fade-in">
          <div>
            <h3 className="font-serif text-xl font-bold text-slate-900">
              AI Amazon KDP &amp; Social Launch Pack Generator
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Harness Gemini 3.8 to research the 7 highest-converting Amazon backend keywords,
              ad copy, and press release for your registered books.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Select Your Book
              </label>
              <select
                value={seoBookId}
                onChange={(e) => setSeoBookId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-[#F05262] focus:outline-none"
              >
                {books.map((b) => (
                  <option key={b.book_id} value={b.book_id}>
                    {b.title} ({b.genre || "General"})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={handleGenerateMarketingPack}
                disabled={isGeneratingSeo}
                className="w-full py-2.5 px-4 rounded-xl bg-[#F05262] hover:bg-[#d84050] text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
              >
                {isGeneratingSeo ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Researching Keywords with Gemini...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>✨ Generate Launch Marketing Pack</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {marketingPack ? (
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-slate-800">
                    Generated for &quot;{selectedSeoBook?.title}&quot;
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => copyText(marketingPack, "full_pack")}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F05262] hover:text-[#d84050]"
                >
                  {copiedKey === "full_pack" ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Full Pack</span>
                    </>
                  )}
                </button>
              </div>

              <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap bg-white p-5 rounded-xl border border-slate-200/80 font-mono">
                {marketingPack}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-3xl space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-[#F05262] flex items-center justify-center mx-auto">
                <Wand2 className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">
                Ready to maximize your book&apos;s Amazon visibility
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Click &quot;Generate Launch Marketing Pack&quot; above to instantly receive backend keywords, PPC headlines, and social media announcements.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ===================================================================
          TAB 3: ROYALTY & REVENUE FORECASTER
          =================================================================== */}
      {activeTab === "royalty" && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6 animate-fade-in">
          <div>
            <h3 className="font-serif text-xl font-bold text-slate-900">
              Interactive 100% Royalty &amp; Revenue Forecaster
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Simulate your earnings across domestic sales (100% net profit) and international
              Amazon/IngramSpark distribution (80/20 royalty model).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Projected Copies Sold: <span className="text-[#F05262]">{projectedSales}</span>
              </label>
              <input
                type="range"
                min={50}
                max={5000}
                step={50}
                value={projectedSales}
                onChange={(e) => setProjectedSales(Number(e.target.value))}
                className="w-full accent-[#F05262] cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>50 copies</span>
                <span>2,500</span>
                <span>5,000+ copies</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Book MRP: <span className="text-[#F05262]">₹{retailMrp}</span>
              </label>
              <input
                type="range"
                min={199}
                max={999}
                step={20}
                value={retailMrp}
                onChange={(e) => setRetailMrp(Number(e.target.value))}
                className="w-full accent-[#F05262] cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>₹199</span>
                <span>₹599</span>
                <span>₹999</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                International Sales: <span className="text-[#F05262]">{intlPercent}%</span>
              </label>
              <input
                type="range"
                min={0}
                max={80}
                step={5}
                value={intlPercent}
                onChange={(e) => setIntlPercent(Number(e.target.value))}
                className="w-full accent-[#F05262] cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>0% (India only)</span>
                <span>40%</span>
                <span>80% (Global)</span>
              </div>
            </div>
          </div>

          {/* Forecast Output Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Domestic Sales ({domesticSales} copies)
              </span>
              <p className="font-serif text-2xl font-bold text-slate-900">
                ₹{totalProjectedDomesticRoyalty.toLocaleString("en-IN")}
              </p>
              <p className="text-[11px] text-slate-500">
                ~₹{domesticRoyaltyPerCopy}/copy (100% net profit model)
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-blue-50 border border-blue-200/80 space-y-1">
              <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">
                International ({intlSales} copies)
              </span>
              <p className="font-serif text-2xl font-bold text-blue-900">
                ₹{totalProjectedIntlRoyalty.toLocaleString("en-IN")}
              </p>
              <p className="text-[11px] text-blue-600">
                ~₹{intlRoyaltyPerCopy}/copy (Amazon US/UK/EU 80/20)
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0F4C3A] to-[#16604b] text-white shadow-md space-y-1">
              <span className="text-[11px] font-bold text-emerald-200 uppercase tracking-wider">
                Total Projected Author Royalty
              </span>
              <p className="font-serif text-3xl font-extrabold text-white">
                ₹{grandTotalRoyalty.toLocaleString("en-IN")}
              </p>
              <p className="text-[11px] text-emerald-100 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Quarterly bank credit directly to IFSC
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
