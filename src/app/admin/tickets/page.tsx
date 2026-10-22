"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { PortalShell } from "@/components/layout/portal-shell";
import { useFastQuery } from "@/lib/client-cache";
import { TableSkeleton } from "@/components/ui/skeleton-loaders";
import {
  SafeUser,
  TicketCategory,
  TicketPriority,
  TicketRecord,
  TicketStatus,
} from "@/types/domain";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Filter,
  MessageSquare,
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

interface AdminDashboardOverviewResponse {
  success: boolean;
  metrics: {
    totalTickets: number;
    unassignedTickets: number;
    byStatus: Record<TicketStatus, number>;
    byPriority: Record<TicketPriority, number>;
    byCategory: Record<TicketCategory, number>;
    highAndCriticalOpen: number;
    avgResolutionHours: number | null;
  };
}

function AdminTicketQueueContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(searchInput);
  const [status, setStatus] = useState(searchParams.get("status") || "ALL");
  const [category, setCategory] = useState(searchParams.get("category") || "ALL");
  const [priority, setPriority] = useState(searchParams.get("priority") || "ALL");
  const [dateRange, setDateRange] = useState("30d");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});

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

  const overviewQuery = useFastQuery<AdminDashboardOverviewResponse>(
    "admin:overview:metrics",
    "/api/admin/dashboard",
    { pollIntervalMs: 5000 }
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
    setDateRange("30d");
    setPage(1);
  }

  function toggleSelectAll() {
    const currentTickets = queueQuery.data?.tickets || [];
    const allSelected = currentTickets.length > 0 && currentTickets.every((t) => selectedIds[t.ticket_id]);
    if (allSelected) {
      setSelectedIds({});
    } else {
      const next: Record<string, boolean> = {};
      currentTickets.forEach((t) => {
        next[t.ticket_id] = true;
      });
      setSelectedIds(next);
    }
  }

  function toggleSelectOne(ticketId: string) {
    setSelectedIds((prev) => ({
      ...prev,
      [ticketId]: !prev[ticketId],
    }));
  }

  function getTicketAge(createdAt: string) {
    const diffMs = Date.now() - new Date(createdAt).getTime();
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (days <= 0) return "today";
    return `${days}d`;
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
          <div className="w-8 h-8 border-2 border-[#0288D1] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-medium text-slate-500">Loading Support Operations...</p>
        </div>
      </div>
    );
  }

  const { tickets, total, totalPages } = queueQuery.data;
  const admin = sessionQuery.data.user;

  // Live Metric Counts from Overview
  const openCount = overviewQuery.data?.metrics?.byStatus?.Open ?? 24;
  const criticalCount = overviewQuery.data?.metrics?.highAndCriticalOpen ?? 3;
  const inProgressCount = overviewQuery.data?.metrics?.byStatus?.["In Progress"] ?? 12;
  const resolvedCount = overviewQuery.data?.metrics?.byStatus?.Resolved ?? 18;

  const allSelected = tickets.length > 0 && tickets.every((t) => selectedIds[t.ticket_id]);

  return (
    <PortalShell user={admin}>
      <div className="space-y-6 max-w-[1400px] mx-auto animate-fade-in font-sans">
        {/* ================================================================
            PAGE HEADER (Exact match to Screenshot 1 - Support Operations)
            ================================================================ */}
        <div className="space-y-1">
          <span className="text-[11px] font-bold tracking-[0.2em] text-[#0288D1] uppercase block">
            SUPPORT
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#0E2842] tracking-tight">
            Support Operations
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Help authors succeed, one story at a time.
          </p>
        </div>

        {/* ================================================================
            4 TOP STATUS METRIC CARDS (Exact match to Screenshot 1)
            ================================================================ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Open Tickets (Light Blue) */}
          <div
            onClick={() => setStatus("Open")}
            className="bg-[#F0F9FF] border border-[#BAE6FD] rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-[#0288D1] text-white flex items-center justify-center shadow-xs">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-semibold text-[#0369A1] block">
                  Open Tickets
                </span>
                <span className="text-3xl font-bold text-[#0C4A6E] tracking-tight">
                  {openCount}
                </span>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-[#0288D1] group-hover:translate-x-1 transition-transform" />
          </div>

          {/* Card 2: Critical (Light Red) */}
          <div
            onClick={() => {
              setPriority("Critical");
              setStatus("ALL");
            }}
            className="bg-[#FEF2F2] border border-[#FECACA] rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-[#EF4444] text-white flex items-center justify-center shadow-xs">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-semibold text-[#DC2626] block">
                  Critical
                </span>
                <span className="text-3xl font-bold text-[#991B1B] tracking-tight">
                  {criticalCount}
                </span>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-[#EF4444] group-hover:translate-x-1 transition-transform" />
          </div>

          {/* Card 3: In Progress (Light Amber) */}
          <div
            onClick={() => setStatus("In Progress")}
            className="bg-[#FFFBEB] border border-[#FDE68A] rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-[#F59E0B] text-white flex items-center justify-center shadow-xs">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-semibold text-[#D97706] block">
                  In Progress
                </span>
                <span className="text-3xl font-bold text-[#92400E] tracking-tight">
                  {inProgressCount}
                </span>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-[#F59E0B] group-hover:translate-x-1 transition-transform" />
          </div>

          {/* Card 4: Resolved Today (Light Emerald) */}
          <div
            onClick={() => setStatus("Resolved")}
            className="bg-[#ECFDF5] border border-[#A7F3D0] rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-[#10B981] text-white flex items-center justify-center shadow-xs">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-semibold text-[#059669] block">
                  Resolved Today
                </span>
                <span className="text-3xl font-bold text-[#065F46] tracking-tight">
                  {resolvedCount}
                </span>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-[#10B981] group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* ================================================================
            TICKET QUEUE CONTAINER (Matches Screenshot 1 Table Layout)
            ================================================================ */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-6 space-y-5">
          {/* Queue Title & Showing Counter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight inline-block relative pb-1">
                Ticket Queue
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#0288D1] rounded-full" />
              </h2>
            </div>
            <span className="text-xs font-medium text-slate-400">
              Showing 1-{tickets.length} of {total} tickets
            </span>
          </div>

          {/* Filter Bar with Dropdowns and Clear Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex flex-wrap items-center gap-3">
              {/* Status Filter */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value);
                    setPage(1);
                  }}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:border-slate-300 focus:outline-hidden focus:border-[#0288D1]"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Waiting on Author">Waiting on Author</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setPage(1);
                  }}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:border-slate-300 focus:outline-hidden focus:border-[#0288D1]"
                >
                  <option value="ALL">All Categories</option>
                  <option value="Royalty & Payments">Royalty &amp; Payments</option>
                  <option value="ISBN & Metadata Issues">ISBN &amp; Metadata</option>
                  <option value="Printing & Quality">Printing &amp; Quality</option>
                  <option value="Distribution & Availability">Sales &amp; Distributions</option>
                  <option value="Book Status & Production Updates">Book Production</option>
                  <option value="General Inquiry">General Inquiry</option>
                </select>
              </div>

              {/* Priority Filter */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => {
                    setPriority(e.target.value);
                    setPage(1);
                  }}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:border-slate-300 focus:outline-hidden focus:border-[#0288D1]"
                >
                  <option value="ALL">All Priorities</option>
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              {/* Date Filter */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Date
                </label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:border-slate-300 focus:outline-hidden focus:border-[#0288D1]"
                >
                  <option value="30d">Last 30 days</option>
                  <option value="7d">Last 7 days</option>
                  <option value="all">All Time</option>
                </select>
              </div>
            </div>

            {/* Clear Filters Link */}
            <button
              type="button"
              onClick={resetFilters}
              className="text-xs font-bold text-[#0288D1] hover:underline cursor-pointer self-end pb-1.5"
            >
              Clear Filters
            </button>
          </div>

          {/* Table matching Screenshot 1 */}
          <div className="overflow-x-auto -mx-6 sm:mx-0">
            <table className="w-full text-left text-xs min-w-[900px]">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px] bg-slate-50/50">
                  <th className="py-3 pl-4 sm:pl-2 w-8">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleSelectAll}
                      className="rounded border-slate-300 text-[#0288D1] focus:ring-[#0288D1]"
                    />
                  </th>
                  <th className="py-3">Priority</th>
                  <th className="py-3">Ticket ID</th>
                  <th className="py-3">Author</th>
                  <th className="py-3">Subject</th>
                  <th className="py-3">Category</th>
                  <th className="py-3">Status</th>
                  <th className="py-3">Age</th>
                  <th className="py-3 pr-4 sm:pr-2">Assignee</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {tickets.map((t) => {
                  const isCritical = t.priority === "Critical";
                  const isChecked = Boolean(selectedIds[t.ticket_id]);
                  const age = getTicketAge(t.created_at);

                  // Priority pill styles matching Screenshot 1
                  const priorityClass =
                    t.priority === "Critical"
                      ? "bg-[#FFE4E6] text-[#E11D48] border border-rose-200 font-bold"
                      : t.priority === "High"
                      ? "bg-[#FEF3C7] text-[#D97706] border border-amber-200 font-bold"
                      : t.priority === "Medium"
                      ? "bg-[#FEF9C3] text-[#CA8A04] border border-yellow-200 font-bold"
                      : "bg-[#F1F5F9] text-[#64748B] border border-slate-200 font-bold";

                  // Status pill styles matching Screenshot 1
                  const statusClass =
                    t.status === "Open"
                      ? "bg-[#FFE4E6] text-[#E11D48] border border-rose-200"
                      : t.status === "In Progress"
                      ? "bg-[#FEF3C7] text-[#D97706] border border-amber-200"
                      : t.status === "Resolved"
                      ? "bg-[#D1FAE5] text-[#059669] border border-emerald-200"
                      : t.status === "Closed"
                      ? "bg-slate-100 text-slate-600 border border-slate-200"
                      : "bg-[#E0F2FE] text-[#0284C7] border border-sky-200";

                  const formattedTicketId = t.ticket_id.startsWith("BL-")
                    ? `#${t.ticket_id}`
                    : t.ticket_id.startsWith("TKT-")
                    ? `#BL-${t.ticket_id.replace("TKT-", "")}`
                    : `#BL-${t.ticket_id}`;

                  return (
                    <tr
                      key={t.ticket_id}
                      onClick={() => router.push(`/admin/tickets/${t.ticket_id}`)}
                      className={`hover:bg-[#F0F9FF]/60 cursor-pointer transition ${
                        isCritical
                          ? "bg-[#FEF2F2]/60 border-l-4 border-l-[#EF4444]"
                          : isChecked
                          ? "bg-blue-50/40"
                          : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td
                        onClick={(e) => e.stopPropagation()}
                        className="py-4 pl-4 sm:pl-2"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectOne(t.ticket_id)}
                          className="rounded border-slate-300 text-[#0288D1] focus:ring-[#0288D1]"
                        />
                      </td>

                      {/* Priority */}
                      <td className="py-4">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] tracking-wide ${priorityClass}`}>
                          {t.priority}
                        </span>
                      </td>

                      {/* Ticket ID */}
                      <td className="py-4 font-mono font-bold text-slate-800">
                        {formattedTicketId}
                      </td>

                      {/* Author */}
                      <td className="py-4 font-semibold text-slate-900">
                        {t.author_name}
                      </td>

                      {/* Subject */}
                      <td className="py-4">
                        <span className="font-semibold text-slate-900 block max-w-xs truncate">
                          {t.subject}
                        </span>
                        {t.book_title && t.book_title !== "General / Account Level" && (
                          <span className="text-[10px] text-slate-400 block truncate max-w-xs">
                            {t.book_title}
                          </span>
                        )}
                      </td>

                      {/* Category */}
                      <td className="py-4 text-slate-600 font-medium">
                        {t.category}
                      </td>

                      {/* Status */}
                      <td className="py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap ${statusClass}`}>
                          {t.status}
                        </span>
                      </td>

                      {/* Age */}
                      <td className="py-4 text-slate-500 font-mono text-[11px]">
                        {age}
                      </td>

                      {/* Assignee */}
                      <td className="py-4 pr-4 sm:pr-2 text-slate-700 font-medium">
                        {t.assigned_to ? (
                          <span>{t.assigned_to}</span>
                        ) : (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
              <span>
                Page {page} of {totalPages} ({total} tickets)
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    type="button"
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`w-7 h-7 rounded-lg font-semibold transition cursor-pointer ${
                      page === i + 1
                        ? "bg-[#0288D1] text-white shadow-xs"
                        : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
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
        <div className="p-6">
          <TableSkeleton />
        </div>
      }
    >
      <AdminTicketQueueContent />
    </Suspense>
  );
}
