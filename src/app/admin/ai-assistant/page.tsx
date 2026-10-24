"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PortalShell } from "@/components/layout/portal-shell";
import { useFastQuery } from "@/lib/client-cache";
import { SafeUser, TicketCategory, TicketPriority, TICKET_CATEGORIES, TICKET_PRIORITIES } from "@/types/domain";
import { TicketCategoryBadge, TicketPriorityBadge } from "@/components/ui/badges";
import {
  MessageSquare,
  Play,
  Send,
  Copy,
  Check,
  RefreshCw,
  Sliders,
  ShieldCheck,
  FileText,
  AlertTriangle,
  BookOpen,
  ArrowRight,
  TrendingDown,
  Layers,
  Smile,
  Meh,
  Frown,
  Flame,
  CheckCircle2,
} from "lucide-react";

interface PresetScenario {
  title: string;
  category: TicketCategory;
  priority: TicketPriority;
  authorId: string;
  bookId: string | null;
  subject: string;
  description: string;
}

const PRESET_SCENARIOS: PresetScenario[] = [
  {
    title: "Overdue Royalty (> ₹1,000 threshold)",
    category: "Royalty & Payments",
    priority: "High",
    authorId: "AUTH003",
    bookId: "BOOK004",
    subject: "My Q3 royalties of ₹2,546 are overdue. Please assist.",
    description:
      "Hello BookLeaf Support, It has been more than 45 days since the end of the quarter. My dashboard shows ₹2,546 pending for 'The Silent Path', which is well above the ₹1,000 minimum threshold, but no money has been credited to my bank account. Can you please check why the payout has not arrived?",
  },
  {
    title: "Physical Print Defect on Author Copies",
    category: "Printing & Quality",
    priority: "High",
    authorId: "AUTH004",
    bookId: "BOOK006",
    subject: "Defective author copies received: Crooked trim and blurry text",
    description:
      "I received my batch of 10 author copies of 'Shadows of Varanasi' yesterday. Unfortunately, the interior pages have uneven margins and the body text is blurry on pages 40-75. I am very disappointed with this print quality and need clean replacement copies for my book launch next week.",
  },
  {
    title: "ISBN Mismatch on Amazon Listing",
    category: "ISBN & Metadata Issues",
    priority: "Critical",
    authorId: "AUTH002",
    bookId: "BOOK002",
    subject: "Urgent: Physical copy barcode does not match Amazon ISBN",
    description:
      "A reader just messaged me saying they bought 'Echoes of Eternity' on Amazon India, but the ISBN listed on the store page (978-93-91234-02-1) does not match the barcode printed on the physical back cover (978-93-91234-99-9). This is causing inventory confusion and bad reviews. Please fix immediately!",
  },
  {
    title: "Amazon 'Currently Unavailable' Stock Sync",
    category: "Distribution & Availability",
    priority: "Medium",
    authorId: "AUTH001",
    bookId: "BOOK001",
    subject: "Book showing 'Currently Unavailable' on Amazon India",
    description:
      "My book 'Whispers in the Wind' was published two weeks ago and was live, but today it is suddenly showing 'Currently Unavailable' on Amazon India. Several of my readers are trying to order it. Can you please restore the listing?",
  },
  {
    title: "Typesetting Bottleneck in Stage 4",
    category: "Book Status & Production Updates",
    priority: "Medium",
    authorId: "AUTH009",
    bookId: "BOOK014",
    subject: "Book stuck in Typesetting for over 3 weeks",
    description:
      "Hi team, I approved my cover design on September 28th, but my book 'The Golden Quill' has been in the Typesetting stage for over 3 weeks now with no update. Could you please give me an ETA on when I will receive the PDF proof to review?",
  },
];

export default function AdminAiAssistantPage() {
  const sessionQuery = useFastQuery<{ success: boolean; user: SafeUser }>(
    "auth:session",
    "/api/auth/session"
  );

  const demoAccountsQuery = useFastQuery<{
    success: boolean;
    accounts: Array<{
      author_id: string | null;
      name: string;
      email: string;
      role: string;
      edge_case_tag: string;
    }>;
  }>("auth:demo-accounts", "/api/auth/demo-accounts");

  const [selectedAuthorId, setSelectedAuthorId] = useState("AUTH001");
  const [selectedBookId, setSelectedBookId] = useState<string | null>("BOOK001");
  const [selectedTone, setSelectedTone] = useState("Empathetic & Warm");
  const [subject, setSubject] = useState(PRESET_SCENARIOS[0].subject);
  const [description, setDescription] = useState(PRESET_SCENARIOS[0].description);
  
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // AI Response State
  const [simulationResult, setSimulationResult] = useState<{
    success: boolean;
    latencyMs: number;
    result: {
      suggested_category: TicketCategory;
      suggested_priority: TicketPriority;
      rationale: string;
      draft_reply: string;
      provider: string;
      model: string;
      tokens_saved_pct: number;
    };
    slicedPolicy: string;
    diagnostics: string;
  } | null>(null);

  const authors = (demoAccountsQuery.data?.accounts || []).filter(
    (a) => a.role === "AUTHOR"
  );

  function loadPreset(preset: PresetScenario) {
    setSelectedAuthorId(preset.authorId);
    setSelectedBookId(preset.bookId);
    setSubject(preset.subject);
    setDescription(preset.description);
  }

  async function handleRunSimulation() {
    setIsLoading(true);
    setCopied(false);
    try {
      const res = await fetch("/api/admin/ai-assistant/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author_id: selectedAuthorId,
          book_id: selectedBookId,
          subject,
          description,
          tone: selectedTone,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSimulationResult(data);
      }
    } catch (err) {
      console.error("Simulation error", err);
    } finally {
      setIsLoading(false);
    }
  }

  function handleCopy() {
    if (simulationResult?.result?.draft_reply) {
      navigator.clipboard.writeText(simulationResult.result.draft_reply);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }

  const currentUser = sessionQuery.data?.user || {
    user_id: "admin-default",
    name: "BookLeaf Operations Admin",
    email: "support.ops@bookleafpub.com",
    role: "ADMIN" as const,
    author_id: null,
    phone: null,
    city: "New Delhi",
    joined_date: "2024-01-01",
  };

  return (
    <PortalShell user={currentUser}>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* ==================================================================
            PAGE HEADER
            ================================================================== */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#0F4C3A]">
              <ShieldCheck className="w-4 h-4 text-[#10B981]" />
              <span>Google Gemini AI Co-Pilot & Policy Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900 mt-1">
              AI Support Assistant & Sandbox
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Test and simulate real-time author inquiries, evaluate automated 2-stage context slicing, and preview policy-grounded replies.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Gemini 3.8 Flash Active
            </span>
          </div>
        </div>

        {/* ==================================================================
            FAST PRESET SCENARIOS BAR
            ================================================================== */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
            One-Click Benchmark Scenarios:
          </span>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {PRESET_SCENARIOS.map((p, idx) => (
              <button
                key={idx}
                onClick={() => loadPreset(p)}
                className="px-3 py-2 bg-slate-50 hover:bg-emerald-50 hover:text-[#0F4C3A] hover:border-emerald-200 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 whitespace-nowrap transition flex items-center gap-1.5"
              >
                <ArrowRight className="w-3 h-3 text-emerald-600" />
                <span>{p.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ==================================================================
            MAIN TWO-COLUMN WORKBENCH
            ================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT COLUMN: SIMULATOR INPUTS (5 COLS) */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#0F4C3A]" />
                  Inquiry Parameters
                </span>
                <span className="text-xs text-slate-400">Context Builder</span>
              </div>

              {/* Author Select */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                  Author Account
                </label>
                <select
                  value={selectedAuthorId}
                  onChange={(e) => setSelectedAuthorId(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F4C3A]"
                >
                  {authors.map((a) => (
                    <option key={a.author_id} value={a.author_id || ""}>
                      {a.name} ({a.author_id}) — {a.edge_case_tag}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tone Selection */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                  AI Communication Tone
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    "Empathetic & Warm",
                    "Direct & Concise",
                    "Formal Corporate",
                    "Urgent Escalation",
                  ].map((tone) => (
                    <button
                      key={tone}
                      type="button"
                      onClick={() => setSelectedTone(tone)}
                      className={`px-3 py-2 text-xs rounded-xl border text-left font-medium transition ${
                        selectedTone === tone
                          ? "bg-[#0F4C3A] text-white border-[#0F4C3A] shadow-sm"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {tone}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                  Ticket Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full text-sm p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F4C3A]"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                  Author Message / Inquiry Body
                </label>
                <textarea
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F4C3A] leading-relaxed"
                />
              </div>

              {/* Action Button */}
              <button
                onClick={handleRunSimulation}
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#0F4C3A] to-[#10B981] hover:from-[#0c3c2e] hover:to-[#059669] text-white font-medium text-sm transition shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analyzing with Gemini 3.8...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 text-emerald-200" />
                    <span>Run AI Triage & Draft Generation</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: AI INTELLIGENCE & AUTO-DRAFT (7 COLS) */}
          <div className="lg:col-span-7 space-y-5">
            {simulationResult ? (
              <div className="space-y-5 animate-in fade-in duration-200">
                {/* Telemetry Strip */}
                <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-sm grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                      AI Engine
                    </span>
                    <span className="text-sm font-bold text-slate-900 flex items-center gap-1 mt-0.5">
                      <Layers className="w-3.5 h-3.5 text-emerald-600" />
                      {simulationResult.result.model}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                      Inference Latency
                    </span>
                    <span className="text-sm font-bold text-slate-900 mt-0.5 block">
                      {simulationResult.latencyMs} ms
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                      Tokens Saved
                    </span>
                    <span className="text-sm font-bold text-emerald-600 mt-0.5 flex items-center gap-1">
                      <TrendingDown className="w-3.5 h-3.5" />
                      ~{simulationResult.result.tokens_saved_pct}%
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                      Provider Mode
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 mt-0.5 inline-block">
                      {simulationResult.result.provider}
                    </span>
                  </div>
                </div>

                {/* AI Classification & Rationale */}
                <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Automated Classification:
                    </span>
                    <div className="flex items-center gap-2">
                      <TicketCategoryBadge
                        category={simulationResult.result.suggested_category}
                      />
                      <TicketPriorityBadge
                        priority={simulationResult.result.suggested_priority}
                      />
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200/70 leading-relaxed">
                    <strong className="text-slate-900">AI Rationale:</strong>{" "}
                    {simulationResult.result.rationale}
                  </p>
                </div>

                {/* Policy Context Injected */}
                <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Sliced Policy Grounding Context:
                  </span>
                  <div className="text-[11px] font-mono bg-slate-50 text-slate-700 p-3.5 rounded-xl border border-slate-200 max-h-36 overflow-y-auto whitespace-pre-line leading-relaxed">
                    {simulationResult.slicedPolicy}
                  </div>
                </div>

                {/* Generated Draft Reply */}
                <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 text-[#0F4C3A] flex items-center justify-center">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <span className="font-semibold text-slate-900 text-sm">
                        Recommended Author Reply (Grounded Draft)
                      </span>
                    </div>

                    <button
                      onClick={handleCopy}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-medium text-slate-700 transition"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Draft</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="bg-[#F9FAF7] rounded-xl p-4 border border-emerald-100 text-xs text-slate-800 leading-relaxed font-sans whitespace-pre-line">
                    {simulationResult.result.draft_reply}
                  </div>

                  <div className="flex items-center justify-between pt-2 text-xs text-slate-500">
                    <span>
                      Draft formatted with empathetic tone and verifiable policy dates.
                    </span>
                    <Link
                      href="/admin/tickets"
                      className="text-[#0F4C3A] font-semibold hover:underline inline-flex items-center gap-1"
                    >
                      <span>Apply in Tickets Queue</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              /* Empty State */
              <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center shadow-sm flex flex-col items-center justify-center min-h-[420px]">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-[#0F4C3A] flex items-center justify-center mb-4">
                  <FileText className="w-7 h-7 text-[#10B981]" />
                </div>
                <h3 className="text-lg font-bold font-serif text-slate-900">
                  Ready to Simulate AI Triage
                </h3>
                <p className="text-xs text-slate-500 max-w-md mt-1 leading-relaxed">
                  Select an inquiry preset above or input a custom author ticket scenario on the left. Gemini 3.8 Flash will slice the relevant BookLeaf policy and generate a contextual response.
                </p>
                <button
                  onClick={handleRunSimulation}
                  className="mt-6 px-5 py-2.5 rounded-xl bg-[#0F4C3A] hover:bg-[#0c3c2e] text-white text-xs font-medium transition shadow-sm"
                >
                  Run First Simulation
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </PortalShell>
  );
}
