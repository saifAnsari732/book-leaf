"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Calendar,
  Tag,
  ShieldCheck,
  RefreshCw,
  BookOpen,
  MessageSquare,
  HelpCircle,
  Sparkles,
  ExternalLink,
} from "lucide-react";

interface PublicTicketDetail {
  ticket_id: string;
  author_name: string;
  masked_email: string;
  book_title: string;
  subject: string;
  description: string;
  status: "Open" | "In Progress" | "Waiting for Author" | "Resolved" | "Closed" | string;
  category: string;
  priority: string;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  assigned_to: string | null;
  attachments_count: number;
  timeline: {
    message_id: string;
    sender_role: string;
    sender_name: string;
    content: string;
    created_at: string;
  }[];
}

function getStatusBadgeClass(status: string) {
  switch (status) {
    case "Open":
      return "bg-amber-50 text-amber-800 border-amber-300 ring-amber-100";
    case "In Progress":
      return "bg-blue-50 text-blue-800 border-blue-300 ring-blue-100";
    case "Waiting for Author":
      return "bg-purple-50 text-purple-800 border-purple-300 ring-purple-100";
    case "Resolved":
      return "bg-emerald-50 text-emerald-800 border-emerald-300 ring-emerald-100";
    case "Closed":
      return "bg-slate-100 text-slate-800 border-slate-300 ring-slate-100";
    case "Rejected":
      return "bg-rose-50 text-rose-800 border-rose-300 ring-rose-100";
    default:
      return "bg-slate-50 text-slate-700 border-slate-200 ring-slate-100";
  }
}

function formatDate(isoString?: string | null) {
  if (!isoString) return "N/A";
  try {
    return new Date(isoString).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Kolkata",
    }) + " IST";
  } catch {
    return isoString;
  }
}

function TrackContent() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get("id") || "";

  const [ticketIdInput, setTicketIdInput] = useState(initialId);
  const [ticket, setTicket] = useState<PublicTicketDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async (idToSearch: string) => {
    if (!idToSearch || !idToSearch.trim()) {
      setError("Please enter a valid Ticket or Grievance Reference ID.");
      return;
    }

    setLoading(true);
    setError(null);
    setTicket(null);

    try {
      const res = await fetch(`/api/tickets/track?id=${encodeURIComponent(idToSearch.trim())}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(
          data.error ||
            "No ticket or grievance found with this reference number. Please verify the ID and try again."
        );
      } else {
        setTicket(data.ticket);
      }
    } catch {
      setError("Network connection issue. Failed to load ticket status.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialId) {
      setTicketIdInput(initialId);
      fetchStatus(initialId);
    }
  }, [initialId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStatus(ticketIdInput);
  };

  const getStepStatus = (currentStatus: string, step: number) => {
    const statusMap: Record<string, number> = {
      Open: 1,
      "In Progress": 2,
      "Waiting for Author": 2,
      Resolved: 3,
      Closed: 3,
      Rejected: 3,
    };
    const currentStep = statusMap[currentStatus] || 1;
    if (currentStep > step) return "completed";
    if (currentStep === step) return "active";
    return "pending";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100/60 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Navigation Back */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-slate-400" />
            <span>Back to Portal Home</span>
          </Link>

          <Link
            href="/login"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition"
          >
            Author Sign In &rarr;
          </Link>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden">
          {/* Header */}
          <div className="bg-slate-900 text-white p-6 sm:p-8 relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center gap-3.5 relative z-10">
              <div className="p-3 bg-slate-800/80 border border-slate-700/60 rounded-xl text-indigo-400 shadow-sm">
                <Search className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                    Track Grievance & Support Ticket
                  </h1>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                    <ShieldCheck className="w-3 h-3" /> Live
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                  Enter your unique Reference ID to check real-time redressal progress and admin updates.
                </p>
              </div>
            </div>
          </div>

          {/* Search Form */}
          <form
            onSubmit={handleSubmit}
            className="p-6 sm:p-8 border-b border-slate-100 bg-slate-50/60"
          >
            <label
              htmlFor="ticketInput"
              className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2"
            >
              Ticket Reference ID
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-grow">
                <input
                  id="ticketInput"
                  type="text"
                  required
                  value={ticketIdInput}
                  onChange={(e) => setTicketIdInput(e.target.value.toUpperCase())}
                  placeholder="e.g. TICK-1001 or CMP-20261023-A7K92"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 font-mono text-base font-bold text-slate-900 uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition shadow-2xs"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-7 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Track Status</span>
                  </>
                )}
              </button>
            </div>

            {error && (
              <div className="mt-4 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3 animate-in fade-in">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
          </form>

          {/* Ticket Details Result */}
          {ticket && (
            <div className="p-6 sm:p-8 space-y-8 animate-in fade-in duration-300">
              {/* Header Status Summary */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-[11px] uppercase font-bold text-slate-500 tracking-wider block">
                    Reference ID
                  </span>
                  <span className="text-xl font-mono font-extrabold text-slate-900">
                    {ticket.ticket_id}
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span
                    className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-extrabold border ring-1 ${getStatusBadgeClass(
                      ticket.status
                    )}`}
                  >
                    {ticket.status}
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-200/80 text-slate-700">
                    {ticket.priority} Priority
                  </span>
                </div>
              </div>

              {/* 3-Step Redressal Progress Pipeline */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
                  <span>Redressal Progress</span>
                </h3>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  {/* Step 1 */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 transition-colors ${
                        getStepStatus(ticket.status, 1) === "completed" ||
                        getStepStatus(ticket.status, 1) === "active"
                          ? "bg-slate-900 text-white shadow-sm"
                          : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      1
                    </div>
                    <span className="font-bold text-slate-900">Submitted</span>
                    <span className="text-slate-400 text-[11px]">Logged in system</span>
                  </div>

                  {/* Step 2 */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 transition-colors ${
                        getStepStatus(ticket.status, 2) === "completed"
                          ? "bg-slate-900 text-white shadow-sm"
                          : getStepStatus(ticket.status, 2) === "active"
                          ? "bg-blue-600 text-white ring-4 ring-blue-100 shadow-sm"
                          : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      2
                    </div>
                    <span className="font-bold text-slate-900">Under Review</span>
                    <span className="text-slate-400 text-[11px]">Assigned to specialist</span>
                  </div>

                  {/* Step 3 */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 transition-colors ${
                        ticket.status === "Resolved" || ticket.status === "Closed"
                          ? "bg-emerald-600 text-white ring-4 ring-emerald-100 shadow-sm"
                          : ticket.status === "Rejected"
                          ? "bg-rose-600 text-white ring-4 ring-rose-100 shadow-sm"
                          : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      3
                    </div>
                    <span className="font-bold text-slate-900">
                      {ticket.status === "Rejected" ? "Rejected" : "Resolved"}
                    </span>
                    <span className="text-slate-400 text-[11px]">Final determination</span>
                  </div>
                </div>
              </div>

              {/* Information Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-sm">
                <div className="p-4 bg-slate-50 flex items-center justify-between">
                  <span className="text-slate-500 font-medium flex items-center gap-2">
                    <Tag className="w-4 h-4 text-slate-400" /> Category
                  </span>
                  <span className="font-bold text-slate-900">{ticket.category}</span>
                </div>
                <div className="p-4 bg-white flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Subject</span>
                  <span className="font-bold text-slate-900 text-right max-w-[65%] truncate">
                    {ticket.subject}
                  </span>
                </div>
                {ticket.book_title && (
                  <div className="p-4 bg-slate-50 flex items-center justify-between">
                    <span className="text-slate-500 font-medium flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-slate-400" /> Book Title
                    </span>
                    <span className="font-semibold text-slate-900 text-right">
                      {ticket.book_title}
                    </span>
                  </div>
                )}
                <div className="p-4 bg-white flex items-center justify-between">
                  <span className="text-slate-500 font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" /> Submitted On
                  </span>
                  <span className="font-semibold text-slate-900">
                    {formatDate(ticket.created_at)}
                  </span>
                </div>
                <div className="p-4 bg-slate-50 flex items-center justify-between">
                  <span className="text-slate-500 font-medium flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" /> Last Updated
                  </span>
                  <span className="font-semibold text-slate-900">
                    {formatDate(ticket.updated_at)}
                  </span>
                </div>
                {ticket.resolved_at && (
                  <div className="p-4 bg-emerald-50/50 flex items-center justify-between">
                    <span className="text-emerald-700 font-semibold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Resolved On
                    </span>
                    <span className="font-bold text-emerald-900">
                      {formatDate(ticket.resolved_at)}
                    </span>
                  </div>
                )}
              </div>

              {/* Inquiry Description */}
              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200">
                <h4 className="text-xs uppercase font-bold text-slate-500 mb-2">
                  Original Inquiry / Description
                </h4>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {ticket.description}
                </p>
              </div>

              {/* Conversation / Update Timeline */}
              {ticket.timeline && ticket.timeline.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-slate-400" />
                    <span>Responses & Updates ({ticket.timeline.length})</span>
                  </h3>
                  <div className="space-y-3">
                    {ticket.timeline.map((msg) => (
                      <div
                        key={msg.message_id}
                        className={`p-4 rounded-xl border text-sm ${
                          msg.sender_role === "ADMIN"
                            ? "bg-blue-50/50 border-blue-200"
                            : "bg-white border-slate-200"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span
                            className={`font-bold text-xs uppercase ${
                              msg.sender_role === "ADMIN"
                                ? "text-blue-800"
                                : "text-slate-800"
                            }`}
                          >
                            {msg.sender_name}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {formatDate(msg.created_at)}
                          </span>
                        </div>
                        <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                          {msg.content}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Refresh Action */}
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => fetchStatus(ticket.ticket_id)}
                  className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh Ticket Status</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Support Help Banner */}
        <div className="mt-8 p-5 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200/80">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Need immediate assistance?</h4>
              <p className="text-xs text-slate-500">
                Our support desk is active Monday to Saturday, 9:00 AM – 7:00 PM IST.
              </p>
            </div>
          </div>
          <Link
            href="/login"
            className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center gap-1.5"
          >
            <span>Author Portal</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center p-12 text-slate-500">
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
            <span className="text-sm font-semibold">Loading Grievance Tracking Portal...</span>
          </div>
        </div>
      }
    >
      <TrackContent />
    </Suspense>
  );
}
