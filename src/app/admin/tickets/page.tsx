"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { PortalShell } from "@/components/layout/portal-shell";
import { invalidateClientCache, useFastQuery } from "@/lib/client-cache";
import {
  SafeUser,
  TicketCategory,
  TicketPriority,
  TicketRecord,
  TicketStatus,
} from "@/types/domain";
import {
  AlertCircle,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Filter,
  RotateCcw,
  Search,
  Sparkles,
  Ticket,
  UserCheck,
} from "lucide-react";

interface AdminQueueResponse {
  success: boolean;
  tickets: TicketRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

function AdminTicketQueueContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(searchInput);
  const [status, setStatus] = useState(searchParams.get("status") || "ALL");
  const [category, setCategory] = useState(searchParams.get("category") || "ALL");
  const [priority, setPriority] = useState(searchParams.get("priority") || "ALL");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1);
    }, 250);
    return () => clearTimeout(t);
  }, [searchInput]);

  const sessionQuery = useFastQuery<{ success: boolean; user: SafeUser }>(
    "auth:session",
    "/api/auth/session"
  );

  const queryParams = new URLSearchParams({
    status,
    category,
    priority,
    sortBy: "urgent",
    page: String(page),
    limit: "10",
  });
  if (debouncedSearch) queryParams.set("search", debouncedSearch);

  const queueQuery = useFastQuery<AdminQueueResponse>(
    `admin:tickets:${queryParams.toString()}`,
    `/api/admin/tickets?${queryParams.toString()}`,
    { pollIntervalMs: 4000 }
  );

  function resetFilters() {
    setSearchInput("");
    setDebouncedSearch("");
    setStatus("ALL");
    setCategory("ALL");
    setPriority("ALL");
    setPage(1);
  }

  if (sessionQuery.error || queueQuery.error) {
    return (
      <div className="min-h-screen bg-[#F9FAF7] flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-3xl border border-[#E8EDE6] bg-white p-8 text-center shadow-sm">
          <AlertCircle className="w-10 h-10 text-amber-600 mx-auto mb-3" />
          <h2 className="font-serif text-xl font-bold text-slate-900 mb-2">
            Administrator Access Required
          </h2>
          <button
            onClick={() => router.push("/login")}
            className="rounded-full bg-[#0F4C3A] px-6 py-2.5 text-xs font-semibold text-white"
          >
            Sign In as Admin
          </button>
        </div>
      </div>
    );
  }

  if (!sessionQuery.data || !queueQuery.data) {
    return (
      <div className="min-h-screen bg-[#F9FAF7] flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-2 border-[#0F4C3A] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-medium text-slate-500">Loading Tickets Queue...</p>
        </div>
      </div>
    );
  }

  const { tickets, total, totalPages } = queueQuery.data;
  const admin = sessionQuery.data.user;

  return (
    <PortalShell user={admin}>
      <div className="space-y-6">
        {/* ================================================================
            PAGE HEADER (Matches Screen 8: Ticket Queue)
            ================================================================ */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8EDE6]">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Ticket Queue
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Manage and assign support tickets to your team with AI triage assistance.
            </p>
          </div>
          <span className="text-xs font-semibold text-[#0F4C3A] bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
            {total} Active Tickets
          </span>
        </div>

        {/* ================================================================
            FILTER & SEARCH BAR (Matches Screen 8)
            ================================================================ */}
        <div className="bg-white rounded-2xl p-4 border border-[#E8EDE6] shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by ID, subject, author, or book..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-[#F9FAF7] text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:border-[#0F4C3A]"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-[#F9FAF7] text-xs font-medium text-slate-700 focus:outline-hidden focus:border-[#0F4C3A]"
            >
              <option value="ALL">All Status</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>

            <select
              value={priority}
              onChange={(e) => {
                setPriority(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-[#F9FAF7] text-xs font-medium text-slate-700 focus:outline-hidden focus:border-[#0F4C3A]"
            >
              <option value="ALL">All Priority</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-[#F9FAF7] text-xs font-medium text-slate-700 focus:outline-hidden focus:border-[#0F4C3A]"
            >
              <option value="ALL">All Categories</option>
              <option value="Royalty & Payments">Royalty & Payments</option>
              <option value="ISBN & Metadata Issues">ISBN & Metadata</option>
              <option value="Printing & Quality">Printing & Quality</option>
              <option value="Distribution & Availability">Distribution</option>
              <option value="Book Status & Production Updates">Book Status</option>
              <option value="General Inquiry">General Inquiry</option>
            </select>

            <button
              onClick={resetFilters}
              title="Reset Filters"
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ================================================================
            QUEUE TABLE (Matches Screen 8)
            ================================================================ */}
        <div className="bg-white rounded-2xl border border-[#E8EDE6] shadow-xs overflow-hidden">
          {tickets.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs">
              No tickets matched the active filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#F9FAF7] border-b border-[#E8EDE6] text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="py-3.5 pl-5">Ticket ID</th>
                    <th className="py-3.5">Subject</th>
                    <th className="py-3.5">Author</th>
                    <th className="py-3.5">Category</th>
                    <th className="py-3.5">Priority</th>
                    <th className="py-3.5">Status</th>
                    <th className="py-3.5">Assigned To</th>
                    <th className="py-3.5 text-right pr-5">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {tickets.map((t) => (
                    <tr
                      key={t.ticket_id}
                      onClick={() => router.push(`/admin/tickets/${t.ticket_id}`)}
                      className="hover:bg-[#F9FAF7] cursor-pointer transition"
                    >
                      <td className="py-4 pl-5 font-mono font-bold text-[#0F4C3A]">
                        #{t.ticket_id}
                      </td>

                      <td className="py-4">
                        <span className="font-semibold text-slate-900 block text-sm max-w-xs truncate">
                          {t.subject}
                        </span>
                        <span className="text-[11px] text-slate-400 truncate block max-w-xs">
                          {t.book_title}
                        </span>
                      </td>

                      <td className="py-4">
                        <span className="font-medium text-slate-900 block">{t.author_name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{t.author_id}</span>
                      </td>

                      <td className="py-4 text-slate-600 font-medium">{t.category}</td>

                      <td className="py-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            t.priority === "Critical"
                              ? "bg-rose-50 text-rose-800 border border-rose-200"
                              : t.priority === "High"
                              ? "bg-amber-50 text-amber-800 border border-amber-200"
                              : t.priority === "Medium"
                              ? "bg-blue-50 text-blue-800 border border-blue-200"
                              : "bg-slate-100 text-slate-600 border border-slate-200"
                          }`}
                        >
                          {t.priority}
                        </span>
                      </td>

                      <td className="py-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                            t.status === "Resolved"
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : t.status === "In Progress"
                              ? "bg-blue-50 text-blue-800 border border-blue-200"
                              : t.status === "Closed"
                              ? "bg-slate-100 text-slate-600 border border-slate-200"
                              : "bg-amber-50 text-amber-800 border border-amber-200"
                          }`}
                        >
                          {t.status}
                        </span>
                      </td>

                      <td className="py-4 text-slate-600">
                        {t.assigned_to || (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </td>

                      <td className="py-4 text-right pr-5">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#0F4C3A] hover:underline">
                          <span>Triage</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls (Matches Screen 8) */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-[#E8EDE6] bg-[#F9FAF7] flex items-center justify-between text-xs text-slate-600">
              <span>
                Page {page} of {totalPages} ({total} tickets)
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`w-7 h-7 rounded-lg font-semibold transition ${
                      page === i + 1
                        ? "bg-[#0F4C3A] text-white"
                        : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-40"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </PortalShell>
  );
}

export default function AdminTicketQueuePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F9FAF7] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#0F4C3A] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <AdminTicketQueueContent />
    </Suspense>
  );
}
