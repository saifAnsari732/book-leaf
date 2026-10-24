"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PortalShell } from "@/components/layout/portal-shell";
import {
  TicketCategoryBadge,
  TicketPriorityBadge,
} from "@/components/ui/badges";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  DollarSign,
  FileCheck,
  FileText,
  Layers,
  MessageSquare,
  PenTool,
  Play,
  RefreshCw,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  TrendingDown,
  User,
} from "lucide-react";
import { SafeUser } from "@/types/domain";

interface PresetScenario {
  title: string;
  authorId: string;
  subject: string;
  description: string;
  tone: string;
}

const PRESET_SCENARIOS: PresetScenario[] = [
  {
    title: "Overdue Royalty (> ₹1,000 threshold)",
    authorId: "AUTH001",
    subject: "My Q3 royalties of ₹2,546 are overdue. Please assist.",
    description:
      "Hello BookLeaf Support, It has been more than 45 days since the end of the quarter. My dashboard shows ₹2,546 pending for 'The Silent Path', which is well above the ₹1,000 minimum threshold, but no money has been credited to my bank account. Can you please check why the payout has not arrived?",
    tone: "Empathetic & Warm",
  },
  {
    title: "Physical Print Defect on Author Copies",
    authorId: "AUTH003",
    subject: "Author copies arrived with crooked spine and faded cover ink",
    description:
      "I received my bundle of 5 complimentary author copies yesterday via BlueDart tracking BK-DEL-9812. The front cover colors look completely washed out compared to the digital proof, and the spine binding is glued crooked. This is unacceptable for my upcoming book launch event. I need fresh copies reprinted immediately.",
    tone: "Direct & Concise",
  },
  {
    title: "ISBN Mismatch on Amazon Listing",
    authorId: "AUTH002",
    subject: "Paperback ISBN on Amazon does not match copyright page",
    description:
      "Readers are reporting that the ISBN listed on Amazon India (978-93-98765-43-2) differs from the official ISBN printed on my physical book (978-93-98765-00-1). It appears to be mapped to another author's title. This is hurting my author ranking and reviews.",
    tone: "Formal Corporate",
  },
  {
    title: "Amazon 'Currently Unavailable' Stock Sync",
    authorId: "AUTH004",
    subject: "My live book is showing 'Currently Unavailable' on Amazon India",
    description:
      "Hi team, readers who are trying to order 'The Last Horizon' are telling me Amazon displays 'Currently Unavailable' even though my author dashboard says 150 units were restocked in the Bangalore fulfillment hub. Please get Prime delivery re-enabled urgently.",
    tone: "Urgent Escalation",
  },
  {
    title: "Typesetting Bottleneck in Editorial",
    authorId: "AUTH005",
    subject: "Typesetting revision pending for 22 days without update",
    description:
      "I submitted my updated chapter 4 manuscript files three weeks ago. The editorial timeline promised 7 working days for proof generation, but my dashboard status has remained frozen at 'Typesetting Revision'. Please provide an ETA.",
    tone: "Direct & Concise",
  },
];

interface SimulationResponse {
  success: boolean;
  ticket_id: string;
  author: {
    author_id: string;
    name: string;
    email: string;
    royalty_balance: number;
    book_count: number;
  };
  result: {
    suggested_category: any;
    suggested_priority: any;
    rationale: string;
    draft_reply: string;
    model: string;
    provider: string;
    tokens_saved_pct: number;
  };
  slicedPolicy: string;
  latencyMs: number;
}

export default function AdminAiAssistantPage() {
  const [selectedAuthorId, setSelectedAuthorId] = useState("AUTH001");
  const [selectedTone, setSelectedTone] = useState("Empathetic & Warm");
  const [subject, setSubject] = useState(PRESET_SCENARIOS[0].subject);
  const [description, setDescription] = useState(PRESET_SCENARIOS[0].description);
  const [isLoading, setIsLoading] = useState(false);
  const [simulationResult, setSimulationResult] = useState<SimulationResponse | null>(null);
  const [copied, setCopied] = useState(false);

  const authors = [
    { author_id: "AUTH001", name: "Priya Sharma", edge_case_tag: "2 Live Books • ₹3,570 Pending" },
    { author_id: "AUTH002", name: "Rohit Kapoor", edge_case_tag: "1 Live Book • Under-threshold ₹820" },
    { author_id: "AUTH003", name: "Ananya Roy", edge_case_tag: "2 Live Books • Print Defect Claim" },
    { author_id: "AUTH004", name: "Kabir Sen", edge_case_tag: "1 Live Book • Stock Outage" },
    { author_id: "AUTH005", name: "Meera Joshi", edge_case_tag: "1 In-Production • Delayed Proof" },
  ];

  function loadPreset(p: PresetScenario) {
    setSelectedAuthorId(p.authorId);
    setSelectedTone(p.tone);
    setSubject(p.subject);
    setDescription(p.description);
    setSimulationResult(null);
  }

  async function handleRunSimulation() {
    setIsLoading(true);
    setSimulationResult(null);
    try {
      const res = await fetch("/api/admin/ai-assistant/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author_id: selectedAuthorId,
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
      console.error("Simulation failed", err);
    } finally {
      setIsLoading(false);
    }
  }

  function handleCopy() {
    if (simulationResult?.result.draft_reply) {
      navigator.clipboard.writeText(simulationResult.result.draft_reply);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  const currentUser: SafeUser = {
    user_id: "USR-ADMIN-01",
    author_id: null,
    email: "saloni.mourya@bookleafpub.com",
    name: "Saloni Mourya (BookLeaf Ops)",
    role: "ADMIN",
    phone: null,
    city: null,
    joined_date: "2024-01-01",
  };

  return (
    <PortalShell user={currentUser}>
      <div className="space-y-8 max-w-7xl mx-auto pb-12 font-sans">
        {/* ==================================================================
            PAGE HEADER: Professional Grievance Resolution Bench
            ================================================================== */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200/90">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0F4C3A]">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>BookLeaf Operations Resolution Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900 mt-1">
              Author Grievance Resolution Bench
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Simulate author inquiry scenarios, evaluate BookLeaf publishing SLAs, and draft policy-grounded replies.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Policy Engine Active
            </span>
          </div>
        </div>

        {/* ==================================================================
            FAST BENCHMARK PRESETS
            ================================================================== */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              One-Click Benchmark Inquiry Scenarios:
            </span>
            <span className="text-[11px] text-slate-400 font-medium">Click any scenario to populate</span>
          </div>
          <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none">
            {PRESET_SCENARIOS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => loadPreset(p)}
                className="px-3.5 py-2.5 bg-[#FAF8F5] hover:bg-emerald-50 hover:text-[#0F4C3A] hover:border-emerald-300 border border-[#EAE3D9] rounded-2xl text-xs font-semibold text-slate-700 whitespace-nowrap transition flex items-center gap-2 cursor-pointer shadow-2xs hover:shadow-xs"
              >
                <ArrowRight className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{p.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ==================================================================
            MAIN TWO-COLUMN WORKBENCH
            ================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: SIMULATOR INPUTS (5 COLS) */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-2xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#0F4C3A]" />
                  Resolution Parameters
                </span>
                <span className="text-xs text-slate-400 font-medium">Context Builder</span>
              </div>

              {/* Author Select */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Author Account *
                </label>
                <select
                  value={selectedAuthorId}
                  onChange={(e) => setSelectedAuthorId(e.target.value)}
                  className="w-full text-xs font-semibold p-3 bg-[#FAF8F5] border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F4C3A] text-slate-900"
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
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Response Tone &amp; Framing *
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
                      className={`px-3 py-2 text-xs rounded-xl border text-center font-bold transition cursor-pointer ${
                        selectedTone === tone
                          ? "bg-[#0F4C3A] text-white border-[#0F4C3A] shadow-xs"
                          : "bg-[#FAF8F5] text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {tone}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Ticket Subject *
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full text-xs font-semibold p-3 bg-[#FAF8F5] border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F4C3A] text-slate-900"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Author Message / Inquiry Body *
                </label>
                <textarea
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs p-3 bg-[#FAF8F5] border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F4C3A] leading-relaxed text-slate-900"
                />
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={handleRunSimulation}
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#0F4C3A] via-[#145C47] to-[#186851] hover:from-[#0B382B] hover:to-[#0F4C3A] text-white font-bold text-xs sm:text-sm transition shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-emerald-200" />
                    <span>Evaluating Publishing Policy...</span>
                  </>
                ) : (
                  <>
                    <PenTool className="w-4 h-4 text-emerald-200" />
                    <span>Generate Policy-Grounded Resolution</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: RESOLUTION PREVIEW & CITATIONS (7 COLS) */}
          <div className="lg:col-span-7 space-y-5">
            {simulationResult ? (
              <div className="space-y-5 animate-fade-in">
                {/* Telemetry Strip */}
                <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-2xs grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Policy Engine
                    </span>
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1 mt-1">
                      <Layers className="w-3.5 h-3.5 text-emerald-700" />
                      BookLeaf Core Triage
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Evaluation Speed
                    </span>
                    <span className="text-xs font-bold text-slate-900 mt-1 block font-mono">
                      {simulationResult.latencyMs} ms
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Policy Precision
                    </span>
                    <span className="text-xs font-bold text-emerald-700 mt-1 flex items-center gap-1 font-mono">
                      <TrendingDown className="w-3.5 h-3.5" />
                      100% Policy Grounded
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      SLA Target
                    </span>
                    <span className="text-xs font-bold text-slate-900 mt-1 block">
                      &lt; 24h Author Guarantee
                    </span>
                  </div>
                </div>

                {/* Classification & Rationale */}
                <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
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

                  <p className="text-xs text-slate-700 bg-[#FAF8F5] p-3.5 rounded-2xl border border-slate-200/80 leading-relaxed">
                    <strong className="text-slate-900 font-bold">Policy Rationale:</strong>{" "}
                    {simulationResult.result.rationale}
                  </p>
                </div>

                {/* Sliced Policy Grounding Context */}
                <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs space-y-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                    Cited BookLeaf Publishing Policy Clauses:
                  </span>
                  <div className="text-[11px] font-mono bg-[#FAF8F5] text-slate-800 p-4 rounded-2xl border border-slate-200/80 max-h-40 overflow-y-auto whitespace-pre-line leading-relaxed">
                    {simulationResult.slicedPolicy}
                  </div>
                </div>

                {/* Generated Draft Reply */}
                <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#0F4C3A] flex items-center justify-center">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-slate-900 text-sm">
                        Recommended Author Resolution Draft
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleCopy}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-700 transition cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Copied to Clipboard!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Draft</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="bg-[#FAF8F5] rounded-2xl p-5 border border-emerald-100 text-xs text-slate-800 leading-relaxed font-sans whitespace-pre-line shadow-2xs">
                    {simulationResult.result.draft_reply}
                  </div>

                  <div className="flex items-center justify-between pt-2 text-xs text-slate-500">
                    <span>
                      Draft formatted with empathetic tone, policy citations, and direct author next steps.
                    </span>
                    <Link
                      href="/admin/tickets"
                      className="text-[#0F4C3A] font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>Apply in Tickets Queue</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              /* High-Value Empty State with Policy Checklist & Quick Preview */
              <div className="bg-white rounded-3xl border border-slate-200/90 p-7 sm:p-8 shadow-2xs space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                      Standard Operating Procedures &amp; SLA Checklist
                    </span>
                  </div>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-slate-900">
                    BookLeaf Official Author Policy Benchmarks
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Every author inquiry is automatically cross-referenced against official BookLeaf publishing policies before draft generation.
                  </p>
                </div>

                {/* 4 Policy Pillars */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE3D9] space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                      <DollarSign className="w-4 h-4 text-emerald-700" />
                      <span>Royalty Payout Policy</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      100% net author profit split disbursed within 45 days post-quarter. Minimum threshold ₹1,000 for automated penny-drop verified bank transfer.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE3D9] space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                      <BookOpen className="w-4 h-4 text-sky-700" />
                      <span>Author Copies SLA</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Complimentary copies dispatched within 10-14 business days of publication sign-off via air courier with live tracking.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE3D9] space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                      <ShieldAlert className="w-4 h-4 text-rose-700" />
                      <span>Print Defect Guarantee</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      100% free reprinting &amp; replacement within 14 days of receipt for binding defects, faded ink, or shipping damages.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE3D9] space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                      <Layers className="w-4 h-4 text-teal-700" />
                      <span>ISBN &amp; Retail Sync</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Official government ISBN allocation with Bowker metadata synchronization across Amazon Pan-India and Flipkart.
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between flex-wrap gap-3">
                  <span className="text-xs text-slate-500 font-medium">
                    Select any benchmark scenario on the left to test live resolution drafting.
                  </span>
                  <button
                    type="button"
                    onClick={handleRunSimulation}
                    className="px-5 py-2.5 rounded-xl bg-[#0F4C3A] hover:bg-[#0B382B] text-white text-xs font-bold transition shadow-xs hover:shadow cursor-pointer flex items-center gap-2"
                  >
                    <span>Run Resolution Simulation</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PortalShell>
  );
}
