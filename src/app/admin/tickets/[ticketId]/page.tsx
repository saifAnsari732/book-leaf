"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { PortalShell } from "@/components/layout/portal-shell";
import { invalidateClientCache, useFastQuery } from "@/lib/client-cache";
import { useTicketRealtime, RealtimeStatusBadge } from "@/lib/use-ticket-realtime";
import {
  AuditLogRecord,
  BookRecord,
  InternalNoteRecord,
  SafeUser,
  TICKET_CATEGORIES,
  TICKET_PRIORITIES,
  TICKET_STATUSES,
  TicketCategory,
  TicketMessageRecord,
  TicketPriority,
  TicketRecord,
  TicketStatus,
} from "@/types/domain";
import {
  BookProductionStagePipeline,
  formatDateTime,
  formatINR,
  formatNullableINR,
  formatRelativeTime,
  TicketCategoryBadge,
  TicketPriorityBadge,
  TicketStatusBadge,
} from "@/components/ui/badges";
import { useToast } from "@/context/ToastContext";
import {
  AlertCircle,
  ArrowLeft,
  Bookmark,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  Copy,
  ExternalLink,
  EyeOff,
  FileEdit,
  FileText,
  Lock,
  Mail,
  Paperclip,
  Phone,
  RefreshCw,
  Send,
  ShieldCheck,
  User,
  UserCheck,
} from "lucide-react";

interface AdminTicketDetailResponse {
  success: boolean;
  ticket: TicketRecord;
  author: SafeUser | null;
  book: BookRecord | null;
  authorAllBooks: BookRecord[];
  messages: TicketMessageRecord[];
  internalNotes: InternalNoteRecord[];
  auditLogs: AuditLogRecord[];
}

const CANNED_TEMPLATES = [
  {
    id: "royalty",
    title: "Royalty & Payout",
    icon: FileText,
    generate: (ticket: TicketRecord, book: BookRecord | null) =>
      `Dear ${ticket.author_name},\n\nWe have thoroughly reviewed your royalty account inquiry for "${ticket.book_title || book?.title || "your book"}". Our finance desk has reconciled the sales ledger and verified the pending balance. Please ensure that your registered bank account and IFSC code on the BookLeaf portal are current so our automated payout run can process smoothly.\n\nWarm regards,\nBookLeaf Publishing Accounts Desk`,
  },
  {
    id: "isbn",
    title: "ISBN & Metadata",
    icon: Bookmark,
    generate: (ticket: TicketRecord, book: BookRecord | null) =>
      `Dear ${ticket.author_name},\n\nRegarding the metadata and ISBN listing for "${ticket.book_title || book?.title || "your book"}", we have updated the Bowker and Ingram distribution feeds. Channel synchronization typically reflects across Amazon, Flipkart, and the BookLeaf Global Store within 24 to 48 hours.\n\nWarm regards,\nBookLeaf Publishing Distribution Team`,
  },
  {
    id: "quality",
    title: "Print Quality Batch",
    icon: CheckCircle2,
    generate: (ticket: TicketRecord, book: BookRecord | null) =>
      `Dear ${ticket.author_name},\n\nThank you for bringing this print quality observation to our attention. We have logged this with our manufacturing and fulfillment partner (Repro India). A complimentary replacement copy is being expedited to your registered shipping address.\n\nWarm regards,\nBookLeaf Production Operations`,
  },
  {
    id: "resolved",
    title: "Resolution & Closure",
    icon: ShieldCheck,
    generate: (ticket: TicketRecord, _book: BookRecord | null) =>
      `Dear ${ticket.author_name},\n\nWe are pleased to inform you that your support ticket (#${ticket.ticket_id}) has been addressed and resolved by our editorial team. Should you require any further assistance, feel free to reply directly to this thread.\n\nThank you for publishing with BookLeaf!\n\nWarm regards,\nBookLeaf Author Support Desk`,
  },
];

export default function AdminTicketDetailWorkbenchPage() {
  const params = useParams<{ ticketId: string }>();
  const ticketId = params.ticketId;
  const router = useRouter();
  const toast = useToast();

  const sessionQuery = useFastQuery<{ success: boolean; user: SafeUser }>(
    "auth:session",
    "/api/auth/session"
  );

  const detailQuery = useFastQuery<AdminTicketDetailResponse>(
    `admin:ticket:${ticketId}`,
    `/api/admin/tickets/${ticketId}`,
    { pollIntervalMs: 4000 }
  );

  const [draftContent, setDraftContent] = useState("");
  const [draftInitializedFor, setDraftInitializedFor] = useState<string | null>(
    null
  );
  const [sendStatusOnReply, setSendStatusOnReply] =
    useState<TicketStatus>("In Progress");
  const [customInstruction, setCustomInstruction] = useState("");
  const [internalNoteText, setInternalNoteText] = useState("");

  const [isUpdatingMeta, setIsUpdatingMeta] = useState(false);
  const [isRefreshingDraft, setIsRefreshingDraft] = useState(false);
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [feedbackBanner, setFeedbackBanner] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Real-time Live WebSocket & SSE Ticket Workbench Sync
  useTicketRealtime({
    ticketIdFilter: ticketId,
    onMessagePosted: (event) => {
      if (event.payload) {
        const incomingMsg = event.payload as TicketMessageRecord;
        detailQuery.mutate((prev) => {
          if (!prev) return prev;
          if (prev.messages.some((m) => m.message_id === incomingMsg.message_id)) {
            return prev;
          }
          return {
            ...prev,
            messages: [...prev.messages, incomingMsg],
          };
        });
      } else {
        detailQuery.refresh();
      }

      if (event.sender_role === "AUTHOR") {
        setFeedbackBanner({
          type: "success",
          text: `⚡ Live Message Received: ${event.sender_name || "Author"} just sent a message.`,
        });
      }
    },
    onTicketUpdated: (event) => {
      detailQuery.mutate((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          ticket: {
            ...prev.ticket,
            status: (event.status as TicketStatus) || prev.ticket.status,
            priority: (event.priority as TicketPriority) || prev.ticket.priority,
            category: (event.category as TicketCategory) || prev.ticket.category,
            assigned_to:
              event.assigned_to !== undefined
                ? event.assigned_to
                : prev.ticket.assigned_to,
          },
        };
      });
    },
  });

  useEffect(() => {
    if (
      detailQuery.data?.ticket &&
      draftInitializedFor !== detailQuery.data.ticket.ticket_id
    ) {
      setDraftContent(detailQuery.data.ticket.ai_metadata.draft_reply);
      setDraftInitializedFor(detailQuery.data.ticket.ticket_id);
      if (detailQuery.data.ticket.status === "Open") {
        setSendStatusOnReply("In Progress");
      } else {
        setSendStatusOnReply(detailQuery.data.ticket.status);
      }
    }
  }, [detailQuery.data, draftInitializedFor]);

  async function handleUpdateTicketField(updates: {
    status?: TicketStatus;
    category?: TicketCategory;
    priority?: TicketPriority;
    assigned_to?: string | null;
  }) {
    setIsUpdatingMeta(true);
    setFeedbackBanner(null);
    try {
      const res = await fetch(`/api/admin/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setFeedbackBanner({
          type: "error",
          text: json.error || "Failed to update ticket",
        });
        return;
      }
      invalidateClientCache("admin:");
      invalidateClientCache("author:");
      detailQuery.refresh();
      setFeedbackBanner({
        type: "success",
        text: "Ticket metadata updated successfully.",
      });
    } finally {
      setIsUpdatingMeta(false);
    }
  }

  async function handleRefreshEditorialDraft() {
    setIsRefreshingDraft(true);
    setFeedbackBanner(null);
    try {
      const res = await fetch(`/api/admin/tickets/${ticketId}/draft-reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          custom_instruction: customInstruction || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setFeedbackBanner({
          type: "error",
          text: json.error || "Failed to refresh editorial draft response",
        });
        toast.error("Draft Error", json.error || "Failed to refresh draft response.");
        return;
      }
      setDraftContent(json.ai_metadata.draft_reply);
      detailQuery.refresh();
      setFeedbackBanner({
        type: "success",
        text: "Editorial draft response refreshed successfully. Review and edit before sending.",
      });
      toast.success("Draft Refreshed", "Loaded updated editorial draft response.");
    } finally {
      setIsRefreshingDraft(false);
    }
  }

  async function handleSendApprovedReply(e: React.FormEvent) {
    e.preventDefault();
    const contentToSend = draftContent.trim();
    if (!contentToSend) return;

    // Optimistic instantaneous UI update (sub-5ms)
    const optimisticMsgId = `opt_${Date.now()}`;
    const optimisticMsg: TicketMessageRecord = {
      message_id: optimisticMsgId,
      ticket_id: ticketId,
      sender_role: "ADMIN",
      sender_name: adminUser.name,
      sender_id: adminUser.user_id,
      content: contentToSend,
      attachments: [],
      created_at: new Date().toISOString(),
    };

    detailQuery.mutate((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        ticket: {
          ...prev.ticket,
          status: sendStatusOnReply,
          assigned_to: prev.ticket.assigned_to || adminUser.name,
        },
        messages: [...prev.messages, optimisticMsg],
      };
    });

    setIsSendingReply(true);
    setFeedbackBanner(null);

    try {
      const res = await fetch(`/api/admin/tickets/${ticketId}/send-reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: contentToSend,
          status: sendStatusOnReply,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to send response");
      }

      if (json.message) {
        detailQuery.mutate((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            messages: prev.messages.map((m) =>
              m.message_id === optimisticMsgId ? json.message : m
            ),
          };
        });
      }

      invalidateClientCache("admin:");
      invalidateClientCache("author:");
      setFeedbackBanner({
        type: "success",
        text: "⚡ Response sent to author via WebSocket! Synced in real time.",
      });
    } catch (err: any) {
      // Revert optimistic message on error
      detailQuery.mutate((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          messages: prev.messages.filter((m) => m.message_id !== optimisticMsgId),
        };
      });
      setFeedbackBanner({
        type: "error",
        text: err.message || "Failed to send response",
      });
    } finally {
      setIsSendingReply(false);
    }
  }

  async function handleAddInternalNote(e: React.FormEvent) {
    e.preventDefault();
    if (!internalNoteText.trim()) return;
    setIsAddingNote(true);
    setFeedbackBanner(null);

    try {
      const res = await fetch(`/api/admin/tickets/${ticketId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: internalNoteText }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setFeedbackBanner({
          type: "error",
          text: json.error || "Could not save internal note",
        });
        return;
      }
      setInternalNoteText("");
      detailQuery.refresh();
      setFeedbackBanner({
        type: "success",
        text: "Private internal note saved (strictly hidden from author).",
      });
    } finally {
      setIsAddingNote(false);
    }
  }

  if (detailQuery.error || sessionQuery.error) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm text-red-600 mb-3">
          {detailQuery.error || sessionQuery.error}
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

  if (
    sessionQuery.isLoading ||
    !sessionQuery.data ||
    detailQuery.isLoading ||
    !detailQuery.data
  ) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-4">
        <div className="h-10 w-64 rounded animate-shimmer" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 h-96 rounded-xl animate-shimmer" />
          <div className="lg:col-span-4 h-96 rounded-xl animate-shimmer" />
        </div>
      </div>
    );
  }

  const adminUser = sessionQuery.data.user;
  const {
    ticket,
    author,
    book,
    authorAllBooks,
    messages,
    internalNotes,
    auditLogs,
  } = detailQuery.data;

  return (
    <PortalShell
      user={adminUser}
      lastSyncedAt={detailQuery.lastSyncedAt}
      onManualRefresh={detailQuery.refresh}
      isRefreshing={detailQuery.isRefreshing}
    >
      <div className="space-y-6 animate-fade-up">
        {/* Top Bar & Feedback Banner */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/tickets"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              Back to Ticket Queue
            </Link>
            <RealtimeStatusBadge />
          </div>

          <div className="flex items-center gap-2">
            {ticket.assigned_to === adminUser.name ? (
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs font-semibold text-emerald-800">
                <UserCheck className="h-3.5 w-3.5" aria-hidden="true" />
                Assigned to You ({ticket.assigned_to})
              </span>
            ) : (
              <button
                type="button"
                onClick={() =>
                  handleUpdateTicketField({ assigned_to: adminUser.name })
                }
                disabled={isUpdatingMeta}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#0E2842] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#163f68] cursor-pointer"
              >
                <UserCheck className="h-3.5 w-3.5" aria-hidden="true" />
                Assign Ticket to Me
              </button>
            )}
          </div>
        </div>

        {feedbackBanner && (
          <div
            role="status"
            className={`flex items-center justify-between rounded-xl border px-4 py-3 text-xs font-medium ${
              feedbackBanner.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                : "border-red-200 bg-red-50 text-red-900"
            }`}
          >
            <span className="flex items-center gap-2">
              {feedbackBanner.type === "success" ? (
                <CheckCircle2
                  className="h-4 w-4 text-emerald-600 shrink-0"
                  aria-hidden="true"
                />
              ) : (
                <AlertCircle
                  className="h-4 w-4 text-red-600 shrink-0"
                  aria-hidden="true"
                />
              )}
              {feedbackBanner.text}
            </span>
            <button
              type="button"
              onClick={() => setFeedbackBanner(null)}
              className="text-xs underline ml-4 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* ================================================================
            4-STEP INTERACTIVE TICKET RESOLUTION LIFECYCLE STEPPER
            ================================================================ */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Ticket Resolution Lifecycle
              </span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-sky-50 text-[#0288D1] border border-sky-200 font-bold">
                Status: {ticket.status}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400 font-medium">Quick Transition:</span>
              {ticket.status !== "In Progress" && (
                <button
                  type="button"
                  onClick={() => handleUpdateTicketField({ status: "In Progress" })}
                  disabled={isUpdatingMeta}
                  className="px-3 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold transition cursor-pointer"
                >
                  Mark In Progress
                </button>
              )}
              {ticket.status !== "Resolved" && (
                <button
                  type="button"
                  onClick={() => handleUpdateTicketField({ status: "Resolved" })}
                  disabled={isUpdatingMeta}
                  className="px-3 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition cursor-pointer"
                >
                  Mark Resolved
                </button>
              )}
              {ticket.status !== "Closed" && (
                <button
                  type="button"
                  onClick={() => handleUpdateTicketField({ status: "Closed" })}
                  disabled={isUpdatingMeta}
                  className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-bold transition cursor-pointer"
                >
                  Close Ticket
                </button>
              )}
            </div>
          </div>

          {/* Stepper Steps Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Step 1: Logged */}
            <div className="flex items-center gap-3 p-3 rounded-xl border border-emerald-200 bg-emerald-50/50">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                  Step 1 • Logged
                </span>
                <span className="text-xs font-bold text-slate-900 block truncate">
                  Author Submitted
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {formatDateTime(ticket.created_at).slice(0, 11)}
                </span>
              </div>
            </div>

            {/* Step 2: Under Review */}
            <div
              className={`flex items-center gap-3 p-3 rounded-xl border ${
                ticket.assigned_to || ticket.status !== "Open"
                  ? "border-emerald-200 bg-emerald-50/50"
                  : "border-sky-200 bg-sky-50/50"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white ${
                  ticket.assigned_to || ticket.status !== "Open"
                    ? "bg-emerald-600"
                    : "bg-[#0288D1]"
                }`}
              >
                {ticket.assigned_to || ticket.status !== "Open" ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Clock className="w-4 h-4" />
                )}
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  Step 2 • Triage
                </span>
                <span className="text-xs font-bold text-slate-900 block truncate">
                  {ticket.assigned_to ? "Admin Assigned" : "Awaiting Triage"}
                </span>
                <span className="text-[10px] text-slate-500 truncate block">
                  {ticket.assigned_to || "Unassigned"}
                </span>
              </div>
            </div>

            {/* Step 3: Action / In Progress */}
            <div
              className={`flex items-center gap-3 p-3 rounded-xl border ${
                ticket.status === "In Progress"
                  ? "border-amber-300 bg-amber-50/60 ring-2 ring-amber-400/30"
                  : ticket.status === "Resolved" || ticket.status === "Closed"
                  ? "border-emerald-200 bg-emerald-50/50"
                  : "border-slate-200 bg-slate-50 opacity-60"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white ${
                  ticket.status === "Resolved" || ticket.status === "Closed"
                    ? "bg-emerald-600"
                    : ticket.status === "In Progress"
                    ? "bg-amber-500"
                    : "bg-slate-400"
                }`}
              >
                {ticket.status === "Resolved" || ticket.status === "Closed" ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <FileText className="w-4 h-4" />
                )}
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  Step 3 • Action
                </span>
                <span className="text-xs font-bold text-slate-900 block truncate">
                  {ticket.status === "In Progress"
                    ? "Desk In Progress"
                    : ticket.status === "Resolved" || ticket.status === "Closed"
                    ? "Action Complete"
                    : "Pending Action"}
                </span>
                <span className="text-[10px] text-slate-500 truncate block">
                  {ticket.category}
                </span>
              </div>
            </div>

            {/* Step 4: Resolution */}
            <div
              className={`flex items-center gap-3 p-3 rounded-xl border ${
                ticket.status === "Resolved" || ticket.status === "Closed"
                  ? "border-emerald-300 bg-emerald-50 ring-2 ring-emerald-500/30"
                  : "border-slate-200 bg-slate-50 opacity-60"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white ${
                  ticket.status === "Resolved" || ticket.status === "Closed"
                    ? "bg-emerald-600"
                    : "bg-slate-400"
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  Step 4 • Closure
                </span>
                <span className="text-xs font-bold text-slate-900 block truncate">
                  {ticket.status === "Resolved" || ticket.status === "Closed"
                    ? "Resolved & Notified"
                    : "Pending Closure"}
                </span>
                <span className="text-[10px] text-slate-500 truncate block">
                  {ticket.status === "Resolved" ? "Email Delivered" : "Awaiting Result"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (8 cols): Ticket Header, Editorial Draft Workbench, External Thread & Internal Notes */}
          <div className="lg:col-span-8 space-y-6">
            {/* Ticket Summary & Override Controls */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-sm font-bold text-[#1B4D7E]">
                    {ticket.ticket_id}
                  </span>
                  <TicketStatusBadge status={ticket.status} />
                  <TicketPriorityBadge priority={ticket.priority} />
                  <TicketCategoryBadge category={ticket.category} />
                </div>
                <span className="text-xs text-slate-500">
                  Created {formatDateTime(ticket.created_at)}
                </span>
              </div>

              <h1 className="font-serif text-xl sm:text-2xl font-bold text-slate-900">
                {ticket.subject}
              </h1>

              {/* Admin Override Controls (Status, Category, Priority) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-200">
                <div>
                  <label
                    htmlFor="admin-status-select"
                    className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1"
                  >
                    Ticket Status
                  </label>
                  <select
                    id="admin-status-select"
                    value={ticket.status}
                    disabled={isUpdatingMeta}
                    onChange={(e) =>
                      handleUpdateTicketField({
                        status: e.target.value as TicketStatus,
                      })
                    }
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900"
                  >
                    {TICKET_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="admin-category-select"
                    className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1"
                  >
                    Category (Manual Classification)
                  </label>
                  <select
                    id="admin-category-select"
                    value={ticket.category}
                    disabled={isUpdatingMeta}
                    onChange={(e) =>
                      handleUpdateTicketField({
                        category: e.target.value as TicketCategory,
                      })
                    }
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900"
                  >
                    {TICKET_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="admin-priority-select"
                    className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1"
                  >
                    Priority (Manual Triage)
                  </label>
                  <select
                    id="admin-priority-select"
                    value={ticket.priority}
                    disabled={isUpdatingMeta}
                    onChange={(e) =>
                      handleUpdateTicketField({
                        priority: e.target.value as TicketPriority,
                      })
                    }
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900"
                  >
                    {TICKET_PRIORITIES.map((pri) => (
                      <option key={pri} value={pri}>
                        {pri}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Editorial Draft Response Editor (Knowledge Base + Book Grounded) */}
            <div className="rounded-2xl border-2 border-sky-200 bg-white overflow-hidden shadow-sm">
              <div className="bg-[#0E2842] px-6 py-4 text-white flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <FileEdit
                    className="h-5 w-5 text-sky-300"
                    aria-hidden="true"
                  />
                  <div>
                    <h2 className="text-sm font-bold">
                      Editorial Response Workbench
                    </h2>
                    <p className="text-[11px] text-slate-300">
                      Grounded in BookLeaf Knowledge Base &{" "}
                      {book ? `"${book.title}"` : "Author"} Database Diagnostics
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-[11px]">
                  <span className="rounded-full bg-white/10 border border-white/15 px-2.5 py-0.5 font-semibold text-sky-200 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-sky-300" />
                    Editorial Desk Active
                  </span>
                  <span className="rounded-full bg-emerald-500/20 border border-emerald-400/30 px-2.5 py-0.5 font-semibold text-emerald-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                    Gmail SMTP Auto-Dispatch
                  </span>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {/* Publishing Desk Diagnostic Summary Bar */}
                <div className="rounded-xl border border-sky-200 bg-sky-50/60 p-3.5 text-xs space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-bold text-[#1B4D7E] flex items-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5 text-sky-600" aria-hidden="true" />
                      Publishing Desk Diagnostic Summary:
                    </span>
                    <span className="text-[11px] text-slate-600">
                      Suggested:{" "}
                      <strong>{ticket.ai_metadata.suggested_category}</strong> •{" "}
                      <strong>{ticket.ai_metadata.suggested_priority}</strong>
                      {ticket.ai_metadata.human_overridden &&
                        " (Modified by Admin)"}
                    </span>
                  </div>
                  <p className="text-slate-700 leading-relaxed">
                    {ticket.ai_metadata.rationale}
                  </p>
                </div>

                {/* Regenerate with optional instruction */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={customInstruction}
                    onChange={(e) => setCustomInstruction(e.target.value)}
                    placeholder="Optional guidance to tailor draft response (e.g., 'Ask author to confirm IFSC code')..."
                    className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-800 focus:border-[#1B4D7E] focus:bg-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleRefreshEditorialDraft}
                    disabled={isRefreshingDraft}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-sky-300 bg-sky-50 px-3.5 py-2 text-xs font-semibold text-[#1B4D7E] hover:bg-sky-100 transition-colors cursor-pointer shrink-0"
                  >
                    <RefreshCw
                      className={`h-3.5 w-3.5 ${
                        isRefreshingDraft ? "animate-spin" : ""
                      }`}
                      aria-hidden="true"
                    />
                    {isRefreshingDraft
                      ? "Refreshing..."
                      : "Refresh Response Draft"}
                  </button>
                </div>

                {/* Quick Canned Response Templates */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Quick Editorial Snippets
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Click template to populate draft response
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {CANNED_TEMPLATES.map((tpl) => (
                      <button
                        key={tpl.id}
                        type="button"
                        onClick={() => {
                          setDraftContent(tpl.generate(ticket, book));
                          toast.success("Template Loaded", `Loaded "${tpl.title}" template.`);
                        }}
                        className="flex items-center gap-1.5 p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-sky-50 hover:border-sky-300 text-slate-700 text-left text-xs font-semibold transition cursor-pointer"
                      >
                        <tpl.icon className="w-3.5 h-3.5 text-[#0288D1] shrink-0" />
                        <span className="truncate">{tpl.title}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Editable Draft Textarea + Send Form */}
                <form onSubmit={handleSendApprovedReply} className="space-y-3">
                  <div>
                    <label
                      htmlFor="editorial-draft-textarea"
                      className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
                    >
                      Review &amp; Edit Response Before Sending to Author:
                    </label>
                    <textarea
                      id="editorial-draft-textarea"
                      rows={9}
                      required
                      value={draftContent}
                      onChange={(e) => setDraftContent(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white p-4 text-sm text-slate-900 leading-relaxed focus:border-[#1B4D7E] focus:outline-none focus:ring-2 focus:ring-[#1B4D7E]/20"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-2 text-xs">
                      <label
                        htmlFor="reply-status-transition"
                        className="font-semibold text-slate-700"
                      >
                        Set Ticket Status on Send:
                      </label>
                      <select
                        id="reply-status-transition"
                        value={sendStatusOnReply}
                        onChange={(e) =>
                          setSendStatusOnReply(e.target.value as TicketStatus)
                        }
                        className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-900"
                      >
                        {TICKET_STATUSES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={isSendingReply || !draftContent.trim()}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60 transition-all cursor-pointer"
                    >
                      {isSendingReply ? (
                        <RefreshCw
                          className="h-4 w-4 animate-spin"
                          aria-hidden="true"
                        />
                      ) : (
                        <Send className="h-4 w-4" aria-hidden="true" />
                      )}
                      Approve &amp; Send Response to {ticket.author_name}
                    </button>
                  </div>

                  {/* Gmail SMTP Dispatch Indicator */}
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-slate-50 rounded-xl p-2.5 border border-slate-200">
                    <Mail className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>
                      An official branded update email will be dispatched to <strong>{ticket.author_email}</strong> via Gmail SMTP upon approval.
                    </span>
                  </div>
                </form>
              </div>
            </div>

            {/* External Conversation History (Visible to Author) */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <h2 className="font-serif text-lg font-bold text-slate-900">
                Author-Visible Conversation Timeline ({messages.length})
              </h2>

              <div className="space-y-4">
                {messages.map((msg) => {
                  const isAdminMsg = msg.sender_role === "ADMIN";
                  return (
                    <div
                      key={msg.message_id}
                      className={`rounded-xl border p-4 ${
                        isAdminMsg
                          ? "border-sky-200 bg-sky-50/40 ml-0 sm:ml-6"
                          : "border-slate-200 bg-slate-50 mr-0 sm:mr-6"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900">
                          {isAdminMsg ? (
                            <ShieldCheck
                              className="h-4 w-4 text-[#1B4D7E]"
                              aria-hidden="true"
                            />
                          ) : (
                            <User
                              className="h-4 w-4 text-slate-600"
                              aria-hidden="true"
                            />
                          )}
                          {msg.sender_name} ({msg.sender_role})
                        </span>
                        <span className="text-xs text-slate-400">
                          {formatRelativeTime(msg.created_at)}
                        </span>
                      </div>
                      <p className="text-sm text-slate-800 whitespace-pre-line leading-relaxed">
                        {msg.content}
                      </p>
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-slate-200/60 flex flex-wrap gap-2">
                          {msg.attachments.map((att, idx) => (
                            <a
                              key={idx}
                              href={att.url || "#"}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 rounded bg-white border border-slate-200 px-2 py-1 text-xs font-medium text-[#1B4D7E]"
                            >
                              <Paperclip
                                className="h-3 w-3"
                                aria-hidden="true"
                              />
                              {att.name}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Private Internal Ops Notes (Strictly Hidden from Author) */}
            <div className="rounded-2xl border-2 border-amber-200 bg-amber-50/30 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <EyeOff
                    className="h-5 w-5 text-amber-700"
                    aria-hidden="true"
                  />
                  <div>
                    <h2 className="font-serif text-lg font-bold text-amber-950">
                      Private Internal Operations Notes ({internalNotes.length})
                    </h2>
                    <p className="text-xs text-amber-800">
                      Stored in an isolated collection—never visible or
                      serialized to the author.
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 border border-amber-300 px-2.5 py-0.5 text-[11px] font-bold text-amber-900">
                  <Lock className="h-3 w-3" aria-hidden="true" />
                  Admin Only
                </span>
              </div>

              {internalNotes.length > 0 && (
                <div className="space-y-2.5">
                  {internalNotes.map((note) => (
                    <div
                      key={note.note_id}
                      className="rounded-xl border border-amber-200 bg-white p-3.5 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between text-amber-900 font-semibold">
                        <span>{note.admin_name}</span>
                        <span className="text-amber-700/80">
                          {formatRelativeTime(note.created_at)}
                        </span>
                      </div>
                      <p className="text-slate-800 leading-relaxed whitespace-pre-line">
                        {note.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <form onSubmit={handleAddInternalNote} className="space-y-2.5">
                <label
                  htmlFor="internal-note-input"
                  className="block text-xs font-bold uppercase tracking-wider text-amber-900"
                >
                  Add Internal Note
                </label>
                <textarea
                  id="internal-note-input"
                  rows={2}
                  required
                  value={internalNoteText}
                  onChange={(e) => setInternalNoteText(e.target.value)}
                  placeholder="Add an internal ops note (e.g., escalated to Finance / Repro India print batch #442)..."
                  className="w-full rounded-xl border border-amber-300 bg-white p-3 text-xs sm:text-sm text-slate-900 focus:border-amber-600 focus:outline-none"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isAddingNote || !internalNoteText.trim()}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-amber-700 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-800 disabled:opacity-60 cursor-pointer"
                  >
                    <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                    {isAddingNote ? "Saving Note..." : "Save Internal Note"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column (4 cols): Author & Book Database Context Inspector */}
          <div className="lg:col-span-4 space-y-5">
            {/* Author Profile Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#1B4D7E] block">
                  Author Account Context
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Verified Author
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {ticket.author_name}
                </h3>
                <p className="text-xs font-mono text-slate-500 mb-2">
                  ID: {ticket.author_id}
                </p>

                <div className="space-y-1.5 text-xs">
                  {ticket.author_email && (
                    <a
                      href={`mailto:${ticket.author_email}?subject=[BookLeaf] Support Ticket #${ticket.ticket_id}: ${ticket.subject}`}
                      className="flex items-center gap-2 text-[#0288D1] hover:underline"
                    >
                      <Mail className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                      <span className="truncate">{ticket.author_email}</span>
                    </a>
                  )}
                  {author?.phone && (
                    <a
                      href={`tel:${author.phone}`}
                      className="flex items-center gap-2 text-slate-700 hover:underline"
                    >
                      <Phone className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                      <span>{author.phone}</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Copy Tracking URL button */}
              <button
                type="button"
                onClick={() => {
                  const url = `${window.location.origin}/author/tickets?track=${ticket.ticket_id}`;
                  navigator.clipboard.writeText(url);
                  toast.success("URL Copied", "Author direct tracking link copied to clipboard.");
                }}
                className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copy Author Tracking Link</span>
              </button>

              {author && (
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">City</span>
                    <span className="font-semibold text-slate-800">
                      {author.city || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Phone</span>
                    <span className="font-semibold text-slate-800">
                      {author.phone || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Joined Date</span>
                    <span className="font-semibold text-slate-800">
                      {formatDateTime(author.joined_date).slice(0, 11)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Published Titles</span>
                    <span className="font-semibold text-slate-800">
                      {authorAllBooks.length} Book(s)
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Selected Book Diagnostics Card */}
            {book && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#1B4D7E]">
                    Selected Book Record ({book.book_id})
                  </span>
                  <BookOpen
                    className="h-4 w-4 text-[#1B4D7E]"
                    aria-hidden="true"
                  />
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {book.title}
                  </h3>
                  <p className="text-xs font-mono text-slate-500">
                    ISBN: {book.isbn}
                  </p>
                </div>

                <BookProductionStagePipeline status={book.status} />

                <div className="grid grid-cols-2 gap-2.5 text-xs pt-2 border-t border-slate-100">
                  <div className="rounded-lg bg-slate-50 p-2.5">
                    <span className="text-slate-500 block">MRP</span>
                    <span className="font-bold text-slate-900">
                      {formatNullableINR(book.mrp, "TBD")}
                    </span>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-2.5">
                    <span className="text-slate-500 block">Royalty / Copy</span>
                    <span className="font-bold text-slate-900">
                      {book.author_royalty_per_copy !== null
                        ? `₹${book.author_royalty_per_copy}`
                        : "TBD"}
                    </span>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-2.5">
                    <span className="text-slate-500 block">Copies Sold</span>
                    <span className="font-bold text-slate-900">
                      {book.total_copies_sold.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-2.5">
                    <span className="text-slate-500 block">Earned / Paid</span>
                    <span className="font-bold text-slate-900">
                      {formatINR(book.total_royalty_earned)} /{" "}
                      {formatINR(book.royalty_paid)}
                    </span>
                  </div>
                </div>

                <div className="rounded-xl border border-sky-200 bg-sky-50/60 p-3 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700">
                      Pending Royalty:
                    </span>
                    <span className="text-sm font-bold text-[#1B4D7E]">
                      {formatINR(book.royalty_pending)}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Last Payout:{" "}
                    <strong>
                      {book.last_royalty_payout_date || "None recorded"}
                    </strong>{" "}
                    • Print Partner:{" "}
                    <strong>{book.print_partner || "TBD"}</strong>
                  </p>
                  {book.royalty_pending > 0 && book.royalty_pending < 1000 && (
                    <p className="text-[11px] font-semibold text-amber-800 pt-1">
                      ⚠️ Below ₹1,000 minimum payout threshold (rolls over to
                      next quarter).
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Author's Full Book Portfolio */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                All Books by {ticket.author_name} ({authorAllBooks.length})
              </span>
              <div className="space-y-2">
                {authorAllBooks.map((b) => (
                  <div
                    key={b.book_id}
                    className={`rounded-xl border p-3 text-xs ${
                      b.book_id === ticket.book_id
                        ? "border-sky-300 bg-sky-50/40"
                        : "border-slate-200 bg-slate-50/50"
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span>
                        {b.title} ({b.book_id})
                      </span>
                      <span>{formatINR(b.royalty_pending)} pending</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {b.status} • {b.total_copies_sold} sold
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Ticket Audit Trail */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                Ticket Audit Trail ({auditLogs.length})
              </span>
              <div className="space-y-2 max-h-56 overflow-y-auto text-xs">
                {auditLogs.map((l) => (
                  <div
                    key={l.log_id}
                    className="border-l-2 border-[#1B4D7E] pl-3 py-1"
                  >
                    <p className="font-semibold text-slate-800">
                      {l.action.replace(/_/g, " ")}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {l.actor_name} • {formatRelativeTime(l.created_at)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PortalShell>
  );
}
