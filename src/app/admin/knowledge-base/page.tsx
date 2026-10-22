"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { PortalShell } from "@/components/layout/portal-shell";
import { useFastQuery } from "@/lib/client-cache";
import { SafeUser, TicketCategory, TICKET_CATEGORIES } from "@/types/domain";
import { TicketCategoryBadge } from "@/components/ui/badges";
import {
  BookOpen,
  Search,
  Plus,
  Filter,
  CheckCircle2,
  ExternalLink,
  ThumbsUp,
  ThumbsDown,
  Eye,
  FileText,
  Clock,
  Sparkles,
  Layers,
  ChevronRight,
  Edit3,
  Trash2,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  X,
} from "lucide-react";

interface KBArticle {
  id: string;
  title: string;
  category: TicketCategory;
  summary: string;
  content: string;
  tags: string[];
  views: number;
  helpfulCount: number;
  unhelpfulCount: number;
  lastUpdated: string;
  isAiGrounded: boolean;
}

const INITIAL_ARTICLES: KBArticle[] = [
  {
    id: "kb-001",
    title: "How author royalties are calculated: The 80/20 Net Profit Split",
    category: "Royalty & Payments",
    summary:
      "A complete breakdown of the 80/20 royalty formula, production cost deductions, platform commissions, and quarterly calculation.",
    content: `### 80/20 Royalty Split Formula
BookLeaf Authors receive **80% of the net profit** generated from every book sale across Amazon India, Flipkart, Amazon Global, and the BookLeaf Store.

#### Calculation Formula:
\`Net Profit = MRP - (Printing Cost + Channel Platform Commission + Shipping)\`
\`Author Royalty = Net Profit * 0.80\`

#### Example:
- **MRP**: ₹350
- **Print Cost**: ₹110
- **Amazon Commission & Logistics**: ₹90
- **Net Profit**: ₹150
- **Author's Earnings**: ₹120 per copy sold.

#### Payout Schedule:
Royalties are calculated at the end of each calendar quarter (Q1: Jan-Mar, Q2: Apr-Jun, Q3: Jul-Sep, Q4: Oct-Dec) and disbursed within **45 calendar days** of the quarter closing.`,
    tags: ["royalty", "80-20", "net-profit", "quarterly", "amazon"],
    views: 3420,
    helpfulCount: 412,
    unhelpfulCount: 14,
    lastUpdated: "2026-10-15",
    isAiGrounded: true,
  },
  {
    id: "kb-002",
    title: "Quarterly Payout Schedule & ₹1,000 Minimum Threshold Rollover",
    category: "Royalty & Payments",
    summary:
      "Understanding the ₹1,000 disbursement threshold, payment rollover mechanics, and verifying bank account details.",
    content: `### Minimum Payout Threshold Policy
To maintain banking processing integrity and reduce micro-transaction fees, BookLeaf maintains a minimum payout threshold of **₹1,000**.

- If your accumulated pending royalty is **greater than or equal to ₹1,000**, it is scheduled for direct NEFT/IMPS transfer during the quarterly cycle.
- If your accumulated balance is **below ₹1,000**, your balance automatically rolls over to the following quarter with zero deductions or penalties.
- You can review your lifetime sales, pending balance, and payout slips directly in your Author Portal Dashboard under "Royalty Summary".`,
    tags: ["threshold", "rollover", "payout", "banking", "finance"],
    views: 2150,
    helpfulCount: 285,
    unhelpfulCount: 8,
    lastUpdated: "2026-10-18",
    isAiGrounded: true,
  },
  {
    id: "kb-003",
    title: "ISBN Registration, Publisher Imprint & Retail Barcode Verification",
    category: "ISBN & Metadata Issues",
    summary:
      "How BookLeaf registers 13-digit ISBNs with the National Raja Rammohun Roy Agency and manages retail barcode generation.",
    content: `### Official ISBN Assignment
Every book published under BookLeaf's catalog receives an authentic, government-registered 13-digit ISBN (International Standard Book Number).

- **Publisher Imprint**: The registered ISBN will list BookLeaf Publishing as the designated publishing house.
- **Retail Barcodes**: High-resolution EAN-13 barcodes are embedded directly onto the back cover in vector SVG/PDF format.
- **Reporting Discrepancies**: If your book's physical copy shows an ISBN mismatch or Amazon lists an incorrect barcode, submit a ticket under *ISBN & Metadata Issues* for immediate 48-hour priority correction.`,
    tags: ["isbn", "barcode", "imprint", "catalog", "agency"],
    views: 1840,
    helpfulCount: 198,
    unhelpfulCount: 5,
    lastUpdated: "2026-10-12",
    isAiGrounded: true,
  },
  {
    id: "kb-004",
    title: "Updating Metadata: Book Description, Author Bio, and Categories",
    category: "ISBN & Metadata Issues",
    summary:
      "Step-by-step instructions on updating retail listings, keywords, author bio blurb, and expected channel sync delays.",
    content: `### Metadata Modification Guidelines
Authors can update their book description blurb, author biography, and search discovery keywords post-publication.

- **Turnaround Time**: Metadata changes take **3 to 5 business days** to index across Amazon India, Flipkart, and Google Books.
- **How to Submit**: Create a ticket or request through the Book Details panel with the exact new description text.
- **Title / Subtitle Changes**: Changing the book title or subtitle requires a new edition/ISBN under international cataloging guidelines.`,
    tags: ["metadata", "description", "bio", "keywords", "flipkart"],
    views: 1290,
    helpfulCount: 142,
    unhelpfulCount: 6,
    lastUpdated: "2026-10-09",
    isAiGrounded: true,
  },
  {
    id: "kb-005",
    title: "Print Quality Guarantee & 100% Free Reprint Policy",
    category: "Printing & Quality",
    summary:
      "Our strict zero-defect print guarantee, how to document defective author copies, and 5-7 business day replacement turnaround.",
    content: `### BookLeaf 100% Quality Assurance Guarantee
We take tremendous pride in every paperback and hardcover printed in our Delhi facility and through Repro India.

#### Eligible Defect Criteria:
- Severely misaligned or crooked trim margins
- Blurry, faded, or ink-streaked typography
- Inverted or missing pages
- Weak spine glue or loose binding leaves
- Scratched or peeling cover lamination

#### Free Replacement Process:
1. Photograph the defective copy (cover, affected pages, and barcode).
2. Attach the photos in a support ticket under **Printing & Quality**.
3. Our Production Desk verifies the issue within 24 hours.
4. A brand-new reprint batch is dispatched to your shipping address within **5 to 7 business days** at zero cost to you.`,
    tags: ["print-quality", "reprint", "binding", "delhi-plant", "guarantee"],
    views: 2980,
    helpfulCount: 388,
    unhelpfulCount: 11,
    lastUpdated: "2026-10-19",
    isAiGrounded: true,
  },
  {
    id: "kb-006",
    title: "Retail Listing Timelines: Amazon, Flipkart, and Global Distribution",
    category: "Distribution & Availability",
    summary:
      "Standard retail channel ingestion schedules, POD stock synchronization, and troubleshooting 'Currently Unavailable' listings.",
    content: `### Channel Distribution Flow
Following final author proof approval, distribution setup proceeds across major platforms:

- **BookLeaf Store**: Live within 24 hours.
- **Amazon India (Prime POD)**: 5 to 7 business days.
- **Flipkart**: 7 to 10 business days.
- **Amazon US / UK / Canada (Global)**: 10 to 14 business days.

#### Out of Stock / Unavailable Warnings:
If an active book shows "Currently Unavailable" on Amazon, our automated distributor stock-sync will re-push availability within **24 to 48 hours**. Contact support if the status persists beyond 48 hours.`,
    tags: ["distribution", "amazon-prime", "flipkart", "stock-sync", "global"],
    views: 2640,
    helpfulCount: 310,
    unhelpfulCount: 9,
    lastUpdated: "2026-10-14",
    isAiGrounded: true,
  },
  {
    id: "kb-007",
    title: "The 8 Sequential Stages of BookLeaf Book Production",
    category: "Book Status & Production Updates",
    summary:
      "Detailed roadmap of the 8 production stages from initial manuscript upload to published book in author hands.",
    content: `### 8-Stage Production Lifecycle
1. **Manuscript Received**: Initial formatting and word count verification.
2. **Editing (Optional)**: Editorial cleanup, grammar, and structural feedback.
3. **Cover Design**: Spine calculation, typography layout, author proof review.
4. **Typesetting & Interior**: Page numbering, headers, margins, typography styling.
5. **Proofreading Round**: Digital PDF proof dispatched for author sign-off.
6. **ISBN Assignment**: Official barcode and imprint registration.
7. **Printing**: Delhi facility and partner press batch run.
8. **Distribution Setup**: Retail feed sync and go-live!`,
    tags: ["production", "stages", "cover-design", "typesetting", "proof"],
    views: 4110,
    helpfulCount: 520,
    unhelpfulCount: 15,
    lastUpdated: "2026-10-16",
    isAiGrounded: true,
  },
  {
    id: "kb-008",
    title: "Standard Free vs Bestseller Breakthrough Publishing Packages",
    category: "General Inquiry",
    summary:
      "Comparison matrix between BookLeaf's free zero-cost self-publishing package and the premium Bestseller Breakthrough tier.",
    content: `### Publishing Package Comparison

| Feature | Standard Free | Bestseller Breakthrough |
| :--- | :--- | :--- |
| Upfront Cost | ₹0 (Zero) | Premium One-Time Fee |
| ISBN & Barcode | Included | Included |
| Royalty Share | 80% Net Profit | 80% Net Profit |
| Cover Design | Curated Templates | 100% Custom Illustrated Cover |
| Distribution | Amazon & BookLeaf | Amazon, Flipkart, Global, BookLeaf |
| Author Complimentary Copies | 1 Copy | 10 Copies + Author Kit |
| Marketing Add-ons | Optional Add-on | Press Release + Amazon Ads Launch |`,
    tags: ["packages", "free-publishing", "bestseller", "comparison"],
    views: 3890,
    helpfulCount: 465,
    unhelpfulCount: 18,
    lastUpdated: "2026-10-11",
    isAiGrounded: true,
  },
];

export default function AdminKnowledgeBasePage() {
  const sessionQuery = useFastQuery<{ success: boolean; user: SafeUser }>(
    "auth:session",
    "/api/auth/session"
  );

  const [articles, setArticles] = useState<KBArticle[]>(INITIAL_ARTICLES);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeArticle, setActiveArticle] = useState<KBArticle | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New Article Form State
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] =
    useState<TicketCategory>("Royalty & Payments");
  const [newSummary, setNewSummary] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newTags, setNewTags] = useState("");
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      const matchesCat =
        selectedCategory === "All" || article.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        article.title.toLowerCase().includes(q) ||
        article.summary.toLowerCase().includes(q) ||
        article.tags.some((t) => t.toLowerCase().includes(q));
      return matchesCat && matchesSearch;
    });
  }, [articles, selectedCategory, searchQuery]);

  function handleCreateArticle(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const newArt: KBArticle = {
      id: `kb-${Date.now().toString().slice(-4)}`,
      title: newTitle.trim(),
      category: newCategory,
      summary: newSummary.trim() || newContent.slice(0, 120) + "...",
      content: newContent.trim(),
      tags: newTags
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean),
      views: 1,
      helpfulCount: 0,
      unhelpfulCount: 0,
      lastUpdated: new Date().toISOString().split("T")[0],
      isAiGrounded: true,
    };

    setArticles([newArt, ...articles]);
    setIsCreateModalOpen(false);
    setNewTitle("");
    setNewSummary("");
    setNewContent("");
    setNewTags("");
    setSuccessBanner("Knowledge Base article published successfully!");
    setTimeout(() => setSuccessBanner(null), 4000);
  }

  function handleVote(articleId: string, isHelpful: boolean) {
    setArticles((prev) =>
      prev.map((a) => {
        if (a.id === articleId) {
          return {
            ...a,
            helpfulCount: isHelpful ? a.helpfulCount + 1 : a.helpfulCount,
            unhelpfulCount: !isHelpful
              ? a.unhelpfulCount + 1
              : a.unhelpfulCount,
          };
        }
        return a;
      })
    );
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
            PAGE HEADER & HERO STATS
            ================================================================== */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#0F4C3A]">
              <Layers className="w-4 h-4 text-[#10B981]" />
              <span>Operations & Policy Control</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900 mt-1">
              Knowledge Base Management
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Curate author policy documents, FAQs, and factual grounding rules
              consumed by Google Gemini AI triage.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0F4C3A] text-white font-medium text-sm hover:bg-[#0c3c2e] transition shadow-sm hover:shadow"
            >
              <Plus className="w-4 h-4" />
              <span>New Policy Article</span>
            </button>
          </div>
        </div>

        {/* Success Banner */}
        {successBanner && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-medium">{successBanner}</span>
            </div>
            <button
              onClick={() => setSuccessBanner(null)}
              className="text-emerald-600 hover:text-emerald-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 4 KPI CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Total Articles
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#0F4C3A] flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-2">
              {articles.length}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Across 6 support categories
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                AI Grounding Status
              </span>
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-2">100%</p>
            <p className="text-xs text-slate-500 mt-1">
              Synchronized with Gemini engine
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Author Satisfaction
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <ThumbsUp className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-2">96.2%</p>
            <p className="text-xs text-slate-500 mt-1">
              Based on 2,500+ helpfulness votes
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Lifetime Views
              </span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Eye className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-2">
              {articles.reduce((acc, a) => acc + a.views, 0).toLocaleString()}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Self-serve issue resolution
            </p>
          </div>
        </div>

        {/* ==================================================================
            SEARCH & CATEGORY FILTER TABS
            ================================================================== */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search articles, keywords, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F4C3A] transition"
              />
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 w-full md:w-auto justify-end">
              <span>Showing {filteredArticles.length} of {articles.length} articles</span>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {["All", ...TICKET_CATEGORIES].map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                    active
                      ? "bg-[#0F4C3A] text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* ==================================================================
            ARTICLE GRID & DETAIL MODAL
            ================================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredArticles.map((article) => (
            <div
              key={article.id}
              onClick={() => setActiveArticle(article)}
              className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm hover:shadow-md hover:border-emerald-300 transition cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <TicketCategoryBadge category={article.category} />
                  {article.isAiGrounded && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <Sparkles className="w-3 h-3 text-emerald-600" />
                      AI Grounded
                    </span>
                  )}
                </div>

                <h3 className="font-semibold text-slate-900 group-hover:text-[#0F4C3A] transition line-clamp-2">
                  {article.title}
                </h3>
                <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                  {article.summary}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {article.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[10px] font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 mt-5 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    {article.views}
                  </span>
                  <span className="flex items-center gap-1 text-emerald-700">
                    <ThumbsUp className="w-3.5 h-3.5" />
                    {article.helpfulCount}
                  </span>
                </div>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {article.lastUpdated}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* ==================================================================
            ARTICLE PREVIEW MODAL / DRAWER
            ================================================================== */}
        {activeArticle && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col animate-in fade-in zoom-in-95 duration-150">
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-100 flex items-start justify-between">
                <div>
                  <TicketCategoryBadge category={activeArticle.category} />
                  <h2 className="text-xl font-bold font-serif text-slate-900 mt-2">
                    {activeArticle.title}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Last updated on {activeArticle.lastUpdated} • ID: {activeArticle.id}
                  </p>
                </div>
                <button
                  onClick={() => setActiveArticle(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4 text-sm text-slate-700 leading-relaxed font-sans">
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/70 text-xs text-slate-600">
                  <strong className="text-slate-900">Executive Summary:</strong>{" "}
                  {activeArticle.summary}
                </div>

                <div className="prose prose-slate prose-sm max-w-none whitespace-pre-line">
                  {activeArticle.content}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-slate-100 bg-slate-50/70 rounded-b-3xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Was this article helpful?</span>
                  <button
                    onClick={() => handleVote(activeArticle.id, true)}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium text-emerald-700 hover:bg-emerald-50 transition"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    Yes ({activeArticle.helpfulCount})
                  </button>
                  <button
                    onClick={() => handleVote(activeArticle.id, false)}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition"
                  >
                    <ThumbsDown className="w-3.5 h-3.5" />
                    No ({activeArticle.unhelpfulCount})
                  </button>
                </div>

                <button
                  onClick={() => setActiveArticle(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-xl text-xs font-medium text-slate-800 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================
            CREATE ARTICLE MODAL
            ================================================================== */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 flex flex-col animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-bold font-serif text-slate-900">
                    Create Knowledge Base Article
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Adds factual policy context into Gemini AI support prompts.
                  </p>
                </div>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateArticle} className="space-y-4 mt-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                    Category *
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) =>
                      setNewCategory(e.target.value as TicketCategory)
                    }
                    className="w-full text-sm p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F4C3A]"
                  >
                    {TICKET_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                    Article Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Expedited Author Reprints for Book Launch Events"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full text-sm p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F4C3A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                    Short Summary (1-2 sentences)
                  </label>
                  <input
                    type="text"
                    placeholder="Summary shown on cards and in AI metadata citations..."
                    value={newSummary}
                    onChange={(e) => setNewSummary(e.target.value)}
                    className="w-full text-sm p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F4C3A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                    Full Content & Rules (Markdown Supported) *
                  </label>
                  <textarea
                    required
                    rows={6}
                    placeholder="Detailed policy instructions, formulas, timelines, step-by-step resolution..."
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    className="w-full text-sm p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F4C3A] font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    placeholder="reprint, urgent, shipping, delhi-plant"
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                    className="w-full text-sm p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F4C3A]"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#0F4C3A] hover:bg-[#0c3c2e] text-white text-sm font-medium transition shadow-sm"
                  >
                    Publish Article
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </PortalShell>
  );
}
