"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PortalShell } from "@/components/layout/portal-shell";
import { useFastQuery } from "@/lib/client-cache";
import {
  SafeUser,
  TicketCategory,
  TicketPriority,
  TicketStatus,
} from "@/types/domain";
import {
  AlertCircle,
  ArrowRight,
  ChevronRight,
  Clock,
  Headphones,
  MessageSquare,
  PlusCircle,
  Search,
  Ticket,
} from "lucide-react";

interface AuthorTicketsResponse {
  success: boolean;
  tickets: Array<{
    ticket_id: string;
    book_id: string | null;
    book_title: string;
    subject: string;
    description: string;
    status: TicketStatus;
    category: TicketCategory;
    priority: TicketPriority;
    created_at: string;
    updated_at: string;
    message_count: number;
    last_reply_by: "AUTHOR" | "ADMIN" | null;
  }>;
}

export default function AuthorTicketsListPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const sessionQuery = useFastQuery<{ success: boolean; user: SafeUser }>(
    "auth:session",
    "/api/auth/session"
  );

  const ticketsQuery = useFastQuery<AuthorTicketsResponse>(
    `author:tickets:${statusFilter}`,
    `/api/author/tickets?status=${encodeURIComponent(statusFilter)}`,
    { pollIntervalMs: 3500 }
  );

  const allTickets = ticketsQuery.data?.tickets || [];

  const counts = useMemo(() => {
    return {
      all: allTickets.length,
      open: allTickets.filter((t) => t.status === "Open").length,
      inProgress: allTickets.filter((t) => t.status === "In Progress").length,
      resolved: allTickets.filter((t) => t.status === "Resolved").length,
      closed: allTickets.filter((t) => t.status === "Closed").length,
    };
  }, [allTickets]);

  const filteredTickets = useMemo(() => {
    if (!searchQuery.trim()) return allTickets;
    const q = searchQuery.toLowerCase();
    return allTickets.filter(
      (t) =>
        t.ticket_id.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.book_title.toLowerCase().includes(q)
    );
  }, [allTickets, searchQuery]);

  if (sessionQuery.error) {
    return (
      <div className="min-h-screen bg-[#F9FAF7] flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-3xl border border-[#E8EDE6] bg-white p-8 text-center shadow-sm">
          <AlertCircle className="w-10 h-10 text-amber-600 mx-auto mb-3" />
          <h2 className="font-serif text-xl font-bold text-slate-900 mb-2">
            Session Expired
          </h2>
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

  if (sessionQuery.isLoading || !sessionQuery.data) {
    return (
      <div className="min-h-screen bg-[#F9FAF7] flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-2 border-[#0F4C3A] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-medium text-slate-500">Loading Support Tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <PortalShell user={sessionQuery.data.user}>
      <div className="space-y-6">
        {/* ================================================================
            PAGE HEADER (Matches Screen 4: Support Tickets - Author View)
            ================================================================ */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8EDE6]">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Support Tickets
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Track your support requests and get updates from our team.
            </p>
          </div>
          <Link
            href="/author/tickets/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0F4C3A] hover:bg-[#0A3B2D] text-white text-xs sm:text-sm font-semibold shadow-xs transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Ticket</span>
          </Link>
        </div>

        {/* ================================================================
            STATUS TABS & SEARCH BAR (Matches Screen 4)
            ================================================================ */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Status Tabs Pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white border border-[#E8EDE6] shadow-2xs overflow-x-auto">
            <button
              onClick={() => setStatusFilter("ALL")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 ${
                statusFilter === "ALL"
                  ? "bg-[#0F4C3A] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All ({counts.all})
            </button>
            <button
              onClick={() => setStatusFilter("Open")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 ${
                statusFilter === "Open"
                  ? "bg-[#0F4C3A] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Open ({counts.open})
            </button>
            <button
              onClick={() => setStatusFilter("In Progress")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 ${
                statusFilter === "In Progress"
                  ? "bg-[#0F4C3A] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              In Progress ({counts.inProgress})
            </button>
            <button
              onClick={() => setStatusFilter("Resolved")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 ${
                statusFilter === "Resolved"
                  ? "bg-[#0F4C3A] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Resolved ({counts.resolved})
            </button>
            <button
              onClick={() => setStatusFilter("Closed")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 ${
                statusFilter === "Closed"
                  ? "bg-[#0F4C3A] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Closed ({counts.closed})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search tickets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-[#0F4C3A]"
            />
          </div>
        </div>

        {/* ================================================================
            TICKETS TABLE LIST (Matches Screen 4)
            ================================================================ */}
        <div className="bg-white rounded-2xl border border-[#E8EDE6] shadow-xs overflow-hidden">
          {filteredTickets.length === 0 ? (
            <div className="p-12 text-center">
              <Ticket className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h3 className="font-serif font-bold text-base text-slate-800 mb-1">
                No Tickets Found
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                You don&apos;t have any tickets under this filter.
              </p>
              <Link
                href="/author/tickets/new"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#0F4C3A] text-white text-xs font-semibold"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Create Support Ticket</span>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#F9FAF7] border-b border-[#E8EDE6] text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="py-3.5 pl-5">Ticket ID & Subject</th>
                    <th className="py-3.5">Category</th>
                    <th className="py-3.5">Status</th>
                    <th className="py-3.5">Priority</th>
                    <th className="py-3.5 text-right pr-5">Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredTickets.map((t) => (
                    <tr
                      key={t.ticket_id}
                      onClick={() => router.push(`/author/tickets/${t.ticket_id}`)}
                      className="hover:bg-[#F9FAF7] cursor-pointer transition"
                    >
                      <td className="py-4 pl-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#EBF3EE] text-[#0F4C3A] flex items-center justify-center font-mono font-bold text-xs shrink-0 border border-[#D5E5DC]">
                            BL
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="font-mono text-[11px] font-bold text-[#0F4C3A]">
                                {t.ticket_id}
                              </span>
                              <span className="text-slate-400">•</span>
                              <span className="text-[11px] text-slate-500">
                                {t.book_title}
                              </span>
                            </div>
                            <span className="font-semibold text-slate-900 block text-sm">
                              {t.subject}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 text-slate-600 font-medium">
                        {t.category}
                      </td>

                      <td className="py-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                            t.status === "Resolved"
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : t.status === "In Progress"
                              ? "bg-blue-50 text-blue-800 border border-blue-200"
                              : t.status === "Closed"
                              ? "bg-slate-100 text-slate-700 border border-slate-200"
                              : "bg-amber-50 text-amber-800 border border-amber-200"
                          }`}
                        >
                          {t.status}
                        </span>
                      </td>

                      <td className="py-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
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

                      <td className="py-4 text-right pr-5">
                        <div className="flex items-center justify-end gap-2 text-slate-500">
                          <span>{new Date(t.updated_at).toLocaleDateString()}</span>
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </PortalShell>
  );
}
