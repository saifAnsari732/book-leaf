"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";
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
  LogIn,
  LogOut,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  MessageSquare,
  Phone,
  Search,
  Shield,
  ShieldCheck,
  Sparkles,
  Star,
  ThumbsUp,
  TrendingUp,
  Twitter,
  Users,
  X,
  Youtube,
  Zap,
} from "lucide-react";
import { RoyaltyCalculator } from "@/components/calculator/royalty-calculator";
import AuthorVideoReel from "@/components/AuthorVideoReel";
import { RazorpayModal } from "@/components/payment/RazorpayModal";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

interface BookstoreBook {
  id: string;
  title: string;
  author: string;
  genre: string;
  price: number;
  rating: number;
  reviewsCount: number;
  coverImage: string;
  fallbackCover: string;
  isbn: string;
  pages: number;
  language: string;
  synopsis: string;
  highlights: string[];
}

const BESTSELLER_BOOKS: BookstoreBook[] = [
  {
    id: "9789375431183",
    title: "Hope Between the Lines",
    author: "Anisha Amol Karmalkar",
    genre: "Poetry",
    price: 210,
    rating: 4.9,
    reviewsCount: 148,
    coverImage: "https://cdn.shopify.com/s/files/1/0860/3648/0312/files/9789375431183_front.jpg?v=1784963237",
    fallbackCover: "/images/bookleaf/hope-between-the-lines.jpg",
    isbn: "9789375431183",
    pages: 142,
    language: "English & Hindi (Bilingual)",
    synopsis:
      "A heartfelt collection of verses bridging emotions, quiet mornings, and unspoken longing. Divided into dual expressions of English and Hindi lyrical reflections, the collection navigates hope through personal stillness, healing, and emotional renewal.",
    highlights: [
      "Paperback Edition with Matte Lamination",
      "National Poetry Bestseller 2024",
      "Published under BookLeaf Imprint",
      "Available across Amazon & Flipkart",
    ],
  },
  {
    id: "9788199612686",
    title: "From Middle Class to Millionaire",
    author: "Saumya Singh",
    genre: "Finance & Wealth",
    price: 210,
    rating: 4.8,
    reviewsCount: 312,
    coverImage: "https://cdn.shopify.com/s/files/1/0860/3648/0312/files/FrontCover_b362f06d-2376-42f2-8565-49dcbfbcb9a6.png?v=1776934789",
    fallbackCover: "/images/bookleaf/middle-class-to-millionaire.png",
    isbn: "9788199612686",
    pages: 220,
    language: "English",
    synopsis:
      "Practical frameworks, psychological shifts, and actionable money habits to navigate Indian middle-class economic realities into sustainable generational wealth. Includes real-world investment roadmaps and budgeting templates.",
    highlights: [
      "Top Indian Personal Finance Guide",
      "Paperback + Kindle Edition",
      "Fast 5-Day Print Fulfillment",
      "100% Author Royalty Protected",
    ],
  },
  {
    id: "9789375279310",
    title: "The Language of Us",
    author: "Sohani Jani",
    genre: "Contemporary Fiction",
    price: 249,
    rating: 4.9,
    reviewsCount: 289,
    coverImage: "https://cdn.shopify.com/s/files/1/0860/3648/0312/files/image-1_83410d26-8ccb-4c96-b926-f09f312241f8.png?v=1775044230",
    fallbackCover: "/images/bookleaf/the-language-of-us.png",
    isbn: "9789375279310",
    pages: 196,
    language: "English",
    synopsis:
      "An intimate exploration of human silence, vulnerability, and love that survives distance, unspoken grief, and rediscovery in modern India. A poignant, emotionally raw narrative that resonates with contemporary readers.",
    highlights: [
      "Literary Fiction Bestseller",
      "Custom Embossed Cover Finish",
      "Over 2,400 Copies Distributed",
      "In-House Quality Checked",
    ],
  },
  {
    id: "9789375432029",
    title: "Verses on The HUMAN Stage",
    author: "S Sujit Nayak",
    genre: "Philosophy & Drama",
    price: 220,
    rating: 4.7,
    reviewsCount: 195,
    coverImage: "https://cdn.shopify.com/s/files/1/0860/3648/0312/files/front_0d9e2d7b-d802-41e2-a244-64e4bf5e6e47.png?v=1778218422",
    fallbackCover: "/images/bookleaf/verses-on-the-human-stage.png",
    isbn: "9789375432029",
    pages: 168,
    language: "English",
    synopsis:
      "A dramatic tapestry examining the masks people wear, societal expectations, existential wanderings, and the raw vulnerability of human experience. Structured across episodic reflections on identity, performance, and truth.",
    highlights: [
      "Poetry & Dramatic Monologue",
      "Registered ISBN Imprint",
      "Author Spotlight Featured",
      "National Distribution Setup",
    ],
  },
];

export default function HomePage() {
  const router = useRouter();
  const toast = useToast();
  const {
    user,
    role: currentRole,
    isAuthenticated,
    isLoading: authLoading,
    logout,
    login,
  } = useAuth();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [faqSearchQuery, setFaqSearchQuery] = useState("");
  const [selectedFaqCategory, setSelectedFaqCategory] = useState<string>("All");
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [selectedBookPreview, setSelectedBookPreview] = useState<BookstoreBook | null>(null);
  const [showCatalogModal, setShowCatalogModal] = useState<boolean>(false);
  const [catalogSearch, setCatalogSearch] = useState<string>("");
  const [catalogCategory, setCatalogCategory] = useState<string>("All");
  const [checkoutPlan, setCheckoutPlan] = useState<{
    planId?: string;
    planName: string;
    amount: number;
  } | null>(null);

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
            <Link href="#author-stories" className="hover:text-[#F05262] transition">
              Author Stories
            </Link>
            <Link href="#faq" className="hover:text-[#F05262] transition">
              FAQ
            </Link>
            <Link href="/track" className="hover:text-[#F05262] font-semibold transition flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5" />
              <span>Track Ticket</span>
            </Link>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 shrink-0">
            {authLoading ? (
              <div className="w-28 h-10 rounded-full bg-slate-100 animate-pulse" />
            ) : isAuthenticated && user ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/dashboard"
                  className="px-4 py-2 rounded-full text-xs sm:text-sm font-bold text-[#0F4C3A] bg-emerald-50 border border-emerald-300 hover:bg-emerald-100 transition flex items-center gap-2.5 shadow-xs"
                  title={`Signed in as ${user.name} (${user.role})`}
                >
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                    {user.name ? user.name[0].toUpperCase() : "A"}
                  </div>
                  <div className="flex flex-col text-left leading-tight">
                    <span className="text-xs font-bold text-slate-800 truncate max-w-[110px]">
                      {user.name?.split(" ")[0] || "Author"}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-semibold">
                      {currentRole === "ADMIN" ? "Admin Portal" : "Dashboard"}
                    </span>
                  </div>
                </Link>

                <button
                  type="button"
                  onClick={() => logout()}
                  className="p-2.5 rounded-full text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition shrink-0 cursor-pointer"
                  title="Sign Out"
                  aria-label="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-5 py-2.5 rounded-full text-sm font-semibold text-[#F05262] border border-[#F05262]/30 hover:bg-[#FFE7E9]/50 transition flex items-center gap-1.5 shadow-2xs"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
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

              {isAuthenticated && user && (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileNavOpen(false)}
                    className="text-emerald-700 font-bold flex items-center justify-between"
                  >
                    <span>Dashboard ({currentRole === "ADMIN" ? "Admin" : "Author"})</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold">
                      {user.name?.split(" ")[0] || "Active"}
                    </span>
                  </Link>
                  <Link
                    href="/author-dashboard?menu=Support%20Tickets"
                    onClick={() => setMobileNavOpen(false)}
                    className="hover:text-[#F05262]"
                  >
                    Support Tickets &amp; Help
                  </Link>
                </>
              )}

              <Link
                href="/track"
                onClick={() => setMobileNavOpen(false)}
                className="hover:text-[#F05262] flex items-center justify-between font-semibold text-indigo-700"
              >
                <span className="flex items-center gap-2"><Search className="w-4 h-4" /> Track Grievance Status</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold">LIVE</span>
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
              {isAuthenticated && user ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileNavOpen(false)}
                    className="flex-1 py-2.5 text-center rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-xs"
                  >
                    Open Dashboard
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileNavOpen(false);
                      logout();
                    }}
                    className="flex-1 py-2.5 text-center rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 font-bold text-xs transition"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileNavOpen(false)}
                    className="flex-1 py-2.5 text-center rounded-xl bg-slate-100 font-bold text-xs text-slate-800"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/create_book"
                    onClick={() => setMobileNavOpen(false)}
                    className="flex-1 py-2.5 text-center rounded-xl bg-[#F05262] font-bold text-xs text-white"
                  >
                    Publish Book
                  </Link>
                </>
              )}
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
              </div></div>

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
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold uppercase tracking-wider shadow-2xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Official BookLeaf Publishing Packages • Now with AI Editorial &amp; Sales Features</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F05262] tracking-tight">
              Publishing Packages
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Choose the perfect publishing plan tailored to your book&apos;s goals. Includes highlighted AI publishing intelligence, transparent royalties, and global distribution.
            </p>
          </div>

          {/* 3 Pricing Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            {/* Package 1: Basic */}
            <div className="bg-white rounded-3xl border-2 border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition flex flex-col justify-between">
              {/* Card Header */}
              <div className="bg-[#F05262] text-white p-8 text-center relative">
                <span className="inline-block px-3 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold tracking-wider uppercase mb-1.5">
                  Standard Edition
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
                    <span>Official ISBN Assignment + Bar Code</span>
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
                    <span className="bg-amber-100 text-slate-900 font-bold px-2 py-0.5 rounded-md border border-amber-300/80 shadow-2xs">
                      AI Smart Title &amp; Blurb Consultation
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="bg-amber-100 text-slate-900 font-bold px-2 py-0.5 rounded-md border border-amber-300/80 shadow-2xs">
                      AI Pre-Print Grammar &amp; Syntax Diagnostic
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Social Media Marketing Templates</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Post Publishing Support &amp; Helpdesk</span>
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
                  Bestseller Breakthrough
                </span>
                <h3 className="text-2xl font-bold">Premium</h3>
                <p className="text-3xl font-extrabold mt-1 font-sans">₹7,999</p>
                <p className="text-[11px] text-white/90 font-medium mt-1">
                  All inclusive • 5 Author Copies included
                </p>
              </div>

              <div className="p-8 flex flex-col justify-between flex-1">
                <ul className="space-y-3 text-xs sm:text-sm text-slate-700 mb-8">
                  <li className="flex items-center gap-3 font-semibold text-slate-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Everything in Basic</span>
                  </li>
                  <li className="flex items-center gap-3 font-semibold text-slate-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>5 Complimentary Author Copies</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Editorial &amp; Proofreading (Up to 30K words)</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Customised Premium Cover Design</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="bg-amber-100 text-slate-900 font-bold px-2 py-0.5 rounded-md border border-amber-300/80 shadow-2xs">
                      AI Chapter Synopsis &amp; Narrative Flow Analysis
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="bg-amber-100 text-slate-900 font-bold px-2 py-0.5 rounded-md border border-amber-300/80 shadow-2xs">
                      AI Amazon Search &amp; KDP Keyword SEO Tags
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="bg-amber-100 text-slate-900 font-bold px-2 py-0.5 rounded-md border border-amber-300/80 shadow-2xs">
                      AI Target Audience &amp; Category Matcher
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Author Spotlight Feature &amp; Interview</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>15-Day Targeted Amazon Ad Campaign</span>
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
                  Executive Master Edition
                </span>
                <h3 className="text-2xl font-bold">Professional</h3>
                <p className="text-3xl font-extrabold mt-1 font-sans">₹14,999</p>
                <p className="text-[11px] text-white/85 font-medium mt-1">
                  All inclusive • 10 Author Copies + Hardcover
                </p>
              </div>

              <div className="p-8 flex flex-col justify-between flex-1">
                <ul className="space-y-3 text-xs sm:text-sm text-slate-700 mb-8">
                  <li className="flex items-center gap-3 font-semibold text-slate-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Everything in Premium</span>
                  </li>
                  <li className="flex items-center gap-3 font-semibold text-slate-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>10 Complimentary Author Copies + Hardcover</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="bg-amber-100 text-slate-900 font-bold px-2 py-0.5 rounded-md border border-amber-300/80 shadow-2xs">
                      AI Comprehensive Manuscript Studio
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Customised Pagination &amp; Interior Typesetting</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Up to 20 Interior Illustrations</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>30-Day Managed Amazon Ad Campaign</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="bg-amber-100 text-slate-900 font-bold px-2 py-0.5 rounded-md border border-amber-300/80 shadow-2xs">
                      AI Bestseller Category &amp; Competitor Radar
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="bg-amber-100 text-slate-900 font-bold px-2 py-0.5 rounded-md border border-amber-300/80 shadow-2xs">
                      AI Predictive Sales &amp; Demand Model
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Amazon Author Central Page Setup</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>National Press Release Distribution</span>
                  </li>
                  <li className="flex items-center gap-3 font-semibold text-slate-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Priority Support SLA with 2-Hour Response Time</span>
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
          FEATURED BESTSELLERS FROM BOOKLEAF STORE (In-App Direct Preview)
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
            <Link
              href="/bookstore"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#F05262] hover:text-[#d94151] hover:underline cursor-pointer group"
            >
              <span>Explore The Book Store</span>
              <BookOpen className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {BESTSELLER_BOOKS.map((book) => (
              <Link
                key={book.id}
                href={`/book/${book.id}`}
                className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group cursor-pointer text-left"
              >
                <div className="h-64 rounded-xl overflow-hidden mb-4 relative bg-[#F8F8F7] flex items-center justify-center p-2">
                  <img
                    src={book.coverImage}
                    alt={book.title}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = book.fallbackCover;
                    }}
                  />
                  <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/10 transition-colors rounded-xl flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-[#3D081B] text-[#F2EFDD] text-xs font-bold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-[#F05262]" />
                      View Official Page
                    </span>
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 line-clamp-1 group-hover:text-[#F05262] transition-colors">
                    {book.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">{book.genre} • Rs. {book.price}.00</p>
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1 text-amber-400">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span className="text-xs text-slate-600 font-bold ml-1">{book.rating}</span>
                    </div>
                    <span className="text-[11px] font-semibold text-[#F05262] group-hover:underline inline-flex items-center gap-1">
                      <span>View Details</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ====================================================================
          REAL STORIES & TESTIMONIALS - AUTHOR VIDEO REEL (YouTube Scraped)
          ==================================================================== */}
      <AuthorVideoReel />

      {/* ====================================================================
          FAQ SECTION (World-Class Editorial Knowledge Base & Accordion)
          ==================================================================== */}
      <section id="faq" className="py-24 sm:py-32 bg-gradient-to-b from-[#FBFBFA] via-[#F8F9F6] to-white border-t border-slate-200/80 relative overflow-hidden">
        {/* Subtle background ambient glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#F05262]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-slate-900 tracking-tight leading-tight">
              Frequently Asked Questions
            </h2>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
              Clear, transparent answers grounded in BookLeaf official author agreements, 100% royalty standards, and global distribution network.
            </p>
          </div>

          {/* 2-Column Split Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            {/* Left Column: Categories Navigation & Support Concierge (4 cols) */}
            <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-28">
              {/* Category Filter Navigation */}
              <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-1.5">
                <div className="px-3 py-1 flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <span>Browse by Topic</span>
                  <span>{faqs.length} Total</span>
                </div>

                {[
                  { id: "All", label: "All Questions", count: faqs.length, icon: HelpCircle },
                  { id: "Publishing", label: "Publishing & Timeline", count: faqs.filter(f => f.category === "Publishing").length, icon: BookOpen },
                  { id: "Royalties", label: "Royalties & Payouts", count: faqs.filter(f => f.category === "Royalties").length, icon: IndianRupee },
                  { id: "Copyright", label: "Copyright & Ownership", count: faqs.filter(f => f.category === "Copyright").length, icon: ShieldCheck },
                  { id: "AI Tech", label: "AI Co-Pilot & Platform", count: faqs.filter(f => f.category === "AI Tech").length, icon: Sparkles },
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
                      className={`w-full h-12 px-3.5 rounded-2xl flex items-center justify-between text-xs font-semibold transition-all group cursor-pointer ${
                        isSelected
                          ? "bg-slate-900 text-white shadow-xs"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                            isSelected
                              ? "bg-white/15 text-white"
                              : "bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-900"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-left">{cat.label}</span>
                      </div>
                      <span
                        className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold font-mono ${
                          isSelected
                            ? "bg-white/20 text-white"
                            : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
                        }`}
                      >
                        {cat.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Author Support Concierge Card */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-2xs space-y-5 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-full">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                    <span>Live Support Desk</span>
                  </div>
                  <span className="text-[11px] font-medium text-slate-400">&lt; 15 min reply</span>
                </div>

                <div className="space-y-1.5">
                  <h4 className="font-serif text-lg font-bold text-slate-900">
                    Need Personal Guidance?
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Have specific questions about your manuscript, printing costs, or quarterly royalty breakdown? Connect directly with our publishing team.
                  </p>
                </div>

                <div className="space-y-2.5 pt-1">
                  <a
                    href="https://wa.me/911943550930?text=Hello%20BookLeaf%20Publishing%20Team,%20I%20have%20a%20question%20about%20publishing%20my%20book."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full h-11 rounded-2xl bg-[#25D366] hover:bg-[#20be5a] text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-xs hover:shadow-md cursor-pointer"
                  >
                    <WhatsAppIcon className="w-4 h-4 fill-white text-white" />
                    <span>Chat on WhatsApp (+91 194 355 0930)</span>
                  </a>

                  <Link
                    href="/author-dashboard?menu=Raise%20a%20Query"
                    className="w-full h-11 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-semibold text-xs transition flex items-center justify-center gap-2 group cursor-pointer"
                  >
                    <span>Raise Priority Support Ticket</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-800 group-hover:translate-x-0.5 transition-all" />
                  </Link>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>support@bookleafpub.com</span>
                  </span>
                  <span className="font-medium text-slate-600">Mon-Sat (10AM-7PM)</span>
                </div>
              </div>
            </div>

            {/* Right Column: Search Bar & Refined Accordion (8 cols) */}
            <div className="lg:col-span-8 space-y-6">
              {/* Keyword Search Bar & Quick Chips */}
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-4.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={faqSearchQuery}
                    onChange={(e) => setFaqSearchQuery(e.target.value)}
                    placeholder="Search publishing timeline, royalty calculation, ISBN, Amazon delivery..."
                    className="w-full pl-12 pr-11 py-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs text-xs sm:text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition"
                  />
                  {faqSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setFaqSearchQuery("")}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold transition cursor-pointer"
                      title="Clear search"
                    >
                      ×
                    </button>
                  )}
                </div>

                {/* Popular Keywords Quick Filter Chips */}
                <div className="flex items-center gap-2 flex-wrap text-[11px] text-slate-500 pl-1">
                  <span className="font-semibold text-slate-400">Popular:</span>
                  {[
                    { label: "Royalty Payouts", cat: "Royalties" },
                    { label: "Publishing Timeline", cat: "Publishing" },
                    { label: "Copyright Ownership", cat: "Copyright" },
                    { label: "Author Copies Discount", cat: "Royalties" },
                    { label: "Gemini AI Co-Pilot", cat: "AI Tech" },
                  ].map((chip) => (
                    <button
                      key={chip.label}
                      type="button"
                      onClick={() => {
                        setSelectedFaqCategory(chip.cat);
                        setFaqSearchQuery("");
                      }}
                      className="px-2.5 py-1 rounded-full bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 text-[11px] font-medium transition cursor-pointer"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
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
                    <div className="bg-white rounded-3xl border border-slate-200/90 p-12 text-center space-y-4 shadow-2xs">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
                        <HelpCircle className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-base font-bold text-slate-800">No matching questions found</p>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto">
                          We couldn&apos;t find any questions matching &ldquo;{faqSearchQuery}&rdquo;. Try another term or reset filters.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setFaqSearchQuery("");
                          setSelectedFaqCategory("All");
                        }}
                        className="px-5 py-2.5 rounded-full bg-slate-900 hover:bg-black text-white text-xs font-semibold transition cursor-pointer shadow-xs"
                      >
                        Show All Questions
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
                          className={`rounded-3xl border bg-white overflow-hidden transition-all duration-200 ${
                            isOpen
                              ? "border-slate-400/80 shadow-sm ring-1 ring-slate-900/5"
                              : "border-slate-200/90 hover:border-slate-300 shadow-2xs hover:shadow-xs"
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => setOpenFaq(isOpen ? null : idx)}
                            className="w-full p-5 sm:p-6 text-left flex items-start justify-between gap-4 group cursor-pointer"
                          >
                            <div className="space-y-1.5 flex-1 pr-2">
                              <span className="inline-block text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md">
                                {faq.categoryLabel}
                              </span>
                              <h3 className="font-serif text-base sm:text-lg font-bold text-slate-900 group-hover:text-[#F05262] transition-colors leading-snug">
                                {faq.q}
                              </h3>
                            </div>

                            <div
                              className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 transition-all duration-300 ${
                                isOpen
                                  ? "bg-slate-900 text-white border-slate-900 rotate-180"
                                  : "border-slate-200 bg-slate-50 text-slate-500 group-hover:border-slate-300 group-hover:text-slate-900 group-hover:bg-slate-100"
                              }`}
                            >
                              <ChevronDown className="w-4 h-4 transition-transform duration-300" />
                            </div>
                          </button>

                          {isOpen && (
                            <div className="px-5 sm:px-6 pb-6 pt-1 space-y-4 border-t border-slate-100 animate-fade-in">
                              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-2">
                                {faq.a}
                              </p>

                              {/* Highlight Badges / Key Takeaways */}
                              {faq.highlights && faq.highlights.length > 0 && (
                                <div className="flex flex-wrap gap-2 pt-2">
                                  {faq.highlights.map((h, hIdx) => (
                                    <span
                                      key={hIdx}
                                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] font-semibold text-slate-700"
                                    >
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                      <span>{h}</span>
                                    </span>
                                  ))}
                                </div>
                              )}

                              {/* Quick Feedback & Assistance Strip */}
                              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400">
                                <span>Was this helpful for your publishing plan?</span>
                                <div className="flex items-center gap-3">
                                  <button
                                    type="button"
                                    onClick={() => alert("Thank you for your feedback!")}
                                    className="inline-flex items-center gap-1 text-slate-600 hover:text-emerald-700 font-medium transition cursor-pointer"
                                  >
                                    <ThumbsUp className="w-3.5 h-3.5" />
                                    <span>Yes, clear</span>
                                  </button>
                                  <span>•</span>
                                  <Link
                                    href="/author-dashboard?menu=Raise%20a%20Query"
                                    className="text-[#F05262] hover:underline font-semibold"
                                  >
                                    Ask another question &rarr;
                                  </Link>
                                </div>
                              </div>
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

      {/* ====================================================================
          FOOTER (World-Class Editorial Dark Midnight Luxury Layout)
          ==================================================================== */}
      <footer className="bg-[#080E18] text-slate-400 border-t border-slate-800/80 pt-16 sm:pt-20 pb-12 sm:pb-16 relative overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute top-0 right-10 w-96 h-96 bg-[#F05262]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Pre-Footer Community & Newsletter Banner */}
          <div className="bg-gradient-to-br from-[#0F1E33] via-[#0E1B2D] to-[#0A131F] border border-white/10 rounded-3xl p-8 sm:p-12 shadow-2xl mb-16 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#F05262]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="space-y-2.5 max-w-xl text-center lg:text-left">
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  Start Your Book Publishing Journey
                </h3>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                  Get our free 48-page Author Publishing Handbook, weekly royalty benchmarks, cover design inspirations, and writing challenge alerts.
                </p>
              </div>

              {/* Newsletter Form */}
              <form onSubmit={handleNewsletter} className="w-full lg:w-auto flex-1 max-w-md">
                {subscribed ? (
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm font-semibold flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span>Welcome! You are subscribed to BookLeaf Author Dispatch.</span>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <input
                      type="email"
                      required
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      placeholder="Enter your email address..."
                      className="flex-1 px-5 py-3 rounded-2xl bg-white/10 border border-white/15 text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#F05262] focus:bg-white/15 transition"
                    />
                    <button
                      type="submit"
                      className="px-6 py-3 rounded-2xl bg-[#F05262] hover:bg-[#e04354] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition cursor-pointer shrink-0"
                    >
                      Subscribe Free
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Main 4-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12 pb-14 border-b border-white/10">
            {/* Column 1: Brand Wordmark & Corporate Trust (4 cols) */}
            <div className="lg:col-span-4 space-y-5">
              {/* Logo */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F05262] flex items-center justify-center text-white shadow-md">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-serif text-2xl font-bold tracking-tight text-white leading-tight">
                    BookLeaf
                  </span>
                  <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase -mt-0.5">
                    Publishing
                  </span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
                World&apos;s #1 Author-First Self-Publishing Platform. Empowering writers across 100+ countries with 100% royalty profit ownership, 30-day print fulfillment, official government-registered ISBNs, and distribution on Amazon &amp; Flipkart.
              </p>

              {/* Corporate Legal Entity */}
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1 text-xs">
                <span className="text-slate-300 font-semibold block text-[11px] uppercase tracking-wider">
                  Corporate Registration
                </span>
                <p className="text-slate-400">
                  Libresco Feeds Private Limited
                </p>
                <p className="font-mono text-[11px] text-slate-500">
                  CIN: U22100JK2019PTC010936
                </p>
              </div>

              {/* Security & DMCA Badges */}
              <div className="flex items-center gap-2 flex-wrap pt-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>DMCA Protected</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-[11px] text-sky-300 font-semibold">
                  <Lock className="w-3 h-3 text-sky-400 shrink-0" />
                  <span>256-Bit SSL Encrypted</span>
                </div>
              </div>
            </div>

            {/* Column 2: Publishing & Services (2 cols) */}
            <div className="lg:col-span-2 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                Publishing
              </h4>
              <ul className="space-y-3 text-xs sm:text-sm text-slate-400">
                <li>
                  <a href="#publishing-packages" className="hover:text-white transition-colors block">
                    Packages &amp; Pricing
                  </a>
                </li>
                <li>
                  <a href="#calculator" className="hover:text-white transition-colors block">
                    Royalty Calculator
                  </a>
                </li>
                <li>
                  <a href="#bookstore" className="hover:text-white transition-colors block">
                    Bookstore &amp; Catalog
                  </a>
                </li>
                <li>
                  <Link href="/login" className="hover:text-white transition-colors block">
                    21-Day Challenges
                  </Link>
                </li>
                <li>
                  <Link href="/printing-cost-royalty-calculator" className="hover:text-white transition-colors block">
                    Print Cost Estimator
                  </Link>
                </li>
                <li>
                  <Link href="/create_book" className="hover:text-white transition-colors block">
                    Create New Book
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Author Support & Legal (3 cols) */}
            <div className="lg:col-span-3 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                Author Support
              </h4>
              <ul className="space-y-3 text-xs sm:text-sm text-slate-400">
                <li>
                  <Link href="/author" className="hover:text-white transition-colors block font-medium text-slate-300">
                    Author Dashboard Login &rarr;
                  </Link>
                </li>
                <li>
                  <a href="#faq" className="hover:text-white transition-colors block">
                    Knowledge Base &amp; FAQs
                  </a>
                </li>
                <li>
                  <Link href="/author-dashboard?menu=Raise%20a%20Query" className="hover:text-white transition-colors block">
                    Submit Support Query
                  </Link>
                </li>
                <li>
                  <Link href="/admin/tickets" className="hover:text-white transition-colors block">
                    Ticket Queue (Live Status)
                  </Link>
                </li>
                <li>
                  <Link href="/track" className="hover:text-white transition-colors block text-indigo-300 font-semibold flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5" />
                    <span>Track Grievance / Ticket</span>
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-white transition-colors block">
                    Privacy &amp; Refund Policy
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-white transition-colors block">
                    Terms &amp; Conditions
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Global Offices & Editorial Helpline (3 cols) */}
            <div className="lg:col-span-3 space-y-5">
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                  Editorial Desk &amp; Offices
                </h4>

                <div className="space-y-2.5 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-[#F05262] shrink-0" />
                    <a
                      href="mailto:support@bookleafpub.com"
                      className="hover:text-white font-medium text-slate-300 transition-colors"
                    >
                      support@bookleafpub.com
                    </a>
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <a
                      href="tel:+911943550930"
                      className="hover:text-white font-medium text-slate-300 transition-colors"
                    >
                      +91 194 355 0930
                    </a>
                  </div>

                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-3.5 h-3.5 text-[#25D366] shrink-0" />
                    <a
                      href="https://wa.me/911943550930"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-white font-medium text-slate-300 transition-colors"
                    >
                      WhatsApp Priority Support
                    </a>
                  </div>
                </div>

                <div className="pt-2 space-y-1.5 text-xs text-slate-400 border-t border-white/10">
                  <div className="flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span><strong>USA:</strong> 1603 Capitol Ave., Suite 310, Cheyenne, WY 82001</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span><strong>India:</strong> Cyber City, Gurugram &amp; Srinagar, J&amp;K - 190005</span>
                  </div>
                </div>
              </div>

              {/* Social Media Links with Frosted Badges */}
              <div className="space-y-2 pt-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Connect with BookLeaf
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Instagram */}
                  <a
                    href="https://instagram.com/bookleafpublishing/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-white/5 hover:bg-[#E4405F] border border-white/10 hover:border-[#E4405F] text-slate-300 hover:text-white flex items-center justify-center transition-all duration-200 hover:scale-110"
                    aria-label="Instagram"
                    title="Instagram"
                  >
                    <Instagram className="w-4 h-4" />
                  </a>

                  {/* Facebook */}
                  <a
                    href="https://www.facebook.com/bookleafpublishing"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-white/5 hover:bg-[#1877F2] border border-white/10 hover:border-[#1877F2] text-slate-300 hover:text-white flex items-center justify-center transition-all duration-200 hover:scale-110"
                    aria-label="Facebook"
                    title="Facebook"
                  >
                    <Facebook className="w-4 h-4 fill-current" />
                  </a>

                  {/* Twitter / X */}
                  <a
                    href="https://twitter.com/bookleafpub"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-white/5 hover:bg-slate-700 border border-white/10 hover:border-slate-500 text-slate-300 hover:text-white flex items-center justify-center transition-all duration-200 hover:scale-110"
                    aria-label="Twitter / X"
                    title="Twitter / X"
                  >
                    <Twitter className="w-4 h-4 fill-current" />
                  </a>

                  {/* YouTube */}
                  <a
                    href="https://www.youtube.com/channel/UCJAAi_L1JH8OZSTbtYZW3OQ"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-white/5 hover:bg-[#FF0000] border border-white/10 hover:border-[#FF0000] text-slate-300 hover:text-white flex items-center justify-center transition-all duration-200 hover:scale-110"
                    aria-label="YouTube"
                    title="YouTube"
                  >
                    <Youtube className="w-4 h-4 fill-current" />
                  </a>

                  {/* LinkedIn */}
                  <a
                    href="https://in.linkedin.com/company/bookleaf-publishing"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-white/5 hover:bg-[#0A66C2] border border-white/10 hover:border-[#0A66C2] text-slate-300 hover:text-white flex items-center justify-center transition-all duration-200 hover:scale-110"
                    aria-label="LinkedIn"
                    title="LinkedIn"
                  >
                    <Linkedin className="w-4 h-4 fill-current" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar: Copyright & Payment Security */}
          <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-5">
            <p className="text-center md:text-left">
              &copy; 2026 BookLeaf Publishing. All rights reserved. A division of Libresco Feeds Pvt. Ltd.
            </p>

            {/* Payment & Security Chips */}
            <div className="flex items-center gap-2 flex-wrap justify-center">
              <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-slate-300 font-mono text-[10px] font-bold tracking-wider">
                VISA
              </span>
              <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-slate-300 font-mono text-[10px] font-bold tracking-wider">
                MASTERCARD
              </span>
              <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-slate-300 font-mono text-[10px] font-bold tracking-wider">
                AMEX
              </span>
              <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-slate-300 font-mono text-[10px] font-bold tracking-wider">
                RUPAY
              </span>
              <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-slate-300 font-mono text-[10px] font-bold tracking-wider">
                UPI
              </span>
              <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[10px] font-semibold">
                RAZORPAY VERIFIED
              </span>
            </div>

            {/* System Status & Links */}
            <div className="flex items-center gap-5 text-slate-400">
              <span className="flex items-center gap-1.5 text-emerald-400 text-[11px] font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Network Active
              </span>
              <Link href="/api-docs" className="hover:text-white transition-colors">
                API Docs
              </Link>
              <Link href="/login" className="hover:text-white transition-colors">
                Privacy
              </Link>
              <Link href="/login" className="hover:text-white transition-colors">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* ====================================================================
          IN-APP BOOK DETAIL PREVIEW MODAL (Zero External Redirects)
          ==================================================================== */}
      {selectedBookPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 relative animate-scale-up">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedBookPreview(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer"
              aria-label="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6 sm:p-8">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-start">
                {/* Book Cover */}
                <div className="sm:col-span-5 flex flex-col items-center">
                  <div className="w-full max-w-[220px] aspect-[2/3] bg-slate-100 rounded-2xl overflow-hidden shadow-lg border border-slate-200/80 p-2 flex items-center justify-center">
                    <img
                      src={selectedBookPreview.coverImage}
                      alt={selectedBookPreview.title}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    BookLeaf Verified Edition
                  </span>
                </div>

                {/* Book Metadata */}
                <div className="sm:col-span-7 space-y-4">
                  <div>
                    <span className="text-xs font-bold text-[#F05262] uppercase tracking-wider block">
                      {selectedBookPreview.genre}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug mt-1">
                      {selectedBookPreview.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                      By <strong className="text-slate-800">{selectedBookPreview.author}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-3 py-2 border-y border-slate-100">
                    <div className="flex items-center gap-1 text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400" />
                      ))}
                      <span className="text-sm font-bold text-slate-800 ml-1">
                        {selectedBookPreview.rating}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-600 font-medium">
                      {selectedBookPreview.reviewsCount} Reader Reviews
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-base font-extrabold text-[#F05262] font-sans">
                      ₹{selectedBookPreview.price}
                    </span>
                  </div>

                  {/* Synopsis */}
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      About This Book
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {selectedBookPreview.synopsis}
                    </p>
                  </div>

                  {/* Specs Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">ISBN</span>
                      <span className="font-mono text-slate-800 text-[11px] font-semibold">{selectedBookPreview.isbn}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Pages &amp; Language</span>
                      <span className="text-slate-800 font-semibold">{selectedBookPreview.pages} pp • {selectedBookPreview.language}</span>
                    </div>
                  </div>

                  {/* Key Highlights */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block">
                      Publishing Highlights
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {selectedBookPreview.highlights.map((h, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-xs text-slate-700">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons in Modal */}
              <div className="mt-8 pt-5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedBookPreview(null)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-full border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition cursor-pointer"
                >
                  Close Preview
                </button>
                <Link
                  href="/create_book"
                  onClick={() => setSelectedBookPreview(null)}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#F05262] hover:bg-[#d94151] text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <span>Publish In This Genre</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href="/printing-cost-royalty-calculator"
                  onClick={() => setSelectedBookPreview(null)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <IndianRupee className="w-3.5 h-3.5" />
                  <span>Calculate Royalties</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          IN-APP BOOKSTORE CATALOG MODAL (Explores Complete Catalog In-App)
          ==================================================================== */}
      {showCatalogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 relative animate-scale-up flex flex-col">
            {/* Header */}
            <div className="p-6 sm:p-8 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <span className="text-xs font-bold text-[#F05262] uppercase tracking-wider block">
                  BookLeaf Official Catalog
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                  Author Bookstore &amp; Titles
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCatalogModal(false)}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer"
                aria-label="Close Catalog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Bar */}
            <div className="p-6 bg-slate-50 border-b border-slate-100 space-y-4">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search books by title, author, or genre..."
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#F05262]/20 focus:border-[#F05262]"
                />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {["All", "Poetry", "Finance & Wealth", "Contemporary Fiction", "Anthology & Drama"].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCatalogCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                      catalogCategory === cat
                        ? "bg-[#F05262] text-white shadow-xs"
                        : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Catalog Grid */}
            <div className="p-6 sm:p-8 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {BESTSELLER_BOOKS.filter((b) => {
                  const matchCat =
                    catalogCategory === "All" ||
                    b.genre.toLowerCase().includes(catalogCategory.toLowerCase());
                  const matchQuery =
                    !catalogSearch ||
                    b.title.toLowerCase().includes(catalogSearch.toLowerCase()) ||
                    b.author.toLowerCase().includes(catalogSearch.toLowerCase()) ||
                    b.genre.toLowerCase().includes(catalogSearch.toLowerCase());
                  return matchCat && matchQuery;
                }).map((book) => (
                  <div
                    key={book.id}
                    onClick={() => {
                      setSelectedBookPreview(book);
                    }}
                    className="bg-white rounded-2xl p-3 border border-slate-200 shadow-2xs hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div className="h-48 rounded-xl overflow-hidden mb-3 bg-slate-50 flex items-center justify-center p-2">
                      <img
                        src={book.coverImage}
                        alt={book.title}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-1">
                        {book.title}
                      </h4>
                      <p className="text-[11px] text-slate-500">{book.author}</p>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-xs">
                        <span className="font-bold text-[#F05262]">₹{book.price}</span>
                        <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                          Preview
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 sm:p-6 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                All titles published under BookLeaf 100% royalty agreements.
              </span>
              <button
                type="button"
                onClick={() => setShowCatalogModal(false)}
                className="px-5 py-2 rounded-full bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition cursor-pointer"
              >
                Close Catalog
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          INTERACTIVE CUSTOMER SUPPORT CHAT POPUP ("Nishtha" Agent Parity)
          ==================================================================== */}
      

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
