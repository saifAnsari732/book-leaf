"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { PortalShell } from "@/components/layout/portal-shell";
import { useFastQuery } from "@/lib/client-cache";
import {
  BookRecord,
  SafeUser,
  TicketMessageRecord,
  TicketRecord,
} from "@/types/domain";
import {
  formatDateTime,
  formatINR,
  formatNullableINR,
  TicketCategoryBadge,
  TicketPriorityBadge,
  TicketStatusBadge,
} from "@/components/ui/badges";
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  Clock,
  Paperclip,
  RefreshCw,
  Send,
  ShieldCheck,
  User,
} from "lucide-react";

interface AuthorTicketDetailResponse {
  success: boolean;
  ticket: Omit<TicketRecord, "ai_metadata">;
  book: BookRecord | null;
  messages: TicketMessageRecord[];
  serverTimestamp: string;
}

export default function AuthorTicketDetailPage() {
  const params = useParams<{ ticketId: string }>();
  const ticketId = params.ticketId;
  const router = useRouter();

  const [replyText, setReplyText] = useState("");
  const [replyError, setReplyError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const sessionQuery = useFastQuery<{ success: boolean; user: SafeUser }>(
    "auth:session",
    "/api/auth/session"
  );

  // Real-time / near-real-time auto-sync every 3 seconds without page refresh
  const detailQuery = useFastQuery<AuthorTicketDetailResponse>(
    `author:ticket:${ticketId}`,
    `/api/author/tickets/${ticketId}`,
    { pollIntervalMs: 3000 }
  );

  async function handleSendFollowUp(e: React.FormEvent) {
    e.preventDefault();
    if (!replyText.trim()) return;
    setReplyError(null);
    setIsSending(true);

    try {
      const res = await fetch(`/api/author/tickets/${ticketId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: replyText }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setReplyError(json.error || "Could not send message");
        return;
      }
      setReplyText("");
      detailQuery.refresh();
    } catch {
      setReplyError("Network error while sending message");
    } finally {
      setIsSending(false);
    }
  }

  if (detailQuery.error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-2xl border border-slate-200 bg-white p-6 text-center space-y-4">
          <AlertCircle
            className="h-10 w-10 text-red-600 mx-auto"
            aria-hidden="true"
          />
          <h1 className="font-serif text-xl font-bold text-slate-900">
            Unable to Load Ticket
          </h1>
          <p className="text-sm text-slate-600">{detailQuery.error}</p>
          <Link
            href="/author/tickets"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#1B4D7E] px-4 py-2 text-xs font-semibold text-white"
          >
            Back to My Tickets
          </Link>
        </div>
      </div>
    );
  }

  if (
    sessionQuery.isLoading ||
    !sessionQuery.data ||
    detailQuery.isLoading ||
    !detailQuery.data
  ) {
    return (
      <div className="p-8 max-w-5xl mx-auto space-y-4">
        <div className="h-10 w-64 rounded animate-shimmer" />
        <div className="h-40 rounded-xl animate-shimmer" />
        <div className="h-80 rounded-xl animate-shimmer" />
      </div>
    );
  }

  const { ticket, book, messages } = detailQuery.data;

  return (
    <PortalShell
      user={sessionQuery.data.user}
      lastSyncedAt={detailQuery.lastSyncedAt}
      onManualRefresh={detailQuery.refresh}
      isRefreshing={detailQuery.isRefreshing}
    >
      <div className="space-y-6 animate-fade-up">
        <div>
          <Link
            href="/author/tickets"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 mb-3"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Back to My Tickets
          </Link>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-sm font-bold text-[#1B4D7E]">
                  {ticket.ticket_id}
                </span>
                <TicketStatusBadge status={ticket.status} />
                <TicketCategoryBadge category={ticket.category} />
                <TicketPriorityBadge priority={ticket.priority} />
              </div>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                Submitted {formatDateTime(ticket.created_at)}
              </span>
            </div>

            <h1 className="font-serif text-xl sm:text-2xl font-bold text-slate-900">
              {ticket.subject}
            </h1>

            {/* Linked Book Summary Bar */}
            {book ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <BookOpen
                    className="h-4 w-4 text-[#1B4D7E]"
                    aria-hidden="true"
                  />
                  <span className="font-bold text-slate-900">{book.title}</span>
                  <span className="font-mono text-slate-500">
                    ({book.book_id} • ISBN: {book.isbn})
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-slate-600">
                  <span>
                    <strong>Status:</strong> {book.status}
                  </span>
                  <span>
                    <strong>MRP:</strong>{" "}
                    {formatNullableINR(book.mrp, "TBD")}
                  </span>
                  <span>
                    <strong>Pending Royalty:</strong>{" "}
                    {formatINR(book.royalty_pending)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-500">
                Scope:{" "}
                <strong className="text-slate-700">
                  General / Account-Level Inquiry
                </strong>
              </div>
            )}
          </div>
        </div>

        {/* Conversation Timeline */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h2 className="font-serif text-lg font-bold text-slate-900">
              Conversation History ({messages.length})
            </h2>
            <span className="text-xs text-emerald-700 font-medium">
              Real-time updates active (no page refresh needed)
            </span>
          </div>

          <div className="space-y-4">
            {messages.map((msg) => {
              const isAdminMsg = msg.sender_role === "ADMIN";
              return (
                <div
                  key={msg.message_id}
                  className={`rounded-2xl border p-5 transition-all ${
                    isAdminMsg
                      ? "border-sky-200 bg-sky-50/50 ml-0 sm:ml-6"
                      : "border-slate-200 bg-slate-50/60 mr-0 sm:mr-6"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-bold ${
                          isAdminMsg
                            ? "bg-[#1B4D7E] text-white"
                            : "bg-slate-200 text-slate-800"
                        }`}
                      >
                        {isAdminMsg ? (
                          <ShieldCheck
                            className="h-3.5 w-3.5"
                            aria-hidden="true"
                          />
                        ) : (
                          <User className="h-3.5 w-3.5" aria-hidden="true" />
                        )}
                        {msg.sender_name}
                      </span>
                      <span className="text-[11px] font-medium text-slate-500">
                        {isAdminMsg
                          ? "BookLeaf Author Support Representative"
                          : "Author"}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">
                      {new Date(msg.created_at).toLocaleString("en-IN", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <div className="text-sm text-slate-800 whitespace-pre-line leading-relaxed">
                    {msg.content}
                  </div>

                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-200/70 flex flex-wrap gap-2">
                      {msg.attachments.map((att, idx) => (
                        <a
                          key={idx}
                          href={att.url || "#"}
                          target={
                            att.url?.startsWith("http") ? "_blank" : undefined
                          }
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-[#1B4D7E] hover:bg-sky-50"
                        >
                          <Paperclip className="h-3 w-3" aria-hidden="true" />
                          {att.name}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Author Reply Box */}
          {ticket.status === "Closed" ? (
            <div className="rounded-xl border border-slate-200 bg-slate-100 p-4 text-center text-xs text-slate-600">
              This ticket is closed. If you need additional help, please{" "}
              <Link
                href="/author/tickets/new"
                className="font-semibold text-[#1B4D7E] underline"
              >
                submit a new support query
              </Link>
              .
            </div>
          ) : (
            <form
              onSubmit={handleSendFollowUp}
              className="pt-4 border-t border-slate-200 space-y-3"
            >
              {replyError && (
                <p className="text-xs font-medium text-red-600">{replyError}</p>
              )}
              <label
                htmlFor="author-reply-input"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
              >
                Add a Follow-Up Reply
              </label>
              <textarea
                id="author-reply-input"
                rows={3}
                required
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply or share additional details with the BookLeaf support team..."
                className="w-full rounded-xl border border-slate-300 bg-white p-3.5 text-sm text-slate-900 focus:border-[#1B4D7E] focus:outline-none focus:ring-2 focus:ring-[#1B4D7E]/20"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSending || !replyText.trim()}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#1B4D7E] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#163f68] disabled:opacity-60 transition-all cursor-pointer"
                >
                  {isSending ? (
                    <RefreshCw
                      className="h-4 w-4 animate-spin"
                      aria-hidden="true"
                    />
                  ) : (
                    <Send className="h-4 w-4" aria-hidden="true" />
                  )}
                  Send Follow-Up
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </PortalShell>
  );
}
