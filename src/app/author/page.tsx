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
  BookProductionStagePipeline,
  formatDateTime,
  formatINR,
  formatNullableINR,
  formatRelativeTime,
  TicketCategoryBadge,
  TicketPriorityBadge,
  TicketStatusBadge,
} from "@/components/ui/badges";
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  IndianRupee,
  Layers,
  PlusCircle,
  Sparkles,
  Ticket,
  TrendingUp,
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
  const { data, isLoading, isRefreshing, error, lastSyncedAt, refresh } =
    useFastQuery<AuthorDashboardResponse>(
      "author:dashboard",
      "/api/author/dashboard",
      { pollIntervalMs: 4000 }
    );

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm space-y-4">
          <AlertCircle
            className="h-10 w-10 text-amber-600 mx-auto"
            aria-hidden="true"
          />
          <h1 className="font-serif text-xl font-bold text-slate-900">
            Author Session Required
          </h1>
          <p className="text-sm text-slate-600">{error}</p>
          <div className="flex justify-center gap-3">
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="rounded-xl bg-[#1B4D7E] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#163f68] cursor-pointer"
            >
              Go to Login
            </button>
            <button
              type="button"
              onClick={refresh}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
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
      <div className="min-h-screen bg-slate-50 p-8 max-w-6xl mx-auto space-y-6">
        <div className="h-10 w-64 rounded-lg animate-shimmer" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-xl animate-shimmer" />
          ))}
        </div>
        <div className="h-64 rounded-xl animate-shimmer" />
      </div>
    );
  }

  const { author, metrics, books, recentTickets } = data;

  return (
    <PortalShell
      user={author}
      lastSyncedAt={lastSyncedAt}
      onManualRefresh={refresh}
      isRefreshing={isRefreshing}
    >
      <div className="space-y-8 animate-fade-up">
        {/* Welcome Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#1B4D7E]">
              <span>Author Partner Workspace</span>
              <span>•</span>
              <span className="font-mono">{author.author_id}</span>
              {author.city && (
                <>
                  <span>•</span>
                  <span>{author.city}</span>
                </>
              )}
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              Welcome back, {author.name}
            </h1>
            <p className="text-sm text-slate-600 mt-0.5">
              Track your published books, quarterly royalty balances, and live
              support conversations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/author/books"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <BookOpen className="h-4 w-4 text-[#1B4D7E]" aria-hidden="true" />
              My Books ({metrics.totalBooks})
            </Link>
            <Link
              href="/author/tickets/new"
              className="inline-flex items-center gap-2 rounded-xl bg-[#1B4D7E] px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-[#163f68] transition-all cursor-pointer"
            >
              <PlusCircle className="h-4 w-4" aria-hidden="true" />
              Raise Support Ticket
            </Link>
          </div>
        </div>

        {/* Key Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500">
              <span>Catalog Status</span>
              <BookOpen className="h-4 w-4 text-[#1B4D7E]" aria-hidden="true" />
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-2">
              {metrics.totalBooks}{" "}
              <span className="text-sm font-normal text-slate-500">
                {metrics.totalBooks === 1 ? "Book" : "Books"}
              </span>
            </p>
            <div className="mt-2 flex items-center gap-2 text-xs">
              <span className="text-emerald-700 font-medium">
                {metrics.publishedBooks} Live
              </span>
              {metrics.booksInProduction > 0 && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="text-amber-700 font-medium">
                    {metrics.booksInProduction} In Production
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500">
              <span>Total Copies Sold</span>
              <TrendingUp
                className="h-4 w-4 text-emerald-600"
                aria-hidden="true"
              />
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-2">
              {metrics.totalCopiesSold.toLocaleString("en-IN")}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Recorded across active retail channels
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500">
              <span>Royalty Pending</span>
              <IndianRupee
                className="h-4 w-4 text-amber-600"
                aria-hidden="true"
              />
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-2">
              {formatINR(metrics.totalRoyaltyPending)}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Earned: {formatINR(metrics.totalRoyaltyEarned)} • Paid:{" "}
              {formatINR(metrics.totalRoyaltyPaid)}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500">
              <span>Support Tickets</span>
              <Ticket className="h-4 w-4 text-sky-600" aria-hidden="true" />
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-2">
              {metrics.openTicketsCount}{" "}
              <span className="text-sm font-normal text-slate-500">Active</span>
            </p>
            <p className="mt-2 text-xs text-slate-500">
              {metrics.totalTickets} total ticket(s) submitted
            </p>
          </div>
        </div>

        {/* Author Books Snapshot */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-lg font-bold text-slate-900">
                Your Published & In-Production Books
              </h2>
              <p className="text-xs text-slate-500">
                80/20 Net Profit Split • Minimum Quarterly Payout Threshold:
                ₹1,000
              </p>
            </div>
            <Link
              href="/author/books"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#1B4D7E] hover:underline"
            >
              View Full Royalty Breakdown
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {books.map((book) => {
              const isProduction = book.status
                .toLowerCase()
                .includes("in production");
              const belowThreshold =
                !isProduction &&
                book.royalty_pending > 0 &&
                book.royalty_pending < 1000;

              return (
                <div
                  key={book.book_id}
                  className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 flex flex-col justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-mono text-[11px] font-semibold text-slate-500">
                          {book.book_id} • ISBN: {book.isbn}
                        </span>
                        <h3 className="text-base font-bold text-slate-900">
                          {book.title}
                        </h3>
                        <p className="text-xs text-slate-600">{book.genre}</p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                          isProduction
                            ? "bg-amber-50 text-amber-800 border-amber-200"
                            : "bg-emerald-50 text-emerald-800 border-emerald-200"
                        }`}
                      >
                        {book.status}
                      </span>
                    </div>

                    <BookProductionStagePipeline status={book.status} />
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-200/80 text-xs">
                    <div>
                      <span className="text-slate-500 block">MRP / Copy</span>
                      <span className="font-semibold text-slate-900">
                        {formatNullableINR(book.mrp, "TBD")}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Copies Sold</span>
                      <span className="font-semibold text-slate-900">
                        {isProduction
                          ? "Not live yet"
                          : book.total_copies_sold.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">
                        Pending Royalty
                      </span>
                      <span
                        className={`font-bold ${
                          book.royalty_pending >= 1000
                            ? "text-emerald-700"
                            : "text-slate-900"
                        }`}
                      >
                        {formatINR(book.royalty_pending)}
                      </span>
                    </div>
                  </div>

                  {belowThreshold && (
                    <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-[11px] text-amber-900">
                      <strong>Rollover Notice:</strong> Pending balance (
                      {formatINR(book.royalty_pending)}) is below the ₹1,000
                      minimum quarterly payout threshold and will roll over to
                      the next quarter.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Support Tickets */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-lg font-bold text-slate-900">
                Recent Support Queries
              </h2>
              <p className="text-xs text-slate-500">
                Updates automatically in real time as BookLeaf Operations
                responds
              </p>
            </div>
            <Link
              href="/author/tickets"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#1B4D7E] hover:underline"
            >
              View All Tickets
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>

          {recentTickets.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center space-y-3">
              <Sparkles
                className="h-8 w-8 text-[#1B4D7E] mx-auto"
                aria-hidden="true"
              />
              <h3 className="text-sm font-bold text-slate-900">
                No Support Queries Yet
              </h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                Have a question about your quarterly royalties, ISBN mapping,
                print quality, or book production status? Raise a support ticket
                and our team will assist you.
              </p>
              <Link
                href="/author/tickets/new"
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#1B4D7E] px-4 py-2 text-xs font-semibold text-white hover:bg-[#163f68]"
              >
                <PlusCircle className="h-4 w-4" aria-hidden="true" />
                Submit Your First Query
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden">
              {recentTickets.map((t) => (
                <Link
                  key={t.ticket_id}
                  href={`/author/tickets/${t.ticket_id}`}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white hover:bg-sky-50/40 transition-colors cursor-pointer"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#1B4D7E]">
                        {t.ticket_id}
                      </span>
                      <TicketStatusBadge status={t.status} />
                      <TicketCategoryBadge category={t.category} />
                      {t.last_reply_by === "ADMIN" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                          <CheckCircle2
                            className="h-3 w-3"
                            aria-hidden="true"
                          />
                          Support Replied
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {t.subject}
                    </p>
                    <p className="text-xs text-slate-500">
                      Book: <span className="font-medium">{t.book_title}</span>{" "}
                      • {t.message_count} message(s)
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 text-xs text-slate-500">
                    <TicketPriorityBadge priority={t.priority} />
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                      {formatRelativeTime(t.updated_at)}
                    </span>
                    <ArrowRight
                      className="h-4 w-4 text-slate-400"
                      aria-hidden="true"
                    />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </PortalShell>
  );
}
