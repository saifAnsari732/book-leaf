"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  UploadCloud,
  Youtube,
} from "lucide-react";

export default function CreateBookStandalonePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [language, setLanguage] = useState("English");
  const [authorName, setAuthorName] = useState("Priya Sharma");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [genre, setGenre] = useState("Literary Fiction");
  const [trimSize, setTrimSize] = useState("5x8 inches");
  const [binding, setBinding] = useState<"Paperback" | "Hardcover" | "Both">(
    "Paperback"
  );
  const [blurb, setBlurb] = useState("");
  const [targetMrp, setTargetMrp] = useState(399);

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
    "Book Information",
    "Design & Genre",
    "Book Interior",
    "Cover Design",
    "Book Distribution",
  ];

  async function handleFinish() {
    if (!title.trim()) {
      setError("Please provide a book title.");
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
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F2EDEB] text-slate-800 font-sans selection:bg-[#F26979] selection:text-white">
      {/* Top Header */}
      <header className="h-16 bg-white border-b border-[#DCDBDD] px-6 lg:px-12 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <Link
            href="/author-dashboard?menu=Books"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#F26979] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
          <span className="text-slate-300">|</span>
          <span className="text-xs text-slate-500 font-medium">
            BookLeaf Publishing Author Studio
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-slate-400 hidden sm:inline">
            priya.sharma@email.com
          </span>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
        <div>
          <h1 className="font-serif text-3xl font-bold text-slate-900">
            Create a New Book
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete the steps below to prepare your book for publishing across Amazon, Flipkart, and the BookLeaf Store.
          </p>
        </div>

        {/* 5-Step Progress Stepper */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center justify-between overflow-x-auto">
          {steps.map((st, idx) => {
            const stepNum = idx + 1;
            const isActive = currentStep === stepNum;
            const isDone = currentStep > stepNum;

            return (
              <button
                key={st}
                onClick={() => setCurrentStep(stepNum)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  isActive
                    ? "bg-[#FFF5F6] text-[#F26979] font-bold border border-[#F26979]/30"
                    : isDone
                    ? "text-emerald-700"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                    isActive
                      ? "bg-[#F26979] text-white"
                      : isDone
                      ? "bg-emerald-100 text-emerald-700 font-bold"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {isDone ? "✓" : stepNum}
                </span>
                <span>{st}</span>
              </button>
            );
          })}
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
            {error}
          </div>
        )}

        {/* Wizard Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
          {success ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="font-serif text-2xl font-bold text-slate-900">
                Book Successfully Registered!
              </h2>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                &ldquo;{title}&rdquo; is now registered in BookLeaf&apos;s editorial queue. Our typesetters and designers will begin preparing your proofs.
              </p>
              <div className="pt-4 flex justify-center gap-3">
                <Link
                  href="/author-dashboard?menu=Books"
                  className="px-6 py-2.5 rounded-full bg-[#F26979] text-white font-bold text-xs shadow-md"
                >
                  View in My Books
                </Link>
                <Link
                  href="/author-dashboard?menu=Royalty%20Withdrawal"
                  className="px-6 py-2.5 rounded-full border border-slate-200 text-slate-700 font-bold text-xs"
                >
                  Royalty Dashboard
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* STEP 1 */}
              {currentStep === 1 && (
                <div className="space-y-6">
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
                          className={`px-4 py-2 rounded-full text-xs font-semibold transition ${
                            language === lang
                              ? "bg-[#F26979] text-white shadow-xs"
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
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-medium"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Author&apos;s Name, Book Title, and Subtitle cannot be changed later.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Book Title *
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter Book Title"
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-medium"
                    />
                    <p className="text-[11px] text-amber-700 mt-1">
                      If the title is in any regional language, please enter it in English letters. Example: कहानियाँ → Kahaaniyan.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Subtitle
                    </label>
                    <input
                      type="text"
                      value={subtitle}
                      onChange={(e) => setSubtitle(e.target.value)}
                      placeholder="Enter Book Subtitle"
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-medium"
                    />
                  </div>
                </div>
              )}

              {/* STEP 2 */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Genre
                    </label>
                    <select
                      value={genre}
                      onChange={(e) => setGenre(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-medium"
                    >
                      <option value="Literary Fiction">Literary Fiction</option>
                      <option value="Non-Fiction / Memoir">Non-Fiction / Memoir</option>
                      <option value="Self-Help / Technology">Self-Help / Technology</option>
                      <option value="Poetry">Poetry &amp; Ghazals</option>
                      <option value="Business / Entrepreneurship">Business / Entrepreneurship</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Dimensions
                      </label>
                      <select
                        value={trimSize}
                        onChange={(e) => setTrimSize(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-medium"
                      >
                        <option value="5x8 inches">5&quot; x 8&quot; (Poetry &amp; Fiction Standard)</option>
                        <option value="6x9 inches">6&quot; x 9&quot; (Trade Standard)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Binding
                      </label>
                      <select
                        value={binding}
                        onChange={(e: any) => setBinding(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-medium"
                      >
                        <option value="Paperback">Paperback</option>
                        <option value="Hardcover">Hardcover</option>
                        <option value="Both">Both (Paperback + eBook)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3 */}
              {currentStep === 3 && (
                <div className="space-y-6 text-center py-6">
                  <div className="border-2 border-dashed border-slate-300 hover:border-[#F26979] rounded-3xl p-10 cursor-pointer transition bg-slate-50/50">
                    <UploadCloud className="w-12 h-12 text-[#F26979] mx-auto mb-3" />
                    <h3 className="font-bold text-slate-800 text-sm">
                      Upload your manuscript file
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Drag &amp; drop .docx or .pdf files here. BookLeaf editorial handles typesetting.
                    </p>
                  </div>
                </div>
              )}

              {/* STEP 4 */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Back Cover Description &amp; Blurb
                    </label>
                    <textarea
                      rows={5}
                      value={blurb}
                      onChange={(e) => setBlurb(e.target.value)}
                      placeholder="Write your book's back cover description..."
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-medium"
                    />
                  </div>
                </div>
              )}

              {/* STEP 5 */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Retail Selling Price (MRP ₹)
                    </label>
                    <input
                      type="number"
                      value={targetMrp}
                      onChange={(e) => setTargetMrp(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 text-base font-bold"
                    />
                  </div>

                  <div className="p-4 rounded-2xl bg-[#FFF5F6] border border-[#FFE7E9] flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-600 block">
                        Estimated Author Royalty:
                      </span>
                      <strong className="text-xl font-extrabold text-[#F26979]">
                        ₹{Math.round(targetMrp * 0.1)} / copy
                      </strong>
                    </div>
                    <span className="text-xs text-slate-500">
                      100% Net Profit Distribution
                    </span>
                  </div>
                </div>
              )}

              {/* Navigation Actions */}
              <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  disabled={currentStep === 1 || isSubmitting}
                  onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
                  className="px-6 py-2.5 rounded-full border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-30"
                >
                  Previous Step
                </button>

                {currentStep < 5 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentStep((s) => Math.min(5, s + 1))}
                    className="px-6 py-2.5 rounded-full bg-[#F26979] hover:bg-[#e04555] text-white text-xs font-bold shadow-sm"
                  >
                    Save and Continue →
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isSubmitting || !title.trim()}
                    onClick={handleFinish}
                    className="px-8 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md"
                  >
                    {isSubmitting ? "Publishing..." : "Submit for Publication"}
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
