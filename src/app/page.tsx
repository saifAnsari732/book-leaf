"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  CreditCard,
  ExternalLink,
  Facebook,
  Headphones,
  HeartHandshake,
  HelpCircle,
  IndianRupee,
  Instagram,
  Layers,
  Linkedin,
  Lock,
  Mail,
  Menu,
  MessageCircle,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Twitter,
  Users,
  X,
  Youtube,
  Zap,
} from "lucide-react";
import { RoyaltyCalculator } from "@/components/calculator/royalty-calculator";
import { FloatingAgentChat } from "@/components/support/floating-agent-chat";

export default function HomePage() {
  const router = useRouter();
  const [loggingInAs, setLoggingInAs] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const handleQuickLogin = async (email: string, role: "AUTHOR" | "ADMIN") => {
    try {
      setLoggingInAs(email);
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password: role === "ADMIN" ? "admin123" : "author123",
        }),
      });
      if (res.ok) {
        if (role === "ADMIN") {
          router.push("/admin");
        } else {
          router.push("/author");
        }
      } else {
        router.push("/login");
      }
    } catch {
      router.push("/login");
    } finally {
      setLoggingInAs(null);
    }
  };

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      setSubscribed(true);
      setNewsletterEmail("");
    }
  };

  const faqs = [
    {
      q: "What is the typical book publication timeline at BookLeaf?",
      a: "Standard Publishing takes 30 to 45 business days from manuscript approval to live retail distribution across Amazon, Flipkart, and the BookLeaf Store. Bestseller Breakthrough packages are fast-tracked to 15 to 20 business days with priority typesetting and proofing.",
    },
    {
      q: "How are book royalties calculated and paid?",
      a: "Authors earn 80% to 100% of the net profit on every copy sold (calculated as MRP minus actual printing, platform, and shipping costs). Royalties are paid quarterly directly into your bank account or via instant 24-hour Razorpay payout links once the ₹1,000 threshold is reached.",
    },
    {
      q: "Do I retain 100% of my copyrights and intellectual property?",
      a: "Yes! All BookLeaf publishing contracts are completely non-exclusive. You retain 100% copyright, intellectual property, and film/audio adaptation rights over your manuscript, poems, and book title.",
    },
    {
      q: "How does the AI Support Co-Pilot help authors?",
      a: "Our integrated Gemini 3.8 Flash AI Co-Pilot slices BookLeaf's official publishing policies and your live database records to provide instant, factual answers on ISBN tracking, royalties, print quality reprints, and retail stock synchronization in seconds.",
    },
    {
      q: "Can I manage multiple books from a single author account?",
      a: "Absolutely! Your BookLeaf Author Portal allows you to track all your published titles and in-production manuscripts simultaneously from a unified dashboard, including individual sales metrics, lifetime royalty ledger, and per-title support threads.",
    },
  ];

  return (
    <div className="min-h-screen bg-white text-[#2F2E2E] font-sans selection:bg-[#F05262] selection:text-white">
      {/* ====================================================================
          MAIN NAVBAR (Exact Match to User Screenshot 1)
          ==================================================================== */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo (Exact Coral Box with White Slash + BookLeaf Publishing) */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-[#F05262] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
              <span className="font-sans text-2xl font-light leading-none -rotate-12 select-none">
                /
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#2F2E2E] leading-tight">
                BookLeaf
              </span>
              <span className="text-xs sm:text-sm font-medium tracking-tight text-[#2F2E2E] -mt-1">
                Publishing
              </span>
              <span className="text-[10px] text-slate-400 font-mono -mt-0.5 hidden sm:block">
                www.bookleafpub.com
              </span>
            </div>
          </Link>

          {/* Navigation Links from Screenshot */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-slate-700">
            <Link href="/" className="text-[#F05262] font-semibold transition">
              Home
            </Link>
            <Link href="#publishing-packages" className="hover:text-[#F05262] transition">
              Get Published
            </Link>
            <Link href="#features" className="hover:text-[#F05262] transition">
              Writing Challenge UK
            </Link>
            <Link href="#features" className="hover:text-[#F05262] transition">
              Writing Challenge US
            </Link>
            <Link href="#portals" className="hover:text-[#F05262] transition">
              Support Portals
            </Link>
            <Link href="#faq" className="hover:text-[#F05262] transition">
              FAQ
            </Link>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-5 py-2.5 rounded-full text-sm font-semibold text-[#F05262] border border-[#F05262]/30 hover:bg-[#FFE7E9]/50 transition"
            >
              Sign In
            </Link>
            <Link
              href="/author"
              className="hidden sm:inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold bg-[#F05262] hover:bg-[#e04555] text-white shadow-xs hover:shadow transition"
            >
              <span>Publish My Book</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            {/* Mobile Hamburger Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition"
              aria-label="Toggle menu"
            >
              {mobileNavOpen ? (
                <X className="w-6 h-6 text-[#F05262]" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Slide-out Menu Drawer */}
        {mobileNavOpen && (
          <div className="lg:hidden bg-white border-b border-slate-200 px-6 py-5 space-y-4 animate-fade-in shadow-xl">
            <nav className="flex flex-col space-y-3 text-sm font-semibold text-slate-700">
              <Link
                href="/"
                onClick={() => setMobileNavOpen(false)}
                className="text-[#F05262]"
              >
                Home
              </Link>
              <Link
                href="#publishing-packages"
                onClick={() => setMobileNavOpen(false)}
                className="hover:text-[#F05262]"
              >
                Packages &amp; Pricing
              </Link>
              <Link
                href="#calculator"
                onClick={() => setMobileNavOpen(false)}
                className="hover:text-[#F05262] flex items-center justify-between"
              >
                <span>Royalty &amp; Print Calculator</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FFF5F6] text-[#F05262] font-bold">
                  NEW
                </span>
              </Link>
              <Link
                href="#features"
                onClick={() => setMobileNavOpen(false)}
                className="hover:text-[#F05262]"
              >
                Writing Challenges (UK &amp; US)
              </Link>
              <Link
                href="#bookstore"
                onClick={() => setMobileNavOpen(false)}
                className="hover:text-[#F05262]"
              >
                Bookstore Bestsellers
              </Link>
              <Link
                href="/author-dashboard?menu=Royalty%20Withdrawal"
                onClick={() => setMobileNavOpen(false)}
                className="text-emerald-700 font-bold"
              >
                Author Dashboard &amp; Royalty Wallet
              </Link>
              <Link
                href="/author/tickets"
                onClick={() => setMobileNavOpen(false)}
                className="hover:text-[#F05262]"
              >
                Support Tickets &amp; Help
              </Link>
              <Link
                href="#faq"
                onClick={() => setMobileNavOpen(false)}
                className="hover:text-[#F05262]"
              >
                FAQ
              </Link>
            </nav>
            <div className="pt-3 border-t border-slate-100 flex gap-2">
              <Link
                href="/login"
                onClick={() => setMobileNavOpen(false)}
                className="flex-1 py-2.5 text-center rounded-xl bg-slate-100 font-bold text-xs text-slate-800"
              >
                Sign In
              </Link>
              <Link
                href="/author-dashboard?menu=Books"
                onClick={() => setMobileNavOpen(false)}
                className="flex-1 py-2.5 text-center rounded-xl bg-[#F05262] font-bold text-xs text-white"
              >
                Publish Book
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ====================================================================
          HERO SECTION (Exact Match to User Screenshot 1: "Publishing Made Easy")
          ==================================================================== */}
      <section className="relative overflow-hidden pt-10 pb-20 md:pt-16 md:pb-28 bg-gradient-to-b from-[#FFF5F6] via-[#FFF9FA] to-white">
        {/* Soft Organic Rose/Pink Cloud Curve Background */}
        <div className="absolute top-0 right-0 w-3/5 h-full bg-[#FFE7E9]/40 rounded-bl-[140px] pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-6 flex flex-col items-start">
              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#F05262] leading-[1.12] mb-6">
                Publishing Made Easy
              </h1>

              {/* Exact Subtitle from Website */}
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-8 max-w-xl">
                Realise your dream of becoming a published author with world&apos;s
                most trusted Self-Publishing Platform. Publish in paperback and
                eBook, sell globally in 150+ countries and earn 100% royalty.
              </p>

              {/* CTA + Social Proof Row */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 w-full mb-10">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-[#F05262] hover:bg-[#e04555] text-white font-bold text-base shadow-md hover:shadow-lg transition transform active:scale-95"
                >
                  <span>Publish My Book</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                {/* Social Proof Pill from Screenshot 1 */}
                <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-full border border-slate-200/90 shadow-2xs">
                  <div className="flex -space-x-2 overflow-hidden">
                    <img
                      src="/images/bookleaf/scraped/author-geetakshi.png"
                      alt="Author"
                      className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                    />
                    <img
                      src="/images/bookleaf/scraped/author-sachin.png"
                      alt="Author"
                      className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                    />
                    <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 ring-2 ring-white text-[10px] font-bold text-slate-600">
                      +12K
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-1 text-xs font-bold text-slate-900 leading-none">
                      <span>3,300+</span>
                    </div>
                    <span className="text-[11px] text-slate-500 block">
                      google reviews
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Launch Buttons for Pair Programming Technical Evaluation */}
              <div className="pt-6 border-t border-slate-200/80 w-full">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-3">
                  1-Click Portal Sandboxes:
                </span>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => handleQuickLogin("priya.sharma@email.com", "AUTHOR")}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 text-[#0F4C3A] border border-emerald-200 text-xs font-bold hover:bg-emerald-100 transition"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Launch Author Desk (Priya Sharma)</span>
                  </button>
                  <button
                    onClick={() => handleQuickLogin("admin@bookleafpub.com", "ADMIN")}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 text-slate-800 border border-slate-200 text-xs font-bold hover:bg-slate-200 transition"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Launch Admin Triage & AI Desk</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Side: Floating Author Photo Collage (Exact Match to Screenshot 1) */}
            <div className="lg:col-span-6 relative">
              <div className="relative mx-auto max-w-md sm:max-w-lg min-h-[440px] flex items-center justify-center">
                {/* Floating Photo 1: Geetakshi Arora (Top Left) */}
                <div className="absolute top-2 left-6 w-36 h-40 rounded-2xl overflow-hidden shadow-lg border-2 border-white transform -rotate-3 hover:rotate-0 hover:scale-105 transition duration-300">
                  <img
                    src="/images/bookleaf/scraped/author-geetakshi.png"
                    alt="Geetakshi Arora"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Floating Photo 2: Author with Book (Top Right) */}
                <div className="absolute top-4 right-8 w-32 h-36 rounded-2xl overflow-hidden shadow-lg border-2 border-white transform rotate-3 hover:rotate-0 hover:scale-105 transition duration-300">
                  <img
                    src="/images/bookleaf/scraped/author-glasses.jpeg"
                    alt="BookLeaf Author"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Floating Photo 3: Author Smiling (Center) */}
                <div className="relative z-10 w-36 h-40 rounded-2xl overflow-hidden shadow-xl border-3 border-white transform hover:scale-105 transition duration-300">
                  <img
                    src="/images/bookleaf/scraped/author-smiling.jpeg"
                    alt="BookLeaf Author"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Floating Photo 4: Man holding Blue Book (Bottom Left) */}
                <div className="absolute bottom-4 left-10 w-32 h-36 rounded-2xl overflow-hidden shadow-lg border-2 border-white transform rotate-2 hover:rotate-0 hover:scale-105 transition duration-300">
                  <img
                    src="/images/bookleaf/scraped/author-blue-book.png"
                    alt="BookLeaf Author"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Floating Photo 5: Girl in Pink Checked Shirt (Bottom Right) */}
                <div className="absolute bottom-2 right-6 w-36 h-44 rounded-2xl overflow-hidden shadow-xl border-2 border-white transform -rotate-2 hover:rotate-0 hover:scale-105 transition duration-300">
                  <img
                    src="/images/bookleaf/scraped/author-pink-shirt.jpeg"
                    alt="BookLeaf Author"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          SHARK TANK INDIA FEATURE BANNER (Exact Match to User Screenshot 2)
          ==================================================================== */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl overflow-hidden shadow-xl border border-slate-200 relative group">
            <div className="relative w-full h-72 sm:h-96 md:h-[440px] bg-slate-900">
              <img
                src="/images/bookleaf/scraped/shark-tank-banner.png"
                alt="BookLeaf Publishing As Seen On Shark Tank India"
                className="w-full h-full object-cover opacity-90 group-hover:scale-102 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/40 to-transparent flex flex-col justify-end p-6 sm:p-10">
                <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-emerald-400 mb-1">
                  National Television Spotlight
                </span>
                <h3 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                  As Seen On SHARK TANK INDIA
                </h3>
                <p className="text-xs sm:text-sm text-slate-200 mt-2 max-w-2xl leading-relaxed">
                  Founders Musavir Khurshid & Shivangi Verma presenting BookLeaf&apos;s revolution in self-publishing, empowering thousands of budding authors worldwide.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          FEATURE BOXES GRID (Exact Match to User Screenshot 2)
          ==================================================================== */}
      <section id="features" className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Box 1: Publish Your Book Faster */}
            <div className="p-6 rounded-3xl bg-[#FFF5F6] border border-[#F8B2B9]/50 hover:shadow-md transition flex flex-col justify-between">
              <div>
                <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center p-2 mb-4 shadow-xs">
                  <img
                    src="/images/bookleaf/scraped/feature-publish-faster.png"
                    alt="Publish your book faster"
                    className="w-full h-full object-contain"
                  />
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-2">
                  Publish your book faster
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  You no longer have to wait for months to hear back from a publisher. Publish in paperback and eBook in just weeks.
                </p>
              </div>
            </div>

            {/* Box 2: Unbeatable Pricing */}
            <div className="p-6 rounded-3xl bg-[#FFF5F6] border border-[#F8B2B9]/50 hover:shadow-md transition flex flex-col justify-between">
              <div>
                <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center p-2 mb-4 shadow-xs">
                  <img
                    src="/images/bookleaf/scraped/feature-unbeatable-pricing.png"
                    alt="Unbeatable Pricing"
                    className="w-full h-full object-contain"
                  />
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-2">
                  Unbeatable Pricing
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  We are officially world&apos;s most affordable premium self-publishing platform with 100% transparent author copy print costs.
                </p>
              </div>
            </div>

            {/* Box 3: Highest Royalty */}
            <div className="p-6 rounded-3xl bg-[#FFF5F6] border border-[#F8B2B9]/50 hover:shadow-md transition flex flex-col justify-between">
              <div>
                <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center p-2 mb-4 shadow-xs">
                  <img
                    src="/images/bookleaf/scraped/feature-highest-royalty.png"
                    alt="Highest Royalty"
                    className="w-full h-full object-contain"
                  />
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-2">
                  Highest Royalty
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Earn up to 100% royalty on every single book sold across domestic and global retail platforms.
                </p>
              </div>
            </div>

            {/* Box 4: Live Sales Report */}
            <div className="p-6 rounded-3xl bg-[#FFF5F6] border border-[#F8B2B9]/50 hover:shadow-md transition flex flex-col justify-between">
              <div>
                <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center p-2 mb-4 shadow-xs">
                  <img
                    src="/images/bookleaf/scraped/feature-live-sales.png"
                    alt="Live sales report"
                    className="w-full h-full object-contain"
                  />
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-2">
                  Live sales report
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  View real-time sales insights, inventory status, and quarterly payout ledgers in your Author Portal.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          MEDIA LOGOS STRIP (Exact Match to User Screenshot 3)
          ==================================================================== */}
      <section className="py-8 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
              Featured In Leading Media Publications
            </span>
            <div className="w-full max-w-4xl flex items-center justify-center">
              <img
                src="/images/bookleaf/scraped/media-strip-logos.png"
                alt="The Telegraph, The Hindu, Delhi Post, Deccan Chronicle, Hindustan Times, The Statesman"
                className="w-full h-auto object-contain max-h-16"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          PUBLISHING PACKAGES SECTION (Exact Match to User Screenshot 3)
          ==================================================================== */}
      <section id="publishing-packages" className="py-20 bg-gradient-to-b from-[#FFF5F6] to-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Banner */}
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F05262] tracking-tight mb-3">
              Publishing Packages
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Choose the perfect publishing plan tailored to your book&apos;s goals.
            </p>
          </div>

          {/* 3 Pricing Cards matching Screenshot 3 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            {/* Package 1: Basic */}
            <div className="bg-white rounded-3xl border-2 border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition flex flex-col justify-between">
              {/* Card Header */}
              <div className="bg-[#F05262] text-white p-8 text-center">
                <h3 className="text-2xl font-bold">Basic</h3>
                <p className="text-3xl font-extrabold mt-1">$649</p>
              </div>

              {/* Card Body */}
              <div className="p-8 flex flex-col justify-between flex-1">
                <ul className="space-y-3.5 text-xs sm:text-sm text-slate-700 mb-8">
                  <li className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F05262] shrink-0" />
                    <span>Personal Publishing Manager</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F05262] shrink-0" />
                    <span>Paperback + eBook Publishing</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F05262] shrink-0" />
                    <span>Standard Cover Design + Typesetting</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F05262] shrink-0" />
                    <span>ISBN + Bar Code</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F05262] shrink-0" />
                    <span>eBook and Paperback Distribution</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F05262] shrink-0" />
                    <span>Sales Reporting and 100% Royalty</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F05262] shrink-0" />
                    <span>Social Media Marketing Templates</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F05262] shrink-0" />
                    <span>Post Publishing Support</span>
                  </li>
                </ul>

                <button
                  onClick={() => router.push("/login")}
                  className="w-full py-3.5 rounded-full bg-[#F05262] hover:bg-[#e04555] text-white font-bold text-sm transition shadow-sm"
                >
                  Get Started
                </button>
              </div>
            </div>

            {/* Package 2: Premium (Most Popular) */}
            <div className="bg-white rounded-3xl border-2 border-[#F05262] overflow-hidden shadow-lg hover:shadow-2xl transition flex flex-col justify-between relative transform lg:-translate-y-2">
              <div className="bg-[#F05262] text-white p-8 text-center relative">
                <span className="absolute top-3 right-4 px-3 py-0.5 rounded-full bg-white text-[#F05262] text-[10px] font-extrabold uppercase tracking-wider">
                  Most Popular
                </span>
                <h3 className="text-2xl font-bold">Premium</h3>
                <p className="text-3xl font-extrabold mt-1">$899</p>
              </div>

              <div className="p-8 flex flex-col justify-between flex-1">
                <ul className="space-y-3.5 text-xs sm:text-sm text-slate-700 mb-8">
                  <li className="flex items-center gap-3 font-semibold text-slate-900">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F05262] shrink-0" />
                    <span>Everything in Basic</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F05262] shrink-0" />
                    <span>Editing & Proof Reading (Up to 30K words)</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F05262] shrink-0" />
                    <span>Customised Cover Design</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F05262] shrink-0" />
                    <span>5 Complimentary Copies</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F05262] shrink-0" />
                    <span>Author Interview</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F05262] shrink-0" />
                    <span>Amazon Ad Campaign (15 Days)</span>
                  </li>
                </ul>

                <button
                  onClick={() => router.push("/login")}
                  className="w-full py-3.5 rounded-full bg-[#F05262] hover:bg-[#e04555] text-white font-bold text-sm transition shadow-md"
                >
                  Get Started
                </button>
              </div>
            </div>

            {/* Package 3: Professional */}
            <div className="bg-white rounded-3xl border-2 border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition flex flex-col justify-between">
              <div className="bg-[#F05262] text-white p-8 text-center">
                <h3 className="text-2xl font-bold">Professional</h3>
                <p className="text-3xl font-extrabold mt-1">$1449</p>
              </div>

              <div className="p-8 flex flex-col justify-between flex-1">
                <ul className="space-y-3.5 text-xs sm:text-sm text-slate-700 mb-8">
                  <li className="flex items-center gap-3 font-semibold text-slate-900">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F05262] shrink-0" />
                    <span>Everything in Premium</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F05262] shrink-0" />
                    <span>Customised Pagination + Typesetting</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F05262] shrink-0" />
                    <span>Up to 20 B&W Illustrations</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F05262] shrink-0" />
                    <span>10 Complimentary Copies</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F05262] shrink-0" />
                    <span>Amazon Ad Campaign (30 Days)</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F05262] shrink-0" />
                    <span>Amazon Ranking Optimisation</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F05262] shrink-0" />
                    <span>Amazon Author Page</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F05262] shrink-0" />
                    <span>Book Giveaway Campaign</span>
                  </li>
                </ul>

                <button
                  onClick={() => router.push("/login")}
                  className="w-full py-3.5 rounded-full bg-[#F05262] hover:bg-[#e04555] text-white font-bold text-sm transition shadow-sm"
                >
                  Get Started
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          ROYALTY & PRINTING COST CALCULATOR (Official Engine Parity)
          ==================================================================== */}
      <section id="calculator" className="py-20 bg-slate-50 border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RoyaltyCalculator />
        </div>
      </section>

      {/* ====================================================================
          100% MONEY-BACK GUARANTEE & MOBILE SELF-PUBLISHING (Matches User Reference Image)
          ==================================================================== */}
      <section className="py-16 bg-white border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {/* Row 1: 100% Money-Back Guarantee */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-8 space-y-3">
              <h3 className="text-3xl sm:text-4xl font-extrabold text-[#F05262] tracking-tight">
                100% Money-Back Guarantee
              </h3>
              <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-xl">
                If you&apos;re unhappy with our publishing package, you can ask for a refund anytime within 14 days.
              </p>
            </div>
            <div className="md:col-span-4 flex items-center justify-center md:justify-end">
              <div className="w-48 sm:w-56 h-auto">
                <img
                  src="/images/bookleaf/scraped/gold-guarantee-seal.png"
                  alt="100% Money-Back Guarantee Seal"
                  className="w-full h-auto object-contain drop-shadow-xl"
                />
              </div>
            </div>
          </div>

          {/* Row 2: Self-Publishing at your fingertips */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-center pt-8 border-t border-slate-100">
            <div className="md:col-span-6 flex items-center justify-center relative">
              <div className="w-full max-w-md h-auto">
                <img
                  src="/images/bookleaf/Mobile_Publish_your_book.png"
                  alt="Self-Publishing at your fingertips"
                  className="w-full h-auto object-contain"
                />
              </div>
            </div>
            <div className="md:col-span-6 space-y-4">
              <h3 className="text-3xl sm:text-4xl font-extrabold text-[#F05262] tracking-tight">
                Self-Publishing at your fingertips
              </h3>
              <p className="text-slate-600 text-base leading-relaxed">
                Make your book reach every corner of the globe without leaving your house.
                <br className="hidden sm:inline" />
                Publish, sell, track, and earn from the comfort of your home.
              </p>
              <div className="pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#F05262] hover:bg-[#e04555] text-white font-bold text-sm shadow-md hover:shadow-lg transition transform active:scale-95"
                >
                  <span>Publish My Book</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          FEATURED BESTSELLERS FROM BOOKLEAF STORE
          ==================================================================== */}
      <section className="py-16 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-bold text-[#F05262] uppercase tracking-wider block mb-1">
                Official Bookstore
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Top Trending Bestsellers
              </h2>
            </div>
            <a
              href="https://store.bookleafpub.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#F05262] hover:underline"
            >
              <span>Explore The Book Store</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Book 1 */}
            <div className="bg-[#FFF5F6]/40 rounded-2xl p-4 border border-[#F8B2B9]/40 shadow-xs hover:shadow-md transition flex flex-col justify-between group">
              <div className="h-64 rounded-xl overflow-hidden mb-4 relative bg-white flex items-center justify-center p-2">
                <img
                  src="/images/bookleaf/hope-between-the-lines.jpg"
                  alt="Hope Between the Lines"
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 line-clamp-1">
                  Hope Between the Lines
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">Poetry • ₹210</p>
                <div className="flex items-center gap-1 text-amber-400 mt-2">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span className="text-xs text-slate-600 font-bold ml-1">4.9</span>
                </div>
              </div>
            </div>

            {/* Book 2 */}
            <div className="bg-[#FFF5F6]/40 rounded-2xl p-4 border border-[#F8B2B9]/40 shadow-xs hover:shadow-md transition flex flex-col justify-between group">
              <div className="h-64 rounded-xl overflow-hidden mb-4 relative bg-white flex items-center justify-center p-2">
                <img
                  src="/images/bookleaf/middle-class-to-millionaire.png"
                  alt="From Middle Class to Millionaire"
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 line-clamp-1">
                  From Middle Class to Millionaire
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">Finance • ₹210</p>
                <div className="flex items-center gap-1 text-amber-400 mt-2">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span className="text-xs text-slate-600 font-bold ml-1">4.8</span>
                </div>
              </div>
            </div>

            {/* Book 3 */}
            <div className="bg-[#FFF5F6]/40 rounded-2xl p-4 border border-[#F8B2B9]/40 shadow-xs hover:shadow-md transition flex flex-col justify-between group">
              <div className="h-64 rounded-xl overflow-hidden mb-4 relative bg-white flex items-center justify-center p-2">
                <img
                  src="/images/bookleaf/the-language-of-us.png"
                  alt="The Language of Us"
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 line-clamp-1">
                  The Language of Us
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">Contemporary • ₹249</p>
                <div className="flex items-center gap-1 text-amber-400 mt-2">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span className="text-xs text-slate-600 font-bold ml-1">4.9</span>
                </div>
              </div>
            </div>

            {/* Book 4 */}
            <div className="bg-[#FFF5F6]/40 rounded-2xl p-4 border border-[#F8B2B9]/40 shadow-xs hover:shadow-md transition flex flex-col justify-between group">
              <div className="h-64 rounded-xl overflow-hidden mb-4 relative bg-white flex items-center justify-center p-2">
                <img
                  src="/images/bookleaf/verses-on-the-human-stage.png"
                  alt="Verses on The HUMAN Stage"
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 line-clamp-1">
                  Verses on The HUMAN Stage
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">Anthology • ₹220</p>
                <div className="flex items-center gap-1 text-amber-400 mt-2">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span className="text-xs text-slate-600 font-bold ml-1">4.7</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          FAQ SECTION
          ==================================================================== */}
      <section id="faq" className="py-16 bg-[#FFF5F6]/30 border-t border-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-[#F05262] uppercase tracking-wider block mb-2">
              Support & Policies
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              Clear answers grounded in BookLeaf official policies and Freshdesk SLAs.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 bg-white overflow-hidden transition"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full px-6 py-4.5 text-left flex items-center justify-between gap-4 font-semibold text-sm sm:text-base text-slate-900 hover:text-[#F05262] transition"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                        isOpen ? "transform rotate-180 text-[#F05262]" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Top Brand Coral Accent Bar */}
      <div className="h-1 bg-gradient-to-r from-[#F05262] via-[#F26979] to-rose-400" />

      {/* ====================================================================
          FOOTER (Clean 4-Column Layout, Modern Light Slate & White Aesthetic)
          ==================================================================== */}
      <footer className="bg-slate-50 border-t border-slate-200 text-slate-700 pt-14 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main 4-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 pb-12 border-b border-slate-200">
            {/* Column 1: Links */}
            <div className="lg:col-span-3 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#F05262]">
                Explore
              </h4>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600">
                <li>
                  <a href="#publishing-packages" className="hover:text-[#F05262] transition-colors">
                    Packages and Pricing
                  </a>
                </li>
                <li>
                  <a href="#bookstore" className="hover:text-[#F05262] transition-colors">
                    Bookstore
                  </a>
                </li>
                <li>
                  <Link href="/login" className="hover:text-[#F05262] transition-colors">
                    Writing Challenges
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-[#F05262] transition-colors">
                    About BookLeaf
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-[#F05262] transition-colors">
                    Privacy &amp; Refund Policy
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-[#F05262] transition-colors">
                    Terms and Conditions
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 2: Contact & Support */}
            <div className="lg:col-span-3 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#F05262]">
                Support &amp; Help
              </h4>
              <div className="space-y-3 text-xs sm:text-sm text-slate-600">
                <div>
                  <span className="text-slate-400 block text-xs">Email / Phone:</span>
                  <a
                    href="mailto:support@bookleafpub.com"
                    className="hover:text-[#F05262] font-semibold text-slate-800 transition-colors block"
                  >
                    support@bookleafpub.com
                  </a>
                  <a
                    href="tel:+911943550930"
                    className="hover:text-[#F05262] text-xs text-slate-600 transition-colors block mt-0.5"
                  >
                    +91 194 355 0930
                  </a>
                </div>

                <div>
                  <a href="#faq" className="hover:text-[#F05262] transition-colors block">
                    Frequently Asked Questions
                  </a>
                </div>

                <div className="pt-1">
                  <Link
                    href="/author/tickets/new"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#F05262] hover:text-[#d94151] transition-colors group"
                  >
                    <span>Click here to raise a ticket</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Column 3: Corporate Registration & Offices */}
            <div className="lg:col-span-3 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#F05262]">
                Company
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                BookLeaf Publishing (Global) is a subsidiary of <strong className="text-slate-900 font-semibold">Libresco Feeds Pvt Ltd.</strong> (CIN: <span className="font-mono text-slate-700">U22100JK2019PTC010936</span>).
              </p>

              <div className="text-xs text-slate-500 space-y-1 pt-1">
                <span className="text-slate-700 font-semibold block text-[11px] uppercase tracking-wide">
                  Regd. Offices:
                </span>
                <p>• 1603 Capitol Ave., Suite 310, Cheyenne, WY 82001, USA</p>
                <p>• Srinagar, J&amp;K, India - 190005</p>
              </div>

              {/* Security & DMCA Trust Badges */}
              <div className="pt-2 flex items-center gap-2 flex-wrap">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 font-semibold shadow-2xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>DMCA Protected</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-50 border border-sky-200 text-[11px] text-sky-800 font-semibold shadow-2xs">
                  <Lock className="w-3 h-3 text-sky-600 shrink-0" />
                  <span>256-bit SSL</span>
                </div>
              </div>
            </div>

            {/* Column 4: Community, Logo & Payment Trust Badges */}
            <div className="lg:col-span-3 flex flex-col justify-between space-y-5">
              <div className="space-y-3">
                <p className="text-xs sm:text-sm font-semibold text-slate-900">
                  Join our community of 25K+ writers and readers:
                </p>

                {/* 5 Scraped Social Media Buttons */}
                <div className="flex items-center gap-2.5 flex-wrap">
                  <a
                    href="https://instagram.com/bookleafpublishing/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-white text-slate-700 hover:bg-[#F05262] hover:text-white transition-all flex items-center justify-center border border-slate-200 shadow-xs hover:scale-105"
                    aria-label="Instagram"
                    title="Follow on Instagram"
                  >
                    <Instagram className="w-4 h-4" />
                  </a>

                  <a
                    href="http://www.facebook.com/bookleafpublishing"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-white text-slate-700 hover:bg-[#F05262] hover:text-white transition-all flex items-center justify-center border border-slate-200 shadow-xs hover:scale-105"
                    aria-label="Facebook"
                    title="Follow on Facebook"
                  >
                    <Facebook className="w-4 h-4" />
                  </a>

                  <a
                    href="https://twitter.com/bookleafpub"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-white text-slate-700 hover:bg-[#F05262] hover:text-white transition-all flex items-center justify-center border border-slate-200 shadow-xs hover:scale-105"
                    aria-label="Twitter / X"
                    title="Follow on Twitter / X"
                  >
                    <Twitter className="w-4 h-4" />
                  </a>

                  <a
                    href="https://www.youtube.com/channel/UCJAAi_L1JH8OZSTbtYZW3OQ"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-white text-slate-700 hover:bg-[#F05262] hover:text-white transition-all flex items-center justify-center border border-slate-200 shadow-xs hover:scale-105"
                    aria-label="YouTube"
                    title="Subscribe on YouTube"
                  >
                    <Youtube className="w-4 h-4" />
                  </a>

                  <a
                    href="https://in.linkedin.com/company/bookleaf-publishing"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-white text-slate-700 hover:bg-[#F05262] hover:text-white transition-all flex items-center justify-center border border-slate-200 shadow-xs hover:scale-105"
                    aria-label="LinkedIn"
                    title="Connect on LinkedIn"
                  >
                    <Linkedin className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Official Footer Logo */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-xs">
                  <span className="font-sans text-2xl font-light leading-none -rotate-12 select-none text-white">
                    /
                  </span>
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-serif text-xl font-bold tracking-tight text-slate-900 leading-tight">
                    BookLeaf
                  </span>
                  <span className="text-xs font-normal tracking-tight text-slate-500 -mt-0.5">
                    Publishing
                  </span>
                </div>
              </div>

              {/* Payment Acceptance Chips */}
              <div className="pt-1 flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded bg-white text-[#1A1F71] text-[10px] font-extrabold tracking-wider border border-slate-200 shadow-2xs">
                  VISA
                </span>
                <span className="px-2 py-0.5 rounded bg-white text-[#EB001B] text-[10px] font-extrabold tracking-wider border border-slate-200 shadow-2xs">
                  MC
                </span>
                <span className="px-2 py-0.5 rounded bg-[#006FCF] text-white text-[10px] font-bold tracking-wider shadow-2xs">
                  AMEX
                </span>
                <span className="px-2 py-0.5 rounded bg-white text-[#097939] text-[10px] font-extrabold tracking-wider border border-slate-200 shadow-2xs">
                  RuPay
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-semibold border border-emerald-200 shadow-2xs">
                  SSL Secure
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Copyright & Disclaimer */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <p>
              &copy; 2026 BookLeaf Publishing. A division of Libresco Feeds Pvt Ltd. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link href="/api-docs" className="hover:text-[#F05262] transition-colors">
                API Docs
              </Link>
              <Link href="/login" className="hover:text-[#F05262] transition-colors">
                Privacy Policy
              </Link>
              <Link href="/login" className="hover:text-[#F05262] transition-colors">
                Terms and Conditions
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* ====================================================================
          INTERACTIVE CUSTOMER SUPPORT CHAT POPUP ("Nishtha" Agent Parity)
          ==================================================================== */}
      <FloatingAgentChat />
    </div>
  );
}
