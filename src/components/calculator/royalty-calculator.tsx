"use client";

import React, { useState, useId } from "react";
import {
  BookOpen,
  Calculator,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Globe,
  HelpCircle,
  IndianRupee,
  Info,
  ShieldCheck,
  Smartphone,
  Sparkles,
  TrendingUp,
} from "lucide-react";

export function RoyaltyCalculator() {
  const [format, setFormat] = useState<"paperback" | "ebook">("paperback");
  const [country, setCountry] = useState<"india" | "intl">("india");
  const [plan, setPlan] = useState<"standard" | "breakthrough">("breakthrough");
  const [pages, setPages] = useState<number>(150);
  const [price, setPrice] = useState<number>(299);
  const [showBreakdown, setShowBreakdown] = useState<boolean>(false);

  // Constants decompiled from BookLeaf Official Engine
  const isIndia = country === "india";
  const royaltyShare = plan === "breakthrough" ? 1.0 : 0.8; // 100% vs 80%

  // Paperback Math
  const indiaPrintCost = Math.round(pages * 0.6 + 12);
  const indiaQcPackaging = 40; // ₹25 QC + ₹15 Packaging
  const indiaAuthorCopy = indiaPrintCost + indiaQcPackaging;
  const indiaMinPrice = Math.ceil((pages * 0.6 + 97) * 1.43);

  const intlPrintCost = Number((3.0 + pages * 0.025).toFixed(2));
  const intlQc = 1.5;
  const intlAuthorCopy = Number((3.21 + pages * 0.075).toFixed(2));
  const intlMinPrice = Number(
    (Math.ceil((3.0 + 1.5 + pages * 0.025) * 1.43) - 0.01).toFixed(2)
  );

  const currentMinPrice =
    format === "ebook"
      ? isIndia
        ? 95
        : 2.99
      : isIndia
      ? indiaMinPrice
      : intlMinPrice;

  // Active calculations
  const effectivePrice = Math.max(price, currentMinPrice);

  let printCost = 0;
  let handlingFee = 0;
  let storeRoyalty = 0;
  let amazonRoyalty = 0;
  let authorCopyPrice = 0;
  let amazonMarketplaceFee = 0;

  if (format === "paperback") {
    if (isIndia) {
      printCost = indiaPrintCost;
      handlingFee = indiaQcPackaging;
      authorCopyPrice = indiaAuthorCopy;
      amazonMarketplaceFee = Math.round(effectivePrice * 0.3);

      const storeNet = Math.max(0, effectivePrice - printCost - handlingFee);
      const amazonNet = Math.max(
        0,
        effectivePrice - amazonMarketplaceFee - printCost - handlingFee
      );

      storeRoyalty = Math.round(storeNet * royaltyShare);
      amazonRoyalty = Math.round(amazonNet * royaltyShare);
    } else {
      printCost = intlPrintCost;
      handlingFee = intlQc;
      authorCopyPrice = intlAuthorCopy;
      amazonMarketplaceFee = Number((effectivePrice * 0.3).toFixed(2));

      const storeNet = Math.max(0, effectivePrice - printCost - handlingFee);
      const amazonNet = Math.max(
        0,
        effectivePrice - amazonMarketplaceFee - printCost - handlingFee
      );

      storeRoyalty = Number((storeNet * royaltyShare).toFixed(2));
      amazonRoyalty = Number((amazonNet * royaltyShare).toFixed(2));
    }
  } else {
    // E-book
    const platformFee = isIndia ? 25 : 0.35;
    const paymentGatewayFee = effectivePrice * 0.03;
    const netEbook = Math.max(
      0,
      effectivePrice - platformFee - paymentGatewayFee
    );

    storeRoyalty = isIndia
      ? Math.round(netEbook * royaltyShare)
      : Number((netEbook * royaltyShare).toFixed(2));
    amazonRoyalty = storeRoyalty;
  }

  function applyMinPrice() {
    setPrice(currentMinPrice);
  }

  const pagesInputId = useId();
  const priceInputId = useId();

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden max-w-4xl mx-auto">
      {/* Header Accent Bar */}
      <div className="h-2 bg-gradient-to-r from-[#F05262] via-[#FF6B7A] to-[#F05262]" />

      <div className="p-6 sm:p-10 space-y-8">
        {/* Title & Tagline */}
        <div className="text-center max-w-xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF5F6] text-[#F05262] text-xs font-bold border border-[#FFE7E9]">
            <Calculator className="w-3.5 h-3.5" />
            <span>Official BookLeaf Royalty &amp; Print Engine</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Book Printing Cost &amp; Royalty Calculator
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Calculate your exact profit per copy across BookLeaf Store and Amazon in real-time.
          </p>
        </div>

        {/* Format & Country Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Format Tabs */}
          <div>
            <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Book Format
            </span>
            <div className="flex rounded-xl p-1 bg-slate-100 border border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setFormat("paperback");
                  if (price < 199) setPrice(isIndia ? 299 : 9.99);
                }}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  format === "paperback"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-[#F05262]" />
                <span>Paperback</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setFormat("ebook");
                  setPrice(isIndia ? 149 : 4.99);
                }}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  format === "ebook"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Smartphone className="w-3.5 h-3.5 text-sky-600" />
                <span>E-Book</span>
              </button>
            </div>
          </div>

          {/* Region Tabs */}
          <div>
            <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Currency &amp; Region
            </span>
            <div className="flex rounded-xl p-1 bg-slate-100 border border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setCountry("india");
                  setPrice(299);
                }}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  country === "india"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span>🇮🇳 India (₹)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setCountry("intl");
                  setPrice(9.99);
                }}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  country === "intl"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span>🌍 Global ($)</span>
              </button>
            </div>
          </div>

          {/* Royalty Plan */}
          <div>
            <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Publishing Plan
            </span>
            <div className="flex rounded-xl p-1 bg-slate-100 border border-slate-200">
              <button
                type="button"
                onClick={() => setPlan("breakthrough")}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 ${
                  plan === "breakthrough"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span>100% Royalty</span>
              </button>
              <button
                type="button"
                onClick={() => setPlan("standard")}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 ${
                  plan === "standard"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span>80% Royalty</span>
              </button>
            </div>
          </div>
        </div>

        {/* Inputs Slider / Numeric Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-200">
          {format === "paperback" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor={pagesInputId}
                  className="text-xs font-bold text-slate-700 uppercase tracking-wider"
                >
                  Number of Pages: <strong className="text-slate-900 text-sm">{pages}</strong>
                </label>
                <span className="text-[11px] text-slate-500 font-mono">
                  (50 - 500 pgs)
                </span>
              </div>
              <input
                id={pagesInputId}
                type="range"
                min={50}
                max={500}
                step={2}
                value={pages}
                onChange={(e) => setPages(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#F05262]"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>50 pgs (Poetry)</span>
                <span>150 pgs (Standard)</span>
                <span>500 pgs (Epic)</span>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor={priceInputId}
                className="text-xs font-bold text-slate-700 uppercase tracking-wider"
              >
                Retail Selling Price (MRP)
              </label>
              <button
                type="button"
                onClick={applyMinPrice}
                className="text-[11px] font-bold text-[#F05262] hover:underline"
              >
                Apply min ({isIndia ? `₹${currentMinPrice}` : `$${currentMinPrice}`})
              </button>
            </div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                {isIndia ? "₹" : "$"}
              </span>
              <input
                id={priceInputId}
                type="number"
                min={currentMinPrice}
                step={isIndia ? 1 : 0.01}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#F05262] text-base font-bold text-slate-900 bg-white"
              />
            </div>
            {price < currentMinPrice && (
              <p className="text-[11px] text-rose-600 font-medium">
                Minimum price required for positive royalty: {isIndia ? `₹${currentMinPrice}` : `$${currentMinPrice}`}
              </p>
            )}
          </div>
        </div>

        {/* Live Output Highlight Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Card 1: BookLeaf Store */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-lg space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-100 flex items-center justify-between">
              <span>BookLeaf Store</span>
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[9px] font-extrabold">
                HIGHEST
              </span>
            </span>
            <div className="flex items-baseline gap-1 py-1">
              <span className="text-xl font-light">{isIndia ? "₹" : "$"}</span>
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                {storeRoyalty}
              </span>
              <span className="text-xs text-emerald-100">/ copy</span>
            </div>
            <p className="text-[11px] text-emerald-100 leading-tight">
              0% Amazon commission deducted. 100% direct readers.
            </p>
          </div>

          {/* Card 2: Amazon Marketplace */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#F05262] to-[#D93D4D] text-white shadow-lg space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-100 flex items-center justify-between">
              <span>Amazon &amp; Flipkart</span>
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[9px] font-extrabold">
                GLOBAL
              </span>
            </span>
            <div className="flex items-baseline gap-1 py-1">
              <span className="text-xl font-light">{isIndia ? "₹" : "$"}</span>
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                {amazonRoyalty}
              </span>
              <span className="text-xs text-rose-100">/ copy</span>
            </div>
            <p className="text-[11px] text-rose-100 leading-tight">
              Includes 30% standard Amazon &amp; Flipkart marketplace fee.
            </p>
          </div>

          {/* Card 3: Author Copy Price */}
          <div className="p-5 rounded-2xl bg-[#0F223D] text-white shadow-lg space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
              <span>Author Copy Cost</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-700 text-slate-200 text-[9px] font-bold">
                PRINT ONLY
              </span>
            </span>
            <div className="flex items-baseline gap-1 py-1">
              <span className="text-xl font-light">{isIndia ? "₹" : "$"}</span>
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                {format === "paperback" ? authorCopyPrice : "₹0"}
              </span>
              <span className="text-xs text-slate-400">/ copy</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Subsidized wholesale rate when ordering author copies.
            </p>
          </div>
        </div>

        {/* Collapsible Full Deduction Breakdown */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden">
          <button
            type="button"
            onClick={() => setShowBreakdown(!showBreakdown)}
            className="w-full px-5 py-3.5 bg-slate-50 hover:bg-slate-100 transition flex items-center justify-between text-xs font-bold text-slate-800"
          >
            <span>Itemized Cost &amp; Revenue Breakdown</span>
            <span className="flex items-center gap-1 text-[#F05262]">
              <span>{showBreakdown ? "Hide Details" : "Show Full Formula"}</span>
              {showBreakdown ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </span>
          </button>

          {showBreakdown && (
            <div className="p-5 bg-white divide-y divide-slate-100 text-xs text-slate-700">
              <div className="py-2 flex justify-between">
                <span>Retail Selling Price (MRP):</span>
                <strong className="text-slate-900 font-bold">
                  {isIndia ? `₹${effectivePrice}` : `$${effectivePrice}`}
                </strong>
              </div>
              {format === "paperback" && (
                <>
                  <div className="py-2 flex justify-between text-slate-600">
                    <span>Base In-House Printing Cost ({pages} pgs):</span>
                    <span>- {isIndia ? `₹${printCost}` : `$${printCost}`}</span>
                  </div>
                  <div className="py-2 flex justify-between text-slate-600">
                    <span>QC Inspection &amp; Packaging:</span>
                    <span>- {isIndia ? `₹${handlingFee}` : `$${handlingFee}`}</span>
                  </div>
                  <div className="py-2 flex justify-between text-slate-600">
                    <span>Amazon Channel Commission (30% on Amazon):</span>
                    <span>- {isIndia ? `₹${amazonMarketplaceFee}` : `$${amazonMarketplaceFee}`}</span>
                  </div>
                </>
              )}
              <div className="py-2 flex justify-between text-slate-600">
                <span>Author Royalty Share:</span>
                <span className="font-semibold text-emerald-700">
                  {plan === "breakthrough" ? "100% of Net Revenue" : "80% of Net Revenue"}
                </span>
              </div>
              <div className="pt-2 flex justify-between text-slate-900 font-bold">
                <span>Net Royalty Paid to Author per Amazon Sale:</span>
                <span className="text-base font-extrabold text-[#F05262]">
                  {isIndia ? `₹${amazonRoyalty}` : `$${amazonRoyalty}`}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
