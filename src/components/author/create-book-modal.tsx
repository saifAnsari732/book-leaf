"use client";

import React, { useState } from "react";
import { useToast } from "@/context/ToastContext";
import {
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  FileText,
  Globe,
  Image as ImageIcon,
  IndianRupee,
  Layers,
  Loader2,
  Palette,
  Sparkles,
  UploadCloud,
  Wand2,
  X,
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
  const [binding, setBinding] = useState<"Paperback" | "Hardcover" | "Both">(
    "Paperback"
  );
  const [blurb, setBlurb] = useState("");
  const [targetMrp, setTargetMrp] = useState(399);
  const [agreedToTerms, setAgreedToTerms] = useState(true);

  // Gemini AI Assisted Drafting State
  const [isAiGeneratingTitle, setIsAiGeneratingTitle] = useState(false);
  const [isAiGeneratingBlurb, setIsAiGeneratingBlurb] = useState(false);
  const [suggestedTitles, setSuggestedTitles] = useState<string[]>([]);

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
      toast.info("Gemini AI Titles Ready", "Click any suggestion below to set your title.");
    } catch (err: any) {
      toast.error("AI Generation Error", err?.message || "Could not generate titles.");
    } finally {
      setIsAiGeneratingTitle(false);
    }
  }

  async function handleAiGenerateBlurb() {
    if (!title.trim()) {
      toast.warning("Title Required", "Please enter a book title first so Gemini AI can craft your blurb.");
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
      toast.success("AI Blurb Generated", "Gemini 3.8 created a captivating back cover blurb!");
    } catch (err: any) {
      toast.error("AI Generation Error", err?.message || "Could not generate blurb.");
    } finally {
      setIsAiGeneratingBlurb(false);
    }
  }

  if (!isOpen) return null;

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

  const genres = [
    { id: "Literary Fiction", label: "Fiction / Novel", desc: "Novels, stories" },
    { id: "Poetry", label: "Poetry & Verse", desc: "Anthology, ghazals" },
    { id: "Self-Help", label: "Self-Help / Wellness", desc: "Mindset, habits" },
    { id: "Non-Fiction / Memoir", label: "Memoir & Biography", desc: "Real journeys" },
    { id: "Business / Entrepreneurship", label: "Business & Career", desc: "Startups, finance" },
    { id: "Thriller / Mystery", label: "Crime & Suspense", desc: "Mystery, plot twists" },
  ];

  const estimatedRoyalty = Math.round(targetMrp * 0.1);

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-[#0F223D] to-[#163359] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F05262] flex items-center justify-center text-white shadow-md">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold tracking-tight">
                Start a New Book
              </h2>
              <p className="text-xs text-slate-300">
                Official BookLeaf 5-Stage Publishing Engine
              </p>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Progress Stepper */}
        {!successMessage && (
          <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs font-medium">
            {[
              { num: 1, label: "Information" },
              { num: 2, label: "Design & Genre" },
              { num: 3, label: "Interior" },
              { num: 4, label: "Cover" },
              { num: 5, label: "Distribution" },
            ].map((s) => (
              <button
                key={s.num}
                onClick={() => setCurrentStep(s.num)}
                className={`flex items-center gap-1.5 transition ${
                  currentStep === s.num
                    ? "text-[#F05262] font-bold"
                    : currentStep > s.num
                    ? "text-emerald-600 font-semibold"
                    : "text-slate-400"
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                    currentStep === s.num
                      ? "bg-[#F05262] text-white"
                      : currentStep > s.num
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {currentStep > s.num ? "✓" : s.num}
                </span>
                <span className="hidden sm:inline">{s.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {errorMessage}
            </div>
          )}

          {successMessage ? (
            <div className="py-10 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-slate-900">
                Manuscript Registered!
              </h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                {successMessage}
              </p>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 max-w-sm mx-auto text-left text-xs space-y-1">
                <p className="text-slate-500">
                  Assigned Imprint: <strong className="text-slate-800">BookLeaf Publishing Global</strong>
                </p>
                <p className="text-slate-500">
                  Initial Stage: <strong className="text-amber-600 font-semibold">Manuscript Received → Typesetting</strong>
                </p>
              </div>
              <button
                onClick={handleResetAndClose}
                className="mt-4 px-8 py-3 rounded-full bg-[#F05262] hover:bg-[#e04555] text-white font-bold text-xs transition shadow-md"
              >
                Go to My Books
              </button>
            </div>
          ) : (
            <>
              {/* STEP 1: Book Information */}
              {currentStep === 1 && (
                <div className="space-y-5 animate-fade-in">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Book Language
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {languages.map((lang) => (
                        <button
                          key={lang}
                          type="button"
                          onClick={() => setLanguage(lang)}
                          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
                            language === lang
                              ? "bg-[#F05262] text-white shadow-xs"
                              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          }`}
                        >
                          {lang}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Author&apos;s Name *
                    </label>
                    <input
                      type="text"
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      placeholder="Enter author's name"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#F05262] text-sm"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Author&apos;s name will be printed on the front cover and spine.
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Book Title *
                      </label>
                      <button
                        type="button"
                        onClick={handleAiGenerateTitles}
                        disabled={isAiGeneratingTitle}
                        className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#F05262] hover:text-[#d43f4f] bg-[#FFF0F2] hover:bg-[#FFE3E7] px-2.5 py-1 rounded-lg border border-[#FCD0D6] transition shadow-xs"
                      >
                        {isAiGeneratingTitle ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>Crafting Titles...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3 h-3 text-[#F05262]" />
                            <span>✨ Suggest Titles with Gemini AI</span>
                          </>
                        )}
                      </button>
                    </div>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter Book Title"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#F05262] text-sm"
                    />

                    {/* Gemini Suggested Titles Pille */}
                    {suggestedTitles.length > 0 && (
                      <div className="mt-2.5 p-3 bg-gradient-to-r from-rose-50/80 to-amber-50/80 rounded-xl border border-rose-100 animate-fade-in">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-rose-800 mb-1.5 flex items-center gap-1">
                          <Wand2 className="w-3 h-3 text-[#F05262]" />
                          Gemini 3.8 Suggested Titles (Click to apply):
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {suggestedTitles.map((t, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setTitle(t);
                                toast.info("Applied Title", `Title set to "${t}"`);
                              }}
                              className="text-xs bg-white hover:bg-[#F05262] hover:text-white text-slate-800 border border-rose-200 px-2.5 py-1 rounded-lg transition font-medium shadow-2xs text-left"
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <p className="text-[11px] text-amber-600 mt-1">
                      If the title is in any regional language, please enter it in English letters. Example: कहानियाँ → Kahaaniyan.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Subtitle (Optional)
                    </label>
                    <input
                      type="text"
                      value={subtitle}
                      onChange={(e) => setSubtitle(e.target.value)}
                      placeholder="Enter Book Subtitle (e.g. A Journey Through Hope)"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#F05262] text-sm"
                    />
                  </div>
                </div>
              )}

              {/* STEP 2: Design & Genre */}
              {currentStep === 2 && (
                <div className="space-y-5 animate-fade-in">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Select Primary Genre
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {genres.map((g) => (
                        <div
                          key={g.id}
                          onClick={() => setGenre(g.id)}
                          className={`p-3.5 rounded-2xl border-2 cursor-pointer transition flex items-center justify-between ${
                            genre === g.id
                              ? "border-[#F05262] bg-[#FFF5F6]"
                              : "border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <div>
                            <p className="text-xs font-bold text-slate-900">{g.label}</p>
                            <p className="text-[11px] text-slate-500">{g.desc}</p>
                          </div>
                          {genre === g.id && (
                            <span className="w-5 h-5 rounded-full bg-[#F05262] text-white flex items-center justify-center text-[10px]">
                              ✓
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Trim Size
                      </label>
                      <select
                        value={trimSize}
                        onChange={(e) => setTrimSize(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium"
                      >
                        <option value="5x8 inches">5&quot; x 8&quot; (Standard Poetry &amp; Fiction)</option>
                        <option value="6x9 inches">6&quot; x 9&quot; (Non-Fiction / Academic)</option>
                        <option value="5.5x8.5 inches">5.5&quot; x 8.5&quot; (Digest)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Format &amp; Binding
                      </label>
                      <select
                        value={binding}
                        onChange={(e: any) => setBinding(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium"
                      >
                        <option value="Paperback">Paperback (Glossy / Matte)</option>
                        <option value="Hardcover">Hardcover (Laminated)</option>
                        <option value="Both">Both (Paperback + eBook)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Book Interior */}
              {currentStep === 3 && (
                <div className="space-y-5 animate-fade-in">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Upload Manuscript (PDF, DOCX, TXT)
                    </label>
                    <div className="border-2 border-dashed border-slate-300 hover:border-[#F05262] rounded-3xl p-8 text-center cursor-pointer transition bg-slate-50/50">
                      <UploadCloud className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                      <p className="text-xs font-semibold text-slate-800">
                        Drag and drop your manuscript file here, or click to browse
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Supported: .docx, .pdf, .rtf (Up to 50MB)
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 space-y-1">
                    <p className="font-semibold flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      BookLeaf In-House Typesetting Included
                    </p>
                    <p className="text-[11px] text-emerald-700 leading-relaxed">
                      Our editorial team standardizes chapter headers, page numbers, margins, and running heads before sending you digital proofs.
                    </p>
                  </div>
                </div>
              )}

              {/* STEP 4: Cover Design */}
              {currentStep === 4 && (
                <div className="space-y-5 animate-fade-in">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Back Cover Blurb / Synopsis
                      </label>
                      <button
                        type="button"
                        onClick={handleAiGenerateBlurb}
                        disabled={isAiGeneratingBlurb}
                        className="inline-flex items-center gap-1.5 text-[11px] font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg border border-indigo-200 transition shadow-xs"
                      >
                        {isAiGeneratingBlurb ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>Drafting Blurb...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3 h-3 text-indigo-600" />
                            <span>✨ Auto-Draft with Gemini AI</span>
                          </>
                        )}
                      </button>
                    </div>
                    <textarea
                      rows={5}
                      value={blurb}
                      onChange={(e) => setBlurb(e.target.value)}
                      placeholder="Enter a compelling 100-200 word summary that will appear on the back cover of your book, or click 'Auto-Draft with Gemini AI'..."
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#F05262] text-sm leading-relaxed"
                    />
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2">
                    <span className="font-bold text-slate-800 block">
                      Cover Design Preference:
                    </span>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="cover_pref" defaultChecked className="text-[#F05262]" />
                      <span>BookLeaf Creative Designer (Custom cover created based on your theme)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="cover_pref" className="text-[#F05262]" />
                      <span>I will provide my own print-ready cover file (300 DPI CMYK)</span>
                    </label>
                  </div>
                </div>
              )}

              {/* STEP 5: Distribution & Royalties */}
              {currentStep === 5 && (
                <div className="space-y-5 animate-fade-in">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Target Retail Price (MRP in ₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                        ₹
                      </span>
                      <input
                        type="number"
                        min={199}
                        max={1999}
                        value={targetMrp}
                        onChange={(e) => setTargetMrp(Number(e.target.value))}
                        className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#F05262] text-sm font-semibold"
                      />
                    </div>
                  </div>

                  {/* Royalty Calculation Card */}
                  <div className="p-4 rounded-2xl bg-[#FFF5F6] border border-[#FFE7E9] space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600">Author Royalty per Copy (100% Net Profit):</span>
                      <span className="font-extrabold text-base text-[#F05262]">
                        ₹{estimatedRoyalty} / copy
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Based on MRP ₹{targetMrp} minus printing and platform distribution costs. Royalties are paid quarterly directly into your bank account.
                    </p>
                  </div>

                  <div>
                    <label className="flex items-start gap-3 p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 cursor-pointer text-xs text-slate-700">
                      <input
                        type="checkbox"
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                        className="mt-0.5 rounded text-[#F05262] focus:ring-[#F05262]"
                      />
                      <span>
                        I confirm that this manuscript is my original work and agree to BookLeaf Publishing&apos;s non-exclusive publishing terms. I retain 100% intellectual property rights.
                      </span>
                    </label>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        {!successMessage && (
          <div className="p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              disabled={currentStep === 1 || isSubmitting}
              onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
              className="px-5 py-2.5 rounded-full border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition"
            >
              Back
            </button>

            {currentStep < 5 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((s) => Math.min(5, s + 1))}
                className="px-6 py-2.5 rounded-full bg-[#F05262] hover:bg-[#e04555] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
              >
                <span>Save and Continue</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                disabled={isSubmitting || !agreedToTerms || !title.trim()}
                onClick={handleSubmit}
                className="px-7 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Registering Book...</span>
                ) : (
                  <>
                    <span>Submit &amp; Launch Production</span>
                    <Check className="w-4 h-4" />
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
