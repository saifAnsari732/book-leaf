"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PortalShell } from "@/components/layout/portal-shell";
import { useFastQuery } from "@/lib/client-cache";
import {
  AuditLogRecord,
  SafeUser,
  TicketCategory,
  TicketPriority,
  TicketRecord,
  TicketStatus,
} from "@/types/domain";
import {
  formatRelativeTime,
  TicketCategoryBadge,
  TicketPriorityBadge,
  TicketStatusBadge,
} from "@/components/ui/badges";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Clock,
  Inbox,
  ShieldCheck,
  Sparkles,
  UserPlus,
} from "lucide-react";

interface AdminOverviewResponse {
  success: boolean;
  metrics: {
    totalTickets: number;
    unassignedTickets: number;
    byStatus: Record<TicketStatus, number>;
    byPriority: Record<TicketPriority, number>;
    byCategory: Record<TicketCategory, number>;
    highAndCriticalOpen: number;
    avgResolutionHours: number | null;
    totalAuthors: number;
    totalBooks: number;
    urgentQueue: TicketRecord[];
    recentActivity: AuditLogRecord[];
  };
}

export default function AdminOverviewPage() {
  const router = useRouter();
  const sessionQuery = useFastQuery<{ success: boolean; user: SafeUser }>(
    "auth:session",
    "/api/auth/session"
  );

  const overviewQuery = useFastQuery<AdminOverviewResponse>(
    "admin:overview",
    "/api/admin/dashboard",
    { pollIntervalMs: 4000 }
  );

  if (overviewQuery.error || sessionQuery.error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-2xl border border-slate-200 bg-white p-6 text-center space-y-4">
          <AlertCircle
            className="h-10 w-10 text-amber-600 mx-auto"
            aria-hidden="true"
          />
          <h1 className="font-serif text-xl font-bold text-slate-900">
            Administrator Access Required
          </h1>
          <p className="text-sm text-slate-600">
            {overviewQuery.error ||
              sessionQuery.error ||
              "Please sign in with an Admin Operations account."}
          </p>
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="rounded-xl bg-[#0E2842] px-4 py-2.5 text-xs font-semibold text-white cursor-pointer"
          >
            Sign In as Admin
          </button>
        </div>
      </div>
    );
  }

  if (
    sessionQuery.isLoading ||
    !sessionQuery.data ||
    overviewQuery.isLoading ||
    !overviewQuery.data
  ) {
    return (
      <div className="p-8 max-w-6xl mx-auto space-y-6">
        <div className="h-10 w-72 rounded animate-shimmer" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-xl animate-shimmer" />
          ))}
        </div>
        <div className="h-80 rounded-xl animate-shimmer" />
      </div>
    );
  }

  const user = sessionQuery.data.user;
  const { metrics } = overviewQuery.data;

  return (
    <PortalShell
      user={user}
      lastSyncedAt={overviewQuery.lastSyncedAt}
      onManualRefresh={overviewQuery.refresh}
      isRefreshing={overviewQuery.isRefreshing}
    >
      <div className="space-y-8 animate-fade-up">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1B4D7E]">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              <span>BookLeaf Publishing • Operations Command Center</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              Support Queue & AI Triage Overview
            </h1>
            <p className="text-sm text-slate-600 mt-0.5">
              Monitoring {metrics.totalAuthors} seeded authors and{" "}
              {metrics.totalBooks} books with automated Gemini 3.8 Flash
              classification, priority scoring, and policy-grounded drafts.
            </p>
          </div>

          <Link
            href="/admin/tickets"
            className="inline-flex items-center gap-2 rounded-xl bg-[#0E2842] px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-[#163f68] transition-colors cursor-pointer"
          >
            <Inbox className="h-4 w-4 text-sky-300" aria-hidden="true" />
            Open Full Ticket Queue ({metrics.totalTickets})
          </Link>
        </div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Tickets
            </span>
            <p className="text-3xl font-bold text-slate-900 mt-2">
              {metrics.totalTickets}
            </p>
            <div className="mt-2 flex items-center gap-2 text-xs text-slate-600">
              <span className="font-medium text-blue-700">
                {metrics.byStatus.Open} Open
              </span>
              <span>•</span>
              <span className="font-medium text-amber-700">
                {metrics.byStatus["In Progress"]} In Progress
              </span>
              <span>•</span>
              <span className="font-medium text-emerald-700">
                {metrics.byStatus.Resolved} Resolved
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-red-200 bg-red-50/40 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-red-800">
                Critical & High Open
              </span>
              <AlertTriangle
                className="h-4 w-4 text-red-600"
                aria-hidden="true"
              />
            </div>
            <p className="text-3xl font-bold text-red-900 mt-2">
              {metrics.highAndCriticalOpen}
            </p>
            <p className="mt-2 text-xs text-red-700">
              Requires 48-hour SLA attention
            </p>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
                Unassigned Active
              </span>
              <UserPlus
                className="h-4 w-4 text-amber-700"
                aria-hidden="true"
              />
            </div>
            <p className="text-3xl font-bold text-amber-900 mt-2">
              {metrics.unassignedTickets}
            </p>
            <p className="mt-2 text-xs text-amber-800">
              Ready for ops specialist assignment
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Avg Resolution Time
              </span>
              <Clock className="h-4 w-4 text-emerald-600" aria-hidden="true" />
            </div>
            <p className="text-3xl font-bold text-slate-900 mt-2">
              {metrics.avgResolutionHours !== null
                ? `${metrics.avgResolutionHours}h`
                : "N/A"}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Calculated from resolved tickets
            </p>
          </div>
        </div>

        {/* Urgent & Oldest Unresolved Spotlight Queue */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-lg font-bold text-slate-900">
                Most Urgent & Oldest Unresolved Tickets
              </h2>
              <p className="text-xs text-slate-500">
                Sorted automatically by Priority (Critical → High → Medium →
                Low) and oldest waiting time first
              </p>
            </div>
            <Link
              href="/admin/tickets"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#1B4D7E] hover:underline"
            >
              Filter & Search All Tickets
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>

          <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden">
            {metrics.urgentQueue.map((t) => (
              <Link
                key={t.ticket_id}
                href={`/admin/tickets/${t.ticket_id}`}
                className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-4 bg-white hover:bg-sky-50/40 transition-colors cursor-pointer"
              >
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
                      AI Draft Ready (-{t.ai_metadata.tokens_saved_pct}% tokens)
                    </span>
                  </div>
                  <p className="text-sm font-bold text-slate-900 truncate">
                    {t.subject}
                  </p>
                  <p className="text-xs text-slate-600">
                    Author:{" "}
                    <strong className="text-slate-800">{t.author_name}</strong>{" "}
                    ({t.author_id}) • Book:{" "}
                    <strong className="text-slate-800">{t.book_title}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-4 shrink-0 text-xs text-slate-500">
                  <span>
                    {t.assigned_to ? (
                      <span className="rounded-md bg-slate-100 px-2 py-1 font-medium text-slate-700">
                        Assignee: {t.assigned_to}
                      </span>
                    ) : (
                      <span className="rounded-md bg-amber-50 border border-amber-200 px-2 py-1 font-semibold text-amber-800">
                        Unassigned
                      </span>
                    )}
                  </span>
                  <span>Opened {formatRelativeTime(t.created_at)}</span>
                  <ArrowRight
                    className="h-4 w-4 text-[#1B4D7E]"
                    aria-hidden="true"
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Category Breakdown & Recent Audit Trail */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="font-serif text-lg font-bold text-slate-900">
              AI Classification Breakdown by Category
            </h2>
            <div className="space-y-3">
              {(
                Object.entries(metrics.byCategory) as Array<
                  [TicketCategory, number]
                >
              ).map(([cat, count]) => {
                const pct =
                  metrics.totalTickets > 0
                    ? Math.round((count / metrics.totalTickets) * 100)
                    : 0;
                return (
                  <Link
                    key={cat}
                    href={`/admin/tickets?category=${encodeURIComponent(cat)}`}
                    className="block group cursor-pointer"
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-800 group-hover:text-[#1B4D7E]">
                        {cat}
                      </span>
                      <span className="font-mono text-slate-500">
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#1B4D7E] transition-all duration-300"
                        style={{ width: `${Math.max(pct, count > 0 ? 8 : 0)}%` }}
                      />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="font-serif text-lg font-bold text-slate-900">
              Recent AI & Operations Audit Log
            </h2>
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {metrics.recentActivity.map((log) => (
                <div
                  key={log.log_id}
                  className="rounded-xl border border-slate-200/80 bg-slate-50 p-3 text-xs flex items-start justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#1B4D7E]">
                        {log.ticket_id}
                      </span>
                      <span className="font-semibold text-slate-800">
                        {log.action.replace(/_/g, " ")}
                      </span>
                    </div>
                    <p className="text-slate-600 mt-0.5">
                      Actor: <strong>{log.actor_name}</strong> ({log.actor_role})
                    </p>
                  </div>
                  <span className="text-slate-400 shrink-0">
                    {formatRelativeTime(log.created_at)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PortalShell>
  );
}
