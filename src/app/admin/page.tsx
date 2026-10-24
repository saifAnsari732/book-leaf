"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PortalShell } from "@/components/layout/portal-shell";
import { useFastQuery } from "@/lib/client-cache";
import { DashboardSkeleton } from "@/components/ui/skeleton-loaders";
import {
  AuditLogRecord,
  SafeUser,
  TicketCategory,
  TicketPriority,
  TicketRecord,
  TicketStatus,
} from "@/types/domain";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  ExternalLink,
  Layers,
  MessageSquare,
  ShieldCheck,
  Ticket,
  TrendingUp,
  User,
  Users,
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
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <AlertCircle className="w-10 h-10 text-amber-600 mx-auto mb-3" />
          <h2 className="font-serif text-xl font-bold text-slate-900 mb-2">
            Administrator Access Required
          </h2>
          <p className="text-xs text-slate-600 mb-4">
            {overviewQuery.error || sessionQuery.error || "Please sign in as Admin."}
          </p>
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

  if (!sessionQuery.data || !overviewQuery.data) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-10 max-w-7xl mx-auto">
        <DashboardSkeleton />
      </div>
    );
  }

  const { metrics } = overviewQuery.data;
  const admin = sessionQuery.data.user;

  const total = Math.max(1, metrics.totalTickets);
  const openPct = Math.round((metrics.byStatus.Open / total) * 100);
  const inProgPct = Math.round(((metrics.byStatus["In Progress"] || 0) / total) * 100);
  const resPct = Math.round((metrics.byStatus.Resolved / total) * 100);
  const closedPct = Math.round((metrics.byStatus.Closed / total) * 100);

  return (
    <PortalShell user={admin}>
      <div className="space-y-7 animate-fade-in font-sans">
        {/* ================================================================
            PAGE HEADER: Executive Triage & Operations Telemetry
            ================================================================ */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/90">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Support Operations Overview
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-[11px] font-bold">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                Live Telemetry Active
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500">
              Real-time triage telemetry, grievance resolution velocity, and operational SLA tracking.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/admin/tickets"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F4C3A] hover:bg-[#0A3B2D] text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow transition cursor-pointer"
            >
              <Ticket className="w-4 h-4 text-emerald-300" />
              <span>Open Tickets Queue ({metrics.byStatus.Open})</span>
            </Link>
          </div>
        </div>

        {/* ================================================================
            TOP ROW: 6 EXECUTIVE BENTO KPI METRIC CARDS
            ================================================================ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5 sm:gap-4">
          {/* 1. Total Tickets */}
          <div className="bg-white rounded-2xl p-4.5 border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500">
                Total Volume
              </span>
              <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                <Layers className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
                {metrics.totalTickets}
              </span>
              <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                All-Time
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate">Across {metrics.totalAuthors || 11} authors</p>
          </div>

          {/* 2. Open Tickets */}
          <div className="bg-white rounded-2xl p-4.5 border border-sky-200/90 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-sky-800">
                Open Queue
              </span>
              <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center">
                <Ticket className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-sky-700 tabular-nums">
                {metrics.byStatus.Open}
              </span>
              <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded">
                {openPct}%
              </span>
            </div>
            <p className="text-[11px] text-sky-600 font-medium truncate">
              {metrics.unassignedTickets} unassigned
            </p>
          </div>

          {/* 3. High/Critical Priority */}
          <div className="bg-white rounded-2xl p-4.5 border border-rose-200/90 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-rose-800">
                Critical &amp; High
              </span>
              <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
                <AlertTriangle className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-rose-700 tabular-nums">
                {metrics.highAndCriticalOpen}
              </span>
              <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded">
                Urgent
              </span>
            </div>
            <p className="text-[11px] text-rose-600 font-medium truncate">Immediate SLA target</p>
          </div>

          {/* 4. Resolved Tickets */}
          <div className="bg-white rounded-2xl p-4.5 border border-emerald-200/90 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-emerald-800">
                Resolved
              </span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700 tabular-nums">
                {metrics.byStatus.Resolved}
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                {resPct}%
              </span>
            </div>
            <p className="text-[11px] text-emerald-600 font-medium truncate">Closed &amp; confirmed</p>
          </div>

          {/* 5. In Progress Tickets */}
          <div className="bg-white rounded-2xl p-4.5 border border-amber-200/90 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-amber-800">
                In Review
              </span>
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                <Clock className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-amber-700 tabular-nums">
                {metrics.byStatus["In Progress"] || 0}
              </span>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                {inProgPct}%
              </span>
            </div>
            <p className="text-[11px] text-amber-600 font-medium truncate">Under investigation</p>
          </div>

          {/* 6. Average Response Time */}
          <div className="bg-white rounded-2xl p-4.5 border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500">
                Resolution Velocity
              </span>
              <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                <Activity className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
                {metrics.avgResolutionHours ? `${metrics.avgResolutionHours}h` : "< 4h"}
              </span>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/70">
                98% SLA
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate">Target: &lt; 24h SLA</p>
          </div>
        </div>

        {/* ================================================================
            MIDDLE ROW: DONUT STATUS BREAKDOWN + URGENT QUEUE ACTION
            ================================================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Status Breakdown with SVG Donut (6 cols) */}
          <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-lg text-slate-900">
                  Ticket Status Distribution
                </h3>
                <p className="text-xs text-slate-500">
                  Live composition of active grievances and operational tickets
                </p>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold font-mono">
                {metrics.totalTickets} Total
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-8 py-2">
              {/* Modern SVG Donut */}
              <div className="relative w-40 h-40 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  {/* Background Track */}
                  <path
                    className="text-slate-100"
                    strokeWidth="3.8"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Resolved arc (Emerald) */}
                  <path
                    className="text-emerald-500 transition-all duration-500"
                    strokeDasharray={`${resPct}, 100`}
                    strokeWidth="3.8"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* In Progress arc (Amber) */}
                  <path
                    className="text-amber-400 transition-all duration-500"
                    strokeDasharray={`${inProgPct}, 100`}
                    strokeDashoffset={`-${resPct}`}
                    strokeWidth="3.8"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Open arc (Sky) */}
                  <path
                    className="text-sky-500 transition-all duration-500"
                    strokeDasharray={`${openPct}, 100`}
                    strokeDashoffset={`-${resPct + inProgPct}`}
                    strokeWidth="3.8"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="font-serif text-3xl font-extrabold text-slate-900 tabular-nums">
                    {metrics.totalTickets}
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                    Total
                  </span>
                </div>
              </div>

              {/* Status Breakdown Table */}
              <div className="flex-1 w-full space-y-2.5 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-sky-50/60 border border-sky-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                    <span className="text-slate-800 font-semibold">Open &amp; Pending Triage</span>
                  </div>
                  <span className="font-bold text-sky-900 font-mono">
                    {metrics.byStatus.Open} ({openPct}%)
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50/60 border border-amber-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <span className="text-slate-800 font-semibold">In Progress Investigation</span>
                  </div>
                  <span className="font-bold text-amber-900 font-mono">
                    {metrics.byStatus["In Progress"] || 0} ({inProgPct}%)
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-slate-800 font-semibold">Resolved Successfully</span>
                  </div>
                  <span className="font-bold text-emerald-900 font-mono">
                    {metrics.byStatus.Resolved} ({resPct}%)
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                    <span className="text-slate-700 font-medium">Closed &amp; Archived</span>
                  </div>
                  <span className="font-bold text-slate-800 font-mono">
                    {metrics.byStatus.Closed} ({closedPct}%)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Live Audit Trail & Team Feed (6 cols) */}
          <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-serif font-bold text-lg text-slate-900">
                    Live Operations Activity
                  </h3>
                  <p className="text-xs text-slate-500">
                    Real-time operational audit log of author communications and triage
                  </p>
                </div>
                <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/70">
                  Live Log
                </span>
              </div>

              <div className="space-y-2.5">
                {metrics.recentActivity.slice(0, 5).map((log) => (
                  <div
                    key={log.log_id}
                    className="flex items-start gap-3 p-3 rounded-2xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/60 transition text-xs"
                  >
                    <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Activity className="w-4 h-4 text-emerald-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-slate-900 truncate">
                          #{log.ticket_id} • {log.action.replace(/_/g, " ")}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium shrink-0">
                          {new Date(log.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Actor: {log.actor_name} ({log.actor_role})
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 text-right">
              <Link
                href="/admin/tickets"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0F4C3A] hover:underline"
              >
                <span>View Full Ticket Queue ({metrics.totalTickets})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* ================================================================
            LOWER SECTION: URGENT ATTENTION QUEUE
            ================================================================ */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-6 sm:p-7 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
            <div>
              <h3 className="font-serif font-bold text-lg text-slate-900">
                Priority Action Queue
              </h3>
              <p className="text-xs text-slate-500">
                Tickets requiring priority operational response or urgent royalty clarification
              </p>
            </div>
            <Link
              href="/admin/tickets"
              className="text-xs font-bold text-[#0F4C3A] hover:underline inline-flex items-center gap-1"
            >
              <span>Manage All Tickets</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {metrics.urgentQueue.map((t) => (
              <div
                key={t.ticket_id}
                onClick={() => router.push(`/admin/tickets/${t.ticket_id}`)}
                className="py-3.5 px-3 -mx-3 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition cursor-pointer group"
              >
                <div className="flex items-start sm:items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0F4C3A] to-[#10B981] text-white text-xs font-bold flex items-center justify-center shrink-0">
                    {t.author_name ? t.author_name[0] : "A"}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                        #{t.ticket_id}
                      </span>
                      <span className="font-bold text-slate-900 text-sm truncate">
                        {t.subject}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                      {t.author_name} ({t.author_id}) • {t.book_title || "General Publishing"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0 pl-11 sm:pl-0">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                      t.priority === "Critical"
                        ? "bg-rose-50 text-rose-700 border border-rose-200"
                        : "bg-amber-50 text-amber-800 border border-amber-200"
                    }`}
                  >
                    {t.priority}
                  </span>
                  <span className="text-[10px] px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                    {t.category}
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-[#0F4C3A] group-hover:text-white text-slate-500 flex items-center justify-center transition">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PortalShell>
  );
}
