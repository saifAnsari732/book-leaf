"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { PortalShell } from "@/components/layout/portal-shell";
import { invalidateClientCache, useFastQuery } from "@/lib/client-cache";
import {
  SafeUser,
  TICKET_CATEGORIES,
  TICKET_PRIORITIES,
  TICKET_STATUSES,
  TicketRecord,
} from "@/types/domain";
import {
  formatDateTime,
  formatRelativeTime,
  TicketCategoryBadge,
  TicketPriorityBadge,
  TicketStatusBadge,
} from "@/components/ui/badges";
import {
  ArrowRight,
  Filter,
  RotateCcw,
  Search,
  Sparkles,
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

  const [searchInput, setSearchInput] = useState(
    searchParams.get("search") || ""
  );
  const [debouncedSearch, setDebouncedSearch] = useState(searchInput);
  const [status, setStatus] = useState(searchParams.get("status") || "ALL");
  const [category, setCategory] = useState(
    searchParams.get("category") || "ALL"
  );
  const [priority, setPriority] = useState(
    searchParams.get("priority") || "ALL"
  );
  const [assignee, setAssignee] = useState(
    searchParams.get("assignee") || "ALL"
  );
  const [dateFrom, setDateFrom] = useState(
    searchParams.get("dateFrom") || ""
  );
  const [dateTo, setDateTo] = useState(searchParams.get("dateTo") || "");
  const [sortBy, setSortBy] = useState<"urgent" | "newest" | "oldest">(
    "urgent"
  );
  const [page, setPage] = useState(1);
  const [assigningId, setAssigningId] = useState<string | null>(null);

  // Debounce search input (250ms)
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
    assignee,
    sortBy,
    page: String(page),
    limit: "10",
  });
  if (debouncedSearch) queryParams.set("search", debouncedSearch);
  if (dateFrom) queryParams.set("dateFrom", dateFrom);
  if (dateTo) queryParams.set("dateTo", dateTo);

  const queryKey = `admin:tickets:${queryParams.toString()}`;
  const queueQuery = useFastQuery<AdminQueueResponse>(
    queryKey,
    `/api/admin/tickets?${queryParams.toString()}`,
    { pollIntervalMs: 4000 }
  );

  async function handleAssignToSelf(e: React.MouseEvent, ticketId: string) {
    e.preventDefault();
    e.stopPropagation();
    setAssigningId(ticketId);
    try {
      const res = await fetch(`/api/admin/tickets/${ticketId}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        invalidateClientCache("admin:");
        queueQuery.refresh();
      }
    } finally {
      setAssigningId(null);
    }
  }

  function resetAllFilters() {
    setSearchInput("");
    setDebouncedSearch("");
    setStatus("ALL");
    setCategory("ALL");
    setPriority("ALL");
    setAssignee("ALL");
    setDateFrom("");
    setDateTo("");
    setSortBy("urgent");
    setPage(1);
  }

  if (sessionQuery.error || queueQuery.error) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm text-red-600 mb-3">
          {queueQuery.error || sessionQuery.error}
        </p>
        <button
          type="button"
          onClick={() => router.push("/login")}
          className="rounded-xl bg-[#0E2842] px-4 py-2 text-xs font-semibold text-white"
        >
          Sign In as Admin
        </button>
      </div>
    );
  }

  if (sessionQuery.isLoading || !sessionQuery.data) {
    return (
      <div className="p-8 max-w-6xl mx-auto space-y-4">
        <div className="h-10 w-64 rounded animate-shimmer" />
        <div className="h-24 rounded-xl animate-shimmer" />
        <div className="h-96 rounded-xl animate-shimmer" />
      </div>
    );
  }

  const tickets = queueQuery.data?.tickets || [];
  const total = queueQuery.data?.total || 0;
  const totalPages = queueQuery.data?.totalPages || 1;

  return (
    <PortalShell
      user={sessionQuery.data.user}
      lastSyncedAt={queueQuery.lastSyncedAt}
      onManualRefresh={queueQuery.refresh}
      isRefreshing={queueQuery.isRefreshing}
    >
      <div className="space-y-6 animate-fade-up">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
              Incoming Author Ticket Queue
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Filter by status, AI category, priority, assignee, or date. Urgent
              and oldest unresolved queries are highlighted first.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <span className="rounded-lg bg-white border border-slate-200 px-3 py-1.5">
              Showing {tickets.length} of {total} ticket(s)
            </span>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Search Input */}
            <div className="md:col-span-5 relative">
              <Search
                className="h-4 w-4 text-slate-400 absolute left-3.5 top-3"
                aria-hidden="true"
              />
              <input
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by Ticket ID, Subject, Author, or Book..."
                aria-label="Search tickets"
                className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-900 focus:border-[#1B4D7E] focus:outline-none"
              />
            </div>

            {/* Status Filter */}
            <div className="md:col-span-2">
              <select
                aria-label="Filter by status"
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm text-slate-800"
              >
                <option value="ALL">All Statuses</option>
                {TICKET_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    Status: {st}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority Filter */}
            <div className="md:col-span-2">
              <select
                aria-label="Filter by priority"
                value={priority}
                onChange={(e) => {
                  setPriority(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm text-slate-800"
              >
                <option value="ALL">All Priorities</option>
                {TICKET_PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    Priority: {p}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div className="md:col-span-3">
              <select
                aria-label="Filter by category"
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm text-slate-800"
              >
                <option value="ALL">All 6 AI Categories</option>
                {TICKET_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1 font-semibold text-slate-600">
                <Filter className="h-3.5 w-3.5" aria-hidden="true" />
                Queue Controls:
              </span>

              <select
                aria-label="Filter by assignee"
                value={assignee}
                onChange={(e) => {
                  setAssignee(e.target.value);
                  setPage(1);
                }}
                className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-700"
              >
                <option value="ALL">All Assignees</option>
                <option value="UNASSIGNED">Unassigned Only</option>
                <option value={sessionQuery.data.user.name}>
                  Assigned to Me
                </option>
              </select>

              <select
                aria-label="Sort tickets"
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as "urgent" | "newest" | "oldest")
                }
                className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-700"
              >
                <option value="urgent">
                  Sort: Most Urgent & Oldest Unresolved
                </option>
                <option value="newest">Sort: Newest Created First</option>
                <option value="oldest">Sort: Oldest Created First</option>
              </select>

              <div className="flex items-center gap-1.5">
                <span className="text-slate-500">From:</span>
                <input
                  type="date"
                  aria-label="Date from"
                  value={dateFrom}
                  onChange={(e) => {
                    setDateFrom(e.target.value);
                    setPage(1);
                  }}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs"
                />
                <span className="text-slate-500">To:</span>
                <input
                  type="date"
                  aria-label="Date to"
                  value={dateTo}
                  onChange={(e) => {
                    setDateTo(e.target.value);
                    setPage(1);
                  }}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={resetAllFilters}
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              Reset Filters
            </button>
          </div>
        </div>

        {/* Ticket Queue Table / Cards */}
        {queueQuery.isLoading && !queueQuery.data ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 rounded-xl animate-shimmer" />
            ))}
          </div>
        ) : tickets.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center space-y-3">
            <p className="text-base font-bold text-slate-900">
              No tickets match your active filters
            </p>
            <p className="text-xs text-slate-500">
              Try clearing your search query or resetting the category/priority
              filters.
            </p>
            <button
              type="button"
              onClick={resetAllFilters}
              className="rounded-xl bg-[#1B4D7E] px-4 py-2 text-xs font-semibold text-white cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.map((t) => {
              const isUrgentUnresolved =
                (t.priority === "Critical" || t.priority === "High") &&
                (t.status === "Open" || t.status === "In Progress");

              return (
                <Link
                  key={t.ticket_id}
                  href={`/admin/tickets/${t.ticket_id}`}
                  className={`block rounded-2xl border p-5 transition-all cursor-pointer ${
                    isUrgentUnresolved
                      ? "border-red-200 bg-white hover:border-red-300 shadow-sm"
                      : "border-slate-200 bg-white hover:border-sky-300 shadow-sm"
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#1B4D7E]">
                          {t.ticket_id}
                        </span>
                        <TicketPriorityBadge priority={t.priority} />
                        <TicketStatusBadge status={t.status} />
                        <TicketCategoryBadge category={t.category} />
                        <span className="inline-flex items-center gap-1 rounded bg-sky-50 border border-sky-200 px-2 py-0.5 text-[10px] font-semibold text-[#1B4D7E]">
                          <Sparkles className="h-3 w-3" aria-hidden="true" />
                          {t.ai_metadata.human_overridden
                            ? "Admin Overridden"
                            : `AI Classified (${t.ai_metadata.status})`}
                        </span>
                      </div>

                      <h2 className="text-base font-bold text-slate-900">
                        {t.subject}
                      </h2>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                        <span>
                          Author:{" "}
                          <strong className="text-slate-900">
                            {t.author_name}
                          </strong>{" "}
                          ({t.author_id})
                        </span>
                        <span>•</span>
                        <span>
                          Book:{" "}
                          <strong className="text-slate-900">
                            {t.book_title}
                          </strong>
                        </span>
                        <span>•</span>
                        <span>Created: {formatDateTime(t.created_at)}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between lg:justify-end gap-3 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100">
                      {t.assigned_to ? (
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-700">
                          <UserCheck
                            className="h-3.5 w-3.5 text-emerald-600"
                            aria-hidden="true"
                          />
                          {t.assigned_to}
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => handleAssignToSelf(e, t.ticket_id)}
                          disabled={assigningId === t.ticket_id}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1.5 text-xs font-semibold text-amber-900 hover:bg-amber-100 transition-colors cursor-pointer"
                        >
                          {assigningId === t.ticket_id
                            ? "Assigning..."
                            : "Assign to Me"}
                        </button>
                      )}

                      <span className="text-xs text-slate-400">
                        {formatRelativeTime(t.updated_at)}
                      </span>

                      <span className="inline-flex items-center gap-1 rounded-xl bg-[#0E2842] px-3 py-1.5 text-xs font-semibold text-white">
                        Open & Review AI Draft
                        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 disabled:opacity-50 cursor-pointer"
            >
              Previous Page
            </button>
            <span className="text-xs font-medium text-slate-600">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 disabled:opacity-50 cursor-pointer"
            >
              Next Page
            </button>
          </div>
        )}
      </div>
    </PortalShell>
  );
}

export default function AdminTicketQueuePage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 max-w-6xl mx-auto space-y-4">
          <div className="h-10 w-64 rounded animate-shimmer" />
          <div className="h-24 rounded-xl animate-shimmer" />
          <div className="h-96 rounded-xl animate-shimmer" />
        </div>
      }
    >
      <AdminTicketQueueContent />
    </Suspense>
  );
}
