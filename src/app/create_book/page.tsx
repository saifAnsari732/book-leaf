"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  Download,
  FileCheck,
  FileText,
  HelpCircle,
  IndianRupee,
  Layers,
  Lock,
  PenTool,
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

function CreateBookWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Wizard Step State
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

  // Manuscript Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachedFile, setAttachedFile] = useState<{
    name: string;
    sizeKb: number;
    uploadedAt: string;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isGeneratingBlurb, setIsGeneratingBlurb] = useState(false);
  const [coverStyle, setCoverStyle] = useState("Typography-Led Minimalist");

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
    "English",
    "हिन्दी",
    "Hinglish",
    "தமிழ்",
    "मराठी",
    "Español",
    "Français",
    "Other",
  ];

  const steps = [
    "Plan & Basic Info",
    "Design & Genre",
    "Manuscript Upload",
    "Cover & Blurb",
    "Pricing & Final Submit",
  ];

  const currentPlanConfig = PUBLISHING_PLANS[selectedPlan];

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

  // Editorial Blurb Generator
  const handleGenerateBlurb = () => {
    setIsGeneratingBlurb(true);
    const bookTitle = title.trim() || "The Silent Whispers";
    const author = authorName.trim() || "Priya Sharma";

    setTimeout(() => {
      const generated = `In "${bookTitle}", acclaimed author ${author} weaves an unforgettable tapestry of love, resilience, and human destiny. Set against the vibrant backdrop of contemporary life, this profound exploration reveals what happens when unspoken truths collide with inescapable reality.\n\nFrom the opening chapter to its breathtaking climax, ${bookTitle} stands as a masterclass in ${genre.toLowerCase()}, capturing every emotional nuance with crystalline prose and authentic emotional depth.\n\nPublished worldwide by BookLeaf Publishing under official ISBN registration and Pan-India retail distribution.`;
      setBlurb(generated);
      setIsGeneratingBlurb(false);
    }, 450);
  };

  // Submit Handler
  async function handleFinish() {
    if (!title.trim()) {
      setError("Please provide a valid book title.");
      setCurrentStep(1);
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
    } catch (err: any) {
      setError(err.message || "Failed to submit book for publishing.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F4F2] text-slate-800 font-sans selection:bg-[#F26979] selection:text-white pb-20">
      {/* Top Header */}
      <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-8 lg:px-12 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-4">
          <Link
            href="/author-dashboard?menu=Books"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#F26979] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
          <span className="text-slate-300">|</span>
          <span className="text-xs text-slate-600 font-semibold hidden sm:inline">
            BookLeaf Publishing Author Studio
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-[#F26979] text-xs font-bold border border-rose-200">
            <Tag className="w-3.5 h-3.5" />
            <span>{currentPlanConfig.name} (₹{currentPlanConfig.price.toLocaleString("en-IN")})</span>
          </span>
          <span className="text-xs font-mono text-slate-500 hidden md:inline">
            {authorName}
          </span>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Title & Plan Highlights Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-[#1C2430] to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-rose-300 text-xs font-bold border border-white/15">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Official Book Publishing Intake Wizard</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight">
              Publish Your Next Bestseller with BookLeaf
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Complete your book details below. Our editorial team assigns your government ISBN, prepares digital proofs, and distributes your paperback across Amazon, Flipkart, and the BookLeaf Global Store.
            </p>
          </div>

          {/* Quick Plan Switcher */}
          <div className="mt-6 pt-5 border-t border-white/15 flex flex-wrap items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
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
                        ? "bg-[#F26979] text-white shadow-sm ring-2 ring-white/30"
                        : "bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white"
                    }`}
                  >
                    <span>{plan.name.replace(" Publishing Plan", "")}</span>
                    <span className="font-mono text-[11px] opacity-90">₹{plan.price.toLocaleString("en-IN")}</span>
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 5-Step Progress Stepper */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center justify-between overflow-x-auto gap-2">
          {steps.map((st, idx) => {
            const stepNum = idx + 1;
            const isActive = currentStep === stepNum;
            const isDone = currentStep > stepNum;

            return (
              <button
                key={st}
                type="button"
                onClick={() => setCurrentStep(stepNum)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? "bg-[#FFF5F6] text-[#F26979] font-bold border border-[#F26979]/30"
                    : isDone
                    ? "text-emerald-700 hover:bg-emerald-50/50"
                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                    isActive
                      ? "bg-[#F26979] text-white font-bold"
                      : isDone
                      ? "bg-emerald-100 text-emerald-700 font-bold"
                      : "bg-slate-100 text-slate-500 font-medium"
                  }`}
                >
                  {isDone ? "✓" : stepNum}
                </span>
                <span>{st}</span>
              </button>
            );
          })}
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center justify-between">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => setError(null)}
              className="text-rose-500 hover:text-rose-700 font-bold ml-3"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Wizard Main Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          {success ? (
            <div className="py-10 text-center space-y-5 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm ring-8 ring-emerald-50">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  Manuscript Registered in Editorial Queue
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
                  &ldquo;{title}&rdquo; Successfully Submitted!
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                  Book ID: <strong className="font-mono text-slate-800">{createdBook?.book_id || "BK-NEW"}</strong> • Plan: <strong className="text-[#F26979]">{currentPlanConfig.name}</strong>.
                  BookLeaf editorial is now reviewing your manuscript and initiating ISBN assignment.
                </p>
              </div>

              {/* Status Summary Pill Box */}
              <div className="max-w-md mx-auto p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Author:</span>
                  <span className="font-bold text-slate-800 font-sans">{authorName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Genre &amp; Language:</span>
                  <span className="text-slate-700 font-sans">{genre} • {language}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Format &amp; Retail MRP:</span>
                  <span className="text-slate-700 font-sans">{binding} • ₹{targetMrp}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-1.5">
                  <span className="text-slate-500 font-sans">Author Royalty Share:</span>
                  <span className="font-bold text-emerald-700 font-sans">100% Net Profit Margin</span>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap justify-center gap-3">
                <Link
                  href="/author-dashboard?menu=Books"
                  className="px-6 py-3 rounded-full bg-[#F26979] hover:bg-[#d94151] text-white font-bold text-xs shadow-md transition"
                >
                  View in My Books Catalog
                </Link>
                <Link
                  href="/author-dashboard?menu=Royalty%20Withdrawal"
                  className="px-6 py-3 rounded-full border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition"
                >
                  Royalty &amp; Payout Dashboard
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
                  className="px-6 py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
                >
                  Publish Another Title
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* ============================================================== */}
              {/* STEP 1: PLAN CONFIRMATION & BASIC BOOK INFO                   */}
              {/* ============================================================== */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-fade-in">
                  {/* Plan Picker Card Matrix */}
                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      1. Select Your Publishing Package *
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {(["basic", "premium", "professional"] as const).map((pKey) => {
                        const p = PUBLISHING_PLANS[pKey];
                        const isSelected = selectedPlan === pKey;
                        return (
                          <div
                            key={pKey}
                            onClick={() => setSelectedPlan(pKey)}
                            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                              isSelected
                                ? "border-[#F26979] bg-[#FFF5F6] shadow-sm ring-1 ring-[#F26979]"
                                : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60"
                            }`}
                          >
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-white px-2 py-0.5 rounded-full border border-rose-200">
                                  {p.badge}
                                </span>
                                {isSelected ? (
                                  <div className="w-5 h-5 rounded-full bg-[#F26979] text-white flex items-center justify-center">
                                    <Check className="w-3.5 h-3.5" />
                                  </div>
                                ) : (
                                  <div className="w-5 h-5 rounded-full border border-slate-300" />
                                )}
                              </div>
                              <h4 className="font-bold text-slate-900 text-sm">{p.name}</h4>
                              <p className="font-mono text-lg font-black text-slate-900">
                                ₹{p.price.toLocaleString("en-IN")}
                              </p>
                              <p className="text-[11px] text-slate-500 leading-tight">
                                {p.description}
                              </p>
                            </div>
                            <div className="mt-3 pt-2 border-t border-slate-200/60 text-[10px] text-emerald-800 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>100% Net Royalty Split Included</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Language Selection */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      2. Primary Language of Manuscript *
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {languages.map((lang) => (
                        <button
                          key={lang}
                          type="button"
                          onClick={() => setLanguage(lang)}
                          className={`px-4 py-2 rounded-full text-xs font-semibold transition cursor-pointer ${
                            language === lang
                              ? "bg-[#F26979] text-white shadow-xs font-bold"
                              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          }`}
                        >
                          {lang}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Author Name */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      3. Author&apos;s Full Legal / Pen Name *
                    </label>
                    <input
                      type="text"
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      placeholder="e.g. Priya Sharma"
                      required
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-[#F26979]/20 focus:border-[#F26979] focus:outline-hidden"
                    />
                    <p className="text-[11px] text-slate-400">
                      This name will be formally registered on the copyright page and official ISBN database.
                    </p>
                  </div>

                  {/* Book Title */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      4. Book Title *
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => {
                        setTitle(e.target.value);
                        if (error) setError(null);
                      }}
                      placeholder="e.g. Echoes of Tomorrow"
                      required
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-[#F26979]/20 focus:border-[#F26979] focus:outline-hidden"
                    />
                    <p className="text-[11px] text-amber-700">
                      If the book is in a regional language, please enter title in English transliteration. Example: कहानियाँ → Kahaaniyan.
                    </p>
                  </div>

                  {/* Subtitle */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      5. Subtitle (Optional)
                    </label>
                    <input
                      type="text"
                      value={subtitle}
                      onChange={(e) => setSubtitle(e.target.value)}
                      placeholder="e.g. A Journey Through Hope and Resilience"
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-[#F26979]/20 focus:border-[#F26979] focus:outline-hidden"
                    />
                  </div>
                </div>
              )}

              {/* ============================================================== */}
              {/* STEP 2: DESIGN & GENRE                                         */}
              {/* ============================================================== */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Book Genre &amp; Category *
                    </label>
                    <select
                      value={genre}
                      onChange={(e) => setGenre(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-medium bg-white focus:ring-2 focus:ring-[#F26979]/20 focus:border-[#F26979] focus:outline-hidden cursor-pointer"
                    >
                      <option value="Literary Fiction">Literary Fiction &amp; Stories</option>
                      <option value="Poetry &amp; Ghazals">Poetry, Ghazals &amp; Nazms</option>
                      <option value="Non-Fiction / Memoir">Non-Fiction &amp; Autobiography</option>
                      <option value="Self-Help / Personal Growth">Self-Help &amp; Mindset</option>
                      <option value="Business / Entrepreneurship">Business &amp; Finance</option>
                      <option value="Mystery / Thriller">Mystery &amp; Crime Thriller</option>
                      <option value="Science &amp; Technology">Science &amp; Technology</option>
                      <option value="Anthology &amp; Short Stories">Anthology &amp; Short Stories</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Trim Dimensions *
                      </label>
                      <select
                        value={trimSize}
                        onChange={(e) => setTrimSize(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-medium bg-white focus:ring-2 focus:ring-[#F26979]/20 focus:border-[#F26979] focus:outline-hidden cursor-pointer"
                      >
                        <option value="5x8 inches">5&quot; x 8&quot; (Standard Poetry, Fiction &amp; Novella)</option>
                        <option value="6x9 inches">6&quot; x 9&quot; (Standard Trade Non-Fiction &amp; Academic)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Binding Format *
                      </label>
                      <select
                        value={binding}
                        onChange={(e: any) => setBinding(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-medium bg-white focus:ring-2 focus:ring-[#F26979]/20 focus:border-[#F26979] focus:outline-hidden cursor-pointer"
                      >
                        <option value="Paperback">Paperback Edition</option>
                        <option value="Hardcover">Hardcover Collector Edition</option>
                        <option value="Both">Both (Paperback + eBook Edition)</option>
                      </select>
                    </div>
                  </div>

                  {/* Plan Badge Privilege Callout */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="text-xs space-y-0.5">
                      <span className="font-bold text-slate-900 block">
                        Included in {currentPlanConfig.name}:
                      </span>
                      <span className="text-slate-600 block">
                        Complimentary digital formatting, spine width calculation, and print-ready PDF conversion.
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* ============================================================== */}
              {/* STEP 3: BOOK INTERIOR & WORKING MANUSCRIPT UPLOAD             */}
              {/* ============================================================== */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Upload Manuscript File (.docx, .pdf, .epub, .txt)
                    </label>
                    <p className="text-xs text-slate-500">
                      Our certified typesetting team prepares and formats your book for print and digital publishing.
                    </p>
                  </div>

                  {/* Real File Input (Hidden) */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".docx,.pdf,.doc,.epub,.txt"
                    className="hidden"
                  />

                  {/* Clickable Drag & Drop Zone */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-3xl p-8 sm:p-10 text-center transition cursor-pointer ${
                      isDragging
                        ? "border-[#F26979] bg-rose-50/50 scale-[1.01]"
                        : attachedFile
                        ? "border-emerald-300 bg-emerald-50/40"
                        : "border-slate-300 hover:border-[#F26979] bg-slate-50/50 hover:bg-white"
                    }`}
                  >
                    {attachedFile ? (
                      <div className="space-y-3">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
                          <FileCheck className="w-7 h-7" />
                        </div>
                        <div>
                          <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                            ✓ Manuscript Attached Successfully
                          </span>
                          <h4 className="font-bold text-slate-900 text-base mt-2 font-mono truncate max-w-md mx-auto">
                            {attachedFile.name}
                          </h4>
                          <p className="text-xs text-slate-500 mt-1">
                            {attachedFile.sizeKb} KB • Attached at {attachedFile.uploadedAt}
                          </p>
                        </div>
                        <div className="pt-2 flex justify-center gap-3">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              fileInputRef.current?.click();
                            }}
                            className="px-4 py-1.5 rounded-full border border-slate-300 hover:bg-white text-xs font-semibold text-slate-700 transition"
                          >
                            Replace File
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setAttachedFile(null);
                            }}
                            className="px-4 py-1.5 rounded-full border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-[#F26979] flex items-center justify-center mx-auto shadow-2xs">
                          <UploadCloud className="w-7 h-7" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm sm:text-base">
                            Click to Browse or Drag &amp; Drop Manuscript File
                          </h4>
                          <p className="text-xs text-slate-500 mt-1">
                            Supports Microsoft Word (.docx), PDF, Rich Text, or EPUB (Max 25MB)
                          </p>
                        </div>
                        <div className="pt-2">
                          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs">
                            <UploadCloud className="w-3.5 h-3.5" />
                            <span>Select File From Computer</span>
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Quick Fill Sample / Skip Options */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                    <span className="text-slate-600">
                      Don&apos;t have manuscript file ready right now?
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleAttachSampleManuscript}
                        className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-semibold transition cursor-pointer"
                      >
                        Attach Sample Manuscript (.docx)
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(4)}
                        className="px-3 py-1.5 rounded-lg text-slate-500 hover:text-slate-900 underline transition cursor-pointer"
                      >
                        Skip &amp; Upload Later via Email
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ============================================================== */}
              {/* STEP 4: COVER DESIGN & BLURB GENERATOR                         */}
              {/* ============================================================== */}
              {currentStep === 4 && (
                <div className="space-y-6 animate-fade-in">
                  {/* Blurb Textarea with Generator */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Back Cover Blurb &amp; Synopsis *
                      </label>
                      <button
                        type="button"
                        onClick={handleGenerateBlurb}
                        disabled={isGeneratingBlurb}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F26979] hover:text-[#d94151] transition cursor-pointer disabled:opacity-50"
                      >
                        <PenTool className="w-3.5 h-3.5" />
                        <span>{isGeneratingBlurb ? "Drafting Blurb..." : "Generate Blurb Preview"}</span>
                      </button>
                    </div>

                    <textarea
                      rows={6}
                      value={blurb}
                      onChange={(e) => setBlurb(e.target.value)}
                      placeholder="Write your book's back cover description, hooks, and summary here..."
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-[#F26979]/20 focus:border-[#F26979] focus:outline-hidden"
                    />

                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>{blurb.length} characters • Recommended: 400-800 characters</span>
                      {blurb && (
                        <button
                          type="button"
                          onClick={() => setBlurb("")}
                          className="text-slate-400 hover:text-rose-600 transition"
                        >
                          Clear Text
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Cover Style Preference */}
                  <div className="space-y-2 pt-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Cover Art Design Style Preference *
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      {[
                        "Typography-Led Minimalist",
                        "Photographic Art",
                        "Illustrated Fiction",
                        "Classic Vintage",
                      ].map((style) => (
                        <button
                          key={style}
                          type="button"
                          onClick={() => setCoverStyle(style)}
                          className={`p-3 rounded-xl border text-center font-semibold transition cursor-pointer ${
                            coverStyle === style
                              ? "border-[#F26979] bg-[#FFF5F6] text-[#F26979] font-bold shadow-2xs"
                              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          {style}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ============================================================== */}
              {/* STEP 5: PRICING, DISTRIBUTION & FINAL SUBMISSION               */}
              {/* ============================================================== */}
              {currentStep === 5 && (
                <div className="space-y-6 animate-fade-in">
                  {/* Retail MRP Input */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Target Retail Selling Price (MRP ₹) *
                    </label>
                    <div className="relative max-w-xs">
                      <IndianRupee className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="number"
                        min={99}
                        max={9999}
                        value={targetMrp}
                        onChange={(e) => setTargetMrp(Math.max(99, Number(e.target.value)))}
                        className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-300 text-lg font-bold font-mono text-slate-900 focus:ring-2 focus:ring-[#F26979]/20 focus:border-[#F26979] focus:outline-hidden"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Standard retail pricing in India is typically ₹299 to ₹499 for paperbacks.
                    </p>
                  </div>

                  {/* Royalty Calculation Card */}
                  <div className="p-5 rounded-2xl bg-[#FFF5F6] border border-[#FFE7E9] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-xs font-semibold text-slate-700 block">
                        Estimated Author Net Profit Royalty per Copy:
                      </span>
                      <strong className="text-2xl font-black text-[#F26979] font-mono">
                        ₹{Math.max(15, Math.round(targetMrp * 0.18))} / copy
                      </strong>
                      <span className="text-[11px] text-slate-500 block mt-0.5">
                        100% Net Profit Share on BookLeaf Store &amp; Pan-India Marketplaces
                      </span>
                    </div>

                    <div className="sm:text-right">
                      <span className="px-3 py-1 rounded-full bg-white text-emerald-800 border border-emerald-200 text-xs font-bold inline-block">
                        100% Royalty Active
                      </span>
                    </div>
                  </div>

                  {/* Plan Review Summary */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Publishing Plan:</span>
                      <span className="font-bold text-slate-900">{currentPlanConfig.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">One-Time Fee:</span>
                      <span className="font-bold font-mono text-slate-900">₹{currentPlanConfig.price.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Channels:</span>
                      <span className="text-slate-700">Amazon India, Flipkart, BookLeaf Global Store</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Manuscript Status:</span>
                      <span className={attachedFile ? "text-emerald-700 font-bold" : "text-amber-700 font-semibold"}>
                        {attachedFile ? `Attached (${attachedFile.name})` : "Pending upload (can submit later via email)"}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Stepper Action Bar */}
              <div className="pt-6 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  type="button"
                  disabled={currentStep === 1 || isSubmitting}
                  onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
                  className="px-6 py-2.5 rounded-full border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-30 cursor-pointer"
                >
                  Previous Step
                </button>

                {currentStep < 5 ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (currentStep === 1 && !title.trim()) {
                        setError("Please enter a book title to continue.");
                        return;
                      }
                      setError(null);
                      setCurrentStep((s) => Math.min(5, s + 1));
                    }}
                    className="px-7 py-3 rounded-full bg-[#F26979] hover:bg-[#e04555] text-white text-xs font-bold shadow-sm transition flex items-center gap-2 cursor-pointer"
                  >
                    <span>Save &amp; Continue</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isSubmitting || !title.trim()}
                    onClick={handleFinish}
                    className="px-8 py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Submitting to BookLeaf Queue...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Submit for Publication</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CreateBookStandalonePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F7F4F2] flex items-center justify-center p-6">
          <div className="flex items-center gap-3 text-slate-600 text-sm font-semibold">
            <div className="w-5 h-5 border-2 border-[#F26979] border-t-transparent rounded-full animate-spin" />
            <span>Loading Book Publishing Studio...</span>
          </div>
        </div>
      }
    >
      <CreateBookWizard />
    </Suspense>
  );
}
