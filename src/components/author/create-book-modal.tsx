"use client";

import React, { useState } from "react";
import { useToast } from "@/context/ToastContext";
import {
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  FileText,
  Globe,
  Image as ImageIcon,
  IndianRupee,
  Layers,
  Loader2,
  Palette,
  Lightbulb,
  FileEdit,
  UploadCloud,
  X,
  Sparkles,
  ShieldCheck,
  Award,
  BookMarked,
  Sliders,
  DollarSign,
  TrendingUp,
  AlertCircle,
  HelpCircle,
} from "lucide-react";

interface CreateBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookCreated?: () => void;
  defaultAuthorName?: string;
}

export function CreateBookModal({
  isOpen,
  onClose,
  onBookCreated,
  defaultAuthorName = "Priya Sharma",
}: CreateBookModalProps) {
  const toast = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [language, setLanguage] = useState("English");
  const [authorName, setAuthorName] = useState(defaultAuthorName);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [genre, setGenre] = useState("Literary Fiction");
  const [trimSize, setTrimSize] = useState("5x8 inches");
  const [binding, setBinding] = useState<"Paperback" | "Hardcover" | "Both">("Paperback");
  const [blurb, setBlurb] = useState("");
  const [targetMrp, setTargetMrp] = useState(399);
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [coverPreference, setCoverPreference] = useState<"designer" | "custom">("designer");

  // Gemini AI Assisted Drafting State
  const [isAiGeneratingTitle, setIsAiGeneratingTitle] = useState(false);
  const [isAiGeneratingBlurb, setIsAiGeneratingBlurb] = useState(false);
  const [suggestedTitles, setSuggestedTitles] = useState<string[]>([]);

  if (!isOpen) return null;

  const languages = [
    { code: "en", label: "English", native: "English" },
    { code: "hi", label: "Hindi", native: "हिन्दी" },
    { code: "hg", label: "Hinglish", native: "Hinglish" },
    { code: "ta", label: "Tamil", native: "தமிழ்" },
    { code: "mr", label: "Marathi", native: "मराठी" },
    { code: "es", label: "Spanish", native: "Español" },
    { code: "fr", label: "French", native: "Français" },
    { code: "ot", label: "Other", native: "Other" },
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
      id: "Poetry",
      label: "Poetry & Verse",
      tag: "Anthologies & Ghazals",
      desc: "Lyrical reflections, couplets, free verse, and emotive poems.",
      color: "from-rose-600 to-pink-700",
      accent: "bg-rose-50 border-rose-200 text-rose-700",
    },
    {
      id: "Self-Help",
      label: "Self-Help & Wellness",
      tag: "Mindset & Habits",
      desc: "Personal growth, daily productivity, healing, and life systems.",
      color: "from-amber-600 to-yellow-600",
      accent: "bg-amber-50 border-amber-200 text-amber-700",
    },
    {
      id: "Non-Fiction / Memoir",
      label: "Memoir & Biography",
      tag: "True Journeys",
      desc: "Real experiences, personal essays, reflections, and life history.",
      color: "from-emerald-600 to-teal-700",
      accent: "bg-emerald-50 border-emerald-200 text-emerald-700",
    },
    {
      id: "Business / Entrepreneurship",
      label: "Business & Career",
      tag: "Startups & Wealth",
      desc: "Financial independence, leadership, investing, and execution.",
      color: "from-sky-600 to-cyan-700",
      accent: "bg-sky-50 border-sky-200 text-sky-700",
    },
    {
      id: "Thriller / Mystery",
      label: "Thriller & Mystery",
      tag: "Crime & Suspense",
      desc: "Twists, psychological intrigue, detective investigative arcs.",
      color: "from-purple-600 to-violet-800",
      accent: "bg-purple-50 border-purple-200 text-purple-700",
    },
  ];

  const estimatedRoyalty = Math.round(targetMrp * 0.1);

  async function handleAiGenerateTitles() {
    setIsAiGeneratingTitle(true);
    try {
      const res = await fetch("/api/ai/write-book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "titles",
          topic: title || `${genre} book`,
          genre,
          tone: "inspiring and bestselling",
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to generate titles");
      }
      const rawText: string = data.content || "";
      const lines = rawText
        .split("\n")
        .map((l) => l.replace(/^[-*•\d.)\s"]+/, "").replace(/"$/, "").trim())
        .filter((l) => l.length > 3 && l.length < 80)
        .slice(0, 5);

      setSuggestedTitles(lines.length > 0 ? lines : [rawText.slice(0, 60)]);
      toast.info("Title Suggestions Ready", "Click any title chip below to set it instantly.");
    } catch (err: any) {
      toast.error("Generation Error", err?.message || "Could not generate titles.");
    } finally {
      setIsAiGeneratingTitle(false);
    }
  }

  async function handleAiGenerateBlurb() {
    if (!title.trim()) {
      toast.warning("Title Required", "Please enter a book title first to draft your blurb.");
      return;
    }
    setIsAiGeneratingBlurb(true);
    try {
      const res = await fetch("/api/ai/write-book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "blurb",
          title,
          genre,
          topic: subtitle || title,
          tone: "captivating and professional",
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to generate blurb");
      }
      setBlurb(data.content.trim());
      toast.success("Blurb Drafted", "Compelling back-cover blurb generated by Gemini AI!");
    } catch (err: any) {
      toast.error("Drafting Error", err?.message || "Could not generate blurb.");
    } finally {
      setIsAiGeneratingBlurb(false);
    }
  }

  async function handleSubmit() {
    if (!title.trim()) {
      setErrorMessage("Please enter a book title");
      setCurrentStep(1);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/author/books/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          subtitle,
          author_name: authorName,
          language,
          genre,
          trim_size: trimSize,
          binding,
          blurb,
          target_mrp: Number(targetMrp),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create book");
      }

      setSuccessMessage(data.message);
      toast.success(
        "Book Created Successfully!",
        `"${title}" has been registered and submitted to editorial review.`
      );
      if (onBookCreated) {
        onBookCreated();
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred");
      toast.error("Book Creation Failed", err.message || "Could not create book.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleResetAndClose() {
    setTitle("");
    setSubtitle("");
    setCurrentStep(1);
    setSuccessMessage(null);
    setErrorMessage(null);
    onClose();
  }

  const steps = [
    { num: 1, label: "Information", icon: BookOpen },
    { num: 2, label: "Design & Genre", icon: Palette },
    { num: 3, label: "Interior", icon: FileText },
    { num: 4, label: "Cover & Blurb", icon: Sparkles },
    { num: 5, label: "Distribution", icon: Globe },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col max-h-[92vh] my-auto transition-all">
        {/* Luxury Studio Header */}
        <div className="px-6 py-5 sm:px-8 sm:py-6 bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] text-white flex items-center justify-between relative overflow-hidden border-b border-white/10 shrink-0">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-56 h-56 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-10 -ml-16 -mb-16 w-56 h-56 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center gap-3.5 relative z-10">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#F05262] via-[#e24455] to-[#f43f5e] flex items-center justify-center text-white shadow-lg shadow-rose-500/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-white leading-tight">
                  Publish Your Next Book
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/10 text-amber-300 border border-amber-300/30">
                  <Sparkles className="w-3 h-3" /> 5-Stage Publishing Studio
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Official BookLeaf Editorial, Typesetting &amp; Global ISBN Distribution Engine
              </p>
            </div>
          </div>

          <button
            onClick={handleResetAndClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer relative z-10 shrink-0"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modern Interactive Stepper Bar */}
        {!successMessage && (
          <div className="px-6 py-3.5 bg-slate-50/90 border-b border-slate-200/80 flex items-center justify-between text-xs font-semibold shrink-0 overflow-x-auto">
            {steps.map((s) => {
              const IconComponent = s.icon;
              const isActive = currentStep === s.num;
              const isCompleted = currentStep > s.num;

              return (
                <button
                  key={s.num}
                  type="button"
                  onClick={() => setCurrentStep(s.num)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition cursor-pointer shrink-0 ${
                    isActive
                      ? "bg-white text-[#F05262] shadow-sm border border-rose-200/80 ring-2 ring-rose-500/20 font-bold"
                      : isCompleted
                      ? "text-emerald-700 hover:bg-emerald-50/80 font-medium"
                      : "text-slate-500 hover:bg-slate-200/60 font-medium"
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs transition ${
                      isActive
                        ? "bg-[#F05262] text-white shadow-2xs font-extrabold"
                        : isCompleted
                        ? "bg-emerald-100 text-emerald-800 font-bold"
                        : "bg-slate-200/80 text-slate-600"
                    }`}
                  >
                    {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : s.num}
                  </span>
                  <span className="text-xs">{s.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Content Body Container */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6 bg-slate-50/30">
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage ? (
            /* Celebration Success Card */
            <div className="py-10 text-center space-y-5 animate-in fade-in">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-1.5">
                <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-600">
                  Manuscript Successfully Registered
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
                  Welcome to BookLeaf Publishing, Author!
                </h3>
                <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                  {successMessage}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs max-w-md mx-auto text-left text-xs space-y-2.5 divide-y divide-slate-100">
                <div className="flex justify-between items-center pb-2">
                  <span className="text-slate-500 font-medium">Registered Title:</span>
                  <span className="font-bold text-slate-900 font-serif text-sm">&ldquo;{title}&rdquo;</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-500 font-medium">Author Name:</span>
                  <span className="font-semibold text-slate-900">{authorName}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-500 font-medium">Production Stage:</span>
                  <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    Typesetting &amp; ISBN Allocation
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-slate-500 font-medium">Target Distribution:</span>
                  <span className="font-semibold text-slate-900">Amazon, Flipkart &amp; Bookstore</span>
                </div>
              </div>

              <button
                onClick={handleResetAndClose}
                className="mt-4 px-8 py-3 rounded-full bg-gradient-to-r from-[#F05262] to-[#e04555] hover:opacity-95 text-white font-bold text-xs tracking-wide transition shadow-lg shadow-rose-500/25 cursor-pointer"
              >
                Go to My Books &amp; Track Status &rarr;
              </button>
            </div>
          ) : (
            <>
              {/* STEP 1: Book Information & Live 3D Preview */}
              {currentStep === 1 && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in duration-200">
                  {/* Left Form Inputs (7 Cols) */}
                  <div className="lg:col-span-7 space-y-5">
                    {/* Language Selector */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Manuscript Language
                        </label>
                        <span className="text-[11px] text-slate-400 font-medium">
                          Selected: <strong className="text-slate-700">{language}</strong>
                        </span>
                      </div>
                      <div className="grid grid-cols-4 sm:grid-cols-4 gap-2">
                        {languages.map((lang) => (
                          <button
                            key={lang.code}
                            type="button"
                            onClick={() => setLanguage(lang.label)}
                            className={`py-2 px-2.5 rounded-xl text-xs font-semibold transition text-center border cursor-pointer ${
                              language === lang.label
                                ? "bg-slate-900 text-white border-slate-900 shadow-sm font-bold ring-2 ring-slate-900/10"
                                : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                            }`}
                          >
                            <span className="block text-[11px] leading-tight font-bold">{lang.native}</span>
                            <span className="block text-[10px] text-slate-400 leading-tight mt-0.5">{lang.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Author's Name */}
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
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#F05262] focus:border-[#F05262] text-sm font-semibold text-slate-900 bg-white shadow-2xs transition"
                      />
                      <p className="text-[11px] text-slate-500 mt-1">
                        Printed on the book cover, spine, legal copyright notice, and barcode.
                      </p>
                    </div>

                    {/* Book Title with AI Assistant */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Book Title *
                        </label>
                        <button
                          type="button"
                          onClick={handleAiGenerateTitles}
                          disabled={isAiGeneratingTitle}
                          className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#F05262] hover:text-[#d43f4f] bg-rose-50 hover:bg-rose-100 px-3 py-1 rounded-lg border border-rose-200 transition shadow-2xs cursor-pointer"
                        >
                          {isAiGeneratingTitle ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Crafting Titles...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3.5 h-3.5 text-[#F05262]" />
                              <span>AI Title Spark</span>
                            </>
                          )}
                        </button>
                      </div>

                      <input
                        type="text"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Whispers of the Monsoon"
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#F05262] focus:border-[#F05262] text-base font-serif font-bold text-slate-900 bg-white shadow-2xs transition"
                      />

                      {/* AI Title Chips Cloud */}
                      {suggestedTitles.length > 0 && (
                        <div className="mt-3 p-3.5 bg-gradient-to-r from-rose-50/90 to-amber-50/90 rounded-2xl border border-rose-200/80 animate-in fade-in">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-rose-800 mb-2 flex items-center gap-1.5">
                            <Lightbulb className="w-3.5 h-3.5 text-rose-600" />
                            <span>AI Suggestions (Click any to use):</span>
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {suggestedTitles.map((t, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => {
                                  setTitle(t);
                                  toast.info("Applied Title", `Title set to "${t}"`);
                                }}
                                className="text-xs bg-white hover:bg-[#F05262] hover:text-white text-slate-800 border border-rose-200 px-3 py-1.5 rounded-xl transition font-medium shadow-2xs text-left cursor-pointer"
                              >
                                {t}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <p className="text-[11px] text-amber-700 bg-amber-50/80 px-2.5 py-1 rounded-md border border-amber-200/80 mt-2">
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
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#F05262] text-sm text-slate-900 bg-white shadow-2xs transition"
                      />
                    </div>
                  </div>

                  {/* Right Live 3D Book Preview Mockup (5 Cols) */}
                  <div className="lg:col-span-5 bg-gradient-to-b from-slate-100/80 to-slate-200/60 p-6 rounded-3xl border border-slate-200 flex flex-col items-center justify-center text-center">
                    <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-1.5">
                      <BookMarked className="w-3.5 h-3.5 text-rose-600" /> Live Cover &amp; Spine Mockup
                    </span>

                    {/* 3D Realistic Book Card */}
                    <div className="relative group perspective-1000 py-3">
                      <div className="w-48 h-68 rounded-r-xl rounded-l-sm bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#020617] text-white p-5 flex flex-col justify-between shadow-2xl shadow-slate-900/40 border-l-4 border-l-amber-400 relative overflow-hidden transition-transform duration-300 hover:scale-[1.02]">
                        {/* Book Spine Texture Gradient */}
                        <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-black/40 to-transparent" />
                        
                        {/* Genre Tag Pill */}
                        <div className="text-left">
                          <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest bg-rose-500 text-white shadow-2xs">
                            {genre}
                          </span>
                        </div>

                        {/* Title & Subtitle */}
                        <div className="text-left my-auto space-y-1">
                          <h4 className="font-serif text-lg font-bold text-amber-100 leading-tight line-clamp-3">
                            {title || "Your Book Title Here"}
                          </h4>
                          {subtitle && (
                            <p className="text-[10px] text-slate-300 italic line-clamp-2">
                              {subtitle}
                            </p>
                          )}
                        </div>

                        {/* Author Name & BookLeaf Colophon */}
                        <div className="text-left pt-2 border-t border-white/10 flex items-center justify-between">
                          <div>
                            <span className="text-[8px] uppercase tracking-wider text-slate-400 block">By</span>
                            <span className="font-sans text-xs font-bold text-white truncate max-w-[110px] block">
                              {authorName || "Author Name"}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-[8px] font-serif tracking-widest text-amber-300 uppercase block">
                              BookLeaf
                            </span>
                            <span className="text-[7px] text-slate-400 block">
                              Imprint
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-500 mt-4 leading-relaxed max-w-xs">
                      Visual mockup refreshes in real-time. Final physical print will feature custom matte/glossy finish and your chosen trim size.
                    </p>
                  </div>
                </div>
              )}

              {/* STEP 2: Design & Genre */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                      Select Primary Book Genre
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                      {genres.map((g) => {
                        const isSelected = genre === g.id;
                        return (
                          <div
                            key={g.id}
                            onClick={() => setGenre(g.id)}
                            className={`p-4 rounded-2xl border-2 cursor-pointer transition flex flex-col justify-between text-left relative overflow-hidden ${
                              isSelected
                                ? "border-[#F05262] bg-white shadow-md ring-2 ring-rose-500/20"
                                : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs"
                            }`}
                          >
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${g.accent}`}>
                                  {g.tag}
                                </span>
                                {isSelected && (
                                  <span className="w-5 h-5 rounded-full bg-[#F05262] text-white flex items-center justify-center text-[10px] font-bold">
                                    ✓
                                  </span>
                                )}
                              </div>
                              <h4 className="text-sm font-bold text-slate-900 pt-1">{g.label}</h4>
                              <p className="text-xs text-slate-500 leading-relaxed">{g.desc}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                    {/* Trim Size */}
                    <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3">
                      <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wider">
                        <Sliders className="w-4 h-4 text-rose-600" />
                        <span>Trim Dimensions</span>
                      </div>
                      <select
                        value={trimSize}
                        onChange={(e) => setTrimSize(e.target.value)}
                        className="w-full px-3.5 py-3 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-rose-500"
                      >
                        <option value="5x8 inches">5&quot; x 8&quot; (Standard Poetry, Fiction &amp; Novellas)</option>
                        <option value="6x9 inches">6&quot; x 9&quot; (Non-Fiction, Memoirs &amp; Academic)</option>
                        <option value="5.5x8.5 inches">5.5&quot; x 8.5&quot; (Trade Digest &amp; Anthologies)</option>
                      </select>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Industry-standard paperback sizing used on Amazon KDP and bookstore shelves.
                      </p>
                    </div>

                    {/* Binding Format */}
                    <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3">
                      <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wider">
                        <Layers className="w-4 h-4 text-rose-600" />
                        <span>Binding &amp; Edition</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: "Paperback", label: "Paperback", desc: "Matte/Gloss" },
                          { id: "Hardcover", label: "Hardcover", desc: "Casebound" },
                          { id: "Both", label: "Dual Release", desc: "Print + eBook" },
                        ].map((b) => (
                          <button
                            key={b.id}
                            type="button"
                            onClick={() => setBinding(b.id as any)}
                            className={`p-2.5 rounded-xl text-center border cursor-pointer transition ${
                              binding === b.id
                                ? "bg-slate-900 text-white border-slate-900 font-bold shadow-xs"
                                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 text-xs"
                            }`}
                          >
                            <span className="block text-xs font-bold leading-tight">{b.label}</span>
                            <span className="block text-[10px] text-slate-400 mt-0.5">{b.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Book Interior & Manuscript */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Upload Author Manuscript
                    </label>
                    <div className="border-2 border-dashed border-slate-300 hover:border-[#F05262] bg-white rounded-3xl p-10 text-center cursor-pointer transition shadow-2xs group">
                      <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform">
                        <UploadCloud className="w-7 h-7" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">
                        Drag and drop your manuscript file here, or click to browse
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                        Supported: Microsoft Word (.docx), PDF (.pdf), RTF (.rtf), EPUB (.epub) up to 50MB.
                      </p>
                      <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-semibold">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Encrypted &amp; Stored on ImageKit Cloud</span>
                      </div>
                    </div>
                  </div>

                  {/* Typesetting Guarantee Card */}
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 text-xs text-emerald-900 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-emerald-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>BookLeaf Professional In-House Typesetting Included</span>
                    </div>
                    <p className="text-slate-700 leading-relaxed text-[11px]">
                      Our editorial team formats chapter headers, running titles, page numbers, and margin gutters adhering to international printing standards. You will receive a digital proof for sign-off prior to press printing.
                    </p>
                  </div>
                </div>
              )}

              {/* STEP 4: Cover & Back-Cover Blurb */}
              {currentStep === 4 && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Back-Cover Blurb / Synopsis
                        </label>
                        <p className="text-[11px] text-slate-500">
                          The book description displayed on Amazon, Flipkart, and the physical back cover.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleAiGenerateBlurb}
                        disabled={isAiGeneratingBlurb}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3.5 py-1.5 rounded-xl border border-indigo-200 transition shadow-2xs cursor-pointer"
                      >
                        {isAiGeneratingBlurb ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Drafting Blurb with AI...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Auto-Draft Blurb (Gemini AI)</span>
                          </>
                        )}
                      </button>
                    </div>

                    <textarea
                      rows={5}
                      value={blurb}
                      onChange={(e) => setBlurb(e.target.value)}
                      placeholder="Write a captivating 100-200 word summary that will compel readers to buy your book, or click 'Auto-Draft Blurb (Gemini AI)' to let our intelligence studio craft one for you..."
                      className="w-full p-4 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#F05262] text-sm text-slate-900 bg-white leading-relaxed shadow-2xs transition"
                    />
                    <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1">
                      <span>Recommended: 80 - 180 words</span>
                      <span>{blurb.trim() ? `${blurb.trim().split(/\s+/).length} words` : "0 words"}</span>
                    </div>
                  </div>

                  {/* Cover Design Preference */}
                  <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                      Cover Art Fulfillment
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div
                        onClick={() => setCoverPreference("designer")}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition flex items-start gap-3 ${
                          coverPreference === "designer"
                            ? "border-[#F05262] bg-rose-50/50"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="cover_pref"
                          checked={coverPreference === "designer"}
                          onChange={() => setCoverPreference("designer")}
                          className="mt-1 text-[#F05262]"
                        />
                        <div>
                          <p className="text-xs font-bold text-slate-900">BookLeaf Bespoke Studio Designer</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Our graphic designers craft custom cover artwork based on your book theme.
                          </p>
                        </div>
                      </div>

                      <div
                        onClick={() => setCoverPreference("custom")}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition flex items-start gap-3 ${
                          coverPreference === "custom"
                            ? "border-[#F05262] bg-rose-50/50"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="cover_pref"
                          checked={coverPreference === "custom"}
                          onChange={() => setCoverPreference("custom")}
                          className="mt-1 text-[#F05262]"
                        />
                        <div>
                          <p className="text-xs font-bold text-slate-900">Upload My Own Ready Artwork</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            You provide a high-resolution 300 DPI CMYK cover file with spine wrap.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5: Pricing, Royalties & Launch */}
              {currentStep === 5 && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  {/* MRP Input & Slider */}
                  <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Target Retail Price (MRP in ₹)
                      </label>
                      <span className="font-serif text-2xl font-extrabold text-slate-900">
                        ₹{targetMrp}
                      </span>
                    </div>

                    <input
                      type="range"
                      min={199}
                      max={1499}
                      step={10}
                      value={targetMrp}
                      onChange={(e) => setTargetMrp(Number(e.target.value))}
                      className="w-full accent-[#F05262] cursor-pointer"
                    />

                    <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                      <span>₹199 (Entry)</span>
                      <span>₹399 (Bestseller Avg)</span>
                      <span>₹899 (Hardcover)</span>
                      <span>₹1,499 (Collector)</span>
                    </div>
                  </div>

                  {/* 100% Net Profit Royalty Breakdown */}
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-rose-50/90 via-white to-amber-50/90 border border-rose-200/90 shadow-sm space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-rose-200/60">
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-rose-800 block">
                          Author Royalty Rate
                        </span>
                        <span className="font-serif text-xl sm:text-2xl font-bold text-[#F05262]">
                          ₹{estimatedRoyalty} per copy sold
                        </span>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        100% Net Royalty
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                      <div className="p-3 bg-white rounded-xl border border-rose-100">
                        <span className="text-[10px] text-slate-500 block">Amazon Payout</span>
                        <span className="font-bold text-slate-900">Direct Quarterly</span>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-rose-100">
                        <span className="text-[10px] text-slate-500 block">Flipkart Payout</span>
                        <span className="font-bold text-slate-900">Direct Quarterly</span>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-rose-100">
                        <span className="text-[10px] text-slate-500 block">ISBN Allotment</span>
                        <span className="font-bold text-emerald-700">Govt. Registered</span>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-rose-100">
                        <span className="text-[10px] text-slate-500 block">IP Rights</span>
                        <span className="font-bold text-slate-900">100% Author Owned</span>
                      </div>
                    </div>
                  </div>

                  {/* Terms & Copyright Agreement */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <label className="flex items-start gap-3 cursor-pointer text-xs text-slate-700">
                      <input
                        type="checkbox"
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded text-[#F05262] focus:ring-[#F05262]"
                      />
                      <span className="leading-relaxed">
                        I confirm that this manuscript is my original literary work and agree to BookLeaf Publishing&apos;s non-exclusive distribution terms. <strong>I retain 100% copyright and intellectual property rights</strong>.
                      </span>
                    </label>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Studio Sticky Footer Actions */}
        {!successMessage && (
          <div className="px-6 py-4 sm:px-8 sm:py-5 bg-white border-t border-slate-200 flex items-center justify-between shrink-0">
            <button
              type="button"
              disabled={currentStep === 1 || isSubmitting}
              onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition flex items-center gap-1.5 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <div className="hidden sm:block text-xs font-semibold text-slate-400">
              Stage {currentStep} of {steps.length} &bull; {steps[currentStep - 1].label}
            </div>

            {currentStep < 5 ? (
              <button
                type="button"
                onClick={() => {
                  if (currentStep === 1 && !title.trim()) {
                    toast.warning("Title Required", "Please enter a book title before continuing.");
                    return;
                  }
                  setCurrentStep((s) => Math.min(5, s + 1));
                }}
                className="px-7 py-2.5 rounded-xl bg-gradient-to-r from-[#F05262] to-[#e04555] hover:opacity-95 text-white text-xs font-bold transition flex items-center gap-2 shadow-sm shadow-rose-500/20 cursor-pointer"
              >
                <span>Save &amp; Continue</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={isSubmitting || !agreedToTerms || !title.trim()}
                onClick={handleSubmit}
                className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-extrabold transition flex items-center gap-2 shadow-md shadow-emerald-600/25 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Registering Book...</span>
                  </>
                ) : (
                  <>
                    <span>Submit &amp; Launch Production</span>
                    <Check className="w-4 h-4 stroke-[3]" />
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
