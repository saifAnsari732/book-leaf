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
  AlertCircle,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock,
  Headphones,
  Paperclip,
  Send,
  Sparkles,
  Ticket,
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

  const [activeTab, setActiveTab] = useState<"conversation" | "details" | "related">("conversation");
  const [replyText, setReplyText] = useState("");
  const [replyError, setReplyError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const sessionQuery = useFastQuery<{ success: boolean; user: SafeUser }>(
    "auth:session",
    "/api/auth/session"
  );

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
      <div className="min-h-screen bg-[#F9FAF7] flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-3xl border border-[#E8EDE6] bg-white p-8 text-center shadow-sm">
          <AlertCircle className="w-10 h-10 text-rose-600 mx-auto mb-3" />
          <h2 className="font-serif text-xl font-bold text-slate-900 mb-2">
            Unable to Load Ticket
          </h2>
          <p className="text-xs text-slate-600 mb-4">{detailQuery.error}</p>
          <Link
            href="/author/tickets"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#0F4C3A] text-white text-xs font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to My Tickets</span>
          </Link>
        </div>
      </div>
    );
  }

  if (detailQuery.isLoading || !detailQuery.data || !sessionQuery.data) {
    return (
      <div className="min-h-screen bg-[#F9FAF7] flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-2 border-[#0F4C3A] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-medium text-slate-500">Loading Ticket Workspace...</p>
        </div>
      </div>
    );
  }

  const { ticket, book, messages } = detailQuery.data;
  const author = sessionQuery.data.user;

  return (
    <PortalShell user={author}>
      <div className="space-y-6">
        {/* ================================================================
            BREADCRUMBS & TOP TICKET HEADER (Matches Screen 5)
            ================================================================ */}
        <div>
          <Link
            href="/author/tickets"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0F4C3A] hover:underline mb-3"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Tickets</span>
          </Link>

          <div className="bg-white rounded-2xl p-5 border border-[#E8EDE6] shadow-xs">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="font-mono text-xs font-bold text-[#0F4C3A] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                #{ticket.ticket_id}
              </span>
              <span
                className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold ${
                  ticket.status === "Resolved"
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : ticket.status === "In Progress"
                    ? "bg-blue-50 text-blue-800 border border-blue-200"
                    : "bg-amber-50 text-amber-800 border border-amber-200"
                }`}
              >
                {ticket.status}
              </span>
              <span
                className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold ${
                  ticket.priority === "Critical" || ticket.priority === "High"
                    ? "bg-rose-50 text-rose-800 border border-rose-200"
                    : "bg-blue-50 text-blue-800 border border-blue-200"
                }`}
              >
                {ticket.priority} Priority
              </span>
            </div>

            <h1 className="font-serif text-2xl font-bold text-slate-900 mb-2">
              {ticket.subject}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
              <span>
                <strong>Category:</strong> {ticket.category}
              </span>
              <span>•</span>
              <span>
                <strong>Related Book:</strong> {ticket.book_title}
              </span>
              <span>•</span>
              <span>
                <strong>Created:</strong> {new Date(ticket.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* ================================================================
            MAIN CONTENT: CONVERSATION PANE (Left) + TICKET DETAILS (Right)
            ================================================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Conversation Thread (Left 8 Cols - Matches Screen 5) */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-[#E8EDE6] shadow-xs flex flex-col min-h-[520px] justify-between">
            {/* Tabs Bar */}
            <div className="flex items-center gap-4 px-6 pt-4 pb-3 border-b border-slate-100 text-xs font-semibold">
              <button
                onClick={() => setActiveTab("conversation")}
                className={`pb-2 border-b-2 transition ${
                  activeTab === "conversation"
                    ? "border-[#0F4C3A] text-[#0F4C3A]"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                Conversation ({messages.length})
              </button>
              <button
                onClick={() => setActiveTab("details")}
                className={`pb-2 border-b-2 transition ${
                  activeTab === "details"
                    ? "border-[#0F4C3A] text-[#0F4C3A]"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                Details & Scope
              </button>
              <button
                onClick={() => setActiveTab("related")}
                className={`pb-2 border-b-2 transition ${
                  activeTab === "related"
                    ? "border-[#0F4C3A] text-[#0F4C3A]"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                Related Ledger
              </button>
            </div>

            {/* Message Thread List */}
            <div className="p-6 space-y-6 flex-1 overflow-y-auto">
              {activeTab === "conversation" && (
                <>
                  {messages.map((m) => {
                    const isAuthor = m.sender_role === "AUTHOR";
                    return (
                      <div
                        key={m.message_id}
                        className={`flex gap-3 text-xs leading-relaxed ${
                          isAuthor ? "justify-start" : "justify-start"
                        }`}
                      >
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs ${
                            isAuthor
                              ? "bg-slate-100 text-slate-800 border border-slate-200"
                              : "bg-[#0F4C3A] text-white"
                          }`}
                        >
                          {isAuthor ? "You" : "BL"}
                        </div>

                        <div className="flex-1 max-w-2xl">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-slate-900 text-xs">
                              {isAuthor ? author.name : "BookLeaf Support Specialist"}
                            </span>
                            <span
                              className={`text-[9px] px-1.5 py-0.2 rounded font-semibold uppercase ${
                                isAuthor
                                  ? "bg-slate-100 text-slate-600"
                                  : "bg-emerald-100 text-emerald-800"
                              }`}
                            >
                              {m.sender_role}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(m.created_at).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>

                          <div
                            className={`p-4 rounded-2xl whitespace-pre-wrap leading-relaxed ${
                              isAuthor
                                ? "bg-[#F9FAF7] border border-[#E8EDE6] text-slate-800"
                                : "bg-emerald-50/70 border border-emerald-200 text-slate-800"
                            }`}
                          >
                            {m.content}

                            {/* Attachments (e.g. ImageKit CDN links) */}
                            {m.attachments && m.attachments.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-slate-200/60 flex flex-wrap gap-2">
                                {m.attachments.map((att, idx) => (
                                  <a
                                    key={idx}
                                    href={att.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-[#0F4C3A] font-semibold hover:underline shadow-2xs"
                                  >
                                    <Paperclip className="w-3.5 h-3.5" />
                                    <span>{att.name}</span>
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}

              {activeTab === "details" && (
                <div className="p-4 rounded-xl bg-[#F9FAF7] border border-slate-200 text-xs space-y-3">
                  <h4 className="font-bold text-sm text-slate-900">Original Inquiry Description</h4>
                  <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{ticket.description}</p>
                </div>
              )}

              {activeTab === "related" && book && (
                <div className="p-4 rounded-xl bg-[#F9FAF7] border border-slate-200 text-xs space-y-2">
                  <h4 className="font-bold text-sm text-slate-900">{book.title} ({book.book_id})</h4>
                  <p className="text-slate-600">ISBN: {book.isbn || "Pending"}</p>
                  <p className="text-slate-600">Copies Sold: {book.total_copies_sold}</p>
                  <p className="text-emerald-800 font-semibold">Total Royalty Earned: ₹{book.total_royalty_earned}</p>
                  <p className="text-[#0F4C3A] font-semibold">Pending Royalty: ₹{book.royalty_pending}</p>
                </div>
              )}
            </div>

            {/* Reply Composer Box (Bottom of Left Card - Matches Screen 5) */}
            <div className="p-4 border-t border-[#E8EDE6] bg-white rounded-b-2xl">
              {replyError && (
                <p className="text-xs text-rose-600 mb-2 font-medium">{replyError}</p>
              )}
              <form onSubmit={handleSendFollowUp} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Type a message to reply to BookLeaf support..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-full border border-slate-200 bg-[#F9FAF7] text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:border-[#0F4C3A]"
                />
                <button
                  type="submit"
                  disabled={isSending || !replyText.trim()}
                  className="px-5 py-2.5 rounded-full bg-[#0F4C3A] hover:bg-[#0A3B2D] text-white text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </div>
          </div>

          {/* Right Sidebar: Ticket Details Card (Matches Screen 5) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl border border-[#E8EDE6] shadow-xs p-6 space-y-4">
              <h3 className="font-serif font-bold text-base text-slate-900 pb-3 border-b border-slate-100">
                Ticket Details
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 block mb-0.5">Status</span>
                  <span className="font-semibold text-slate-900">{ticket.status}</span>
                </div>

                <div>
                  <span className="text-slate-400 block mb-0.5">Priority</span>
                  <span className="font-semibold text-slate-900">{ticket.priority}</span>
                </div>

                <div>
                  <span className="text-slate-400 block mb-0.5">Category</span>
                  <span className="font-semibold text-slate-900">{ticket.category}</span>
                </div>

                <div>
                  <span className="text-slate-400 block mb-0.5">Assigned To</span>
                  <span className="font-semibold text-slate-900">
                    {ticket.assigned_to || "BookLeaf Support Team"}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block mb-0.5">Created At</span>
                  <span className="font-medium text-slate-700">
                    {new Date(ticket.created_at).toLocaleString()}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block mb-0.5">Last Updated</span>
                  <span className="font-medium text-slate-700">
                    {new Date(ticket.updated_at).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* SLA Policy Note */}
            <div className="bg-[#EBF3EE] rounded-2xl p-5 border border-[#C5DFD2] text-xs text-[#0F4C3A] space-y-2">
              <h4 className="font-bold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#10B981]" />
                BookLeaf SLA Commitment
              </h4>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                Critical issues (ISBN errors & print defects) are investigated within 24 hours. General and royalty tickets receive replies within 48 business hours.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PortalShell>
  );
}
