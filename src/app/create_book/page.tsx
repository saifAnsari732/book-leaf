"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookMarked,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  FileCheck,
  FileText,
  Globe,
  HelpCircle,
  IndianRupee,
  Layers,
  Lightbulb,
  Lock,
  Palette,
  PenTool,
  Plus,
  ShieldCheck,
  Tag,
  Trash2,
  UploadCloud,
  Zap,
} from "lucide-react";

interface PublishingPlanConfig {
  id: "basic" | "premium" | "professional";
  name: string;
  price: number;
  badge: string;
  description: string;
  highlights: string[];
}

const PUBLISHING_PLANS: Record<"basic" | "premium" | "professional", PublishingPlanConfig> = {
  basic: {
    id: "basic",
    name: "Basic Publishing Plan",
    price: 3999,
    badge: "Standard Edition",
    description: "Standard Paperback + eBook publishing with official ISBN, 100% net royalty split, and global distribution.",
    highlights: ["100% Author Royalty Net Profit", "Official ISBN Assignment", "Amazon & Flipkart Pan-India", "Standard Typesetting"],
  },
  premium: {
    id: "premium",
    name: "Premium Publishing Plan",
    price: 7999,
    badge: "Most Popular",
    description: "Paperback + Hardcover + eBook with priority typesetting, 15-day Amazon ad campaign, and 5 author copies.",
    highlights: ["100% Author Royalty Net Profit", "Hardcover & Paperback Editions", "15-Day Targeted Amazon Ads", "5 Complimentary Author Copies"],
  },
  professional: {
    id: "professional",
    name: "Professional Publishing Plan",
    price: 14999,
    badge: "Executive Master Edition",
    description: "Complete flagship publishing package with 10 hardcover author copies, 30-day ads, and national press release.",
    highlights: ["100% Author Royalty Net Profit", "10 Complimentary Author Copies", "30-Day Managed Amazon Campaign", "National Press Release & Distribution"],
  },
};

const EDITORIAL_TITLE_SUGGESTIONS: Record<string, string[]> = {
  "Literary Fiction": [
    "Whispers of the Monsoon",
    "The Silent Echo",
    "Beneath the Banyan Shade",
    "Chronicles of Varanasi",
    "Letters Never Sent",
  ],
  "Poetry & Verse": [
    "Echoes Across the Valley",
    "In the Quiet Hours",
    "Fragrance of Forgotten Rain",
    "Shadows of the Heart",
    "Verses of the Wandering Soul",
  ],
  "Romance & Drama": [
    "When Stars Align in Shimla",
    "Forever in an Instant",
    "Ties That Bind",
    "The Unfinished Symphony",
    "A Melody for Two",
  ],
  "Self-Help & Growth": [
    "The Master of Moments",
    "Quiet Habits, Loud Results",
    "The Resilient Mindset",
    "Unlocking Your Core Compass",
    "The Art of Intentional Living",
  ],
  "Mystery & Thriller": [
    "The Midnight Alibi",
    "Smoke Over Marine Drive",
    "The Third Secret",
    "Vanishing on the Ghats",
    "Cold River Evidence",
  ],
  "Sci-Fi & Fantasy": [
    "The Silicon Prophecy",
    "Aethelgard: The Broken Sigil",
    "Chronicles of the Celestial Spire",
    "Beyond the Void Horizon",
    "The Quantum Alchemist",
  ],
  "Non-Fiction & Memoir": [
    "Beyond the Horizon",
    "Footprints in the Dust",
    "Lessons from an Uncharted Road",
    "Conversations Across Generations",
    "The Fire Within",
  ],
  "Academic & Business": [
    "Strategic Systems in Modern India",
    "The Innovator's Architecture",
    "Economics of Growth & Sustainability",
    "Foundations of Leadership",
    "Modern Enterprise Dynamics",
  ],
};

const COVER_COLOR_PALETTES = [
  { id: "obsidian", label: "Obsidian Slate", bg: "from-[#1E293B] via-[#0F172A] to-[#020617]", spine: "border-l-amber-400", hex: "#0F172A" },
  { id: "emerald", label: "Emerald Forest", bg: "from-[#0F4C3A] via-[#0A3327] to-[#051F17]", spine: "border-l-emerald-300", hex: "#0F4C3A" },
  { id: "crimson", label: "Burgundy Ruby", bg: "from-[#881337] via-[#4C0519] to-[#2B000B]", spine: "border-l-rose-400", hex: "#881337" },
  { id: "navy", label: "Midnight Navy", bg: "from-[#1E3A8A] via-[#172554] to-[#0B1229]", spine: "border-l-cyan-300", hex: "#1E3A8A" },
  { id: "ochre", label: "Vintage Amber", bg: "from-[#78350F] via-[#451A03] to-[#260C00]", spine: "border-l-amber-200", hex: "#78350F" },
];

function CreateBookWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Wizard Step State (1 to 5)
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [createdBook, setCreatedBook] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Plan Selection State (Reads ?plan= from URL)
  const initialPlanParam = (searchParams.get("plan") || "basic").toLowerCase();
  const validInitialPlan: "basic" | "premium" | "professional" =
    initialPlanParam === "premium" || initialPlanParam === "professional"
      ? initialPlanParam
      : "basic";

  const [selectedPlan, setSelectedPlan] = useState<"basic" | "premium" | "professional">(validInitialPlan);

  // Form State
  const [language, setLanguage] = useState("English");
  const [authorName, setAuthorName] = useState("Priya Sharma");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [genre, setGenre] = useState("Literary Fiction");
  const [trimSize, setTrimSize] = useState("5x8 inches");
  const [binding, setBinding] = useState<"Paperback" | "Hardcover" | "Both">("Paperback");
  const [blurb, setBlurb] = useState("");
  const [targetMrp, setTargetMrp] = useState(399);
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Editorial Title Suggestions UI state
  const [showTitleSuggestions, setShowTitleSuggestions] = useState(false);

  // Cover & Styling
  const [coverStyle, setCoverStyle] = useState("Typography-Led Minimalist");
  const [selectedPalette, setSelectedPalette] = useState(COVER_COLOR_PALETTES[0]);

  // Manuscript Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachedFile, setAttachedFile] = useState<{
    name: string;
    sizeKb: number;
    uploadedAt: string;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isGeneratingBlurb, setIsGeneratingBlurb] = useState(false);
  const [typesettingStyle, setTypesettingStyle] = useState("Classic Literary Serif");
  const [estimatedPages, setEstimatedPages] = useState(160);

  // Read URL format param if present
  useEffect(() => {
    const formatParam = searchParams.get("format");
    if (formatParam) {
      if (formatParam.toLowerCase().includes("hardcover")) {
        setBinding("Hardcover");
      } else if (formatParam.toLowerCase().includes("ebook") || formatParam.toLowerCase().includes("both")) {
        setBinding("Both");
      } else {
        setBinding("Paperback");
      }
    }
  }, [searchParams]);

  const languages = [
    { label: "English", native: "English" },
    { label: "हिन्दी", native: "Hindi" },
    { label: "Hinglish", native: "Hinglish" },
    { label: "தமிழ்", native: "Tamil" },
    { label: "मराठी", native: "Marathi" },
    { label: "Español", native: "Spanish" },
    { label: "Français", native: "French" },
    { label: "Other", native: "Other" },
  ];

  const genres = [
    {
      id: "Literary Fiction",
      label: "Literary Fiction",
      tag: "Novels & Stories",
      desc: "Character journeys, timeless drama, and narrative fiction.",
      color: "from-indigo-600 to-blue-700",
      accent: "bg-indigo-50 border-indigo-200 text-indigo-700",
    },
    {
      id: "Poetry & Verse",
      label: "Poetry & Verse",
      tag: "Anthologies & Couplets",
      desc: "Lyrical reflections, couplets, free verse, and emotive poems.",
      color: "from-rose-600 to-pink-700",
      accent: "bg-rose-50 border-rose-200 text-rose-700",
    },
    {
      id: "Romance & Drama",
      label: "Romance & Drama",
      tag: "Heartfelt Journeys",
      desc: "Emotional bonds, passion, human connections, and life twists.",
      color: "from-amber-600 to-orange-700",
      accent: "bg-amber-50 border-amber-200 text-amber-700",
    },
    {
      id: "Self-Help & Growth",
      label: "Self-Help & Growth",
      tag: "Habits & Mindset",
      desc: "Personal growth, daily productivity, healing, and life systems.",
      color: "from-emerald-600 to-teal-700",
      accent: "bg-emerald-50 border-emerald-200 text-emerald-700",
    },
    {
      id: "Mystery & Thriller",
      label: "Mystery & Thriller",
      tag: "Suspense & Crime",
      desc: "Pounding suspense, investigative crime, and plot twists.",
      color: "from-slate-700 to-zinc-900",
      accent: "bg-slate-100 border-slate-300 text-slate-800",
    },
    {
      id: "Sci-Fi & Fantasy",
      label: "Sci-Fi & Fantasy",
      tag: "Speculative Worlds",
      desc: "Futuristic technology, mythological realms, and epic worldbuilding.",
      color: "from-purple-600 to-indigo-800",
      accent: "bg-purple-50 border-purple-200 text-purple-700",
    },
    {
      id: "Non-Fiction & Memoir",
      label: "Non-Fiction & Memoir",
      tag: "True Stories & Essays",
      desc: "Biographies, cultural essays, investigative history, and memoirs.",
      color: "from-cyan-600 to-blue-700",
      accent: "bg-cyan-50 border-cyan-200 text-cyan-700",
    },
    {
      id: "Academic & Business",
      label: "Academic & Business",
      tag: "Scholarly & Strategy",
      desc: "Business strategy, scientific research, monographs, and text books.",
      color: "from-blue-700 to-slate-800",
      accent: "bg-blue-50 border-blue-200 text-blue-800",
    },
  ];

  const trimSizes = [
    { id: "5x8 inches", label: "5\" x 8\"", name: "Novel Standard", desc: "Best for fiction, novels, and poetry books." },
    { id: "5.5x8.5 inches", label: "5.5\" x 8.5\"", name: "Trade Paperback", desc: "Most popular format for general paperbacks." },
    { id: "6x9 inches", label: "6\" x 9\"", name: "Executive & Non-Fiction", desc: "Standard for business, memoirs, and academic works." },
    { id: "8x10 inches", label: "8\" x 10\"", name: "Illustrated & Coffee Table", desc: "Wide format for art, children's, and photography." },
  ];

  const steps = [
    { num: 1, label: "Information", icon: BookOpen },
    { num: 2, label: "Design & Genre", icon: Layers },
    { num: 3, label: "Interior", icon: FileText },
    { num: 4, label: "Cover & Blurb", icon: PenTool },
    { num: 5, label: "Distribution", icon: Globe },
  ];

  const currentPlanConfig = PUBLISHING_PLANS[selectedPlan];

  // Estimated Royalty Calculator
  const estimatedPrintingCost = binding === "Hardcover" ? 220 : binding === "Both" ? 260 : 135;
  const channelMargin = Math.round(targetMrp * 0.35);
  const estimatedRoyaltyPerCopy = Math.max(0, targetMrp - estimatedPrintingCost - channelMargin);

  // Manuscript File Handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFile({
        name: file.name,
        sizeKb: Math.round(file.size / 1024),
        uploadedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      });
      setError(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setAttachedFile({
        name: file.name,
        sizeKb: Math.round(file.size / 1024),
        uploadedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      });
      setError(null);
    }
  };

  const handleAttachSampleManuscript = () => {
    setAttachedFile({
      name: `${(title.trim() || "BookLeaf_Manuscript").replace(/\s+/g, "_")}_Draft.docx`,
      sizeKb: 1420,
      uploadedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    });
    setError(null);
  };

  // Editorial Blurb Generator (Zero AI branding)
  const handleGenerateEditorialBlurb = () => {
    if (!title.trim()) {
      setError("Please enter a book title first to draft your editorial blurb.");
      return;
    }
    setIsGeneratingBlurb(true);
    setError(null);
    const bookTitle = title.trim();
    const author = authorName.trim() || "Priya Sharma";

    setTimeout(() => {
      const generated = `In "${bookTitle}", author ${author} presents a captivating and resonant exploration of life, resilience, and human destiny. Set against a rich and evocative tapestry, this compelling work invites readers into a narrative where profound truths collide with heartfelt conviction.\n\nFrom its opening pages to its unforgettable conclusion, "${bookTitle}" stands out as an exceptional addition to the world of ${genre.toLowerCase()}, crafted with authentic emotional clarity and thoughtful prose.\n\nPublished and distributed worldwide by BookLeaf Publishing under official government ISBN registration with 100% net royalty author split.`;
      setBlurb(generated);
      setIsGeneratingBlurb(false);
    }, 400);
  };

  // Step Validation & Navigation
  const handleNextStep = () => {
    setError(null);
    if (currentStep === 1) {
      if (!title.trim()) {
        setError("Please enter your Book Title to continue.");
        return;
      }
      if (!authorName.trim()) {
        setError("Please enter the Author's Name to continue.");
        return;
      }
    }
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 120, behavior: "smooth" });
    }
  };

  const handlePrevStep = () => {
    setError(null);
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 120, behavior: "smooth" });
    }
  };

  // Submit Handler
  async function handleSubmit() {
    if (!title.trim()) {
      setError("Please provide a valid book title.");
      setCurrentStep(1);
      return;
    }
    if (!agreeTerms) {
      setError("Please agree to BookLeaf Publishing Terms to proceed.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/author/books/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          subtitle: subtitle.trim() || undefined,
          author_name: authorName.trim(),
          language,
          genre,
          trim_size: trimSize,
          binding,
          blurb: blurb.trim() || undefined,
          target_mrp: Number(targetMrp),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create book");
      }

      setCreatedBook(data.book);
      setSuccess(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      setError(err.message || "Failed to submit book for publishing. Please ensure you are logged into your author account.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-slate-800 font-sans selection:bg-[#0F4C3A] selection:text-white pb-24">
      {/* Top Navbar */}
      <header className="h-16 bg-white border-b border-[#EDE6DD] px-4 sm:px-8 lg:px-12 flex items-center justify-between sticky top-0 z-30 shadow-2xs backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Link
            href="/author-dashboard?menu=Books"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-slate-700 hover:text-[#0F4C3A] hover:bg-[#F2ECE4] transition cursor-pointer border border-[#E5DFD7]"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#0F4C3A]" />
            <span>Dashboard</span>
          </Link>
          <span className="text-slate-300">/</span>
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-slate-900 text-sm hidden sm:inline">
              BookLeaf Publishing Studio
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
              5-Stage Engine
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0F4C3A]/10 text-[#0F4C3A] text-xs font-bold border border-[#0F4C3A]/20">
            <Tag className="w-3.5 h-3.5" />
            <span>{currentPlanConfig.name.replace(" Publishing Plan", "")} • ₹{currentPlanConfig.price.toLocaleString("en-IN")}</span>
          </span>
          <span className="text-xs font-medium text-slate-500 hidden md:inline">
            Author: <strong className="text-slate-800">{authorName}</strong>
          </span>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Hero Publisher Hallmark Banner */}
        <div className="bg-gradient-to-r from-[#0B3327] via-[#0F4C3A] to-[#125340] rounded-[28px] p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-emerald-900/40">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-200 text-[11px] font-bold tracking-wider uppercase border border-white/15">
              <BookOpen className="w-3.5 h-3.5 text-emerald-300" />
              <span>Official 5-Stage Publishing Studio</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white leading-tight">
              Publish Your Next Book with BookLeaf
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 max-w-2xl leading-relaxed">
              Official editorial review, professional typesetting, government ISBN allocation, and pan-India print distribution across Amazon, Flipkart, and the BookLeaf Global Store with 100% author royalty split.
            </p>
          </div>

          {/* Plan Selector Switcher Pills */}
          <div className="mt-6 pt-5 border-t border-white/15 flex flex-wrap items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-200/80">
              Selected Publishing Plan:
            </span>
            <div className="flex flex-wrap gap-2">
              {(["basic", "premium", "professional"] as const).map((pKey) => {
                const plan = PUBLISHING_PLANS[pKey];
                const isSelected = selectedPlan === pKey;
                return (
                  <button
                    key={pKey}
                    type="button"
                    onClick={() => setSelectedPlan(pKey)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? "bg-white text-[#0F4C3A] shadow-md font-extrabold"
                        : "bg-white/10 text-emerald-100 hover:bg-white/20 hover:text-white"
                    }`}
                  >
                    <span>{plan.name.replace(" Publishing Plan", "")}</span>
                    <span className="font-mono text-[11px] opacity-80">₹{plan.price.toLocaleString("en-IN")}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#0F4C3A]" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 5-Step Stepper Navigation Bar */}
        <div className="bg-white rounded-2xl p-2.5 sm:p-3 border border-[#EDE6DD] shadow-2xs flex items-center justify-between overflow-x-auto gap-2">
          {steps.map((s) => {
            const Icon = s.icon;
            const isActive = currentStep === s.num;
            const isCompleted = currentStep > s.num;

            return (
              <button
                key={s.num}
                type="button"
                onClick={() => setCurrentStep(s.num)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-[#0F4C3A] text-white shadow-sm ring-2 ring-[#0F4C3A]/20"
                    : isCompleted
                    ? "text-emerald-800 bg-emerald-50 hover:bg-emerald-100"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] ${
                    isActive
                      ? "bg-white/20 text-white"
                      : isCompleted
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {isCompleted ? <Check className="w-3 h-3 stroke-[3]" /> : s.num}
                </span>
                <Icon className="w-3.5 h-3.5" />
                <span>{s.label}</span>
              </button>
            );
          })}
        </div>

        {/* Error Banner */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center justify-between shadow-2xs animate-fade-in">
            <span className="font-medium">{error}</span>
            <button
              type="button"
              onClick={() => setError(null)}
              className="text-rose-600 hover:text-rose-800 font-bold ml-3 cursor-pointer text-xs"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Main Publishing Work Area */}
        {success ? (
          /* Celebratory Publication Success Screen */
          <div className="bg-white rounded-[28px] border border-[#EDE6DD] p-8 sm:p-12 text-center space-y-6 shadow-sm animate-fade-in">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2 max-w-xl mx-auto">
              <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Manuscript Registered in Editorial Queue
              </span>
              <h2 className="font-serif text-3xl font-bold text-slate-900 leading-tight">
                &ldquo;{title}&rdquo; Successfully Submitted!
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Book ID: <strong className="font-mono text-slate-900">{createdBook?.book_id || "BK-NEW"}</strong> • Package: <strong className="text-[#0F4C3A]">{currentPlanConfig.name}</strong>.
                BookLeaf editorial is now reviewing your manuscript and initiating your official ISBN assignment.
              </p>
            </div>

            <div className="max-w-md mx-auto p-5 rounded-2xl bg-[#FAF8F5] border border-[#EAE3D9] text-left text-xs space-y-2.5 divide-y divide-slate-200/60 shadow-2xs font-mono">
              <div className="flex justify-between items-center pb-2 font-sans">
                <span className="text-slate-500">Registered Title:</span>
                <span className="font-bold text-slate-900 font-serif text-sm">&ldquo;{title}&rdquo;</span>
              </div>
              <div className="flex justify-between items-center py-2 font-sans">
                <span className="text-slate-500">Author Name:</span>
                <span className="font-bold text-slate-800">{authorName}</span>
              </div>
              <div className="flex justify-between items-center py-2 font-sans">
                <span className="text-slate-500">Language &amp; Genre:</span>
                <span className="text-slate-800">{language} • {genre}</span>
              </div>
              <div className="flex justify-between items-center py-2 font-sans">
                <span className="text-slate-500">Format &amp; Retail MRP:</span>
                <span className="text-slate-800">{binding} • ₹{targetMrp}</span>
              </div>
              <div className="flex justify-between items-center pt-2 font-sans">
                <span className="text-slate-500">Author Royalty Share:</span>
                <span className="font-bold text-emerald-700">100% Net Profit Margin</span>
              </div>
            </div>

            <div className="pt-4 flex flex-wrap justify-center gap-3">
              <Link
                href="/author-dashboard?menu=Books"
                className="px-6 py-3 rounded-full bg-[#0F4C3A] hover:bg-[#0B382B] text-white font-bold text-xs shadow-md transition cursor-pointer"
              >
                Go to My Books &amp; Track Status &rarr;
              </Link>
              <Link
                href="/author-dashboard?menu=Royalty%20Withdrawal"
                className="px-6 py-3 rounded-full border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition cursor-pointer"
              >
                Royalty &amp; Payout Console
              </Link>
              <button
                type="button"
                onClick={() => {
                  setSuccess(false);
                  setTitle("");
                  setSubtitle("");
                  setBlurb("");
                  setAttachedFile(null);
                  setCurrentStep(1);
                }}
                className="px-6 py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
              >
                Publish Another Title
              </button>
            </div>
          </div>
        ) : (
          /* 2-Column Responsive Studio Layout: Form on Left (7 cols) + 3D Live Mockup on Right (5 cols) */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Form Controls (7 Columns) */}
            <div className="lg:col-span-7 bg-white rounded-[28px] border border-[#EDE6DD] p-6 sm:p-8 shadow-xs space-y-6">
              {/* ============================================================== */}
              {/* STAGE 1: INFORMATION                                           */}
              {/* ============================================================== */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Manuscript Language *
                      </label>
                      <span className="text-[11px] text-slate-500 font-medium">
                        Selected: <strong className="text-[#0F4C3A]">{language}</strong>
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {languages.map((lang) => {
                        const isSelected = language === lang.label;
                        return (
                          <button
                            key={lang.label}
                            type="button"
                            onClick={() => setLanguage(lang.label)}
                            className={`py-2.5 px-3 rounded-xl text-xs transition text-center border cursor-pointer ${
                              isSelected
                                ? "bg-[#0F4C3A] text-white border-[#0F4C3A] shadow-sm font-bold ring-2 ring-[#0F4C3A]/20"
                                : "bg-[#FAF8F5] text-slate-700 border-[#EAE3D9] hover:bg-white hover:border-slate-300"
                            }`}
                          >
                            <span className="block text-xs font-bold leading-tight">{lang.label}</span>
                            <span className={`block text-[10px] leading-tight mt-0.5 ${isSelected ? "text-emerald-200" : "text-slate-400"}`}>
                              {lang.native}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Author Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Author&apos;s Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      placeholder="e.g. Priya Sharma"
                      className="w-full px-4 py-3 rounded-xl border border-[#EDE6DD] bg-[#FAF8F5] focus:bg-white focus:border-[#0F4C3A] focus:ring-4 focus:ring-[#0F4C3A]/10 text-sm font-semibold text-slate-900 transition shadow-2xs"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      Printed on the book cover, spine, legal copyright notice, and barcode.
                    </p>
                  </div>

                  {/* Book Title with Editorial Ideas */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Book Title *
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowTitleSuggestions(!showTitleSuggestions)}
                        className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#0F4C3A] hover:text-[#0B382B] bg-emerald-50 hover:bg-emerald-100 px-3 py-1 rounded-lg border border-emerald-200 transition shadow-2xs cursor-pointer"
                      >
                        <Lightbulb className="w-3.5 h-3.5 text-[#0F4C3A]" />
                        <span>Editorial Title Ideas</span>
                      </button>
                    </div>

                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Whispers of the Monsoon"
                      className="w-full px-4 py-3 rounded-xl border border-[#EDE6DD] bg-[#FAF8F5] focus:bg-white focus:border-[#0F4C3A] focus:ring-4 focus:ring-[#0F4C3A]/10 text-base font-serif font-bold text-slate-900 transition shadow-2xs"
                    />

                    {/* Editorial Title Ideas Dropdown */}
                    {showTitleSuggestions && (
                      <div className="mt-3 p-3.5 bg-gradient-to-r from-emerald-50/90 to-teal-50/90 rounded-2xl border border-emerald-200 animate-fade-in">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-900 mb-2 flex items-center gap-1.5">
                          <Lightbulb className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Curated Editorial Suggestions for {genre} (Click to set):</span>
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {(EDITORIAL_TITLE_SUGGESTIONS[genre] || EDITORIAL_TITLE_SUGGESTIONS["Literary Fiction"]).map((t) => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => {
                                setTitle(t);
                                setShowTitleSuggestions(false);
                              }}
                              className="text-xs bg-white hover:bg-[#0F4C3A] hover:text-white text-slate-800 border border-emerald-200 px-3 py-1.5 rounded-xl transition font-medium shadow-2xs text-left cursor-pointer"
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <p className="text-[11px] text-amber-800 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 mt-2.5">
                      💡 Regional titles should be entered in English letters (Example: कहानियाँ &rarr; Kahaaniyan).
                    </p>
                  </div>

                  {/* Subtitle */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Subtitle (Optional)
                    </label>
                    <input
                      type="text"
                      value={subtitle}
                      onChange={(e) => setSubtitle(e.target.value)}
                      placeholder="e.g. A Journey Through Heartbreak and Healing"
                      className="w-full px-4 py-2.5 rounded-xl border border-[#EDE6DD] bg-[#FAF8F5] focus:bg-white focus:border-[#0F4C3A] focus:ring-4 focus:ring-[#0F4C3A]/10 text-sm text-slate-900 transition shadow-2xs"
                    />
                  </div>
                </div>
              )}

              {/* ============================================================== */}
              {/* STAGE 2: DESIGN & GENRE                                        */}
              {/* ============================================================== */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                      Select Primary Book Genre *
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {genres.map((g) => {
                        const isSelected = genre === g.id;
                        return (
                          <div
                            key={g.id}
                            onClick={() => setGenre(g.id)}
                            className={`p-3.5 rounded-2xl border transition cursor-pointer text-left ${
                              isSelected
                                ? "bg-white border-[#0F4C3A] shadow-md ring-2 ring-[#0F4C3A]/20"
                                : "bg-[#FAF8F5] border-[#EAE3D9] hover:bg-white hover:border-slate-300"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-xs text-slate-900">{g.label}</span>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${g.accent}`}>
                                {g.tag}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 leading-relaxed">{g.desc}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Trim Size */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                      Book Trim Size (Dimensions) *
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {trimSizes.map((ts) => {
                        const isSelected = trimSize === ts.id;
                        return (
                          <div
                            key={ts.id}
                            onClick={() => setTrimSize(ts.id)}
                            className={`p-3.5 rounded-2xl border transition cursor-pointer ${
                              isSelected
                                ? "bg-white border-[#0F4C3A] shadow-md ring-2 ring-[#0F4C3A]/20"
                                : "bg-[#FAF8F5] border-[#EAE3D9] hover:bg-white hover:border-slate-300"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-0.5">
                              <span className="font-mono font-bold text-xs text-[#0F4C3A]">{ts.label}</span>
                              <span className="text-[11px] font-bold text-slate-800">{ts.name}</span>
                            </div>
                            <p className="text-[11px] text-slate-500">{ts.desc}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Binding Format */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Physical Format &amp; Binding *
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {(["Paperback", "Hardcover", "Both"] as const).map((b) => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => setBinding(b)}
                          className={`py-3 px-3 rounded-2xl text-xs font-bold transition text-center border cursor-pointer ${
                            binding === b
                              ? "bg-[#0F4C3A] text-white border-[#0F4C3A] shadow-sm ring-2 ring-[#0F4C3A]/20"
                              : "bg-[#FAF8F5] text-slate-700 border-[#EAE3D9] hover:bg-white"
                          }`}
                        >
                          {b === "Both" ? "Paperback + Hardcover" : `${b} Edition`}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ============================================================== */}
              {/* STAGE 3: INTERIOR & MANUSCRIPT                                 */}
              {/* ============================================================== */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Upload Manuscript File (.docx, .pdf, .epub)
                    </label>

                    {/* Hidden file input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".docx,.pdf,.epub,.txt"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    {/* Drag and Drop Zone */}
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all ${
                        isDragging
                          ? "border-[#0F4C3A] bg-emerald-50/60 scale-[1.01]"
                          : attachedFile
                          ? "border-emerald-300 bg-emerald-50/30"
                          : "border-[#E0D7CD] bg-[#FAF8F5] hover:bg-white hover:border-[#0F4C3A]"
                      }`}
                    >
                      <div className="w-12 h-12 rounded-2xl bg-white text-[#0F4C3A] flex items-center justify-center mx-auto shadow-sm border border-[#EDE6DD] mb-3">
                        <UploadCloud className="w-6 h-6" />
                      </div>

                      {attachedFile ? (
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-emerald-800">
                            Attached: {attachedFile.name}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Size: {attachedFile.sizeKb} KB • Uploaded at {attachedFile.uploadedAt}
                          </p>
                          <span className="inline-block mt-2 text-[11px] text-[#0F4C3A] font-bold underline">
                            Click to replace file
                          </span>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-slate-800">
                            Drag and drop your manuscript here, or{" "}
                            <span className="text-[#0F4C3A] underline">browse files</span>
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Accepts Microsoft Word (.docx), PDF, or plain text (up to 50MB)
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Action buttons under upload */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mt-3">
                      <button
                        type="button"
                        onClick={handleAttachSampleManuscript}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0F4C3A] hover:underline cursor-pointer"
                      >
                        <FileCheck className="w-3.5 h-3.5" />
                        <span>Attach Sample Manuscript (.docx) for Instant Review</span>
                      </button>

                      {attachedFile && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setAttachedFile(null);
                          }}
                          className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-800 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Typesetting Preferences */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Typesetting Style
                      </label>
                      <select
                        value={typesettingStyle}
                        onChange={(e) => setTypesettingStyle(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#EDE6DD] bg-[#FAF8F5] text-xs font-medium text-slate-900 focus:bg-white focus:border-[#0F4C3A]"
                      >
                        <option>Classic Literary Serif</option>
                        <option>Contemporary Minimalist</option>
                        <option>Poetry Line-by-Line Format</option>
                        <option>Academic Multi-Column</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Estimated Manuscript Pages
                      </label>
                      <input
                        type="number"
                        min={30}
                        max={1200}
                        value={estimatedPages}
                        onChange={(e) => setEstimatedPages(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#EDE6DD] bg-[#FAF8F5] text-xs font-medium text-slate-900 focus:bg-white focus:border-[#0F4C3A]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ============================================================== */}
              {/* STAGE 4: COVER & BLURB                                         */}
              {/* ============================================================== */}
              {currentStep === 4 && (
                <div className="space-y-6 animate-fade-in">
                  {/* Live Mockup Palette Chooser */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Cover Theme &amp; Color Tone
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {COVER_COLOR_PALETTES.map((cp) => {
                        const isSelected = selectedPalette.id === cp.id;
                        return (
                          <button
                            key={cp.id}
                            type="button"
                            onClick={() => setSelectedPalette(cp)}
                            className={`p-2.5 rounded-xl border text-center transition cursor-pointer flex flex-col items-center gap-1.5 ${
                              isSelected
                                ? "bg-white border-[#0F4C3A] ring-2 ring-[#0F4C3A]/20 shadow-xs"
                                : "bg-[#FAF8F5] border-[#EAE3D9] hover:bg-white"
                            }`}
                          >
                            <span
                              className="w-6 h-6 rounded-full shadow-2xs border border-white"
                              style={{ backgroundColor: cp.hex }}
                            />
                            <span className="text-[10px] font-bold text-slate-800 leading-tight">
                              {cp.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Cover Design Style */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Editorial Cover Design Style
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {[
                        "Typography-Led Minimalist",
                        "Photographic Modern",
                        "Illustrated Artwork",
                        "Classic Literary Emblem",
                      ].map((cs) => (
                        <button
                          key={cs}
                          type="button"
                          onClick={() => setCoverStyle(cs)}
                          className={`p-3 rounded-xl border text-xs font-bold transition text-left cursor-pointer ${
                            coverStyle === cs
                              ? "bg-[#0F4C3A] text-white border-[#0F4C3A] shadow-xs"
                              : "bg-[#FAF8F5] text-slate-700 border-[#EAE3D9] hover:bg-white"
                          }`}
                        >
                          {cs}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Back-Cover Blurb with Editorial Generator */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Back-Cover Blurb / Synopsis
                        </label>
                        <p className="text-[11px] text-slate-500">
                          The book summary printed on the back cover and retail pages.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleGenerateEditorialBlurb}
                        disabled={isGeneratingBlurb}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0F4C3A] hover:text-[#0B382B] bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 transition shadow-2xs cursor-pointer"
                      >
                        <PenTool className="w-3.5 h-3.5 text-[#0F4C3A]" />
                        <span>{isGeneratingBlurb ? "Drafting..." : "Generate Editorial Blurb"}</span>
                      </button>
                    </div>

                    <textarea
                      rows={5}
                      value={blurb}
                      onChange={(e) => setBlurb(e.target.value)}
                      placeholder="Write an engaging 80-200 word back-cover synopsis, or click 'Generate Editorial Blurb' to draft a professional publisher description..."
                      className="w-full p-4 rounded-2xl border border-[#EDE6DD] bg-[#FAF8F5] focus:bg-white focus:border-[#0F4C3A] focus:ring-4 focus:ring-[#0F4C3A]/10 text-xs sm:text-sm text-slate-900 leading-relaxed transition shadow-2xs"
                    />
                    <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1">
                      <span>Recommended: 80 to 200 words</span>
                      <span>{blurb.trim() ? `${blurb.trim().split(/\s+/).length} words` : "0 words"}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* ============================================================== */}
              {/* STAGE 5: DISTRIBUTION & FINAL SUBMIT                           */}
              {/* ============================================================== */}
              {currentStep === 5 && (
                <div className="space-y-6 animate-fade-in">
                  {/* Selected Plan Review */}
                  <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE3D9] space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Active Publishing Plan
                      </span>
                      <span className="text-xs font-bold text-[#0F4C3A] font-mono">
                        ₹{currentPlanConfig.price.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <h4 className="font-serif text-lg font-bold text-slate-900">
                      {currentPlanConfig.name}
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {currentPlanConfig.description}
                    </p>
                  </div>

                  {/* Target MRP & Royalty Calculator */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Target Retail Selling Price (MRP ₹) *
                    </label>
                    <div className="relative">
                      <IndianRupee className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="number"
                        min={99}
                        max={4999}
                        value={targetMrp}
                        onChange={(e) => setTargetMrp(Number(e.target.value))}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#EDE6DD] bg-[#FAF8F5] focus:bg-white focus:border-[#0F4C3A] focus:ring-4 focus:ring-[#0F4C3A]/10 text-sm font-bold text-slate-900 transition shadow-2xs font-mono"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Standard retail pricing in India is typically ₹299 to ₹499 for paperbacks.
                    </p>

                    {/* Live Royalty Calculation Bento */}
                    <div className="mt-3 p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-xs space-y-2 font-mono">
                      <div className="flex justify-between text-slate-600 font-sans">
                        <span>Retail MRP:</span>
                        <span>₹{targetMrp}</span>
                      </div>
                      <div className="flex justify-between text-slate-600 font-sans">
                        <span>Estimated Print Production Cost:</span>
                        <span>- ₹{estimatedPrintingCost}</span>
                      </div>
                      <div className="flex justify-between text-slate-600 font-sans">
                        <span>Channel Fulfillment &amp; Commission (35%):</span>
                        <span>- ₹{channelMargin}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-emerald-200 font-bold font-sans text-sm text-[#0F4C3A]">
                        <span>Author Royalty Net Profit (100%):</span>
                        <span>₹{estimatedRoyaltyPerCopy} per copy sold</span>
                      </div>
                    </div>
                  </div>

                  {/* Distribution Outlets */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Pan-India &amp; Global Distribution Channels Included
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-bold text-slate-700">
                      <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE3D9]">Amazon Pan-India</div>
                      <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE3D9]">Flipkart Marketplace</div>
                      <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE3D9]">BookLeaf Global Store</div>
                      <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE3D9]">Google Play Books</div>
                    </div>
                  </div>

                  {/* Author Terms Checkbox */}
                  <div className="pt-2">
                    <label className="flex items-start gap-3 cursor-pointer text-xs text-slate-700 select-none">
                      <input
                        type="checkbox"
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                        className="w-4 h-4 mt-0.5 rounded text-[#0F4C3A] focus:ring-[#0F4C3A] border-slate-300 cursor-pointer"
                      />
                      <span>
                        I confirm that this manuscript is my original literary work and agree to BookLeaf Publishing&apos;s distribution terms.{" "}
                        <strong className="text-slate-900 font-bold">
                          I retain 100% copyright, intellectual property, and derivative rights.
                        </strong>
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {/* Bottom Stepper Action Bar */}
              <div className="pt-6 border-t border-[#EDE6DD] flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  disabled={currentStep === 1}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold border border-slate-300 text-slate-700 hover:bg-slate-50 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  &larr; Back
                </button>

                <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                  Stage {currentStep} of 5 • {steps[currentStep - 1].label}
                </span>

                {currentStep < 5 ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="px-6 py-2.5 rounded-xl bg-[#0F4C3A] hover:bg-[#0B382B] text-white text-xs font-bold transition shadow-sm hover:shadow flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Save &amp; Continue</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="px-7 py-3 rounded-xl bg-gradient-to-r from-[#0F4C3A] via-[#145C47] to-[#186851] hover:from-[#0B382B] hover:to-[#0F4C3A] text-white text-xs font-bold transition shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-75"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Submitting to Editorial Queue...</span>
                      </div>
                    ) : (
                      <>
                        <span>Submit Manuscript for Publishing</span>
                        <Check className="w-4 h-4" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Right Column: Sticky 3D Live Cover & Spine Mockup (5 Columns) */}
            <div className="lg:col-span-5 sticky top-24 space-y-4">
              <div className="bg-gradient-to-b from-[#FAF8F5] to-[#F2EBE1] p-6 sm:p-7 rounded-[28px] border border-[#EDE6DD] shadow-sm flex flex-col items-center text-center">
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-600 mb-4 flex items-center gap-1.5">
                  <BookMarked className="w-3.5 h-3.5 text-[#0F4C3A]" />
                  <span>Live Cover &amp; Spine Mockup</span>
                </span>

                {/* 3D Realistic Book Card with Spine & Shadow */}
                <div className="relative group py-4">
                  <div
                    className={`w-52 h-72 rounded-r-xl rounded-l-xs bg-gradient-to-br ${selectedPalette.bg} text-white p-5 flex flex-col justify-between shadow-2xl shadow-slate-900/35 border-l-4 ${selectedPalette.spine} relative overflow-hidden transition-all duration-300 group-hover:scale-[1.02]`}
                  >
                    {/* Spine Realistic Depth Gradient */}
                    <div className="absolute left-0 top-0 bottom-0 w-3.5 bg-gradient-to-r from-black/50 via-black/20 to-transparent pointer-events-none" />

                    {/* Genre Tag Pill */}
                    <div className="text-left relative z-10">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest bg-white/20 text-white backdrop-blur-xs border border-white/25">
                        {genre}
                      </span>
                    </div>

                    {/* Book Title & Subtitle */}
                    <div className="text-left my-auto space-y-1 relative z-10">
                      <h4 className="font-serif text-lg font-bold text-amber-100 leading-tight line-clamp-3">
                        {title || "Your Book Title Here"}
                      </h4>
                      {subtitle && (
                        <p className="text-[10px] text-slate-300 italic line-clamp-2 leading-relaxed">
                          {subtitle}
                        </p>
                      )}
                    </div>

                    {/* Author & BookLeaf Colophon Footer */}
                    <div className="text-left pt-2 border-t border-white/15 flex items-center justify-between relative z-10">
                      <div>
                        <span className="text-[8px] uppercase tracking-wider text-slate-400 block font-semibold">
                          By
                        </span>
                        <span className="font-sans text-xs font-bold text-white truncate max-w-[120px] block">
                          {authorName || "Author Name"}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[8px] font-serif tracking-widest text-amber-300 uppercase block font-bold">
                          BookLeaf
                        </span>
                        <span className="text-[7px] text-slate-300 block uppercase">
                          Imprint
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 3D Paper Pages Thickness Edge Simulation */}
                  <div className="absolute right-[-6px] top-6 bottom-6 w-1.5 bg-gradient-to-r from-amber-50 to-[#ECE3D4] rounded-r-xs shadow-xs border-r border-slate-300 pointer-events-none" />
                </div>

                <p className="text-[11px] text-slate-500 mt-2 leading-relaxed max-w-xs">
                  Visual mockup refreshes in real-time as you customize your book specifications. Final physical print will feature custom matte/glossy finish and your chosen trim size.
                </p>

                {/* Live Specification Pill Box */}
                <div className="w-full mt-5 p-3.5 rounded-2xl bg-white border border-[#EDE6DD] text-left text-[11px] space-y-1.5 font-mono shadow-2xs">
                  <div className="flex justify-between font-sans">
                    <span className="text-slate-500">Selected Plan:</span>
                    <span className="font-bold text-[#0F4C3A]">{currentPlanConfig.name.replace(" Publishing Plan", "")}</span>
                  </div>
                  <div className="flex justify-between font-sans">
                    <span className="text-slate-500">Format:</span>
                    <span className="text-slate-800">{binding} ({trimSize})</span>
                  </div>
                  <div className="flex justify-between font-sans">
                    <span className="text-slate-500">Manuscript:</span>
                    <span className="text-slate-800">
                      {attachedFile ? attachedFile.name : "Pending upload"}
                    </span>
                  </div>
                  <div className="flex justify-between font-sans">
                    <span className="text-slate-500">Royalty Profit:</span>
                    <span className="font-bold text-emerald-700">100% Net Royalty Split</span>
                  </div>
                  <div className="flex justify-between font-sans pt-1 border-t border-slate-100">
                    <span className="text-slate-500">ISBN Allocation:</span>
                    <span className="font-bold text-slate-900">Official Government ISBN</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CreateBookPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FBF9F5] flex items-center justify-center p-6 text-slate-600 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-[#0F4C3A] border-t-transparent rounded-full animate-spin" />
            <span>Loading BookLeaf Publishing Studio...</span>
          </div>
        </div>
      }
    >
      <CreateBookWizard />
    </Suspense>
  );
}
