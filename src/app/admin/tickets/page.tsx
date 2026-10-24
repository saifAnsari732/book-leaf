"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { PortalShell } from "@/components/layout/portal-shell";
import { useFastQuery } from "@/lib/client-cache";
import { useTicketRealtime, RealtimeStatusBadge } from "@/lib/use-ticket-realtime";
import { useToast } from "@/context/ToastContext";
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
  Download,
  Filter,
  Layers,
  Mail,
  MessageSquare,
  RefreshCw,
  RotateCcw,
  Search,
  Ticket,
  User,
  UserCheck,
  X,
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
  const [assignee, setAssignee] = useState(searchParams.get("assignee") || "ALL");
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
  if (assignee && assignee !== "ALL") queryParams.set("assignee", assignee);
  if (debouncedSearch) queryParams.set("search", debouncedSearch);

  const queueQuery = useFastQuery<AdminQueueResponse>(
    `admin:tickets:${queryParams.toString()}`,
    `/api/admin/tickets?${queryParams.toString()}`,
    { pollIntervalMs: 4000 }
  );

  const toast = useToast();

  // Instant Real-time WebSocket / SSE Queue Synchronization
  useTicketRealtime({
    onTicketCreated: (event) => {
      if (event.payload) {
        const newTicket = event.payload as TicketRecord;
        queueQuery.mutate((prev) => {
          if (!prev) return prev;
          if (prev.tickets.some((t) => t.ticket_id === newTicket.ticket_id)) {
            return prev;
          }
          return {
            ...prev,
            total: prev.total + 1,
            tickets: [newTicket, ...prev.tickets],
          };
        });
      }
      overviewQuery.refresh();
      queueQuery.refresh();
      toast.info(
        "⚡ New Live Ticket Received",
        `#${event.ticket_id}: ${event.title || "Support Request"} from ${event.sender_name || "Author"}`
      );
    },
    onTicketUpdated: (event) => {
      queueQuery.mutate((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          tickets: prev.tickets.map((t) =>
            t.ticket_id === event.ticket_id
              ? {
                  ...t,
                  status: (event.status as TicketStatus) || t.status,
                  priority: (event.priority as TicketPriority) || t.priority,
                  category: (event.category as TicketCategory) || t.category,
                  assigned_to:
                    event.assigned_to !== undefined
                      ? event.assigned_to
                      : t.assigned_to,
                }
              : t
          ),
        };
      });
      overviewQuery.refresh();
    },
    onMessagePosted: () => {
      queueQuery.refresh();
      overviewQuery.refresh();
    },
  });

  function resetFilters() {
    setSearchInput("");
    setDebouncedSearch("");
    setStatus("ALL");
    setCategory("ALL");
    setPriority("ALL");
    setAssignee("ALL");
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
    return `${days}d ago`;
  }

  const [isBatchUpdating, setIsBatchUpdating] = useState(false);

  async function handleBatchUpdateStatus(newStatus: TicketStatus) {
    const ids = Object.keys(selectedIds).filter((id) => selectedIds[id]);
    if (!ids.length) return;
    setIsBatchUpdating(true);
    try {
      await Promise.all(
        ids.map((id) =>
          fetch(`/api/admin/tickets/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatus }),
          })
        )
      );
      toast.success(
        "Batch Update Success",
        `Updated ${ids.length} ticket${ids.length > 1 ? "s" : ""} to ${newStatus}.`
      );
      setSelectedIds({});
      queueQuery.refresh();
      overviewQuery.refresh();
    } catch {
      toast.error("Batch Update Error", "Failed to update selected tickets.");
    } finally {
      setIsBatchUpdating(false);
    }
  }

  function handleExportCsv() {
    const list = queueQuery.data?.tickets || [];
    if (!list.length) {
      toast.warning("No Data", "No tickets found to export.");
      return;
    }
    const headers = [
      "Ticket ID",
      "Priority",
      "Author Name",
      "Author Email",
      "Book Title",
      "Category",
      "Subject",
      "Status",
      "Assigned To",
      "Created At",
    ];
    const rows = list.map((t) => [
      t.ticket_id,
      t.priority,
      `"${t.author_name.replace(/"/g, '""')}"`,
      t.author_email || "",
      `"${(t.book_title || "General").replace(/"/g, '""')}"`,
      `"${t.category.replace(/"/g, '""')}"`,
      `"${t.subject.replace(/"/g, '""')}"`,
      t.status,
      t.assigned_to || "Unassigned",
      new Date(t.created_at).toISOString(),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `BookLeaf_Tickets_Report_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(
      "Export Complete",
      `Exported ${list.length} tickets to CSV format.`
    );
  }

  if (sessionQuery.error || queueQuery.error) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <AlertCircle className="w-10 h-10 text-amber-600 mx-auto mb-3" />
          <h2 className="font-serif text-xl font-bold text-slate-900 mb-2">
            Administrator Access Required
          </h2>
          <button
            onClick={() => router.push("/login")}
            className="rounded-full bg-[#0F4C3A] px-6 py-2.5 text-xs font-semibold text-white cursor-pointer"
          >
            Sign In as Admin
          </button>
        </div>
      </div>
    );
  }

  if (!sessionQuery.data || !queueQuery.data) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-2 border-[#0F4C3A] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Loading Support Operations...</p>
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
  const hasActiveFilters =
    status !== "ALL" ||
    category !== "ALL" ||
    priority !== "ALL" ||
    assignee !== "ALL" ||
    debouncedSearch.length > 0;

  return (
    <PortalShell user={admin} fullWidth>
      <div className="space-y-6 w-full animate-fade-in font-sans">
        {/* ================================================================
            PAGE HEADER: Support Operations Telemetry & Quick Sync
            ================================================================ */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-bold tracking-[0.18em] text-[#0F4C3A] uppercase block">
              BOOKLEAF SUPPORT &amp; GRIEVANCE OPERATIONS
            </span>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight">
                Support Operations
              </h1>
              <RealtimeStatusBadge />
            </div>
            <p className="text-xs sm:text-sm text-slate-500">
              Manage author inquiries, royalty claims, book production tickets &amp; grievances.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-2xs hover:shadow-xs transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export CSV</span>
            </button>
            <button
              type="button"
              onClick={() => {
                queueQuery.refresh();
                overviewQuery.refresh();
                toast.info("Refreshed", "Queue synchronized with live database.");
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0F4C3A] hover:bg-[#0A3B2D] text-white text-xs font-bold shadow-2xs hover:shadow-xs transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-emerald-300" />
              <span>Sync Tickets</span>
            </button>
          </div>
        </div>

        {/* Floating Batch Action Toolbar */}
        {Object.values(selectedIds).filter(Boolean).length > 0 && (
          <div className="sticky top-20 z-20 bg-slate-900 text-white rounded-2xl p-4 shadow-xl border border-slate-700/80 flex flex-wrap items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-emerald-500 text-white text-xs font-bold flex items-center justify-center">
                {Object.values(selectedIds).filter(Boolean).length}
              </span>
              <span className="text-xs font-semibold text-slate-200">
                Ticket{Object.values(selectedIds).filter(Boolean).length > 1 ? "s" : ""} Selected
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleBatchUpdateStatus("In Progress")}
                disabled={isBatchUpdating}
                className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/30 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Mark In Progress</span>
              </button>
              <button
                type="button"
                onClick={() => handleBatchUpdateStatus("Resolved")}
                disabled={isBatchUpdating}
                className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mark Resolved</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedIds({})}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-medium transition cursor-pointer"
              >
                Cancel Selection
              </button>
            </div>
          </div>
        )}

        {/* ================================================================
            4 TOP STATUS METRIC FILTER CARDS
            ================================================================ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Open Tickets (Sky) */}
          <div
            onClick={() => {
              setStatus("Open");
              setPriority("ALL");
            }}
            className={`bg-white rounded-2xl p-5 border transition-all cursor-pointer flex items-center justify-between group shadow-2xs hover:shadow-md ${
              status === "Open"
                ? "border-sky-500 ring-2 ring-sky-500/20 bg-sky-50/20"
                : "border-slate-200/90 hover:border-sky-300"
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center shadow-xs border border-sky-100">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-semibold text-sky-800 block">
                  Open Tickets
                </span>
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums">
                  {openCount}
                </span>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-sky-600 group-hover:translate-x-1 transition-transform" />
          </div>

          {/* Card 2: Critical (Rose) */}
          <div
            onClick={() => {
              setPriority("Critical");
              setStatus("ALL");
            }}
            className={`bg-white rounded-2xl p-5 border transition-all cursor-pointer flex items-center justify-between group shadow-2xs hover:shadow-md ${
              priority === "Critical"
                ? "border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20"
                : "border-slate-200/90 hover:border-rose-300"
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center shadow-xs border border-rose-100">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-semibold text-rose-800 block">
                  Critical Priority
                </span>
                <span className="text-3xl font-extrabold text-rose-700 tracking-tight tabular-nums">
                  {criticalCount}
                </span>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-rose-600 group-hover:translate-x-1 transition-transform" />
          </div>

          {/* Card 3: In Progress (Amber) */}
          <div
            onClick={() => {
              setStatus("In Progress");
              setPriority("ALL");
            }}
            className={`bg-white rounded-2xl p-5 border transition-all cursor-pointer flex items-center justify-between group shadow-2xs hover:shadow-md ${
              status === "In Progress"
                ? "border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/20"
                : "border-slate-200/90 hover:border-amber-300"
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center shadow-xs border border-amber-100">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-semibold text-amber-800 block">
                  In Progress
                </span>
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums">
                  {inProgressCount}
                </span>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-amber-600 group-hover:translate-x-1 transition-transform" />
          </div>

          {/* Card 4: Resolved Today (Emerald) */}
          <div
            onClick={() => {
              setStatus("Resolved");
              setPriority("ALL");
            }}
            className={`bg-white rounded-2xl p-5 border transition-all cursor-pointer flex items-center justify-between group shadow-2xs hover:shadow-md ${
              status === "Resolved"
                ? "border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/20"
                : "border-slate-200/90 hover:border-emerald-300"
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shadow-xs border border-emerald-100">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-semibold text-emerald-800 block">
                  Resolved Today
                </span>
                <span className="text-3xl font-extrabold text-emerald-700 tracking-tight tabular-nums">
                  {resolvedCount}
                </span>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-emerald-600 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* ================================================================
            TICKET QUEUE CONTAINER
            ================================================================ */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-6 sm:p-7 space-y-5">
          {/* Queue Title & Showing Counter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight inline-block relative pb-1">
                Ticket Queue
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#0F4C3A] rounded-full" />
              </h2>
              <RealtimeStatusBadge compact />
            </div>
            <span className="text-xs font-medium text-slate-400">
              Showing 1-{tickets.length} of {total} tickets
            </span>
          </div>

          {/* Quick Status Filter Tabs & Search Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1 border-b border-slate-100 pb-4">
            {/* Quick Status Tabs */}
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: "ALL", label: "All Complaints", count: total },
                { id: "Open", label: "Open", count: openCount },
                { id: "In Progress", label: "In Progress", count: inProgressCount },
                { id: "Resolved", label: "Resolved", count: resolvedCount },
                { id: "Closed", label: "Closed" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setStatus(tab.id);
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    status === tab.id
                      ? "bg-[#0F4C3A] text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        status === tab.id
                          ? "bg-white/20 text-white"
                          : "bg-white text-slate-600"
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Instant Search Bar */}
            <div className="relative w-full md:w-96 lg:w-[440px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search author, book, ref ID (#BL-...)..."
                className="w-full pl-10 pr-9 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 focus:bg-white focus:border-[#0F4C3A] focus:outline-none focus:ring-2 focus:ring-[#0F4C3A]/10 transition shadow-2xs"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => setSearchInput("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
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
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:border-slate-300 focus:outline-hidden focus:border-[#0F4C3A] cursor-pointer"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
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
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:border-slate-300 focus:outline-hidden focus:border-[#0F4C3A] cursor-pointer"
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
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:border-slate-300 focus:outline-hidden focus:border-[#0F4C3A] cursor-pointer"
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
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:border-slate-300 focus:outline-hidden focus:border-[#0F4C3A] cursor-pointer"
                >
                  <option value="30d">Last 30 days</option>
                  <option value="7d">Last 7 days</option>
                  <option value="all">All Time</option>
                </select>
              </div>

              {/* Assignment Filter */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Assignment
                </label>
                <select
                  value={assignee}
                  onChange={(e) => {
                    setAssignee(e.target.value);
                    setPage(1);
                  }}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:border-slate-300 focus:outline-hidden focus:border-[#0F4C3A] cursor-pointer"
                >
                  <option value="ALL">All Tickets</option>
                  <option value="UNASSIGNED">Unassigned Only</option>
                  <option value="ASSIGNED">Assigned Only</option>
                </select>
              </div>
            </div>

            {/* Clear Filters Link */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="text-xs font-bold text-[#0F4C3A] hover:underline cursor-pointer self-end pb-1.5 flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear Filters</span>
              </button>
            )}
          </div>

          {/* Table matching Ticket Queue requirements */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200/90 shadow-2xs w-full">
            <table className="w-full text-left text-xs min-w-[1100px]">
              <thead>
                <tr className="border-b border-slate-200/90 text-slate-500 font-bold uppercase tracking-wider text-[10px] bg-slate-50/90">
                  <th className="py-3.5 pl-4 sm:pl-3 w-10">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleSelectAll}
                      className="rounded border-slate-300 text-[#0F4C3A] focus:ring-[#0F4C3A] cursor-pointer"
                    />
                  </th>
                  <th className="py-3.5 px-3 whitespace-nowrap">Priority</th>
                  <th className="py-3.5 px-3 whitespace-nowrap">Ticket ID</th>
                  <th className="py-3.5 px-3 whitespace-nowrap min-w-[190px]">Author</th>
                  <th className="py-3.5 px-3 whitespace-nowrap min-w-[180px]">Book Title</th>
                  <th className="py-3.5 px-3 min-w-[300px]">Subject</th>
                  <th className="py-3.5 px-3 whitespace-nowrap">Category</th>
                  <th className="py-3.5 px-3 whitespace-nowrap">Status</th>
                  <th className="py-3.5 px-3 whitespace-nowrap min-w-[170px]">Assigned Admin</th>
                  <th className="py-3.5 px-3 whitespace-nowrap">Created</th>
                  <th className="py-3.5 pr-4 pl-3 text-right whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {tickets.map((t) => {
                  const isCritical = t.priority === "Critical";
                  const isChecked = Boolean(selectedIds[t.ticket_id]);
                  const age = getTicketAge(t.created_at);
                  const createdDateFormatted = new Date(t.created_at).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  });

                  // Priority pill styles
                  const priorityClass =
                    t.priority === "Critical"
                      ? "bg-rose-50 text-rose-700 border border-rose-200 font-bold"
                      : t.priority === "High"
                      ? "bg-amber-50 text-amber-800 border border-amber-200 font-bold"
                      : t.priority === "Medium"
                      ? "bg-slate-100 text-slate-700 border border-slate-200 font-bold"
                      : "bg-slate-50 text-slate-600 border border-slate-200 font-bold";

                  // Status pill styles
                  const statusClass =
                    t.status === "Open"
                      ? "bg-rose-50 text-rose-700 border border-rose-200"
                      : t.status === "In Progress"
                      ? "bg-amber-50 text-amber-800 border border-amber-200"
                      : t.status === "Resolved"
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-slate-100 text-slate-600 border border-slate-200";

                  const formattedTicketId = t.ticket_id.startsWith("BL-")
                    ? `#${t.ticket_id}`
                    : t.ticket_id.startsWith("TKT-")
                    ? `#BL-${t.ticket_id.replace("TKT-", "")}`
                    : `#BL-${t.ticket_id}`;

                  return (
                    <tr
                      key={t.ticket_id}
                      onClick={() => router.push(`/admin/tickets/${t.ticket_id}`)}
                      className={`hover:bg-slate-50/80 cursor-pointer transition-colors group ${
                        isCritical
                          ? "border-l-4 border-l-rose-500 bg-rose-50/20 hover:bg-rose-50/40"
                          : isChecked
                          ? "bg-emerald-50/30"
                          : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td
                        onClick={(e) => e.stopPropagation()}
                        className="py-3.5 pl-4 sm:pl-3 w-10"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectOne(t.ticket_id)}
                          className="rounded border-slate-300 text-[#0F4C3A] focus:ring-[#0F4C3A] cursor-pointer"
                        />
                      </td>

                      {/* Priority */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="space-y-0.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] tracking-wide inline-block ${priorityClass}`}>
                            {t.priority}
                          </span>
                          <span className="block text-[9px] font-mono text-slate-400">
                            {t.priority === "Critical" ? "4h SLA" : t.priority === "High" ? "8h SLA" : "24h SLA"}
                          </span>
                        </div>
                      </td>

                      {/* Ticket ID */}
                      <td className="py-3.5 px-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                        {formattedTicketId}
                      </td>

                      {/* Author Name & Email */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#0F4C3A] to-[#10B981] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                            {t.author_name ? t.author_name[0] : "A"}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 leading-tight">{t.author_name}</div>
                            <div className="text-[11px] text-slate-400 font-normal">
                              {t.author_email || "No email"}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Book Name */}
                      <td className="py-3.5 px-3">
                        <span className="font-semibold text-slate-800 block truncate max-w-xs xl:max-w-sm 2xl:max-w-md" title={t.book_title || "General Publishing"}>
                          {t.book_title || "General Publishing"}
                        </span>
                      </td>

                      {/* Subject */}
                      <td className="py-3.5 px-3">
                        <span className="font-bold text-slate-900 block truncate max-w-md xl:max-w-xl 2xl:max-w-3xl" title={t.subject}>
                          {t.subject}
                        </span>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-3 text-slate-600 font-medium whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold text-[11px] border border-slate-200">
                          {t.category}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap ${statusClass}`}>
                          {t.status}
                        </span>
                      </td>

                      {/* Assigned Admin */}
                      <td className="py-3.5 px-3 text-slate-700 font-medium whitespace-nowrap">
                        {t.assigned_to ? (
                          <span className="inline-flex items-center gap-1.5 text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg font-bold text-[11px] border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            {t.assigned_to}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic text-[11px] px-2 py-0.5">Unassigned</span>
                        )}
                      </td>

                      {/* Created Date */}
                      <td className="py-3.5 px-3 text-slate-600 font-mono text-[11px] whitespace-nowrap">
                        <div className="font-sans font-medium text-slate-800">{createdDateFormatted}</div>
                        <div className="text-[10px] text-slate-400 font-mono">({age})</div>
                      </td>

                      {/* View Action */}
                      <td className="py-3.5 pr-4 pl-3 text-right whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 group-hover:bg-[#0F4C3A] group-hover:text-white text-xs font-bold transition shadow-2xs">
                          <span>View &amp; Draft</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
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
                        ? "bg-[#0F4C3A] text-white shadow-xs"
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
