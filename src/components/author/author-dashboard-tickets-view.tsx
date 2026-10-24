"use client";

import React, { useState } from "react";
import {
  BookRecord,
  SafeUser,
  TicketCategory,
  TicketPriority,
  TicketRecord,
  TicketStatus,
  TicketMessageRecord,
} from "@/types/domain";
import { useFastQuery } from "@/lib/client-cache";
import { useTicketRealtime, RealtimeStatusBadge } from "@/lib/use-ticket-realtime";
import { useToast } from "@/context/ToastContext";
import { TableSkeleton } from "@/components/ui/skeleton-loaders";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  FileText,
  Headphones,
  Loader2,
  MessageSquare,
  Paperclip,
  PlusCircle,
  RotateCcw,
  Search,
  Send,
  ThumbsUp,
  Ticket,
  User,
  X,
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
    latest_admin_reply?: string | null;
    latest_admin_reply_at?: string | null;
  }>;
}

interface TicketDetailResponse {
  success: boolean;
  ticket: Omit<TicketRecord, "ai_metadata">;
  book: BookRecord | null;
  messages: TicketMessageRecord[];
}

interface AuthorDashboardTicketsViewProps {
  books: BookRecord[];
  author: SafeUser;
  onNavigateToRaiseQuery: () => void;
}

export function AuthorDashboardTicketsView({
  books,
  author,
  onNavigateToRaiseQuery,
}: AuthorDashboardTicketsViewProps) {
  const toast = useToast();
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);

  // Fetch author tickets
  const { data, isLoading, error, refresh } = useFastQuery<AuthorTicketsResponse>(
    `author:tickets:${statusFilter}`,
    `/api/author/tickets?status=${encodeURIComponent(statusFilter)}`,
    { pollIntervalMs: 3500 }
  );

  // Fetch active ticket details if selected
  const activeTicketQuery = useFastQuery<TicketDetailResponse>(
    selectedTicketId ? `author:ticket:${selectedTicketId}` : "author:ticket:none",
    selectedTicketId ? `/api/author/tickets/${selectedTicketId}` : "",
    { pollIntervalMs: 3000 }
  );

  // Realtime Live WebSocket / SSE Sync
  useTicketRealtime({
    onMessagePosted: (event) => {
      // If author is currently viewing this ticket inside the modal
      if (selectedTicketId && event.ticket_id === selectedTicketId) {
        if (event.payload) {
          const incomingMsg = event.payload as TicketMessageRecord;
          activeTicketQuery.mutate((prev) => {
            if (!prev) return prev as unknown as TicketDetailResponse;
            // Prevent duplicate message insertion
            if (prev.messages.some((m) => m.message_id === incomingMsg.message_id)) {
              return prev;
            }
            return {
              ...prev,
              messages: [...prev.messages, incomingMsg],
            };
          });
        } else {
          activeTicketQuery.refresh();
        }

        if (event.sender_role === "ADMIN") {
          toast.info(
            "New Message from Support",
            `Admin ${event.sender_name || "Support"} has replied to your query.`
          );
        }
      }

      // Also refresh the tickets list to show the latest reply & timestamp
      refresh();
    },

    onTicketUpdated: (event) => {
      if (selectedTicketId && event.ticket_id === selectedTicketId) {
        activeTicketQuery.mutate((prev) => {
          if (!prev) return prev as unknown as TicketDetailResponse;
          return {
            ...prev,
            ticket: {
              ...prev.ticket,
              status: (event.status as TicketStatus) || prev.ticket.status,
            },
          };
        });
      }
      refresh();
    },

    onTicketCreated: () => {
      refresh();
    },
  });

  const allTickets = data?.tickets || [];
  const filteredTickets = allTickets.filter((t) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.ticket_id.toLowerCase().includes(q) ||
      t.subject.toLowerCase().includes(q) ||
      t.book_title.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q)
    );
  });

  const counts = {
    all: allTickets.length,
    open: allTickets.filter((t) => t.status === "Open").length,
    inProgress: allTickets.filter((t) => t.status === "In Progress").length,
    resolved: allTickets.filter((t) => t.status === "Resolved").length,
    closed: allTickets.filter((t) => t.status === "Closed").length,
  };

  async function handleSendReply(e: React.FormEvent) {
    e.preventDefault();
    const textToSend = replyText.trim();
    if (!textToSend || !selectedTicketId) return;

    // Optimistic instantaneous UI update (sub-5ms)
    const optimisticMsgId = `opt_${Date.now()}`;
    const optimisticMsg: TicketMessageRecord = {
      message_id: optimisticMsgId,
      ticket_id: selectedTicketId,
      sender_role: "AUTHOR",
      sender_name: author.name,
      sender_id: author.user_id,
      content: textToSend,
      attachments: [],
      created_at: new Date().toISOString(),
    };

    activeTicketQuery.mutate((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        messages: [...prev.messages, optimisticMsg],
      };
    });

    setReplyText("");
    setIsSendingReply(true);
    setReplyError(null);

    try {
      const res = await fetch(`/api/author/tickets/${selectedTicketId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: textToSend }),
      });
      const resJson = await res.json();
      if (!res.ok || !resJson.success) {
        throw new Error(resJson.error || "Failed to send message");
      }

      // Replace optimistic message with actual persisted record from server
      if (resJson.message) {
        activeTicketQuery.mutate((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            messages: prev.messages.map((m) =>
              m.message_id === optimisticMsgId ? resJson.message : m
            ),
          };
        });
      }

      toast.success("Reply Posted", "Your message was sent to BookLeaf support.");
      refresh();
    } catch (err: any) {
      // Rollback optimistic message on error
      activeTicketQuery.mutate((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          messages: prev.messages.filter((m) => m.message_id !== optimisticMsgId),
        };
      });
      setReplyText(textToSend);
      const msg = err.message || "Failed to send reply";
      setReplyError(msg);
      toast.error("Reply Failed", msg);
    } finally {
      setIsSendingReply(false);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="font-serif text-2xl font-bold text-slate-900 tracking-tight">
              Support Tickets &amp; Author Inquiries
            </h2>
            <RealtimeStatusBadge />
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track your book production, royalty questions, and publishing support tickets.
          </p>
        </div>

        <button
          onClick={onNavigateToRaiseQuery}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#F26979] hover:bg-[#e04555] text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Raise a New Query</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setStatusFilter("ALL")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              statusFilter === "ALL"
                ? "bg-[#0F4C3A] text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <span>All</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">
              {counts.all}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter("Open")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              statusFilter === "Open"
                ? "bg-[#0F4C3A] text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <span>Open</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800">
              {counts.open}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter("In Progress")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              statusFilter === "In Progress"
                ? "bg-[#0F4C3A] text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <span>In Progress</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-800">
              {counts.inProgress}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter("Resolved")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              statusFilter === "Resolved"
                ? "bg-[#0F4C3A] text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <span>Resolved</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800">
              {counts.resolved}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter("Closed")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              statusFilter === "Closed"
                ? "bg-[#0F4C3A] text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <span>Closed</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600">
              {counts.closed}
            </span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search tickets by subject, book..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 bg-white text-xs font-medium focus:ring-2 focus:ring-[#F26979] focus:outline-none"
          />
        </div>
      </div>

      {/* Tickets List Table / Card Stream */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading && filteredTickets.length === 0 ? (
          <TableSkeleton rows={4} />
        ) : filteredTickets.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Ticket className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="font-serif text-base font-bold text-slate-700">No Tickets Found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery
                ? "No support inquiries matched your search term."
                : "You currently have no support tickets in this view."}
            </p>
            <button
              onClick={onNavigateToRaiseQuery}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#F26979] text-white text-xs font-bold hover:bg-[#e04555] transition mt-2"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Raise First Query</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredTickets.map((t) => (
              <div
                key={t.ticket_id}
                onClick={() => setSelectedTicketId(t.ticket_id)}
                className="p-4 sm:p-5 hover:bg-[#FFF9FA]/60 cursor-pointer transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                {/* Left: ID, Subject, Book Title */}
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[#FFF5F6] text-[#F26979] flex items-center justify-center shrink-0 font-bold text-xs group-hover:scale-105 transition-transform">
                    <Ticket className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                        #{t.ticket_id}
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium truncate max-w-xs sm:max-w-md">
                        • {t.book_title}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#F26979] transition-colors line-clamp-1">
                      {t.subject}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-2">{t.description}</p>

                    {/* Admin Reply or Pending Status */}
                    {t.latest_admin_reply ? (
                      <div className="mt-2.5 p-2.5 rounded-xl bg-emerald-50/90 border border-emerald-200/80 text-xs text-emerald-950 flex items-start gap-2 shadow-2xs max-w-xl">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[11px] text-emerald-800 uppercase tracking-wide">
                              Admin Reply:
                            </span>
                            {t.latest_admin_reply_at && (
                              <span className="text-[10px] text-emerald-700/80 font-medium">
                                {new Date(t.latest_admin_reply_at).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                })}
                              </span>
                            )}
                          </div>
                          <p className="text-slate-700 font-normal leading-relaxed line-clamp-2 mt-0.5">
                            {t.latest_admin_reply}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-400 italic">
                        <Clock className="w-3 h-3 text-slate-300" />
                        <span>Awaiting response from BookLeaf Editorial &amp; Support Team (SLA &lt; 4h)</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Badges & Timestamp */}
                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                    {t.category}
                  </span>

                  <span
                    className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold whitespace-nowrap ${
                      t.status === "Resolved"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : t.status === "In Progress"
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : t.status === "Closed"
                        ? "bg-slate-100 text-slate-600 border border-slate-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}
                  >
                    {t.status}
                  </span>

                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-semibold whitespace-nowrap ${
                      t.priority === "Critical"
                        ? "bg-rose-50 text-rose-700 border border-rose-200"
                        : t.priority === "High"
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : "bg-slate-50 text-slate-600 border border-slate-200"
                    }`}
                  >
                    {t.priority}
                  </span>

                  <span className="text-[11px] text-slate-400 min-w-[70px] text-right">
                    {new Date(t.updated_at).toLocaleDateString([], {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>

                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#F26979] group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ==================================================================
          INTERACTIVE TICKET CONVERSATION DRAWER / MODAL
          ================================================================== */}
      {selectedTicketId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-start justify-between gap-4 bg-slate-50/50">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-900 bg-white border border-slate-200 px-2 py-0.5 rounded shadow-2xs">
                    #{selectedTicketId}
                  </span>
                  {activeTicketQuery.data?.ticket && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        activeTicketQuery.data.ticket.status === "Resolved"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : activeTicketQuery.data.ticket.status === "In Progress"
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {activeTicketQuery.data.ticket.status}
                    </span>
                  )}
                  <RealtimeStatusBadge compact />
                </div>
                <h3 className="font-serif text-lg font-bold text-slate-900 leading-snug">
                  {activeTicketQuery.data?.ticket.subject || "Loading Ticket..."}
                </h3>
                <p className="text-xs text-slate-500">
                  Book: {activeTicketQuery.data?.book?.title || "BookLeaf General Inquiry"} •{" "}
                  {activeTicketQuery.data?.ticket.category}
                </p>
              </div>

              <button
                onClick={() => setSelectedTicketId(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Message Thread */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1 bg-[#F9FAF7]">
              {/* Original Query */}
              {activeTicketQuery.data?.ticket && (
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-100 pb-2">
                    <span className="font-bold text-slate-800">
                      {author.name} (Author)
                    </span>
                    <span>
                      {new Date(
                        activeTicketQuery.data.ticket.created_at
                      ).toLocaleString([], {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                    {activeTicketQuery.data.ticket.description}
                  </p>
                </div>
              )}

              {/* Messages Stream */}
              {activeTicketQuery.data?.messages.map((m) => {
                const isAuthor = m.sender_role === "AUTHOR";
                return (
                  <div
                    key={m.message_id}
                    className={`flex flex-col ${isAuthor ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`max-w-[85%] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-2xs ${
                        isAuthor
                          ? "bg-[#F26979] text-white rounded-tr-none"
                          : "bg-white text-slate-800 border border-slate-200 rounded-tl-none"
                      }`}
                    >
                      <div
                        className={`flex items-center justify-between gap-4 text-[11px] mb-1 pb-1 border-b ${
                          isAuthor
                            ? "border-white/20 text-white/80"
                            : "border-slate-100 text-slate-400"
                        }`}
                      >
                        <span className="font-bold">
                          {isAuthor ? "You" : m.sender_name}
                        </span>
                        <span>
                          {new Date(m.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap">{m.content}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Reply Form */}
            <form onSubmit={handleSendReply} className="p-4 bg-white border-t border-slate-200">
              {replyError && (
                <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">
                  {replyError}
                </div>
              )}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Type a follow-up reply for BookLeaf support..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-[#F26979] focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={isSendingReply || !replyText.trim()}
                  className="px-5 py-2.5 rounded-xl bg-[#0F4C3A] hover:bg-[#0A3B2D] text-white text-xs font-bold flex items-center gap-1.5 disabled:opacity-50 transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSendingReply ? "Sending..." : "Reply"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

interface AuthorDashboardRaiseQueryViewProps {
  books: BookRecord[];
  author: SafeUser;
  onSuccess: () => void;
  onCancel: () => void;
}

export function AuthorDashboardRaiseQueryView({
  books,
  author,
  onSuccess,
  onCancel,
}: AuthorDashboardRaiseQueryViewProps) {
  const toast = useToast();
  const [selectedBookId, setSelectedBookId] = useState<string>(
    books[0]?.book_id || ""
  );
  const [category, setCategory] = useState<TicketCategory>("Royalty & Payments");
  const [priority, setPriority] = useState<TicketPriority>("Medium");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [attachment, setAttachment] = useState<{
    filename: string;
    size: string;
    sizeBytes: number;
    mimeType: string;
    dataUrl?: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Gemini AI Instant Resolution State
  const [isGettingAiHelp, setIsGettingAiHelp] = useState(false);
  const [aiSolution, setAiSolution] = useState<string | null>(null);
  const [aiProvider, setAiProvider] = useState<string | null>(null);

  async function handleGetInstantAiHelp() {
    if (!subject.trim() && !description.trim()) {
      toast.warning(
        "Details Required",
        "Please provide a subject or description first so we can check publishing guidelines."
      );
      return;
    }

    setIsGettingAiHelp(true);
    setAiSolution(null);

    try {
      const res = await fetch("/api/ai/instant-ticket-help", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: subject.trim(),
          description: description.trim(),
          category,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to fetch instant solution");
      }

      setAiSolution(data.solution);
      setAiProvider(data.provider || "BookLeaf Guidelines");
      toast.info("Policy Solution Ready", "Verified publishing policy match found for your inquiry.");
    } catch (err: any) {
      toast.error("Lookup Error", err?.message || "Could not retrieve guidelines answer.");
    } finally {
      setIsGettingAiHelp(false);
    }
  }

  function handleAttachmentChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File Too Large", "Maximum attachment size is 10MB.");
      return;
    }
    const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
    const sizeText = file.size > 1024 * 1024 ? `${sizeMb} MB` : `${Math.round(file.size / 1024)} KB`;

    const ext = file.name.toLowerCase().split('.').pop();
    let mimeType = file.type;
    if (!mimeType || mimeType === 'application/octet-stream') {
      if (ext === 'jpg' || ext === 'jpeg') mimeType = 'image/jpeg';
      else if (ext === 'png') mimeType = 'image/png';
      else if (ext === 'webp') mimeType = 'image/webp';
      else if (ext === 'pdf') mimeType = 'application/pdf';
      else if (ext === 'txt') mimeType = 'text/plain';
      else mimeType = 'image/jpeg';
    }

    setAttachment({
      filename: file.name,
      size: sizeText,
      sizeBytes: file.size,
      mimeType,
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      setErrorMsg("Please provide both a subject and details for your query.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/author/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          book_id: selectedBookId || null,
          category,
          priority,
          subject: subject.trim(),
          description: description.trim(),
          attachments: attachment
            ? [
                {
                  name: attachment.filename,
                  size: attachment.sizeBytes || 10240,
                  type: attachment.mimeType || "image/jpeg",
                  url: `/uploads/${attachment.filename}`,
                },
              ]
            : [],
        }),
      });

      const resJson = await res.json();
      if (!res.ok || !resJson.success) {
        const detailMsg =
          (Array.isArray(resJson.details) && resJson.details[0]?.message) ||
          resJson.error ||
          "Failed to submit support ticket";
        throw new Error(detailMsg);
      }

      toast.success(
        "Support Query Filed",
        "Your inquiry has been queued for editorial review and email notification sent."
      );
      onSuccess();
    } catch (err: any) {
      const msg = err.message || "Failed to submit support ticket.";
      setErrorMsg(msg);
      toast.error("Ticket Submission Failed", msg);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm max-w-3xl space-y-6 animate-fade-in">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h2 className="font-serif text-2xl font-bold text-slate-900 tracking-tight">
            Raise a Support Query
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Submit a direct inquiry to BookLeaf Publishing&apos;s editorial, royalty, or production team.
          </p>
        </div>
        <button
          onClick={onCancel}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
        >
          Cancel
        </button>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Associated Book
            </label>
            <select
              value={selectedBookId}
              onChange={(e) => setSelectedBookId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-[#F26979] focus:outline-none bg-slate-50/50"
            >
              <option value="">General Inquiry (No specific book)</option>
              {books.map((b) => (
                <option key={b.book_id} value={b.book_id}>
                  {b.title} ({b.status})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as TicketCategory)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-[#F26979] focus:outline-none bg-slate-50/50"
            >
              <option value="Royalty & Payments">Royalty &amp; Payments</option>
              <option value="Book Status & Production Updates">
                Book Status &amp; Production Updates
              </option>
              <option value="Printing & Quality">Printing &amp; Quality</option>
              <option value="Distribution & Availability">
                Distribution &amp; Availability
              </option>
              <option value="ISBN & Metadata Issues">ISBN &amp; Metadata Issues</option>
              <option value="General Inquiry">General Inquiry</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Priority Level
          </label>
          <div className="grid grid-cols-4 gap-2">
            {(["Low", "Medium", "High", "Critical"] as TicketPriority[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPriority(p)}
                className={`py-2 text-xs font-bold rounded-xl border transition ${
                  priority === p
                    ? p === "Critical"
                      ? "bg-rose-50 border-rose-300 text-rose-700"
                      : p === "High"
                      ? "bg-amber-50 border-amber-300 text-amber-700"
                      : "bg-[#0F4C3A] border-[#0F4C3A] text-white"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Subject
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Question about Q4 royalty calculation for Whispers of the Ganges"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-[#F26979] focus:outline-none"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Detailed Query Description
            </label>
            <button
              type="button"
              onClick={handleGetInstantAiHelp}
              disabled={isGettingAiHelp}
              className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#0F4C3A] hover:text-[#0A3B2D] bg-emerald-50 hover:bg-emerald-100 px-3 py-1 rounded-lg border border-emerald-200 transition shadow-2xs"
            >
              {isGettingAiHelp ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0F4C3A]" />
                  <span>Checking Guidelines...</span>
                </>
              ) : (
                <>
                  <BookOpen className="w-3.5 h-3.5 text-[#0F4C3A]" />
                  <span>Instant Policy Lookup</span>
                </>
              )}
            </button>
          </div>
          <textarea
            required
            rows={5}
            placeholder="Please provide full details, dates, or specific questions so our editorial operations team can assist you promptly..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-[#0F4C3A] focus:outline-none leading-relaxed"
          />

          {/* Guidelines Instant Solution Box */}
          {aiSolution && (
            <div className="mt-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs animate-fade-in space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-[#0F4C3A] text-white flex items-center justify-center shadow-xs">
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span>Publishing Policy Resolution</span>
                      <span className="text-[10px] font-medium text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                        {aiProvider}
                      </span>
                    </h4>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAiSolution(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-white p-3.5 rounded-xl border border-slate-200">
                {aiSolution}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <p className="text-[11px] text-slate-700">
                  Did this answer resolve your inquiry without submitting a ticket?
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      toast.success(
                        "Query Resolved",
                        "Inquiry closed based on publishing guidelines."
                      );
                      onSuccess();
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0F4C3A] hover:bg-[#0A3B2D] text-white font-bold text-xs transition shadow-xs"
                  >
                    <ThumbsUp className="w-3 h-3" />
                    <span>Solved! Close Query</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      toast.info("Proceeding", "You can submit the ticket below for editorial review.");
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium text-xs transition"
                  >
                    Submit for Editorial Review
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Optional Attachment Upload */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Optional Attachment (Images, Invoices, PDFs)
          </label>
          {attachment ? (
            <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
              <div className="flex items-center gap-2 text-emerald-900 font-medium">
                <Paperclip className="w-4 h-4 text-emerald-600" />
                <span className="font-bold">{attachment.filename}</span>
                <span className="text-[11px] text-emerald-700 font-mono">({attachment.size})</span>
              </div>
              <button
                type="button"
                onClick={() => setAttachment(null)}
                className="text-emerald-700 hover:text-rose-600 transition p-1"
                title="Remove attachment"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label
              htmlFor="ticket-attachment-input"
              className="flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-slate-300 hover:border-[#F26979] hover:bg-[#FFF9FA] cursor-pointer transition text-xs text-slate-600"
            >
              <Paperclip className="w-4 h-4 text-slate-400" />
              <span>Click to attach file or screenshot (PNG, JPG, PDF up to 10MB)</span>
              <input
                id="ticket-attachment-input"
                type="file"
                accept="image/*,.pdf,.doc,.docx"
                onChange={handleAttachmentChange}
                className="hidden"
              />
            </label>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-[#F26979] hover:bg-[#e04555] text-white text-xs font-bold transition shadow-sm hover:shadow disabled:opacity-50 flex items-center gap-2"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSubmitting ? "Submitting Ticket..." : "Submit Support Query"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
