"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PortalShell } from "@/components/layout/portal-shell";
import { useFastQuery } from "@/lib/client-cache";
import { BookRecord, SafeUser } from "@/types/domain";
import {
  BookProductionStagePipeline,
  formatDateTime,
  formatINR,
  formatNullableINR,
} from "@/components/ui/badges";
import {
  BookOpen,
  Calendar,
  ExternalLink,
  IndianRupee,
  MessageSquarePlus,
  Printer,
  Store,
} from "lucide-react";

interface AuthorDashboardResponse {
  success: boolean;
  author: SafeUser;
  books: BookRecord[];
}

export default function AuthorBooksPage() {
  const router = useRouter();
  const { data, isLoading, isRefreshing, error, lastSyncedAt, refresh } =
    useFastQuery<AuthorDashboardResponse>(
      "author:dashboard",
      "/api/author/dashboard"
    );

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm text-red-600 mb-3">{error}</p>
        <button
          type="button"
          onClick={() => router.push("/login")}
          className="rounded-xl bg-[#1B4D7E] px-4 py-2 text-xs font-semibold text-white"
        >
          Sign In
        </button>
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="p-8 max-w-6xl mx-auto space-y-4">
        <div className="h-10 w-64 rounded animate-shimmer" />
        <div className="h-56 rounded-xl animate-shimmer" />
        <div className="h-56 rounded-xl animate-shimmer" />
      </div>
    );
  }

  const { author, books } = data;

  return (
    <PortalShell
      user={author}
      lastSyncedAt={lastSyncedAt}
      onManualRefresh={refresh}
      isRefreshing={isRefreshing}
    >
      <div className="space-y-6 animate-fade-up">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
              My Books & Royalty Ledger
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Complete publication details, ISBN assignments, active retail
              channels, and 80/20 net-profit royalty figures for{" "}
              <span className="font-semibold text-slate-900">
                {author.name}
              </span>
              .
            </p>
          </div>
          <Link
            href="/author/tickets/new"
            className="inline-flex items-center gap-2 rounded-xl bg-[#1B4D7E] px-4 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-[#163f68] transition-colors cursor-pointer"
          >
            <MessageSquarePlus className="h-4 w-4" aria-hidden="true" />
            Ask About a Book
          </Link>
        </div>

        {/* Detailed Book Cards */}
        <div className="space-y-5">
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
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs font-bold text-slate-700">
                        {book.book_id}
                      </span>
                      <span className="rounded bg-sky-50 border border-sky-200 px-2.5 py-0.5 font-mono text-xs font-semibold text-[#1B4D7E]">
                        ISBN: {book.isbn}
                      </span>
                      <span className="rounded bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                        {book.genre}
                      </span>
                    </div>
                    <h2 className="font-serif text-xl font-bold text-slate-900">
                      {book.title}
                    </h2>
                  </div>

                  <div className="flex items-center gap-3">
                    <Link
                      href={`/author/tickets/new?book_id=${book.book_id}`}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-[#1B4D7E] hover:bg-sky-50 hover:border-sky-200 transition-colors cursor-pointer"
                    >
                      <MessageSquarePlus
                        className="h-3.5 w-3.5"
                        aria-hidden="true"
                      />
                      Raise Ticket for This Book
                    </Link>
                  </div>
                </div>

                {/* Production Stage Progress Bar */}
                <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-4">
                  <BookProductionStagePipeline status={book.status} />
                </div>

                {/* Key Metrics Grid (Null-Safe) */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  <div className="rounded-xl border border-slate-200 p-3.5">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
                      MRP
                    </span>
                    <span className="text-base font-bold text-slate-900 mt-1 block">
                      {formatNullableINR(book.mrp, "TBD (In Prod)")}
                    </span>
                  </div>

                  <div className="rounded-xl border border-slate-200 p-3.5">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
                      Royalty / Copy (80%)
                    </span>
                    <span className="text-base font-bold text-slate-900 mt-1 block">
                      {book.author_royalty_per_copy !== null
                        ? `₹${book.author_royalty_per_copy}/copy`
                        : "TBD (In Prod)"}
                    </span>
                  </div>

                  <div className="rounded-xl border border-slate-200 p-3.5">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
                      Total Copies Sold
                    </span>
                    <span className="text-base font-bold text-slate-900 mt-1 block">
                      {isProduction
                        ? "Not Live Yet"
                        : book.total_copies_sold.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="rounded-xl border border-slate-200 p-3.5">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
                      Total Royalty Earned
                    </span>
                    <span className="text-base font-bold text-slate-900 mt-1 block">
                      {formatINR(book.total_royalty_earned)}
                    </span>
                  </div>

                  <div className="rounded-xl border border-slate-200 p-3.5">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
                      Royalty Paid
                    </span>
                    <span className="text-base font-bold text-emerald-700 mt-1 block">
                      {formatINR(book.royalty_paid)}
                    </span>
                  </div>

                  <div className="rounded-xl border border-sky-200 bg-sky-50/50 p-3.5">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#1B4D7E] block">
                      Royalty Pending
                    </span>
                    <span className="text-base font-bold text-[#1B4D7E] mt-1 block">
                      {formatINR(book.royalty_pending)}
                    </span>
                  </div>
                </div>

                {/* Metadata Footer: Publication Date, Print Partner, Payout Date & Channels */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-200 text-xs text-slate-600">
                  <div className="flex flex-wrap items-center gap-4">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar
                        className="h-3.5 w-3.5 text-slate-400"
                        aria-hidden="true"
                      />
                      <strong>Published:</strong>{" "}
                      {book.publication_date
                        ? formatDateTime(book.publication_date)
                        : "In Production (Not Yet Released)"}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Printer
                        className="h-3.5 w-3.5 text-slate-400"
                        aria-hidden="true"
                      />
                      <strong>Print Partner:</strong>{" "}
                      {book.print_partner ?? "Assigned at Printing Stage"}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <IndianRupee
                        className="h-3.5 w-3.5 text-slate-400"
                        aria-hidden="true"
                      />
                      <strong>Last Payout:</strong>{" "}
                      {book.last_royalty_payout_date
                        ? formatDateTime(book.last_royalty_payout_date)
                        : "No payout recorded yet"}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <Store
                      className="h-3.5 w-3.5 text-slate-400 mr-1"
                      aria-hidden="true"
                    />
                    {book.available_on.length > 0 ? (
                      book.available_on.map((platform) => (
                        <span
                          key={platform}
                          className="inline-flex items-center gap-1 rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[11px] font-medium text-emerald-800"
                        >
                          {platform}
                        </span>
                      ))
                    ) : (
                      <span className="text-amber-700 font-medium">
                        Distribution activates upon publication
                      </span>
                    )}
                  </div>
                </div>

                {belowThreshold && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                    <strong>Minimum Payout Policy Note:</strong> BookLeaf
                    disburses royalties quarterly within 45 days of quarter end
                    once accumulated royalties reach <strong>₹1,000</strong>.
                    Your current pending balance of{" "}
                    <strong>{formatINR(book.royalty_pending)}</strong> is ₹
                    {1000 - book.royalty_pending} away from the threshold and
                    will roll over automatically.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </PortalShell>
  );
}
