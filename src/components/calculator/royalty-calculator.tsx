"use client";

import React, { useState, useId } from "react";
import Link from "next/link";
import {
  BookOpen,
  BookMarked,
  Calculator,
  ChevronDown,
  ChevronUp,
  Globe,
  IndianRupee,
  Info,
  ShieldCheck,
  Smartphone,
  TrendingUp,
  Layers,
  ArrowRight,
  CheckCircle2,
  Copy,
  Package,
  Store,
  ShoppingCart,
} from "lucide-react";

export function RoyaltyCalculator() {
  const [format, setFormat] = useState<"paperback" | "hardcover" | "ebook">("paperback");
  const [country, setCountry] = useState<"india" | "intl">("india");
  const [plan, setPlan] = useState<"breakthrough" | "standard">("breakthrough");
  const [paperType, setPaperType] = useState<"cream" | "white" | "glossy">("cream");
  const [coverFinish, setCoverFinish] = useState<"matte" | "gloss">("matte");
  const [pages, setPages] = useState<number>(150);
  const [price, setPrice] = useState<number>(299);
  const [copiesSold, setCopiesSold] = useState<number>(100);
  const [showBreakdown, setShowBreakdown] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Region and plan constants
  const isIndia = country === "india";
  const royaltyShare = plan === "breakthrough" ? 1.0 : 0.8; // 100% vs 80%

  // Additional Paper, Cover & Binding Adjustments
  const paperUpcharge =
    paperType === "white"
      ? Math.round(pages * 0.08)
      : paperType === "glossy"
      ? Math.round(pages * 0.25)
      : 0;

  const bindingUpcharge = format === "hardcover" ? 120 : 0;
  const coverUpcharge = coverFinish === "gloss" ? 8 : 0;

  // Paperback & Hardcover Math (INR)
  const baseIndiaPrintCost = Math.round(pages * 0.6 + 12);
  const indiaPrintCost = baseIndiaPrintCost + paperUpcharge + bindingUpcharge + coverUpcharge;
  const indiaQcPackaging = 40; // ₹25 QC + ₹15 Thermal Packaging
  const indiaAuthorCopy = indiaPrintCost + indiaQcPackaging;
  const indiaMinPrice = Math.ceil(
    (pages * 0.6 + 97 + paperUpcharge + bindingUpcharge + coverUpcharge) * 1.43
  );

  // International Math (USD)
  const intlPaperUpcharge =
    paperType === "white"
      ? Number((pages * 0.002).toFixed(2))
      : paperType === "glossy"
      ? Number((pages * 0.006).toFixed(2))
      : 0;
  const intlBindingUpcharge = format === "hardcover" ? 3.5 : 0;
  const intlCoverUpcharge = coverFinish === "gloss" ? 0.25 : 0;
  const baseIntlPrintCost = Number((3.0 + pages * 0.025).toFixed(2));
  const intlPrintCost = Number(
    (baseIntlPrintCost + intlPaperUpcharge + intlBindingUpcharge + intlCoverUpcharge).toFixed(2)
  );
  const intlQc = 1.5;
  const intlAuthorCopy = Number(
    (3.21 + pages * 0.075 + intlPaperUpcharge + intlBindingUpcharge + intlCoverUpcharge).toFixed(2)
  );
  const intlMinPrice = Number(
    (
      Math.ceil(
        (3.0 + 1.5 + pages * 0.025 + intlPaperUpcharge + intlBindingUpcharge + intlCoverUpcharge) *
          1.43
      ) - 0.01
    ).toFixed(2)
  );

  // Current Minimum Retail Selling Price
  const currentMinPrice =
    format === "ebook"
      ? isIndia
        ? 95
        : 2.99
      : isIndia
      ? indiaMinPrice
      : intlMinPrice;

  // Effective Active Selling Price (cannot drop below cost floor)
  const effectivePrice = Math.max(price, currentMinPrice);

  let printCost = 0;
  let handlingFee = 0;
  let storeRoyalty = 0;
  let amazonRoyalty = 0;
  let authorCopyPrice = 0;
  let amazonMarketplaceFee = 0;

  if (format === "paperback" || format === "hardcover") {
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
    // E-book calculation
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
    authorCopyPrice = 0;
  }

  // Margin percentages
  const storeMarginPct =
    effectivePrice > 0 ? Math.round((storeRoyalty / effectivePrice) * 100) : 0;
  const amazonMarginPct =
    effectivePrice > 0 ? Math.round((amazonRoyalty / effectivePrice) * 100) : 0;

  // Cumulative Projected Earnings
  const projectedStoreEarnings = isIndia
    ? Math.round(storeRoyalty * copiesSold)
    : Number((storeRoyalty * copiesSold).toFixed(2));
  const projectedAmazonEarnings = isIndia
    ? Math.round(amazonRoyalty * copiesSold)
    : Number((amazonRoyalty * copiesSold).toFixed(2));
  const blendedProjection = isIndia
    ? Math.round((storeRoyalty * 0.4 + amazonRoyalty * 0.6) * copiesSold)
    : Number(((storeRoyalty * 0.4 + amazonRoyalty * 0.6) * copiesSold).toFixed(2));

  // Handler for Format Switching with Auto-Correction of Price Floor
  function handleFormatChange(newFormat: "paperback" | "hardcover" | "ebook") {
    setFormat(newFormat);
    if (newFormat === "ebook") {
      setPrice(isIndia ? 149 : 4.99);
    } else if (newFormat === "hardcover") {
      const minHardcover = isIndia
        ? Math.ceil((pages * 0.6 + 97 + paperUpcharge + 120 + coverUpcharge) * 1.43)
        : Number(
            (
              Math.ceil((3.0 + 1.5 + pages * 0.025 + intlPaperUpcharge + 3.5 + intlCoverUpcharge) * 1.43) -
              0.01
            ).toFixed(2)
          );
      setPrice((prev) => Math.max(prev, minHardcover));
    } else {
      const minPaperback = isIndia
        ? Math.ceil((pages * 0.6 + 97 + paperUpcharge + coverUpcharge) * 1.43)
        : Number(
            (
              Math.ceil((3.0 + 1.5 + pages * 0.025 + intlPaperUpcharge + intlCoverUpcharge) * 1.43) -
              0.01
            ).toFixed(2)
          );
      setPrice((prev) => Math.max(prev, minPaperback));
    }
  }

  // Handler for Currency Switching
  function handleCountryChange(newCountry: "india" | "intl") {
    setCountry(newCountry);
    if (newCountry === "india") {
      setPrice(format === "ebook" ? 149 : 299);
    } else {
      setPrice(format === "ebook" ? 4.99 : 9.99);
    }
  }

  function applyMinPrice() {
    setPrice(currentMinPrice);
  }

  // Bulletproof clipboard copy with automatic fallback
  async function handleCopySummary() {
    const summary = `BookLeaf Publishing - Official Royalty Estimate
Book Format: ${format.toUpperCase()} (${pages} pages)
Paper Grade: ${paperType.toUpperCase()} | Cover: ${coverFinish.toUpperCase()}
Retail Selling Price: ${isIndia ? `₹${effectivePrice}` : `$${effectivePrice}`}
Contract Royalty Plan: ${plan === "breakthrough" ? "100% Net Profit Share" : "80% Royalty"}
• BookLeaf Store Royalty: ${isIndia ? `₹${storeRoyalty}` : `$${storeRoyalty}`} / copy (${storeMarginPct}% net margin)
• Amazon & Flipkart Royalty: ${isIndia ? `₹${amazonRoyalty}` : `$${amazonRoyalty}`} / copy (${amazonMarginPct}% net margin)
• Author Copy Printing Cost: ${isIndia ? `₹${authorCopyPrice}` : `$${authorCopyPrice}`} / copy
• Projected Earnings on ${copiesSold} copies: ${isIndia ? `₹${blendedProjection.toLocaleString()}` : `$${blendedProjection.toLocaleString()}`}`;

    try {
      if (typeof navigator !== "undefined" && navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(summary);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = summary;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      const textarea = document.createElement("textarea");
      textarea.value = summary;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }

  const pagesInputId = useId();
  const priceInputId = useId();

  // Dynamic Smart Quick Set Prices (Always above currentMinPrice)
  const quickPrices = isIndia
    ? [
        { p: currentMinPrice, label: `₹${currentMinPrice} (Min)` },
        { p: Math.max(currentMinPrice + 20, 299), label: `₹${Math.max(currentMinPrice + 20, 299)}` },
        { p: Math.max(currentMinPrice + 80, 399), label: `₹${Math.max(currentMinPrice + 80, 399)}` },
        { p: Math.max(currentMinPrice + 160, 499), label: `₹${Math.max(currentMinPrice + 160, 499)}` },
      ]
    : [
        { p: currentMinPrice, label: `$${currentMinPrice} (Min)` },
        { p: Number(Math.max(currentMinPrice + 1.5, 9.99).toFixed(2)), label: `$${Number(Math.max(currentMinPrice + 1.5, 9.99).toFixed(2))}` },
        { p: Number(Math.max(currentMinPrice + 4.5, 14.99).toFixed(2)), label: `$${Number(Math.max(currentMinPrice + 4.5, 14.99).toFixed(2))}` },
        { p: Number(Math.max(currentMinPrice + 9.5, 19.99).toFixed(2)), label: `$${Number(Math.max(currentMinPrice + 9.5, 19.99).toFixed(2))}` },
      ];

  const PAGE_PRESETS = [
    { count: 64, label: "64 pgs (Poetry)" },
    { count: 150, label: "150 pgs (Standard)" },
    { count: 320, label: "320 pgs (Novel)" },
    { count: 500, label: "500 pgs (Epic)" },
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden max-w-5xl lg:max-w-6xl w-full mx-auto">
      {/* Brand Header Accent Bar */}
      <div className="h-2.5 bg-gradient-to-r from-[#F05262] via-[#FF6B7A] to-[#F05262]" />

      <div className="p-6 sm:p-9 lg:p-11 space-y-8">
        {/* Title & Tagline */}
        <div className="text-center max-w-2xl mx-auto space-y-2.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF5F6] text-[#F05262] text-xs font-bold border border-[#FFE7E9] shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <Calculator className="w-3.5 h-3.5" />
            <span>Official BookLeaf Royalty &amp; Print Engine</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Book Printing Cost &amp; Royalty Calculator
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Calculate your exact profit per copy across BookLeaf Store and Amazon in real-time.
          </p>
        </div>

        {/* Format, Region & Plan Controls Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Format Tabs (Paperback, Hardcover, E-Book) */}
          <div>
            <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Book Format
            </span>
            <div className="flex rounded-xl p-1 bg-slate-100 border border-slate-200 gap-1">
              <button
                type="button"
                onClick={() => handleFormatChange("paperback")}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  format === "paperback"
                    ? "bg-[#F05262] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Paperback</span>
              </button>
              <button
                type="button"
                onClick={() => handleFormatChange("hardcover")}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  format === "hardcover"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                }`}
              >
                <BookMarked className="w-3.5 h-3.5" />
                <span>Hardcover</span>
              </button>
              <button
                type="button"
                onClick={() => handleFormatChange("ebook")}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  format === "ebook"
                    ? "bg-sky-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>E-Book</span>
              </button>
            </div>
          </div>

          {/* Region Tabs (India vs Global) */}
          <div>
            <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Currency &amp; Region
            </span>
            <div className="flex rounded-xl p-1 bg-slate-100 border border-slate-200 gap-1">
              <button
                type="button"
                onClick={() => handleCountryChange("india")}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  country === "india"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                }`}
              >
                <IndianRupee className="w-3.5 h-3.5" />
                <span>India (₹)</span>
              </button>
              <button
                type="button"
                onClick={() => handleCountryChange("intl")}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  country === "intl"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Global ($)</span>
              </button>
            </div>
          </div>

          {/* Royalty Plan (100% vs 80%) */}
          <div>
            <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Publishing Plan
            </span>
            <div className="flex rounded-xl p-1 bg-slate-100 border border-slate-200 gap-1">
              <button
                type="button"
                onClick={() => setPlan("breakthrough")}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  plan === "breakthrough"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>100% Royalty</span>
              </button>
              <button
                type="button"
                onClick={() => setPlan("standard")}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  plan === "standard"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                }`}
              >
                <span>80% Royalty</span>
              </button>
            </div>
          </div>
        </div>

        {/* Paper & Production Finish Options (Only for Physical Books) */}
        {format !== "ebook" && (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-slate-500" />
                <span>Interior Paper Grade:</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: "cream", label: "70 GSM Cream Fiction" },
                  { id: "white", label: "80 GSM Bright White (+₹12)" },
                  { id: "glossy", label: "100 GSM Art Gloss (+₹38)" },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPaperType(p.id as any)}
                    className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer text-[11px] ${
                      paperType === p.id
                        ? "bg-slate-900 text-white shadow-xs ring-2 ring-slate-900/20"
                        : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                Cover Lamination:
              </span>
              <div className="flex gap-1.5">
                {[
                  { id: "matte", label: "Silk Matte Luxury" },
                  { id: "gloss", label: "Gloss High-UV (+₹8)" },
                ].map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCoverFinish(c.id as any)}
                    className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer text-[11px] ${
                      coverFinish === c.id
                        ? "bg-[#F05262] text-white shadow-xs ring-2 ring-[#F05262]/20"
                        : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Inputs Slider & Numeric Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-200">
          {format !== "ebook" ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label
                  htmlFor={pagesInputId}
                  className="text-xs font-bold text-slate-700 uppercase tracking-wider"
                >
                  Number of Pages: <strong className="text-slate-900 text-sm font-sans">{pages}</strong>
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
                className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#F05262]"
              />
              {/* Interactive Quick Preset Buttons with High Contrast Active State */}
              <div className="flex justify-between items-center gap-1.5 pt-1">
                {PAGE_PRESETS.map((item) => (
                  <button
                    key={item.count}
                    type="button"
                    onClick={() => setPages(item.count)}
                    className={`px-2.5 py-1 rounded-md text-xs font-bold transition cursor-pointer ${
                      pages === item.count
                        ? "bg-slate-900 text-white shadow-xs"
                        : "bg-white text-slate-700 hover:bg-slate-200 border border-slate-200"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-3 flex flex-col justify-center">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-sky-600 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Instant Global Digital Distribution
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Kindle, Apple Books, Google Play &amp; BookLeaf Reader. Zero manufacturing print fee.
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                {[
                  { p: isIndia ? 99 : 2.99, label: isIndia ? "₹99" : "$2.99" },
                  { p: isIndia ? 149 : 4.99, label: isIndia ? "₹149" : "$4.99" },
                  { p: isIndia ? 199 : 6.99, label: isIndia ? "₹199" : "$6.99" },
                  { p: isIndia ? 299 : 9.99, label: isIndia ? "₹299" : "$9.99" },
                ].map((btn) => (
                  <button
                    key={btn.p}
                    type="button"
                    onClick={() => setPrice(btn.p)}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                      price === btn.p
                        ? "bg-sky-600 text-white shadow-xs"
                        : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3">
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
                className="text-[11px] font-bold text-[#F05262] hover:underline cursor-pointer bg-rose-50 px-2 py-0.5 rounded border border-rose-200"
              >
                Apply min ({isIndia ? `₹${currentMinPrice}` : `$${currentMinPrice}`})
              </button>
            </div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-base">
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

            {/* Quick Price Buttons with Active Highlighting */}
            <div className="flex flex-wrap gap-1.5 items-center pt-0.5">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Quick set:</span>
              {quickPrices.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setPrice(item.p)}
                  className={`px-2.5 py-1 rounded-md text-xs font-bold transition cursor-pointer ${
                    price === item.p
                      ? "bg-[#F05262] text-white shadow-xs"
                      : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {price < currentMinPrice && (
              <p className="text-[11px] text-rose-600 font-bold">
                ⚠️ Price below cost threshold: minimum {isIndia ? `₹${currentMinPrice}` : `$${currentMinPrice}`} required for positive author royalty.
              </p>
            )}
          </div>
        </div>

        {/* Live Output Highlight Cards - Senior Editorial Polish */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Card 1: BookLeaf Store */}
          <div className="p-6 rounded-2xl bg-white border-2 border-emerald-500/80 shadow-md hover:shadow-lg transition-all space-y-1.5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-50 rounded-bl-full -z-0 pointer-events-none" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 flex items-center justify-between relative z-10">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <Store className="w-3.5 h-3.5 text-emerald-700" />
                <span>BookLeaf Store</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-extrabold tracking-wider">
                100% SPLIT
              </span>
            </span>
            <div className="flex items-baseline gap-1 py-1 relative z-10">
              <span className="text-xl font-medium text-emerald-700">{isIndia ? "₹" : "$"}</span>
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 font-sans">
                {storeRoyalty}
              </span>
              <span className="text-xs font-semibold text-emerald-700">/ copy</span>
              <span className="ml-auto text-[10px] font-bold text-emerald-700 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
                {storeMarginPct}% Margin
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed relative z-10">
              0% marketplace commission. Direct 100% royalty on every reader sale.
            </p>
          </div>

          {/* Card 2: Amazon Marketplace */}
          <div className="p-6 rounded-2xl bg-white border-2 border-[#F05262]/80 shadow-md hover:shadow-lg transition-all space-y-1.5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-28 h-28 bg-[#FFF5F6] rounded-bl-full -z-0 pointer-events-none" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#F05262] flex items-center justify-between relative z-10">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#F05262]" />
                <ShoppingCart className="w-3.5 h-3.5 text-[#F05262]" />
                <span>Amazon &amp; Flipkart</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#FFE7E9] text-[#F05262] text-[9px] font-extrabold tracking-wider">
                GLOBAL REACH
              </span>
            </span>
            <div className="flex items-baseline gap-1 py-1 relative z-10">
              <span className="text-xl font-medium text-[#F05262]">{isIndia ? "₹" : "$"}</span>
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 font-sans">
                {amazonRoyalty}
              </span>
              <span className="text-xs font-semibold text-slate-500">/ copy</span>
              <span className="ml-auto text-[10px] font-bold text-rose-700 px-2 py-0.5 rounded-full bg-rose-50 border border-rose-200">
                {amazonMarginPct}% Margin
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed relative z-10">
              Standard 30% channel marketplace fee factored in automatically.
            </p>
          </div>

          {/* Card 3: Author Copy Price */}
          <div className="p-6 rounded-2xl bg-white border-2 border-slate-300 shadow-md hover:shadow-lg transition-all space-y-1.5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-28 h-28 bg-slate-50 rounded-bl-full -z-0 pointer-events-none" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between relative z-10">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-500" />
                <Package className="w-3.5 h-3.5 text-slate-600" />
                <span>Author Copy Cost</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[9px] font-bold tracking-wider">
                PRINT ONLY
              </span>
            </span>
            <div className="flex items-baseline gap-1 py-1 relative z-10">
              <span className="text-xl font-medium text-slate-500">{isIndia ? "₹" : "$"}</span>
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 font-sans">
                {format === "ebook" ? "0" : authorCopyPrice}
              </span>
              <span className="text-xs font-semibold text-slate-500">/ copy</span>
              <span className="ml-auto text-[10px] font-semibold text-slate-600 px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200">
                {format === "ebook" ? "Instant" : "Subsidized"}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed relative z-10">
              Wholesale subsidized print cost when ordering copies for yourself.
            </p>
          </div>
        </div>

        {/* Feature Addition: Sales Volume & Cumulative Royalty Projection Engine */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 sm:p-7 text-white space-y-4 shadow-lg border border-slate-700">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-300">
                <TrendingUp className="w-3.5 h-3.5" />
                Cumulative Profit Simulator
              </span>
              <h3 className="text-base sm:text-lg font-bold">
                Projected Total Royalty Earnings
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-300 font-medium">Projected Sales:</span>
              <div className="flex gap-1.5">
                {[50, 100, 250, 500, 1000].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setCopiesSold(num)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      copiesSold === num
                        ? "bg-[#F05262] text-white shadow-xs"
                        : "bg-white/10 hover:bg-white/20 text-slate-300"
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2 border-t border-white/10">
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                BookLeaf Store ({copiesSold} copies)
              </span>
              <span className="text-xl sm:text-2xl font-extrabold text-emerald-400 font-sans">
                {isIndia ? `₹${projectedStoreEarnings.toLocaleString()}` : `$${projectedStoreEarnings.toLocaleString()}`}
              </span>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Amazon &amp; Flipkart ({copiesSold} copies)
              </span>
              <span className="text-xl sm:text-2xl font-extrabold text-rose-400 font-sans">
                {isIndia ? `₹${projectedAmazonEarnings.toLocaleString()}` : `$${projectedAmazonEarnings.toLocaleString()}`}
              </span>
            </div>
            <div className="bg-[#F05262]/20 rounded-xl p-4 border border-[#F05262]/40">
              <span className="text-[10px] uppercase font-bold text-amber-300 block mb-1">
                Blended 40/60 Channel Projection
              </span>
              <span className="text-xl sm:text-2xl font-extrabold text-white font-sans">
                {isIndia ? `₹${blendedProjection.toLocaleString()}` : `$${blendedProjection.toLocaleString()}`}
              </span>
            </div>
          </div>
        </div>

        {/* Collapsible Full Deduction Breakdown */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
          <button
            type="button"
            onClick={() => setShowBreakdown((prev) => !prev)}
            className="w-full px-5 py-4 bg-slate-50 hover:bg-slate-100 transition flex items-center justify-between text-xs font-bold text-slate-800 cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Info className="w-4 h-4 text-slate-500" />
              <span>Itemized Cost &amp; Revenue Breakdown</span>
            </span>
            <span className="flex items-center gap-1.5 text-[#F05262] font-bold">
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
              <div className="py-2.5 flex justify-between">
                <span>Retail Selling Price (MRP):</span>
                <strong className="text-slate-900 font-bold font-sans">
                  {isIndia ? `₹${effectivePrice}` : `$${effectivePrice}`}
                </strong>
              </div>
              {format !== "ebook" && (
                <>
                  <div className="py-2.5 flex justify-between text-slate-600">
                    <span>Base In-House Printing Cost ({pages} pgs, {paperType} paper):</span>
                    <span className="font-sans">- {isIndia ? `₹${printCost}` : `$${printCost}`}</span>
                  </div>
                  {format === "hardcover" && (
                    <div className="py-2.5 flex justify-between text-slate-600">
                      <span>Casebound Hardcover Binding Premium:</span>
                      <span className="font-sans">- {isIndia ? `₹120` : `$3.50`}</span>
                    </div>
                  )}
                  {coverFinish === "gloss" && (
                    <div className="py-2.5 flex justify-between text-slate-600">
                      <span>Gloss High-UV Protective Coating:</span>
                      <span className="font-sans">- {isIndia ? `₹8` : `$0.25`}</span>
                    </div>
                  )}
                  <div className="py-2.5 flex justify-between text-slate-600">
                    <span>Thermal QC Packaging &amp; Barcode Integration:</span>
                    <span className="font-sans">- {isIndia ? `₹${handlingFee}` : `$${handlingFee}`}</span>
                  </div>
                  <div className="py-2.5 flex justify-between text-slate-600">
                    <span>Amazon Channel Referral Fee (30% on Amazon/Flipkart):</span>
                    <span className="font-sans">- {isIndia ? `₹${amazonMarketplaceFee}` : `$${amazonMarketplaceFee}`}</span>
                  </div>
                </>
              )}
              {format === "ebook" && (
                <>
                  <div className="py-2.5 flex justify-between text-slate-600">
                    <span>Digital Cloud Hosting &amp; Delivery Platform Fee:</span>
                    <span className="font-sans">- {isIndia ? "₹25" : "$0.35"}</span>
                  </div>
                  <div className="py-2.5 flex justify-between text-slate-600">
                    <span>Payment Gateway Interchange Fee (3%):</span>
                    <span className="font-sans">- {isIndia ? `₹${(effectivePrice * 0.03).toFixed(2)}` : `$${(effectivePrice * 0.03).toFixed(2)}`}</span>
                  </div>
                </>
              )}
              <div className="py-2.5 flex justify-between text-slate-600">
                <span>Author Royalty Contract Split:</span>
                <span className="font-semibold text-emerald-700">
                  {plan === "breakthrough" ? "100% of Net Revenue" : "80% of Net Revenue"}
                </span>
              </div>
              <div className="pt-3 flex justify-between text-slate-900 font-bold border-t border-slate-200">
                <span>Net Royalty Paid Directly to Author Bank Account:</span>
                <span className="text-base font-extrabold text-emerald-600 font-sans">
                  {isIndia ? `₹${amazonRoyalty}` : `$${amazonRoyalty}`} (Amazon) • {isIndia ? `₹${storeRoyalty}` : `$${storeRoyalty}`} (BookLeaf)
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Action Controls & Fast Publishing Link Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={handleCopySummary}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition cursor-pointer"
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-bold">Calculation Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copy Royalty Summary</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <Link
              href="/author-dashboard?menu=Author%20Copies"
              className="flex-1 sm:flex-none text-center px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition cursor-pointer"
            >
              Order Author Copies
            </Link>
            <Link
              href={`/create_book?plan=${plan === "breakthrough" ? "premium" : "basic"}&format=${format}`}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#F05262] hover:bg-[#d94151] text-white text-xs font-bold transition shadow-xs cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Publish with this Plan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
