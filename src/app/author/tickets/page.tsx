"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PortalShell } from "@/components/layout/portal-shell";
import { useFastQuery } from "@/lib/client-cache";
import {
  SafeUser,
  TicketCategory,
  TicketPriority,
  TicketStatus,
  TICKET_STATUSES,
} from "@/types/domain";
import {
  formatRelativeTime,
  TicketCategoryBadge,
  TicketPriorityBadge,
  TicketStatusBadge,
} from "@/components/ui/badges";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  MessageSquare,
  PlusCircle,
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

  const sessionQuery = useFastQuery<{ success: boolean; user: SafeUser }>(
    "auth:session",
    "/api/auth/session"
  );

  const ticketsQuery = useFastQuery<AuthorTicketsResponse>(
    `author:tickets:${statusFilter}`,
    `/api/author/tickets?status=${encodeURIComponent(statusFilter)}`,
    { pollIntervalMs: 3500 }
  );

  if (sessionQuery.error) {
    return (
      <div className="p-8 text-center">
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

  if (sessionQuery.isLoading || !sessionQuery.data) {
    return (
      <div className="p-8 max-w-6xl mx-auto space-y-4">
        <div className="h-10 w-64 rounded animate-shimmer" />
        <div className="h-64 rounded-xl animate-shimmer" />
      </div>
    );
  }

  const tickets = ticketsQuery.data?.tickets || [];

  return (
    <PortalShell
      user={sessionQuery.data.user}
      lastSyncedAt={ticketsQuery.lastSyncedAt}
      onManualRefresh={ticketsQuery.refresh}
      isRefreshing={ticketsQuery.isRefreshing}
    >
      <div className="space-y-6 animate-fade-up">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
              My Support Tickets
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Real-time ticket status and responses from the BookLeaf Operations
              Team—updates automatically without refreshing the page.
            </p>
          </div>
          <Link
            href="/author/tickets/new"
            className="inline-flex items-center gap-2 rounded-xl bg-[#1B4D7E] px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-[#163f68] transition-colors cursor-pointer"
          >
            <PlusCircle className="h-4 w-4" aria-hidden="true" />
            New Support Query
          </Link>
        </div>

        {/* Status Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {["ALL", ...TICKET_STATUSES].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === st
                  ? "bg-[#1B4D7E] text-white shadow-sm"
                  : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              {st === "ALL" ? "All Tickets" : st}
            </button>
          ))}
        </div>

        {/* Tickets List */}
        {ticketsQuery.isLoading && !ticketsQuery.data ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-xl animate-shimmer" />
            ))}
          </div>
        ) : tickets.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center space-y-3">
            <Ticket
              className="h-10 w-10 text-slate-400 mx-auto"
              aria-hidden="true"
            />
            <h2 className="text-base font-bold text-slate-900">
              No tickets found for filter &ldquo;{statusFilter}&rdquo;
            </h2>
            <p className="text-xs text-slate-600 max-w-md mx-auto">
              Submit a new support query regarding your books, royalties, ISBN,
              or printing quality and track responses here in real time.
            </p>
            <Link
              href="/author/tickets/new"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#1B4D7E] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#163f68]"
            >
              <PlusCircle className="h-4 w-4" aria-hidden="true" />
              Raise a Ticket
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.map((t) => (
              <Link
                key={t.ticket_id}
                href={`/author/tickets/${t.ticket_id}`}
                className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-sky-300 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#1B4D7E]">
                        {t.ticket_id}
                      </span>
                      <TicketStatusBadge status={t.status} />
                      <TicketCategoryBadge category={t.category} />
                      <TicketPriorityBadge priority={t.priority} />
                      {t.last_reply_by === "ADMIN" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                          <CheckCircle2
                            className="h-3 w-3"
                            aria-hidden="true"
                          />
                          New Admin Response
                        </span>
                      )}
                    </div>

                    <h2 className="text-base font-bold text-slate-900">
                      {t.subject}
                    </h2>
                    <p className="text-xs text-slate-600 line-clamp-2">
                      {t.description}
                    </p>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 text-xs text-slate-500">
                    <span className="font-medium text-slate-700">
                      {t.book_title}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center gap-1">
                        <MessageSquare
                          className="h-3.5 w-3.5"
                          aria-hidden="true"
                        />
                        {t.message_count}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                        {formatRelativeTime(t.updated_at)}
                      </span>
                      <ArrowRight
                        className="h-4 w-4 text-[#1B4D7E]"
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </PortalShell>
  );
}
