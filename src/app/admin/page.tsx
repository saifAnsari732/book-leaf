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
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  Layers,
  ShieldCheck,
  Sparkles,
  Ticket,
  TrendingUp,
  UserCheck,
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
      <div className="min-h-screen bg-[#F9FAF7] flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-3xl border border-[#E8EDE6] bg-white p-8 text-center shadow-sm">
          <AlertCircle className="w-10 h-10 text-amber-600 mx-auto mb-3" />
          <h2 className="font-serif text-xl font-bold text-slate-900 mb-2">
            Administrator Access Required
          </h2>
          <p className="text-xs text-slate-600 mb-4">
            {overviewQuery.error || sessionQuery.error || "Please sign in as Admin."}
          </p>
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

  if (!sessionQuery.data || !overviewQuery.data) {
    return (
      <div className="min-h-screen bg-[#F9FAF7] flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-2 border-[#0F4C3A] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-medium text-slate-500">Loading Support Overview...</p>
        </div>
      </div>
    );
  }

  const { metrics } = overviewQuery.data;
  const admin = sessionQuery.data.user;

  const total = Math.max(1, metrics.totalTickets);
  const openPct = Math.round((metrics.byStatus.Open / total) * 100);
  const inProgPct = Math.round((metrics.byStatus["In Progress"] / total) * 100);
  const resPct = Math.round((metrics.byStatus.Resolved / total) * 100);
  const closedPct = Math.round((metrics.byStatus.Closed / total) * 100);

  return (
    <PortalShell user={admin}>
      <div className="space-y-8">
        {/* ================================================================
            PAGE HEADER (Matches Screen 7: Support Overview)
            ================================================================ */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8EDE6]">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Support Overview
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Track ticket performance, team activity and AI triage insights.
            </p>
          </div>
          <Link
            href="/admin/tickets"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0F4C3A] hover:bg-[#0A3B2D] text-white text-xs sm:text-sm font-semibold shadow-xs transition"
          >
            <Ticket className="w-4 h-4" />
            <span>Open Tickets Queue</span>
          </Link>
        </div>

        {/* ================================================================
            TOP ROW: 4 METRIC CARDS (Matches Screen 7)
            ================================================================ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-[#E8EDE6] shadow-xs">
            <span className="text-xs font-semibold text-slate-500 block mb-1">
              Total Tickets
            </span>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="font-serif text-3xl font-bold text-slate-900">
                {metrics.totalTickets}
              </span>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                +12% this week
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Across 10 published authors</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#E8EDE6] shadow-xs">
            <span className="text-xs font-semibold text-slate-500 block mb-1">
              Open Tickets
            </span>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="font-serif text-3xl font-bold text-blue-700">
                {metrics.byStatus.Open}
              </span>
              <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                {openPct}% of total
              </span>
            </div>
            <p className="text-[11px] text-slate-400">{metrics.unassignedTickets} unassigned to agents</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#E8EDE6] shadow-xs">
            <span className="text-xs font-semibold text-slate-500 block mb-1">
              In Progress
            </span>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="font-serif text-3xl font-bold text-amber-700">
                {metrics.byStatus["In Progress"]}
              </span>
              <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                {inProgPct}% of total
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Under operational review</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#E8EDE6] shadow-xs">
            <span className="text-xs font-semibold text-slate-500 block mb-1">
              Resolved
            </span>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="font-serif text-3xl font-bold text-emerald-700">
                {metrics.byStatus.Resolved}
              </span>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                {resPct}% rate
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Avg turnaround: ~24h SLA</p>
          </div>
        </div>

        {/* ================================================================
            MIDDLE ROW: DONUT BREAKDOWN (Left) + RECENT ACTIVITY (Right)
            ================================================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Ticket Status Donut Card (Left 6 Cols - Matches Screen 7) */}
          <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-[#E8EDE6] shadow-xs">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-serif font-bold text-lg text-slate-900">
                Ticket Status Breakdown
              </h3>
              <span className="text-xs text-slate-400 font-medium">Live Queue</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-8">
              {/* SVG Donut */}
              <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  {/* Background Circle */}
                  <path
                    className="text-slate-100"
                    strokeWidth="4"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Resolved arc */}
                  <path
                    className="text-[#10B981]"
                    strokeDasharray={`${resPct}, 100`}
                    strokeWidth="4"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* In Progress arc */}
                  <path
                    className="text-amber-400"
                    strokeDasharray={`${inProgPct}, 100`}
                    strokeDashoffset={`-${resPct}`}
                    strokeWidth="4"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Open arc */}
                  <path
                    className="text-blue-500"
                    strokeDasharray={`${openPct}, 100`}
                    strokeDashoffset={`-${resPct + inProgPct}`}
                    strokeWidth="4"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="font-serif text-2xl font-bold text-slate-900">
                    {metrics.totalTickets}
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">
                    Total
                  </span>
                </div>
              </div>

              {/* Status Legend */}
              <div className="flex-1 w-full space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded-lg bg-blue-50/50">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    <span className="text-slate-700 font-medium">Open</span>
                  </div>
                  <span className="font-semibold text-slate-900">
                    {metrics.byStatus.Open} ({openPct}%)
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50/50">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <span className="text-slate-700 font-medium">In Progress</span>
                  </div>
                  <span className="font-semibold text-slate-900">
                    {metrics.byStatus["In Progress"]} ({inProgPct}%)
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/50">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                    <span className="text-slate-700 font-medium">Resolved</span>
                  </div>
                  <span className="font-semibold text-slate-900">
                    {metrics.byStatus.Resolved} ({resPct}%)
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                    <span className="text-slate-700 font-medium">Closed</span>
                  </div>
                  <span className="font-semibold text-slate-900">
                    {metrics.byStatus.Closed} ({closedPct}%)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity Timeline (Right 6 Cols - Matches Screen 7) */}
          <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-[#E8EDE6] shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif font-bold text-lg text-slate-900">
                  Recent Activity
                </h3>
                <span className="text-xs text-[#0F4C3A] font-semibold">Live Audit Trail</span>
              </div>

              <div className="space-y-3">
                {metrics.recentActivity.slice(0, 5).map((log) => (
                  <div
                    key={log.log_id}
                    className="flex items-start gap-3 p-2.5 rounded-xl border border-slate-100 hover:bg-[#F9FAF7] transition text-xs"
                  >
                    <div className="w-7 h-7 rounded-lg bg-[#EBF3EE] text-[#0F4C3A] flex items-center justify-center shrink-0">
                      <Activity className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-slate-900 truncate">
                          {log.ticket_id} • {log.action.replace(/_/g, " ")}
                        </span>
                        <span className="text-[10px] text-slate-400 shrink-0">
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

            <div className="pt-4 mt-2 border-t border-slate-100 text-right">
              <Link
                href="/admin/tickets"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0F4C3A] hover:underline"
              >
                <span>View All Tickets in Queue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* ================================================================
            LOWER SECTION: URGENT ATTENTION QUEUE (Matches Screen 7)
            ================================================================ */}
        <div className="bg-white rounded-2xl border border-[#E8EDE6] shadow-xs p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-serif font-bold text-lg text-slate-900">
                Urgent Attention Queue
              </h3>
              <p className="text-xs text-slate-500">
                Tickets requiring priority action or high-impact author inquiries.
              </p>
            </div>
            <Link
              href="/admin/tickets"
              className="text-xs font-semibold text-[#0F4C3A] hover:underline"
            >
              Full Queue ({metrics.totalTickets})
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {metrics.urgentQueue.map((t) => (
              <div
                key={t.ticket_id}
                onClick={() => router.push(`/admin/tickets/${t.ticket_id}`)}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#F9FAF7] px-2 rounded-xl cursor-pointer transition"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-[#0F4C3A] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {t.ticket_id}
                  </span>
                  <div>
                    <span className="font-semibold text-slate-900 text-sm block">
                      {t.subject}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Author: {t.author_name} ({t.author_id}) • {t.book_title}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                      t.priority === "Critical"
                        ? "bg-rose-50 text-rose-800 border border-rose-200"
                        : "bg-amber-50 text-amber-800 border border-amber-200"
                    }`}
                  >
                    {t.priority}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-800 font-semibold border border-blue-200">
                    {t.category}
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-400 ml-2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PortalShell>
  );
}
