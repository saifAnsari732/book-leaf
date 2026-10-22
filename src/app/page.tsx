"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BadgePercent,
  BarChart3,
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
  TrendingUp,
  Twitter,
  Users,
  X,
  Youtube,
  Zap,
} from "lucide-react";
import { RoyaltyCalculator } from "@/components/calculator/royalty-calculator";
import { FloatingAgentChat } from "@/components/support/floating-agent-chat";
import AuthorVideoReel from "@/components/AuthorVideoReel";
import { RazorpayModal } from "@/components/payment/RazorpayModal";
import { useAuth } from "@/context/AuthContext";

export default function HomePage() {
  const router = useRouter();
  const { user, role: currentRole, isAuthenticated } = useAuth();
  const [loggingInAs, setLoggingInAs] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [faqSearchQuery, setFaqSearchQuery] = useState("");
  const [selectedFaqCategory, setSelectedFaqCategory] = useState<string>("All");
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [checkoutPlan, setCheckoutPlan] = useState<{
    planId?: string;
    planName: string;
    amount: number;
  } | null>(null);

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
      id: "faq-timeline",
      category: "Publishing",
      categoryLabel: "Timeline & SLA",
      q: "What is the typical book publication timeline at BookLeaf?",
      a: "Standard Publishing takes 30 to 45 business days from final manuscript approval to live retail distribution across Amazon, Flipkart, and the BookLeaf Store. Bestseller Breakthrough packages are fast-tracked to 15 to 20 business days with dedicated priority typesetting, proof generation, and expedited ISBN allocation.",
      highlights: ["30-45 Days Standard SLA", "15-20 Days Fast-Track Option", "Live Dashboard Proof Tracking"],
    },
    {
      id: "faq-royalty",
      category: "Royalties",
      categoryLabel: "100% Royalty Share",
      q: "How are book royalties calculated and disbursed to authors?",
      a: "Authors earn 100% of the net profit on every copy sold (calculated as retail MRP minus transparent print production, retailer fee, and postage). Earnings accrue in real-time in your Author Portal wallet and are paid directly into your verified bank account via automated IMPS or instant Razorpay transfer once the ₹1,000 threshold is reached.",
      highlights: ["100% Net Profit Share", "Automated IMPS Bank Settlement", "Zero Hidden Platform Deductions"],
    },
    {
      id: "faq-copies",
      category: "Royalties",
      categoryLabel: "Author Copies",
      q: "Can I order physical author copies at subsidized printer rates?",
      a: "Yes! As a registered BookLeaf author, you can order author copies at exclusive subsidized printing rates—up to 60% below retail MRP. There are no mandatory minimum order quantities, and you can order anytime from your dashboard with doorstep courier delivery.",
      highlights: ["Up to 60% Subsidized Printing Discount", "Order from 10 Copies Onward", "Doorstep Express Courier"],
    },
    {
      id: "faq-copyright",
      category: "Copyright",
      categoryLabel: "Legal & IP Ownership",
      q: "Do I retain 100% of my copyrights, film rights, and intellectual property?",
      a: "Yes! All BookLeaf publishing contracts are completely non-exclusive. You retain 100% legal copyright, intellectual property, translation rights, and film/audio adaptation rights over your manuscript, poems, and book title.",
      highlights: ["100% Non-Exclusive Agreement", "Full Film & Audio Rights Retained", "No Lock-in Period"],
    },
    {
      id: "faq-isbn",
      category: "Copyright",
      categoryLabel: "Official Registration",
      q: "Will my book receive an official Government-registered ISBN and barcode?",
      a: "Every published title receives a unique 13-digit ISBN officially registered with Raja Rammohun Roy National Agency (Ministry of Education, Government of India), complete with a high-resolution retail EAN barcode printed on the back cover for worldwide bookstore scanning.",
      highlights: ["Official Ministry of Education ISBN", "Retail EAN-13 Barcode Included", "Global Bibliographic Cataloged"],
    },
    {
      id: "faq-distribution",
      category: "Publishing",
      categoryLabel: "Global Distribution",
      q: "Where will my book be available for readers to purchase?",
      a: "Your paperback and hardcover editions are distributed across Amazon India (Prime eligible), Flipkart, and the BookLeaf Global Online Store. International distribution packages also place your paperback on Amazon US, Amazon UK, and IngramSpark global bookstore distribution.",
      highlights: ["Amazon India Prime", "Flipkart Nationwide Logistics", "Amazon US & UK Global Distribution"],
    },
    {
      id: "faq-ai-copilot",
      category: "AI Tech",
      categoryLabel: "Nishtha AI Assistant",
      q: "How does the Nishtha Gemini AI Co-Pilot assist authors 24/7?",
      a: "Integrated with Google Gemini, Nishtha is trained on BookLeaf's official publishing guidelines, ISBN databases, and royalty schedules. She answers publishing queries, explains royalty breakdowns, provides book promotion prompts, and assists in raising high-priority support tickets.",
      highlights: ["24/7 Instant Answers", "Grounded in Official BookLeaf Policies", "Integrated Ticket Escalation"],
    },
    {
      id: "faq-multi-book",
      category: "AI Tech",
      categoryLabel: "Author Portal",
      q: "Can I manage multiple published titles from a single author account?",
      a: "Yes! Your BookLeaf Author Portal allows you to track all your published titles and in-production manuscripts simultaneously from a unified dashboard, with title-wise sales reports, consolidated wallet balances, and direct author copy orders.",
      highlights: ["Consolidated Multi-Title Management", "Title-Wise Sales Breakdowns", "Unified KYC & Wallet"],
    },
  ];

  return (
    <div className="min-h-screen bg-white text-[#2F2E2E] font-sans selection:bg-[#F05262] selection:text-white">
      {/* ====================================================================
          MAIN NAVBAR (Exact Match to User Screenshot 1)
          ==================================================================== */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-2xs hover:shadow-xs transition-all">
        <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 h-20 flex items-center justify-between">
          {/* Logo (Clean Editorial Wordmark with BookLeaf Icon) */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="w-10 h-10 rounded-lg bg-[#F05262] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
              <span className="font-sans text-2xl font-light leading-none -rotate-12 select-none">
                /
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#2F2E2E] leading-tight">
                BookLeaf
              </span>
              <span className="text-xs sm:text-sm font-semibold tracking-wide text-slate-500 uppercase -mt-0.5">
                Publishing
              </span>
            </div>
          </Link>

          {/* Navigation Links from Screenshot */}
          <nav className="hidden lg:flex items-center gap-5 xl:gap-8 text-sm font-medium text-slate-700">
            <Link href="/" className="text-[#F05262] font-semibold transition">
              Home
            </Link>
            <Link href="#publishing-packages" className="hover:text-[#F05262] transition">
              Get Published
            </Link>
            <Link href="#features" className="hover:text-[#F05262] transition">
              Why BookLeaf
            </Link>
            <Link href="#calculator" className="hover:text-[#F05262] transition">
              Royalty Calculator
            </Link>
            <Link href="#portals" className="hover:text-[#F05262] transition">
              Support Portals
            </Link>
            <Link href="#author-stories" className="hover:text-[#F05262] transition">
              Author Stories
            </Link>
            <Link href="#faq" className="hover:text-[#F05262] transition">
              FAQ
            </Link>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 shrink-0">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold text-[#0F4C3A] bg-emerald-50 border border-emerald-300 hover:bg-emerald-100 transition flex items-center gap-2 shadow-xs"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Dashboard ({currentRole === "ADMIN" ? "Admin" : "Author"})</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="px-5 py-2.5 rounded-full text-sm font-semibold text-[#F05262] border border-[#F05262]/30 hover:bg-[#FFE7E9]/50 transition"
              >
                Sign In
              </Link>
            )}
            <Link
              href="/create_book"
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
                href="/author-dashboard?menu=Support%20Tickets"
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
      <section className="relative overflow-hidden pt-8 pb-16 md:pt-14 md:pb-24 bg-gradient-to-b from-[#FFF5F6] via-[#FFF9FA] to-white">
        {/* Soft Organic Rose/Pink Cloud Curve Background */}
        <div className="absolute top-0 right-0 w-3/5 h-full bg-[#FFE7E9]/40 rounded-bl-[140px] pointer-events-none -z-10" />

        <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-6 flex flex-col items-start">
              {/* Main Headline with Senior Typography & Intentional Coral Accent */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.12] mb-6">
                Publishing <span className="text-[#F05262]">Made Easy</span>
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
                  href="/create_book"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-[#F05262] hover:bg-[#e04555] text-white font-bold text-base shadow-md hover:shadow-lg transition transform active:scale-95"
                >
                  <span>Publish My Book</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                {/* Social Proof Pill with 5-Star Validation */}
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
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 leading-none">
                      <div className="flex text-amber-400 text-[11px] tracking-tighter">
                        ★★★★★
                      </div>
                      <span className="font-extrabold">4.9/5</span>
                    </div>
                    <span className="text-[11px] text-slate-500 block pt-0.5">
                      3,300+ Google Reviews
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Launch Buttons for Pair Programming Technical Evaluation */}
              <div id="portals" className="pt-6 border-t border-slate-200/80 w-full scroll-mt-24">
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
          SHARK TANK INDIA PANORAMIC SHOWCASE (Official High-Resolution Banner)
          ==================================================================== */}
      <section className="relative w-full bg-slate-950 overflow-hidden border-y border-slate-200/50">
        <div className="relative w-full h-[320px] sm:h-[400px] md:h-[460px] lg:h-[520px]">
          {/* Panoramic Full-Width Banner Image matching BookLeaf Official Website */}
          <img
            src="/images/bookleaf/scraped/shark-tank-banner.png"
            alt="BookLeaf Publishing Founders on Shark Tank India"
            className="w-full h-full object-cover object-[center_center] select-none"
          />

          {/* Subtle Mobile Overlay to ensure floating text pops on compact screens */}
          <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-black/60 via-transparent to-black/70 sm:to-black/30 pointer-events-none" />

          {/* Floating Text Section (UI Float Text) - Positioned neatly in the right aquatic tank zone */}
          <div className="absolute top-1/2 -translate-y-1/2 right-4 sm:right-8 md:right-12 lg:right-16 xl:right-24 text-left z-10 max-w-sm sm:max-w-md">
            <div className="bg-slate-950/70 backdrop-blur-md border border-white/20 p-5 sm:p-7 rounded-3xl shadow-2xl space-y-2">
              <span className="text-xs sm:text-sm font-bold text-rose-300 tracking-wider uppercase block">
                As Seen On
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
                SHARK TANK INDIA
              </h2>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed pt-1">
                Pitching the future of author-first self-publishing on national television with 100% royalties.
              </p>

              <div className="pt-3 sm:pt-4 flex items-center gap-3">
                <Link
                  href="/create_book"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#F05262] hover:bg-[#d94151] text-white text-xs sm:text-sm font-bold transition-all shadow-lg hover:shadow-xl hover:scale-105"
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
          CORE PUBLISHING ADVANTAGES (Official BookLeaf Graphic Media Objects)
          ==================================================================== */}
      <section id="features" className="py-16 sm:py-20 bg-white border-b border-slate-100 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {/* Feature 1: Publish your book faster */}
            <div className="flex items-start gap-5 sm:gap-6 group bg-slate-50/70 hover:bg-white border border-slate-200/80 hover:border-[#F05262]/30 p-6 sm:p-7 rounded-2xl shadow-xs hover:shadow-md transition-all duration-300">
              <div className="shrink-0 w-20 sm:w-24 transition-transform duration-300 group-hover:scale-105">
                <img
                  src="/images/bookleaf/scraped/feature-publish-faster.png"
                  alt="Publish your book faster"
                  className="w-full h-auto object-contain drop-shadow-sm"
                />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 group-hover:text-[#F05262] transition-colors tracking-tight">
                  Publish your book faster
                </h3>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                  You no longer have to wait for months to hear back from a publisher. Publish your book in just a couple of weeks.
                </p>
                <div className="pt-1">
                  <Link
                    href="/create_book"
                    className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-[#F05262] hover:underline"
                  >
                    <span>Start 5-Stage Publishing</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Feature 2: Unbeatable Pricing */}
            <div className="flex items-start gap-5 sm:gap-6 group bg-slate-50/70 hover:bg-white border border-slate-200/80 hover:border-[#F05262]/30 p-6 sm:p-7 rounded-2xl shadow-xs hover:shadow-md transition-all duration-300">
              <div className="shrink-0 w-20 sm:w-24 transition-transform duration-300 group-hover:scale-105">
                <img
                  src="/images/bookleaf/scraped/feature-unbeatable-pricing.png"
                  alt="Unbeatable Pricing"
                  className="w-full h-auto object-contain drop-shadow-sm"
                />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 group-hover:text-[#F05262] transition-colors tracking-tight">
                  Unbeatable Pricing
                </h3>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                  We are officially world&apos;s most affordable premium self-publishing platform.
                </p>
                <div className="pt-1">
                  <a
                    href="#calculator"
                    className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-[#F05262] hover:underline"
                  >
                    <span>Calculate Printing Cost</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Feature 3: Highest Royalty */}
            <div className="flex items-start gap-5 sm:gap-6 group bg-slate-50/70 hover:bg-white border border-slate-200/80 hover:border-[#F05262]/30 p-6 sm:p-7 rounded-2xl shadow-xs hover:shadow-md transition-all duration-300">
              <div className="shrink-0 w-20 sm:w-24 transition-transform duration-300 group-hover:scale-105">
                <img
                  src="/images/bookleaf/scraped/feature-highest-royalty.png"
                  alt="Highest Royalty"
                  className="w-full h-auto object-contain drop-shadow-sm"
                />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 group-hover:text-[#F05262] transition-colors tracking-tight">
                  Highest Royalty
                </h3>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                  Earn up to 100% royalty on every copy sold on Amazon, Flipkart, and the BookLeaf Store.
                </p>
                <div className="pt-1">
                  <Link
                    href="/printing-cost-royalty-calculator"
                    className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-[#F05262] hover:underline"
                  >
                    <span>Explore 100% Split Formula</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Feature 4: Live sales report */}
            <div className="flex items-start gap-5 sm:gap-6 group bg-slate-50/70 hover:bg-white border border-slate-200/80 hover:border-[#F05262]/30 p-6 sm:p-7 rounded-2xl shadow-xs hover:shadow-md transition-all duration-300">
              <div className="shrink-0 w-20 sm:w-24 transition-transform duration-300 group-hover:scale-105">
                <img
                  src="/images/bookleaf/scraped/feature-live-sales.png"
                  alt="Live sales report"
                  className="w-full h-auto object-contain drop-shadow-sm"
                />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 group-hover:text-[#F05262] transition-colors tracking-tight">
                  Live sales report
                </h3>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                  Track sales, check author royalties, and request instant bank payouts anytime from your author dashboard.
                </p>
                <div className="pt-1">
                  <Link
                    href="/author-dashboard?menu=Royalty%20Withdrawal"
                    className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-[#F05262] hover:underline"
                  >
                    <span>Author Royalty Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
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
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase tracking-wider shadow-2xs">
              <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />
              <span>NEW: Powered by Google Gemini AI Publishing Studio</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F05262] tracking-tight">
              Publishing Packages
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Choose the perfect publishing plan tailored to your book&apos;s goals. All packages now include built-in Google Gemini AI writing &amp; support tools.
            </p>
          </div>

          {/* 3 Pricing Cards matching Screenshot 3 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            {/* Package 1: Basic */}
            <div className="bg-white rounded-3xl border-2 border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition flex flex-col justify-between">
              {/* Card Header */}
              <div className="bg-[#F05262] text-white p-8 text-center relative">
                <span className="inline-block px-3 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold tracking-wider uppercase mb-1.5">
                  Gemini AI Enabled
                </span>
                <h3 className="text-2xl font-bold">Basic</h3>
                <p className="text-3xl font-extrabold mt-1 font-sans">₹3,999</p>
                <p className="text-[11px] text-white/85 font-medium mt-1">
                  All inclusive • One-time fee
                </p>
              </div>

              {/* Card Body */}
              <div className="p-8 flex flex-col justify-between flex-1">
                <ul className="space-y-3 text-xs sm:text-sm text-slate-700 mb-8">
                  {/* Highlighted Gemini AI Features */}
                  <li className="flex items-center gap-2.5 p-2 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 text-indigo-950 font-bold shadow-2xs">
                    <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Gemini AI Book Blurb &amp; Title Generator</span>
                  </li>
                  <li className="flex items-center gap-2.5 p-2 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 text-indigo-950 font-bold shadow-2xs">
                    <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>24/7 Nishtha AI Publishing Concierge</span>
                  </li>

                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Personal Publishing Manager</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Paperback + eBook Publishing</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Standard Cover Design + Typesetting</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>ISBN + Bar Code</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>eBook and Paperback Distribution</span>
                  </li>
                  <li className="flex items-center gap-3 font-semibold text-slate-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Sales Reporting and 100% Royalty</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Social Media Marketing Templates</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Post Publishing Support</span>
                  </li>
                </ul>

                <div className="space-y-2.5">
                  <button
                    type="button"
                    onClick={() =>
                      setCheckoutPlan({
                        planId: "basic",
                        planName: "Basic Publishing Plan",
                        amount: 3999,
                      })
                    }
                    className="w-full py-3.5 rounded-full bg-slate-900 hover:bg-[#F05262] text-white font-bold text-xs sm:text-sm transition-all duration-200 shadow-xs flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5 text-white/90" />
                    <span>Choose Plan</span>
                  </button>
                  <Link
                    href="/create_book?plan=basic"
                    className="block text-center w-full py-2.5 rounded-full border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition"
                  >
                    Start with Basic Form →
                  </Link>
                </div>
              </div>
            </div>

            {/* Package 2: Premium (Most Popular) */}
            <div className="bg-white rounded-3xl border-2 border-[#F05262] overflow-hidden shadow-lg hover:shadow-2xl transition flex flex-col justify-between relative transform lg:-translate-y-2">
              <div className="bg-[#F05262] text-white p-8 text-center relative">
                <span className="absolute top-3 right-4 px-3 py-0.5 rounded-full bg-white text-[#F05262] text-[10px] font-extrabold uppercase tracking-wider">
                  MOST POPULAR
                </span>
                <span className="inline-block px-3 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold tracking-wider uppercase mb-1.5">
                  Gemini AI Pro Co-Pilot
                </span>
                <h3 className="text-2xl font-bold">Premium</h3>
                <p className="text-3xl font-extrabold mt-1 font-sans">₹7,999</p>
                <p className="text-[11px] text-white/90 font-medium mt-1">
                  All inclusive • 5 Author Copies included
                </p>
              </div>

              <div className="p-8 flex flex-col justify-between flex-1">
                <ul className="space-y-3 text-xs sm:text-sm text-slate-700 mb-8">
                  {/* Highlighted Gemini AI Features */}
                  <li className="flex items-center gap-2.5 p-2 rounded-xl bg-gradient-to-r from-rose-50 to-purple-50 border border-rose-200 text-rose-950 font-bold shadow-2xs">
                    <Sparkles className="w-4 h-4 text-[#F05262] shrink-0" />
                    <span>Gemini AI Manuscript Polish &amp; Proofreading (Up to 30K words)</span>
                  </li>
                  <li className="flex items-center gap-2.5 p-2 rounded-xl bg-gradient-to-r from-rose-50 to-purple-50 border border-rose-200 text-rose-950 font-bold shadow-2xs">
                    <Sparkles className="w-4 h-4 text-[#F05262] shrink-0" />
                    <span>Gemini AI Chapter Synopsis &amp; Outline Creator</span>
                  </li>
                  <li className="flex items-center gap-2.5 p-2 rounded-xl bg-gradient-to-r from-rose-50 to-purple-50 border border-rose-200 text-rose-950 font-bold shadow-2xs">
                    <Sparkles className="w-4 h-4 text-[#F05262] shrink-0" />
                    <span>Gemini AI 15-Day Amazon Ad Copy &amp; SEO Keywords</span>
                  </li>

                  <li className="flex items-center gap-3 font-semibold text-slate-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Everything in Basic</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Editing &amp; Proof Reading (Up to 30K words)</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Customised Cover Design</span>
                  </li>
                  <li className="flex items-center gap-3 font-semibold text-slate-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>5 Complimentary Author Copies</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Author Spotlight Interview</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Amazon Ad Campaign (15 Days)</span>
                  </li>
                </ul>

                <div className="space-y-2.5">
                  <button
                    type="button"
                    onClick={() =>
                      setCheckoutPlan({
                        planId: "premium",
                        planName: "Premium Publishing Plan",
                        amount: 7999,
                      })
                    }
                    className="w-full py-3.5 rounded-full bg-[#F05262] hover:bg-[#e04555] text-white font-bold text-xs sm:text-sm transition shadow-md flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5 text-white/90" />
                    <span>Choose Plan</span>
                  </button>
                  <Link
                    href="/create_book?plan=premium"
                    className="block text-center w-full py-2.5 rounded-full border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition"
                  >
                    Start with Premium Form →
                  </Link>
                </div>
              </div>
            </div>

            {/* Package 3: Professional */}
            <div className="bg-white rounded-3xl border-2 border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition flex flex-col justify-between">
              <div className="bg-[#F05262] text-white p-8 text-center relative">
                <span className="inline-block px-3 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold tracking-wider uppercase mb-1.5">
                  Full Gemini AI Studio
                </span>
                <h3 className="text-2xl font-bold">Professional</h3>
                <p className="text-3xl font-extrabold mt-1 font-sans">₹14,999</p>
                <p className="text-[11px] text-white/85 font-medium mt-1">
                  All inclusive • 10 Author Copies + Hardcover
                </p>
              </div>

              <div className="p-8 flex flex-col justify-between flex-1">
                <ul className="space-y-3 text-xs sm:text-sm text-slate-700 mb-8">
                  {/* Highlighted Gemini AI Features */}
                  <li className="flex items-center gap-2.5 p-2 rounded-xl bg-gradient-to-r from-amber-50 via-purple-50 to-indigo-50 border border-indigo-200 text-slate-900 font-bold shadow-2xs">
                    <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Full Gemini AI Manuscript Writing Studio (Chapters &amp; Plots)</span>
                  </li>
                  <li className="flex items-center gap-2.5 p-2 rounded-xl bg-gradient-to-r from-amber-50 via-purple-50 to-indigo-50 border border-indigo-200 text-slate-900 font-bold shadow-2xs">
                    <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Gemini AI Amazon Ranking &amp; Keyword Optimizer</span>
                  </li>
                  <li className="flex items-center gap-2.5 p-2 rounded-xl bg-gradient-to-r from-amber-50 via-purple-50 to-indigo-50 border border-indigo-200 text-slate-900 font-bold shadow-2xs">
                    <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Instant AI Ticket Triage &amp; 2-Hour Priority SLA</span>
                  </li>

                  <li className="flex items-center gap-3 font-semibold text-slate-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Everything in Premium</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Customised Pagination + Typesetting</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Up to 20 B&amp;W Illustrations</span>
                  </li>
                  <li className="flex items-center gap-3 font-semibold text-slate-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>10 Complimentary Author Copies</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Amazon Ad Campaign (30 Days)</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Amazon Ranking Optimisation</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Amazon Author Page Setup</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>National Press Release Distribution</span>
                  </li>
                </ul>

                <div className="space-y-2.5">
                  <button
                    type="button"
                    onClick={() =>
                      setCheckoutPlan({
                        planId: "professional",
                        planName: "Professional Publishing Plan",
                        amount: 14999,
                      })
                    }
                    className="w-full py-3.5 rounded-full bg-slate-900 hover:bg-[#F05262] text-white font-bold text-xs sm:text-sm transition-all duration-200 shadow-xs flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5 text-white/90" />
                    <span>Choose Plan</span>
                  </button>
                  <Link
                    href="/create_book?plan=professional"
                    className="block text-center w-full py-2.5 rounded-full border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition"
                  >
                    Start with Professional Form →
                  </Link>
                </div>
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
                  href="/create_book"
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
      <section id="bookstore" className="py-16 bg-white border-t border-slate-100 scroll-mt-24">
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
            <a
              href="https://store.bookleafpub.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
            >
              <div className="h-64 rounded-xl overflow-hidden mb-4 relative bg-slate-50 flex items-center justify-center p-2">
                <img
                  src="/images/bookleaf/hope-between-the-lines.jpg"
                  alt="Hope Between the Lines"
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 line-clamp-1 group-hover:text-[#F05262] transition-colors">
                  Hope Between the Lines
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">Poetry • ₹210</p>
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1 text-amber-400">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span className="text-xs text-slate-600 font-bold ml-1">4.9</span>
                  </div>
                  <span className="text-[11px] font-semibold text-[#F05262] group-hover:underline inline-flex items-center gap-0.5">
                    Store <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </a>

            {/* Book 2 */}
            <a
              href="https://store.bookleafpub.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
            >
              <div className="h-64 rounded-xl overflow-hidden mb-4 relative bg-slate-50 flex items-center justify-center p-2">
                <img
                  src="/images/bookleaf/middle-class-to-millionaire.png"
                  alt="From Middle Class to Millionaire"
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 line-clamp-1 group-hover:text-[#F05262] transition-colors">
                  From Middle Class to Millionaire
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">Finance • ₹210</p>
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1 text-amber-400">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span className="text-xs text-slate-600 font-bold ml-1">4.8</span>
                  </div>
                  <span className="text-[11px] font-semibold text-[#F05262] group-hover:underline inline-flex items-center gap-0.5">
                    Store <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </a>

            {/* Book 3 */}
            <a
              href="https://store.bookleafpub.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
            >
              <div className="h-64 rounded-xl overflow-hidden mb-4 relative bg-slate-50 flex items-center justify-center p-2">
                <img
                  src="/images/bookleaf/the-language-of-us.png"
                  alt="The Language of Us"
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 line-clamp-1 group-hover:text-[#F05262] transition-colors">
                  The Language of Us
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">Contemporary • ₹249</p>
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1 text-amber-400">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span className="text-xs text-slate-600 font-bold ml-1">4.9</span>
                  </div>
                  <span className="text-[11px] font-semibold text-[#F05262] group-hover:underline inline-flex items-center gap-0.5">
                    Store <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </a>

            {/* Book 4 */}
            <a
              href="https://store.bookleafpub.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
            >
              <div className="h-64 rounded-xl overflow-hidden mb-4 relative bg-slate-50 flex items-center justify-center p-2">
                <img
                  src="/images/bookleaf/verses-on-the-human-stage.png"
                  alt="Verses on The HUMAN Stage"
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 line-clamp-1 group-hover:text-[#F05262] transition-colors">
                  Verses on The HUMAN Stage
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">Anthology • ₹220</p>
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1 text-amber-400">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span className="text-xs text-slate-600 font-bold ml-1">4.7</span>
                  </div>
                  <span className="text-[11px] font-semibold text-[#F05262] group-hover:underline inline-flex items-center gap-0.5">
                    Store <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* ====================================================================
          REAL STORIES & TESTIMONIALS - AUTHOR VIDEO REEL (YouTube Scraped)
          ==================================================================== */}
      <AuthorVideoReel />

      {/* ====================================================================
          FAQ SECTION (Executive Senior Split Layout with Interactive Category Filters)
          ==================================================================== */}
      <section id="faq" className="py-20 sm:py-28 bg-[#F9FAF7] border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#FFF5F6] to-[#FFE7E9] border border-[#F05262]/20 text-[#F05262] text-xs font-bold uppercase tracking-wider shadow-2xs">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Support &amp; Author Knowledge Base</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Frequently Asked Questions
            </h2>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Clear, transparent answers grounded in BookLeaf official author agreements, 100% royalty standards, and global distribution network.
            </p>
          </div>

          {/* 2-Column Split Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Categories Navigation & Support Concierge (4 cols) */}
            <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-28">
              {/* Category Filter Pills */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 block mb-2">
                  Browse by Topic
                </span>

                {[
                  { id: "All", label: "All Questions", count: faqs.length, icon: HelpCircle },
                  { id: "Publishing", label: "Publishing & Timeline", count: faqs.filter(f => f.category === "Publishing").length, icon: BookOpen },
                  { id: "Royalties", label: "Royalties & Payouts", count: faqs.filter(f => f.category === "Royalties").length, icon: IndianRupee },
                  { id: "Copyright", label: "Copyright & Legal", count: faqs.filter(f => f.category === "Copyright").length, icon: ShieldCheck },
                  { id: "AI Tech", label: "AI Co-Pilot & Tech", count: faqs.filter(f => f.category === "AI Tech").length, icon: Sparkles },
                ].map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = selectedFaqCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setSelectedFaqCategory(cat.id);
                        setOpenFaq(null);
                      }}
                      className={`w-full h-11 px-3.5 rounded-xl flex items-center justify-between text-xs font-semibold transition-all group ${
                        isSelected
                          ? "bg-gradient-to-r from-[#FFF5F6] to-[#FFE7E9] text-[#F05262] font-bold border border-[#F05262]/25 shadow-2xs"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon
                          className={`w-4 h-4 transition-colors ${
                            isSelected ? "text-[#F05262]" : "text-slate-400 group-hover:text-slate-700"
                          }`}
                        />
                        <span>{cat.label}</span>
                      </div>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          isSelected
                            ? "bg-[#F05262] text-white"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {cat.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Author Support Concierge Card */}
              <div className="bg-gradient-to-br from-[#FFF5F6] via-white to-[#FFF0F2] rounded-2xl p-6 border border-[#F05262]/20 shadow-2xs space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#F05262] to-rose-400 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                    N
                  </div>
                  <div>
                    <h4 className="font-serif text-base font-bold text-slate-900">
                      Need Personal Guidance?
                    </h4>
                    <p className="text-xs text-slate-500">
                      Our Publishing Concierge is here to help
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Have a specific question about your poetry collection, novel manuscript, or royalty breakdown? Speak directly with our editorial team.
                </p>

                <div className="space-y-2 pt-1">
                  <a
                    href="https://wa.me/911943550930?text=Hello%20BookLeaf%20Publishing%20Team,%20I%20have%20a%20question%20about%20publishing%20my%20book."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full h-11 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-sm hover:shadow"
                  >
                    <MessageCircle className="w-4 h-4 fill-white" />
                    <span>Chat on WhatsApp (+91 194 355 0930)</span>
                  </a>

                  <Link
                    href="/author-dashboard?menu=Raise%20a%20Query"
                    className="w-full h-10 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs transition flex items-center justify-center gap-1.5"
                  >
                    <span>Raise a Priority Support Query</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </Link>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Live Support Desk
                  </span>
                  <span className="font-semibold text-slate-700">&lt; 4 hr turnaround</span>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Search & Elevated Accordion (8 cols) */}
            <div className="lg:col-span-8 space-y-5">
              {/* Keyword Search Bar */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={faqSearchQuery}
                  onChange={(e) => setFaqSearchQuery(e.target.value)}
                  placeholder="Search questions (e.g. royalty, timeline, copyright, print copies...)"
                  className="w-full pl-11 pr-10 py-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#F05262] transition"
                />
                {faqSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setFaqSearchQuery("")}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Accordion Cards List */}
              {(() => {
                const filteredFaqs = faqs.filter((faq) => {
                  const matchesCategory =
                    selectedFaqCategory === "All" || faq.category === selectedFaqCategory;
                  const matchesSearch =
                    !faqSearchQuery.trim() ||
                    faq.q.toLowerCase().includes(faqSearchQuery.toLowerCase()) ||
                    faq.a.toLowerCase().includes(faqSearchQuery.toLowerCase()) ||
                    faq.categoryLabel.toLowerCase().includes(faqSearchQuery.toLowerCase());
                  return matchesCategory && matchesSearch;
                });

                if (filteredFaqs.length === 0) {
                  return (
                    <div className="bg-white rounded-2xl border border-slate-200/90 p-10 text-center space-y-3">
                      <HelpCircle className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="text-sm font-bold text-slate-700">No matching questions found</p>
                      <p className="text-xs text-slate-400">
                        Try searching with different keywords or switch back to &quot;All Questions&quot;.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setFaqSearchQuery("");
                          setSelectedFaqCategory("All");
                        }}
                        className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
                      >
                        Reset Search Filters
                      </button>
                    </div>
                  );
                }

                return (
                  <div className="space-y-3.5">
                    {filteredFaqs.map((faq, idx) => {
                      const isOpen = openFaq === idx;
                      return (
                        <div
                          key={faq.id || idx}
                          className={`rounded-2xl border bg-white overflow-hidden transition-all duration-200 shadow-2xs ${
                            isOpen
                              ? "border-[#F05262]/40 shadow-xs ring-1 ring-[#F05262]/10"
                              : "border-slate-200/90 hover:border-slate-300 hover:shadow-xs"
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => setOpenFaq(isOpen ? null : idx)}
                            className="w-full p-5 sm:p-6 text-left flex items-start justify-between gap-4 group cursor-pointer"
                          >
                            <div className="space-y-1.5 flex-1 pr-2">
                              <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-[#F05262] bg-[#FFF5F6] px-2 py-0.5 rounded-md border border-[#F05262]/20">
                                {faq.categoryLabel}
                              </span>
                              <h3 className="font-serif text-base sm:text-lg font-bold text-slate-900 group-hover:text-[#F05262] transition-colors leading-snug">
                                {faq.q}
                              </h3>
                            </div>

                            <div
                              className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 ${
                                isOpen
                                  ? "bg-[#F05262] text-white shadow-2xs rotate-180"
                                  : "bg-slate-100 text-slate-500 group-hover:bg-[#FFF5F6] group-hover:text-[#F05262]"
                              }`}
                            >
                              <ChevronDown className="w-4 h-4" />
                            </div>
                          </button>

                          {isOpen && (
                            <div className="px-5 sm:px-6 pb-6 pt-1 space-y-4 border-t border-slate-100 animate-fade-in">
                              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                {faq.a}
                              </p>

                              {/* Highlight Badges / Fact Strip */}
                              {faq.highlights && faq.highlights.length > 0 && (
                                <div className="flex flex-wrap gap-2 pt-1">
                                  {faq.highlights.map((h, hIdx) => (
                                    <span
                                      key={hIdx}
                                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200/80 text-[11px] font-semibold text-slate-700"
                                    >
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                      <span>{h}</span>
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </section>

      {/* Top Brand Coral Accent Bar */}
      <div className="h-1 bg-gradient-to-r from-[#F05262] via-[#F26979] to-rose-400" />

      {/* ====================================================================
          FOOTER (Clean 4-Column Layout, Modern Light Slate & White Aesthetic)
          ==================================================================== */}
      <footer className="bg-slate-50 border-t border-slate-200 text-slate-700 pt-16 pb-16 sm:pb-20">
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
                    href="/author-dashboard?menu=Raise%20a%20Query"
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

                {/* 5 Scraped Social Media Buttons with Official Brand Backgrounds */}
                <div className="flex items-center gap-2.5 flex-wrap pt-1">
                  {/* Instagram */}
                  <a
                    href="https://instagram.com/bookleafpublishing/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white flex items-center justify-center shadow-xs hover:shadow-md hover:scale-110 transition-all duration-300"
                    aria-label="Instagram"
                    title="Follow on Instagram"
                  >
                    <Instagram className="w-4 h-4 text-white" />
                  </a>

                  {/* Facebook */}
                  <a
                    href="https://www.facebook.com/bookleafpublishing"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-[#1877F2] hover:bg-[#1565cf] text-white flex items-center justify-center shadow-xs hover:shadow-md hover:scale-110 transition-all duration-300"
                    aria-label="Facebook"
                    title="Follow on Facebook"
                  >
                    <Facebook className="w-4 h-4 text-white fill-white" />
                  </a>

                  {/* Twitter / X */}
                  <a
                    href="https://twitter.com/bookleafpub"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-slate-900 hover:bg-black text-white flex items-center justify-center shadow-xs hover:shadow-md hover:scale-110 transition-all duration-300"
                    aria-label="Twitter / X"
                    title="Follow on Twitter / X"
                  >
                    <Twitter className="w-4 h-4 text-white fill-white" />
                  </a>

                  {/* YouTube */}
                  <a
                    href="https://www.youtube.com/channel/UCJAAi_L1JH8OZSTbtYZW3OQ"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-[#FF0000] hover:bg-[#d90000] text-white flex items-center justify-center shadow-xs hover:shadow-md hover:scale-110 transition-all duration-300"
                    aria-label="YouTube"
                    title="Subscribe on YouTube"
                  >
                    <Youtube className="w-4 h-4 text-white fill-white" />
                  </a>

                  {/* LinkedIn */}
                  <a
                    href="https://in.linkedin.com/company/bookleaf-publishing"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-[#0A66C2] hover:bg-[#084e96] text-white flex items-center justify-center shadow-xs hover:shadow-md hover:scale-110 transition-all duration-300"
                    aria-label="LinkedIn"
                    title="Connect on LinkedIn"
                  >
                    <Linkedin className="w-4 h-4 text-white fill-white" />
                  </a>
                </div>
              </div>

              {/* Official Footer Logo */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F05262] flex items-center justify-center text-white shadow-xs">
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

      {/* ====================================================================
          RAZORPAY CHECKOUT MODAL (Secure Payment Gateway)
          ==================================================================== */}
      {checkoutPlan && (
        <RazorpayModal
          isOpen={Boolean(checkoutPlan)}
          onClose={() => setCheckoutPlan(null)}
          planId={checkoutPlan.planId}
          planName={checkoutPlan.planName}
          amount={checkoutPlan.amount}
          purpose="BookLeaf Publishing Package"
        />
      )}
    </div>
  );
}
