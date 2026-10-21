"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Cpu,
  Database,
  FileCode2,
  Image as ImageIcon,
  IndianRupee,
  Layers,
  Lock,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

const LIVE_DEMO_SCENARIOS = [
  {
    id: "royalty-threshold",
    author: "Kavita Deshmukh (AUTH009)",
    book: "The Nagpur Notebooks (BK016) & Raising Roots (BK015)",
    query:
      "My book 'Raising Roots' has been in Typesetting for 3 weeks, and why haven't I received my ₹850 royalty for 'The Nagpur Notebooks' yet?",
    category: "Book Status & Production Updates",
    priority: "High",
    tokensSaved: "71%",
    diagnostics: [
      "BK015 Status: In Production - Typesetting (Stage 4 of 8, MRP: null)",
      "BK016 Pending Royalty: ₹850 (34 copies × ₹25/copy)",
      "Policy Match: ₹850 is ₹150 below BookLeaf's ₹1,000 minimum payout threshold → rolls over to next quarter",
    ],
    draftPreview:
      "Dear Kavita, 'Raising Roots' (BK015) is currently in Stage 4/8 (Typesetting); we have requested a 48-hour milestone date from your Production Coordinator. Regarding 'The Nagpur Notebooks' (BK016), your accumulated royalty of ₹850 (34 copies sold) is ₹150 below our ₹1,000 minimum payout threshold, so it automatically rolls over to the next quarterly cycle...",
  },
  {
    id: "overdue-royalty",
    author: "Ananya Reddy (AUTH003)",
    book: "Between Two Temples (BK005)",
    query:
      "I published my book in July 2024 and sold 67 copies (₹2,546 earned), but my royalty paid is still ₹0. What's going on?",
    category: "Royalty & Payments",
    priority: "Critical",
    tokensSaved: "69%",
    diagnostics: [
      "BK005 Pending Royalty: ₹2,546 (67 copies × ₹38/copy) — Exceeds ₹1,000 threshold",
      "Last Royalty Payout Date: null (₹0 paid to date)",
      "Policy Match: Quarterly + 45-day window overdue → Verify bank details & escalate to Finance with 48h SLA",
    ],
    draftPreview:
      "Dear Ananya, I checked your live records for 'Between Two Temples': you have ₹2,546 in pending royalty across 67 copies sold, which exceeds our ₹1,000 threshold. We own this delay directly—please verify your bank details in the dashboard while our Finance Team audits your transfer within 48 hours...",
  },
  {
    id: "isbn-error",
    author: "Rohit Kapoor (AUTH002)",
    book: "Code & Karma (BK003)",
    query:
      "Amazon is showing a different ISBN than what is printed on my physical copy (978-93-5XXXX-03-5)!",
    category: "ISBN & Metadata Issues",
    priority: "Critical",
    tokensSaved: "74%",
    diagnostics: [
      "BK003 Assigned ISBN: 978-93-5XXXX-03-5 (Print Partner: Repro India)",
      "Active Channels: Amazon India, Flipkart, Amazon US, BookLeaf Store",
      "Policy Match: ISBN mismatch is a high-priority catalog issue → Immediate Production Team escalation (48h SLA)",
    ],
    draftPreview:
      "Dear Rohit, please accept our sincere apologies—an ISBN mismatch on Amazon for 'Code & Karma' (978-93-5XXXX-03-5) is a serious catalog issue. We have escalated this to our Production & Metadata Team as Critical Priority and will confirm resolution within 48 hours...",
  },
  {
    id: "print-defect",
    author: "Vikram Joshi (AUTH004)",
    book: "Debugging Life (BK006)",
    query:
      "I received my author copies and the print quality is terrible. The cover images are blurry and interior pages are misaligned.",
    category: "Printing & Quality",
    priority: "High",
    tokensSaved: "72%",
    diagnostics: [
      "BK006 Print Partner: In-House (Delhi Facility) • 534 copies sold",
      "Attachment Storage: ImageKit.io verified photo pipeline ready",
      "Policy Match: Free reprint arranged within 5–7 business days after photo verification",
    ],
    draftPreview:
      "Dear Vikram, we sincerely apologize for the print defect on your copies of 'Debugging Life' from our Delhi facility. Please share photos of the misaligned pages/cover via our ImageKit attachment uploader—once verified, we will dispatch a free reprint within 5–7 business days...",
  },
];

export default function HomeLandingPage() {
  const router = useRouter();
  const [activeScenarioIdx, setActiveScenarioIdx] = useState(0);
  const [quickLoadingEmail, setQuickLoadingEmail] = useState<string | null>(
    null
  );

  const scenario = LIVE_DEMO_SCENARIOS[activeScenarioIdx];

  async function handleInstantPortalLaunch(
    email: string,
    password: string,
    targetPath: string
  ) {
    setQuickLoadingEmail(email);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        router.push(targetPath);
        router.refresh();
      } else {
        router.push("/login");
      }
    } catch {
      router.push("/login");
    } finally {
      setQuickLoadingEmail(null);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Top Navigation */}
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1B4D7E] text-white shadow-sm">
              <BookOpen className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <span className="font-serif text-lg font-bold text-slate-900 tracking-tight block leading-none">
                BookLeaf Publishing
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-widest text-[#1B4D7E] block mt-0.5">
                Author Support & AI Ops Portal
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <a
              href="#interactive-ai-demo"
              className="hover:text-[#1B4D7E] transition-colors"
            >
              Live AI Pipeline
            </a>
            <a
              href="#instant-launch"
              className="hover:text-[#1B4D7E] transition-colors"
            >
              1-Click Demo Portals
            </a>
            <Link
              href="/api-docs"
              className="inline-flex items-center gap-1.5 hover:text-[#1B4D7E] transition-colors"
            >
              <FileCode2 className="h-4 w-4" aria-hidden="true" />
              REST API Spec
            </Link>
          </nav>

          <div className="flex items-center gap-2.5">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-[#1B4D7E] px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-[#163f68] transition-all cursor-pointer"
            >
              <span>Sign In / Switch Role</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section with Animated Interactive AI Pipeline */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-b from-white via-slate-50/70 to-slate-100/60 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Column: Editorial Headline & Instant Launch */}
            <div className="lg:col-span-6 space-y-6 animate-fade-up">
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3.5 py-1 text-xs font-semibold text-[#1B4D7E]">
                <Sparkles className="h-3.5 w-3.5 text-sky-600" aria-hidden="true" />
                <span>
                  Powered by Gemini 3.8 Flash • Context-Sliced Knowledge Base
                </span>
              </div>

              <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-slate-900 leading-[1.15]">
                Author Support at Publishing Scale—{" "}
                <span className="text-[#1B4D7E]">
                  Grounded in Real Data & Policy.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
                Built for BookLeaf Publishing’s catalog of{" "}
                <strong className="text-slate-900 font-semibold">
                  22,000+ titles
                </strong>{" "}
                and{" "}
                <strong className="text-slate-900 font-semibold">
                  1,200+ monthly releases
                </strong>
                . Automatically triages author tickets, verifies live MongoDB
                royalty & production records, and drafts empathetic,
                policy-accurate responses for operations review.
              </p>

              {/* 1-Click Instant Portal Launch Buttons */}
              <div className="pt-2 space-y-3" id="instant-launch">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Instant 1-Click Evaluator Access (Pre-Seeded Dataset):
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      handleInstantPortalLaunch(
                        "admin@bookleafpub.com",
                        "admin123",
                        "/admin"
                      )
                    }
                    disabled={quickLoadingEmail !== null}
                    className="group flex items-center justify-between rounded-xl bg-[#0E2842] px-4 py-3.5 text-left text-white shadow-md hover:bg-[#163f68] transition-all cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-300">
                        <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                        Admin Ops Portal
                      </div>
                      <p className="text-sm font-semibold mt-0.5">
                        Saloni Mourya (Ops Team)
                      </p>
                      <p className="text-[11px] text-slate-300">
                        Queue, AI Drafts, Overrides & Internal Notes
                      </p>
                    </div>
                    {quickLoadingEmail === "admin@bookleafpub.com" ? (
                      <RefreshCw
                        className="h-5 w-5 animate-spin text-sky-300 shrink-0"
                        aria-hidden="true"
                      />
                    ) : (
                      <ArrowRight
                        className="h-5 w-5 text-sky-300 group-hover:translate-x-1 transition-transform shrink-0"
                        aria-hidden="true"
                      />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleInstantPortalLaunch(
                        "priya.sharma@email.com",
                        "author123",
                        "/author"
                      )
                    }
                    disabled={quickLoadingEmail !== null}
                    className="group flex items-center justify-between rounded-xl border-2 border-[#1B4D7E] bg-white px-4 py-3.5 text-left text-slate-900 shadow-sm hover:bg-sky-50/60 transition-all cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#1B4D7E]">
                        <BookOpen className="h-4 w-4" aria-hidden="true" />
                        Author Portal
                      </div>
                      <p className="text-sm font-semibold mt-0.5">
                        Priya Sharma (AUTH001)
                      </p>
                      <p className="text-[11px] text-slate-500">
                        2 Books • ₹3,570 Pending • Live Thread
                      </p>
                    </div>
                    {quickLoadingEmail === "priya.sharma@email.com" ? (
                      <RefreshCw
                        className="h-5 w-5 animate-spin text-[#1B4D7E] shrink-0"
                        aria-hidden="true"
                      />
                    ) : (
                      <ArrowRight
                        className="h-5 w-5 text-[#1B4D7E] group-hover:translate-x-1 transition-transform shrink-0"
                        aria-hidden="true"
                      />
                    )}
                  </button>
                </div>

                {/* Quick Edge-Case Author Pills */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-xs font-medium text-slate-500">
                    Or test specific JSON edge cases:
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      handleInstantPortalLaunch(
                        "kavita.deshmukh@email.com",
                        "author123",
                        "/author"
                      )
                    }
                    className="inline-flex items-center gap-1 rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-900 hover:bg-amber-100 transition-colors cursor-pointer"
                  >
                    Kavita (AUTH009: ₹850 &lt; ₹1k + In Production)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleInstantPortalLaunch(
                        "sneha.kulkarni@email.com",
                        "author123",
                        "/author"
                      )
                    }
                    className="inline-flex items-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-900 hover:bg-indigo-100 transition-colors cursor-pointer"
                  >
                    Sneha (AUTH007: 3 Books + Cover Design)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleInstantPortalLaunch(
                        "ananya.reddy@email.com",
                        "author123",
                        "/author"
                      )
                    }
                    className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-900 hover:bg-rose-100 transition-colors cursor-pointer"
                  >
                    Ananya (AUTH003: Overdue ₹2,546, ₹0 Paid)
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Live AI Triage & Context Slicer Simulator */}
            <div
              id="interactive-ai-demo"
              className="lg:col-span-6 animate-fade-up delay-150"
            >
              <div className="rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden">
                <div className="bg-[#0E2842] px-5 py-3.5 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cpu className="h-4 w-4 text-sky-300" aria-hidden="true" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Interactive AI Triage & Context-Slicing Inspector
                    </span>
                  </div>
                  <span className="rounded-full bg-emerald-500/20 border border-emerald-400/30 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300">
                    Saved {scenario.tokensSaved} Tokens
                  </span>
                </div>

                {/* Scenario Selector Tabs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-slate-200 bg-slate-50 text-xs font-semibold">
                  {[
                    { idx: 0, label: "₹850 Threshold" },
                    { idx: 1, label: "Overdue Payout" },
                    { idx: 2, label: "ISBN Mismatch" },
                    { idx: 3, label: "Print Defect" },
                  ].map((tab) => (
                    <button
                      key={tab.idx}
                      type="button"
                      onClick={() => setActiveScenarioIdx(tab.idx)}
                      className={`py-2.5 px-3 border-b-2 transition-all cursor-pointer ${
                        activeScenarioIdx === tab.idx
                          ? "border-[#1B4D7E] bg-white text-[#1B4D7E]"
                          : "border-transparent text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="p-5 space-y-4 text-sm">
                  {/* Author Query Box */}
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                      <span className="font-semibold text-slate-800">
                        {scenario.author}
                      </span>
                      <span className="font-mono text-[11px]">
                        {scenario.book}
                      </span>
                    </div>
                    <p className="text-slate-700 italic text-xs sm:text-sm">
                      “{scenario.query}”
                    </p>
                  </div>

                  {/* Step 1 & 2 Badges */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 border border-blue-200 px-2.5 py-1 text-xs font-semibold text-blue-900">
                      AI Category: {scenario.category}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-semibold ${
                        scenario.priority === "Critical"
                          ? "bg-red-50 border-red-200 text-red-800"
                          : "bg-orange-50 border-orange-200 text-orange-800"
                      }`}
                    >
                      AI Priority: {scenario.priority}
                    </span>
                  </div>

                  {/* Grounded Diagnostics */}
                  <div className="rounded-xl border border-sky-200 bg-sky-50/50 p-3.5 space-y-1.5">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#1B4D7E]">
                      Injected Database + Policy Grounding Facts:
                    </p>
                    <ul className="space-y-1 text-xs text-slate-700">
                      {scenario.diagnostics.map((d, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <CheckCircle2
                            className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5"
                            aria-hidden="true"
                          />
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Drafted Response Preview */}
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-3.5">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                        AI-Drafted Support Reply (Admin Editable):
                      </span>
                      <span className="text-[11px] text-emerald-700 font-medium">
                        Requires Admin Approval
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {scenario.draftPreview}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Architecture Highlights Grid */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="h-9 w-9 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center text-[#1B4D7E] mb-3">
              <Zap className="h-5 w-5" aria-hidden="true" />
            </div>
            <h2 className="text-sm font-bold text-slate-900">
              2-Stage Context Slicing
            </h2>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              Instead of sending all 18 books and the entire policy manual on
              every call, our AI engine slices only the matched policy section
              and single book record—saving ~70% of tokens.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="h-9 w-9 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 mb-3">
              <Database className="h-5 w-5" aria-hidden="true" />
            </div>
            <h2 className="text-sm font-bold text-slate-900">
              Null-Safe Sample Dataset
            </h2>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              Pre-seeded with all 10 authors and 18 books from{" "}
              <code className="font-mono text-[11px]">
                bookleaf_sample_data.json
              </code>
              , gracefully handling <code className="font-mono">null</code> MRP,
              publication dates, and <em>In Production</em> stages.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="h-9 w-9 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 mb-3">
              <Lock className="h-5 w-5" aria-hidden="true" />
            </div>
            <h2 className="text-sm font-bold text-slate-900">
              Strict RBAC & Note Privacy
            </h2>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              Server-side JWT session verification ensures authors only access
              their own books and tickets, while Admin internal notes are stored
              in an isolated collection and never serialized to authors.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="h-9 w-9 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700 mb-3">
              <ImageIcon className="h-5 w-5" aria-hidden="true" />
            </div>
            <h2 className="text-sm font-bold text-slate-900">
              ImageKit Cloud Attachments
            </h2>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              Authors reporting print defects can attach photos validated via
              magic-byte inspection and uploaded to ImageKit.io cloud storage
              with instant preview fallback.
            </p>
          </div>
        </div>
      </section>

      {/* BookLeaf Official Policy Reference Bar */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex flex-wrap items-center gap-4">
            <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
              <IndianRupee className="h-3.5 w-3.5 text-[#1B4D7E]" aria-hidden="true" />
              80/20 Net Profit Split
            </span>
            <span>•</span>
            <span>₹1,000 Minimum Payout Threshold</span>
            <span>•</span>
            <span>Quarterly + 45-Day Disbursement</span>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              <Layers className="h-3.5 w-3.5 text-[#1B4D7E]" aria-hidden="true" />
              48-Hour Escalation SLA
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="font-semibold text-[#1B4D7E] hover:underline"
            >
              Portal Login
            </Link>
            <Link
              href="/api-docs"
              className="font-semibold text-[#1B4D7E] hover:underline"
            >
              OpenAPI 3.0 Spec
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
