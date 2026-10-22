"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PortalShell } from "@/components/layout/portal-shell";
import { useFastQuery } from "@/lib/client-cache";
import {
  BookRecord,
  SafeUser,
  TicketCategory,
  TicketPriority,
  TicketStatus,
} from "@/types/domain";
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  Headphones,
  IndianRupee,
  Layers,
  PlusCircle,
  Sparkles,
  Ticket,
  TrendingUp,
  User,
} from "lucide-react";

interface AuthorDashboardResponse {
  success: boolean;
  author: SafeUser;
  metrics: {
    totalBooks: number;
    publishedBooks: number;
    booksInProduction: number;
    totalCopiesSold: number;
    totalRoyaltyEarned: number;
    totalRoyaltyPaid: number;
    totalRoyaltyPending: number;
    totalTickets: number;
    openTicketsCount: number;
  };
  books: BookRecord[];
  recentTickets: Array<{
    ticket_id: string;
    book_id: string | null;
    book_title: string;
    subject: string;
    status: TicketStatus;
    category: TicketCategory;
    priority: TicketPriority;
    updated_at: string;
    message_count: number;
    last_reply_by: "AUTHOR" | "ADMIN" | null;
  }>;
}

export default function AuthorDashboardPage() {
  const router = useRouter();
  const { data, isLoading, error, refresh } =
    useFastQuery<AuthorDashboardResponse>(
      "author:dashboard",
      "/api/author/dashboard",
      { pollIntervalMs: 4000 }
    );

  if (error) {
    return (
      <div className="min-h-screen bg-[#F9FAF7] flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-3xl border border-[#E8EDE6] bg-white p-8 text-center shadow-sm space-y-4">
          <AlertCircle className="w-10 h-10 text-amber-600 mx-auto" />
          <h1 className="font-serif text-2xl font-bold text-slate-900">
            Author Session Required
          </h1>
          <p className="text-sm text-slate-600">{error}</p>
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => router.push("/login")}
              className="rounded-full bg-[#0F4C3A] px-6 py-2.5 text-xs font-semibold text-white hover:bg-[#0A3B2D] transition"
            >
              Go to Login
            </button>
            <button
              onClick={refresh}
              className="rounded-full border border-slate-200 px-6 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="min-h-screen bg-[#F9FAF7] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#0F4C3A] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Loading Author Dashboard...</p>
        </div>
      </div>
    );
  }

  const { author, metrics, books, recentTickets } = data;
  const paidPercent =
    metrics.totalRoyaltyEarned > 0
      ? Math.round((metrics.totalRoyaltyPaid / metrics.totalRoyaltyEarned) * 100)
      : 0;
  const pendingPercent = 100 - paidPercent;

  return (
    <PortalShell user={author}>
      <div className="space-y-8">
        {/* ================================================================
            PAGE GREETING HEADER (Matches Screen 2: Good morning, Priya Sharma 👋)
            ================================================================ */}
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Good morning, {author.name} 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Here&apos;s your latest overview. Keep creating, we&apos;re here to support you.
          </p>
        </div>

        {/* ================================================================
            TOP ROW: 3 KPI CARDS + ROYALTY SUMMARY CARD
            ================================================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* 3 Metric Cards (Left 8 Cols) */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Card 1: Total Books */}
            <div className="bg-white rounded-2xl p-5 border border-[#E8EDE6] shadow-xs hover:shadow-sm transition flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 block mb-1">
                  Total Books
                </span>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="font-serif text-3xl font-bold text-slate-900">
                    {metrics.totalBooks}
                  </span>
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>
                  {metrics.publishedBooks} published • {metrics.booksInProduction} in production
                </span>
              </div>
            </div>

            {/* Card 2: Total Sales */}
            <div className="bg-white rounded-2xl p-5 border border-[#E8EDE6] shadow-xs hover:shadow-sm transition flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 block mb-1">
                  Total Sales
                </span>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="font-serif text-3xl font-bold text-slate-900">
                    {metrics.totalCopiesSold.toLocaleString()}
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                    +12% vs last mo
                  </span>
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Across Amazon, Flipkart & Store</span>
              </div>
            </div>

            {/* Card 3: Total Royalty Earned */}
            <div className="bg-white rounded-2xl p-5 border border-[#E8EDE6] shadow-xs hover:shadow-sm transition flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 block mb-1">
                  Total Royalty Earned
                </span>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="font-serif text-3xl font-bold text-[#0F4C3A]">
                    ₹ {metrics.totalRoyaltyEarned.toLocaleString()}
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                    +18% vs Q3
                  </span>
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>80% Net Author Share</span>
              </div>
            </div>
          </div>

          {/* Royalty Summary Card (Right 4 Cols - Matches Screen 2 Donut Card) */}
          <div className="lg:col-span-4 bg-white rounded-2xl p-5 border border-[#E8EDE6] shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif font-bold text-base text-slate-900">
                  Royalty Summary
                </h3>
                <span className="text-[11px] text-slate-400 font-medium">80/20 Plan</span>
              </div>

              {/* Amount Display */}
              <div className="mb-4">
                <span className="text-xs text-slate-500 block">Total Lifetime Earned</span>
                <span className="font-serif text-2xl font-bold text-[#0F4C3A]">
                  ₹ {metrics.totalRoyaltyEarned.toLocaleString()}
                </span>
              </div>

              {/* Progress Bar & Breakdown */}
              <div className="space-y-3">
                <div className="w-full bg-amber-100 h-2.5 rounded-full overflow-hidden flex">
                  <div
                    style={{ width: `${paidPercent}%` }}
                    className="bg-[#10B981] h-full rounded-l-full"
                  />
                  <div
                    style={{ width: `${pendingPercent}%` }}
                    className="bg-amber-400 h-full rounded-r-full"
                  />
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                    <span className="text-slate-600">Paid:</span>
                    <span className="font-semibold text-slate-900">
                      ₹ {metrics.totalRoyaltyPaid.toLocaleString()} ({paidPercent}%)
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <span className="text-slate-600">Pending:</span>
                    <span className="font-semibold text-[#0F4C3A]">
                      ₹ {metrics.totalRoyaltyPending.toLocaleString()} ({pendingPercent}%)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>Next settlement cycle: Q1 2025</span>
                <span className="font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  ₹1,000 Threshold
                </span>
              </div>
              <Link
                href="/author-dashboard?menu=Royalty%20Withdrawal"
                className="w-full py-2.5 rounded-xl bg-[#F05262] hover:bg-[#e04555] text-white text-xs font-bold transition text-center flex items-center justify-center gap-1.5 shadow-xs"
              >
                <span>Request Royalty Withdrawal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* ================================================================
            LOWER GRID: RECENT BOOKS TABLE (Left) + QUICK ACTIONS (Right)
            ================================================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Recent Books Table (Left 8 Cols - Matches Screen 2) */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-[#E8EDE6] shadow-xs p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif font-bold text-lg text-slate-900">
                Recent Books
              </h3>
              <Link
                href="/author/books"
                className="text-xs font-semibold text-[#0F4C3A] hover:text-[#0A3B2D] flex items-center gap-1 transition"
              >
                <span>View all books</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="pb-3 pl-2">Title</th>
                    <th className="pb-3">ISBN</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Sales</th>
                    <th className="pb-3 text-right">Royalty</th>
                    <th className="pb-3 text-right pr-2">Published</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {books.map((b) => {
                    const isInProduction = b.status
                      .toLowerCase()
                      .includes("in production");
                    return (
                      <tr key={b.book_id} className="hover:bg-[#F9FAF7] transition">
                        <td className="py-3.5 pl-2">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-10 rounded bg-gradient-to-br from-[#0F382C] to-[#1A6B52] text-white flex items-center justify-center font-serif text-[9px] font-bold text-center leading-none p-1 shrink-0 shadow-xs">
                              {b.title.slice(0, 8)}
                            </div>
                            <div>
                              <span className="font-semibold text-slate-900 block">
                                {b.title}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {b.genre} • {b.book_id}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 font-mono text-[11px] text-slate-600">
                          {b.isbn || "Pending"}
                        </td>
                        <td className="py-3.5">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                              isInProduction
                                ? "bg-amber-50 text-amber-800 border border-amber-200"
                                : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            }`}
                          >
                            {b.status}
                          </span>
                        </td>
                        <td className="py-3.5 text-right font-medium text-slate-900">
                          {b.total_copies_sold}
                        </td>
                        <td className="py-3.5 text-right font-semibold text-[#0F4C3A]">
                          ₹ {b.total_royalty_earned.toLocaleString()}
                        </td>
                        <td className="py-3.5 text-right pr-2 text-slate-500">
                          {b.publication_date || "In Pipeline"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Actions & Recent Tickets (Right 4 Cols - Matches Screen 2) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Quick Actions Card */}
            <div className="bg-white rounded-2xl border border-[#E8EDE6] shadow-xs p-6">
              <h3 className="font-serif font-bold text-base text-slate-900 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Link
                  href="/author/tickets/new"
                  className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:border-[#0F4C3A] hover:bg-[#F2F7F4] transition group"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#EBF3EE] text-[#0F4C3A] flex items-center justify-center shrink-0">
                    <PlusCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#0F4C3A]">
                      Create Support Ticket
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Need help with royalties, printing or sales
                    </p>
                  </div>
                </Link>

                <Link
                  href="/author/tickets"
                  className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:border-[#0F4C3A] hover:bg-[#F2F7F4] transition group"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#EBF3EE] text-[#0F4C3A] flex items-center justify-center shrink-0">
                    <Ticket className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#0F4C3A]">
                      View My Tickets
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Check status and latest team responses
                    </p>
                  </div>
                </Link>

                <Link
                  href="/author/profile"
                  className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:border-[#0F4C3A] hover:bg-[#F2F7F4] transition group"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#EBF3EE] text-[#0F4C3A] flex items-center justify-center shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#0F4C3A]">
                      Update Profile
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Manage your contact and bank details
                    </p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Active Tickets List */}
            <div className="bg-white rounded-2xl border border-[#E8EDE6] shadow-xs p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif font-bold text-base text-slate-900">
                  Support Activity
                </h3>
                <Link
                  href="/author/tickets"
                  className="text-xs font-semibold text-[#0F4C3A] hover:underline"
                >
                  All ({metrics.totalTickets})
                </Link>
              </div>

              {recentTickets.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">
                  No active support tickets.
                </p>
              ) : (
                <div className="space-y-3">
                  {recentTickets.slice(0, 3).map((t) => (
                    <Link
                      key={t.ticket_id}
                      href={`/author/tickets/${t.ticket_id}`}
                      className="block p-3 rounded-xl border border-slate-100 hover:border-[#0F4C3A] hover:bg-[#F9FAF7] transition"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-[10px] font-bold text-slate-500">
                          {t.ticket_id}
                        </span>
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded font-semibold ${
                            t.status === "Resolved"
                              ? "bg-emerald-50 text-emerald-800"
                              : t.status === "Open"
                              ? "bg-blue-50 text-blue-800"
                              : "bg-amber-50 text-amber-800"
                          }`}
                        >
                          {t.status}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-800 line-clamp-1">
                        {t.subject}
                      </p>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        {t.category}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PortalShell>
  );
}
