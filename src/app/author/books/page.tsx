"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PortalShell } from "@/components/layout/portal-shell";
import { useFastQuery } from "@/lib/client-cache";
import { BookRecord, SafeUser } from "@/types/domain";
import { BookProductionStagePipeline } from "@/components/ui/badges";
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  Filter,
  IndianRupee,
  MessageSquarePlus,
  Search,
  SlidersHorizontal,
  TrendingUp,
} from "lucide-react";

interface AuthorDashboardResponse {
  success: boolean;
  author: SafeUser;
  books: BookRecord[];
}

export default function AuthorBooksPage() {
  const router = useRouter();
  const { data, isLoading, error } = useFastQuery<AuthorDashboardResponse>(
    "author:dashboard",
    "/api/author/dashboard"
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [genreFilter, setGenreFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("newest");

  const filteredBooks = useMemo(() => {
    if (!data?.books) return [];
    let list = [...data.books];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.isbn.toLowerCase().includes(q) ||
          b.genre.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== "ALL") {
      if (statusFilter === "PUBLISHED") {
        list = list.filter((b) => !b.status.toLowerCase().includes("in production"));
      } else if (statusFilter === "IN_PRODUCTION") {
        list = list.filter((b) => b.status.toLowerCase().includes("in production"));
      }
    }

    if (genreFilter !== "ALL") {
      list = list.filter((b) => b.genre.toLowerCase() === genreFilter.toLowerCase());
    }

    list.sort((a, b) => {
      if (sortBy === "sales") return b.total_copies_sold - a.total_copies_sold;
      if (sortBy === "royalty") return b.total_royalty_earned - a.total_royalty_earned;
      return (b.publication_date || "").localeCompare(a.publication_date || "");
    });

    return list;
  }, [data?.books, searchQuery, statusFilter, genreFilter, sortBy]);

  const uniqueGenres = useMemo(() => {
    if (!data?.books) return [];
    return Array.from(new Set(data.books.map((b) => b.genre)));
  }, [data?.books]);

  if (error) {
    return (
      <div className="min-h-screen bg-[#F9FAF7] flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-3xl border border-[#E8EDE6] bg-white p-8 text-center shadow-sm">
          <AlertCircle className="w-10 h-10 text-amber-600 mx-auto mb-3" />
          <h2 className="font-serif text-xl font-bold text-slate-900 mb-2">
            Session Expired
          </h2>
          <p className="text-xs text-slate-600 mb-4">{error}</p>
          <button
            onClick={() => router.push("/login")}
            className="rounded-full bg-[#0F4C3A] px-6 py-2.5 text-xs font-semibold text-white hover:bg-[#0A3B2D]"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="min-h-screen bg-[#F9FAF7] flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-2 border-[#0F4C3A] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-medium text-slate-500">Loading Books Catalog...</p>
        </div>
      </div>
    );
  }

  const { author, books } = data;

  return (
    <PortalShell user={author}>
      <div className="space-y-6">
        {/* ================================================================
            PAGE HEADER (Matches Screen 3: My Books)
            ================================================================ */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8EDE6]">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              My Books
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Manage your books and view their details, sales and royalty information.
            </p>
          </div>
          <Link
            href="/author/tickets/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0F4C3A] hover:bg-[#0A3B2D] text-white text-xs sm:text-sm font-semibold shadow-xs transition"
          >
            <MessageSquarePlus className="w-4 h-4" />
            <span>Raise Book Ticket</span>
          </Link>
        </div>

        {/* ================================================================
            FILTER & SEARCH BAR (Matches Screen 3)
            ================================================================ */}
        <div className="bg-white rounded-2xl p-4 border border-[#E8EDE6] shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search books by title, ISBN, or genre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-[#F9FAF7] text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:border-[#0F4C3A] transition"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-[#F9FAF7] text-xs font-medium text-slate-700 focus:outline-hidden focus:border-[#0F4C3A]"
            >
              <option value="ALL">All Status</option>
              <option value="PUBLISHED">Published</option>
              <option value="IN_PRODUCTION">In Production</option>
            </select>

            <select
              value={genreFilter}
              onChange={(e) => setGenreFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-[#F9FAF7] text-xs font-medium text-slate-700 focus:outline-hidden focus:border-[#0F4C3A]"
            >
              <option value="ALL">All Genres</option>
              {uniqueGenres.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-[#F9FAF7] text-xs font-medium text-slate-700 focus:outline-hidden focus:border-[#0F4C3A]"
            >
              <option value="newest">Newest First</option>
              <option value="sales">Highest Sales</option>
              <option value="royalty">Highest Royalty</option>
            </select>
          </div>
        </div>

        {/* ================================================================
            BOOKS TABLE & PIPELINE LIST (Matches Screen 3)
            ================================================================ */}
        <div className="bg-white rounded-2xl border border-[#E8EDE6] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#F9FAF7] border-b border-[#E8EDE6] text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3.5 pl-5">Cover & Title</th>
                  <th className="py-3.5">ISBN</th>
                  <th className="py-3.5">Status</th>
                  <th className="py-3.5 text-right">Sales</th>
                  <th className="py-3.5 text-right">Royalty</th>
                  <th className="py-3.5 text-right">Published</th>
                  <th className="py-3.5 text-center pr-5">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredBooks.map((b) => {
                  const isInProduction = b.status
                    .toLowerCase()
                    .includes("in production");
                  return (
                    <React.Fragment key={b.book_id}>
                      <tr className="hover:bg-[#F9FAF7] transition">
                        <td className="py-4 pl-5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-12 rounded-lg bg-gradient-to-br from-[#0F382C] to-[#1A6B52] text-white flex items-center justify-center font-serif text-[9px] font-bold text-center leading-none p-1 shrink-0 shadow-xs">
                              {b.title.slice(0, 10)}
                            </div>
                            <div>
                              <span className="font-semibold text-slate-900 block text-sm">
                                {b.title}
                              </span>
                              <span className="text-[11px] text-slate-400">
                                {b.genre} • {b.book_id}
                                {b.mrp ? ` • MRP: ₹${b.mrp}` : " • MRP: TBA"}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 font-mono text-[11px] text-slate-600">
                          {b.isbn || "Not Assigned"}
                        </td>
                        <td className="py-4">
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
                        <td className="py-4 text-right font-medium text-slate-900">
                          {b.total_copies_sold.toLocaleString()}
                        </td>
                        <td className="py-4 text-right font-semibold text-[#0F4C3A]">
                          ₹ {b.total_royalty_earned.toLocaleString()}
                        </td>
                        <td className="py-4 text-right text-slate-500">
                          {b.publication_date || "In Pipeline"}
                        </td>
                        <td className="py-4 text-center pr-5">
                          <Link
                            href={`/author/tickets/new?book_id=${b.book_id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-[#0F4C3A] hover:bg-[#F2F7F4] text-slate-700 hover:text-[#0F4C3A] text-xs font-medium transition"
                          >
                            <MessageSquarePlus className="w-3.5 h-3.5" />
                            <span>Ask Question</span>
                          </Link>
                        </td>
                      </tr>

                      {/* If In Production: Expandable Production Pipeline Tracker */}
                      {isInProduction && (
                        <tr className="bg-amber-50/40">
                          <td colSpan={7} className="px-5 py-3 border-b border-amber-100">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                              <span className="font-semibold text-amber-900 flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                Current Production Pipeline Stage:
                              </span>
                              <span className="text-[11px] text-amber-800">
                                Manuscript received → Final Dispatch (8 Stages)
                              </span>
                            </div>
                            <div className="mt-2">
                              <BookProductionStagePipeline status={b.status} />
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PortalShell>
  );
}
