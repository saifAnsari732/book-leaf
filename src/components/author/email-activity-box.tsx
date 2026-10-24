"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Mail,
  Inbox,
  Send,
  ShieldCheck,
  ShieldAlert,
  CreditCard,
  Ticket,
  BookOpen,
  Search,
  Check,
  CheckCircle2,
  Trash2,
  RefreshCw,
  Clock,
  Filter,
  Eye,
  Code,
  Layers,
  AlertCircle,
  X,
  FileText,
} from "lucide-react";
import { EmailActivityRecord, EmailCategory } from "@/lib/email";
import { useToast } from "@/context/ToastContext";
import { EmailBoxSkeleton } from "@/components/ui/skeleton-loaders";

interface EmailActivityBoxProps {
  currentUserId?: string;
  currentUserEmail?: string;
  currentUserName?: string;
}

export function EmailActivityBox({
  currentUserId,
  currentUserEmail,
  currentUserName,
}: EmailActivityBoxProps) {
  const toast = useToast();
  const [emails, setEmails] = useState<EmailActivityRecord[]>([]);
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<"rendered" | "source">("rendered");
  const [isTestModalOpen, setIsTestModalOpen] = useState<boolean>(false);
  const [testType, setTestType] = useState<
    "LOGIN" | "PAYMENT" | "TICKET" | "BOOK" | "SECURITY"
  >("LOGIN");
  const [isSendingTest, setIsSendingTest] = useState<boolean>(false);

  const fetchEmails = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/email/inbox");
      const data = await res.json();
      if (data.success && Array.isArray(data.emails)) {
        setEmails(data.emails);
        if (data.emails.length > 0 && !selectedEmailId) {
          setSelectedEmailId(data.emails[0].email_id);
        }
      }
    } catch (err) {
      console.error("Failed to fetch email activity:", err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedEmailId]);

  useEffect(() => {
    fetchEmails();
  }, [fetchEmails]);

  const selectedEmail = useMemo(() => {
    return emails.find((e) => e.email_id === selectedEmailId) || emails[0] || null;
  }, [emails, selectedEmailId]);

  const filteredEmails = useMemo(() => {
    return emails.filter((em) => {
      const matchesCategory =
        categoryFilter === "ALL" || em.category === categoryFilter;
      const matchesSearch =
        searchQuery === "" ||
        em.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        em.recipient_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        em.text_content.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [emails, categoryFilter, searchQuery]);

  const stats = useMemo(() => {
    const total = emails.length;
    const unread = emails.filter((e) => !e.read_at).length;
    const payments = emails.filter(
      (e) => e.category === "PAYMENT_RECEIPT"
    ).length;
    const security = emails.filter(
      (e) => e.category === "LOGIN_ALERT" || e.category === "SECURITY_ALERT"
    ).length;
    return { total, unread, payments, security };
  }, [emails]);

  const handleMarkAsRead = async (emailId: string) => {
    try {
      const res = await fetch(`/api/email/${emailId}`, { method: "PATCH" });
      if (res.ok) {
        setEmails((prev) =>
          prev.map((e) =>
            e.email_id === emailId
              ? { ...e, read_at: new Date().toISOString() }
              : e
          )
        );
        toast.info("Marked as Read", "Email status updated in mailbox.");
      }
    } catch (err) {
      console.error("Error marking email as read:", err);
      toast.error("Update Failed", "Could not mark email as read.");
    }
  };

  const handleDeleteEmail = async (emailId: string) => {
    try {
      const res = await fetch(`/api/email/${emailId}`, { method: "DELETE" });
      if (res.ok) {
        setEmails((prev) => prev.filter((e) => e.email_id !== emailId));
        if (selectedEmailId === emailId) {
          const remaining = emails.filter((e) => e.email_id !== emailId);
          setSelectedEmailId(remaining[0]?.email_id || null);
        }
        toast.warning("Email Removed", "The activity email was deleted from your view.");
      }
    } catch (err) {
      console.error("Error deleting email:", err);
      toast.error("Deletion Failed", "Could not delete email from mailbox.");
    }
  };

  const handleSendTestEmail = async () => {
    try {
      setIsSendingTest(true);
      const res = await fetch("/api/email/send-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: testType }),
      });
      const data = await res.json();
      if (data.success && data.email) {
        setEmails((prev) => [data.email, ...prev]);
        setSelectedEmailId(data.email.email_id);
        setIsTestModalOpen(false);
        toast.success(
          "Nodemailer Activity Email Sent!",
          `Successfully dispatched ${testType} transactional template.`
        );
      } else {
        toast.error("Dispatch Failed", data.error || "Failed to dispatch test email.");
      }
    } catch (err) {
      console.error("Test email dispatch error:", err);
      toast.error("Network Error", "Could not reach email dispatch API.");
    } finally {
      setIsSendingTest(false);
    }
  };

  const getCategoryBadge = (category: EmailCategory) => {
    switch (category) {
      case "LOGIN_ALERT":
        return {
          label: "Login Security",
          bg: "bg-blue-50 text-blue-700 border-blue-200",
          icon: <ShieldAlert className="w-3.5 h-3.5 mr-1 text-blue-600" />,
        };
      case "PAYMENT_RECEIPT":
        return {
          label: "Payment Receipt",
          bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
          icon: <CreditCard className="w-3.5 h-3.5 mr-1 text-emerald-600" />,
        };
      case "TICKET_UPDATE":
        return {
          label: "Support Ticket",
          bg: "bg-amber-50 text-amber-700 border-amber-200",
          icon: <Ticket className="w-3.5 h-3.5 mr-1 text-amber-600" />,
        };
      case "BOOK_PUBLISHING":
        return {
          label: "Publishing",
          bg: "bg-purple-50 text-purple-700 border-purple-200",
          icon: <BookOpen className="w-3.5 h-3.5 mr-1 text-purple-600" />,
        };
      case "SECURITY_ALERT":
        return {
          label: "Security Alert",
          bg: "bg-rose-50 text-rose-700 border-rose-200",
          icon: <ShieldCheck className="w-3.5 h-3.5 mr-1 text-rose-600" />,
        };
      default:
        return {
          label: "Notification",
          bg: "bg-slate-50 text-slate-700 border-slate-200",
          icon: <Mail className="w-3.5 h-3.5 mr-1 text-slate-600" />,
        };
    }
  };

  if (isLoading && emails.length === 0) {
    return <EmailBoxSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-6 text-white border border-slate-700/60 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-xs font-semibold uppercase tracking-wider border border-indigo-400/30">
              <Mail className="w-3.5 h-3.5" />
              <span>Nodemailer Email Activity Hub</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Activity & Email Notification Box
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl">
              Inspect real-time transactional activity emails triggered across
              the platform, including sign-in security alerts, Razorpay payment
              receipts, ticket updates, and publishing milestones.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchEmails}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-sm font-medium border border-slate-600 transition"
              title="Refresh Inbox"
            >
              <RefreshCw
                className={`w-4 h-4 ${isLoading ? "animate-spin text-indigo-400" : ""}`}
              />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => setIsTestModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-md transition"
            >
              <Send className="w-4 h-4" />
              <span>Send Test Email</span>
            </button>
          </div>
        </div>

        {/* Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-700/60">
          <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/40">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Total Dispatched</span>
              <Mail className="w-4 h-4 text-indigo-400" />
            </div>
            <p className="text-xl font-bold text-white mt-1">{stats.total}</p>
          </div>
          <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/40">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Unread Alerts</span>
              <AlertCircle className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-xl font-bold text-amber-300 mt-1">
              {stats.unread}
            </p>
          </div>
          <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/40">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Payment Receipts</span>
              <CreditCard className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-xl font-bold text-emerald-300 mt-1">
              {stats.payments}
            </p>
          </div>
          <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/40">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Security Events</span>
              <ShieldCheck className="w-4 h-4 text-rose-400" />
            </div>
            <p className="text-xl font-bold text-rose-300 mt-1">
              {stats.security}
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search email subjects, recipients, or keywords..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "ALL", label: "All Activity", icon: Layers },
            { id: "LOGIN_ALERT", label: "Login & Security", icon: ShieldAlert },
            { id: "PAYMENT_RECEIPT", label: "Payments", icon: CreditCard },
            { id: "TICKET_UPDATE", label: "Tickets", icon: Ticket },
            { id: "BOOK_PUBLISHING", label: "Publishing", icon: BookOpen },
          ].map((cat) => {
            const Icon = cat.icon;
            const active = categoryFilter === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  active
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Mailbox Two-Pane Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[580px]">
        {/* Left Column: Email List */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden max-h-[750px]">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
            <div className="flex items-center gap-2">
              <Inbox className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Inbox Stream ({filteredEmails.length})
              </span>
            </div>
            {stats.unread > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">
                {stats.unread} Unread
              </span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredEmails.length === 0 ? (
              <div className="py-16 px-4 text-center">
                <Mail className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-700">
                  No activity emails found
                </p>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  Try adjusting your filter or search, or use &quot;Send Test Email&quot;
                  to dispatch a sample.
                </p>
              </div>
            ) : (
              filteredEmails.map((email) => {
                const isSelected = selectedEmail?.email_id === email.email_id;
                const isUnread = !email.read_at;
                const badge = getCategoryBadge(email.category);

                return (
                  <div
                    key={email.email_id}
                    onClick={() => {
                      setSelectedEmailId(email.email_id);
                      if (isUnread) {
                        handleMarkAsRead(email.email_id);
                      }
                    }}
                    className={`p-4 cursor-pointer transition relative text-left ${
                      isSelected
                        ? "bg-indigo-50/60 border-l-4 border-l-indigo-600"
                        : "hover:bg-slate-50 border-l-4 border-l-transparent"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${badge.bg}`}
                      >
                        {badge.icon}
                        <span>{badge.label}</span>
                      </span>

                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <Clock className="w-3 h-3" />
                        <span>
                          {new Date(email.sent_at).toLocaleDateString("en-IN", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        {isUnread && (
                          <span className="w-2 h-2 rounded-full bg-indigo-600" />
                        )}
                      </div>
                    </div>

                    <h4
                      className={`text-sm truncate mb-1 ${
                        isUnread
                          ? "font-bold text-slate-900"
                          : "font-medium text-slate-800"
                      }`}
                    >
                      {email.subject}
                    </h4>

                    <p className="text-xs text-slate-500 line-clamp-2">
                      {email.text_content}
                    </p>

                    <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400">
                      <span>To: {email.recipient_email}</span>
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                        {email.status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Full Rich Email Viewer / Browser */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden max-h-[750px]">
          {selectedEmail ? (
            <>
              {/* Email Viewer Header */}
              <div className="p-5 border-b border-slate-100 bg-slate-50/70">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    {(() => {
                      const badge = getCategoryBadge(selectedEmail.category);
                      return (
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${badge.bg}`}
                        >
                          {badge.icon}
                          <span>{badge.label}</span>
                        </span>
                      );
                    })()}
                    <span className="text-xs text-slate-500 font-mono">
                      ID: {selectedEmail.email_id}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center bg-slate-200/80 p-0.5 rounded-lg text-xs">
                      <button
                        onClick={() => setViewMode("rendered")}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md transition ${
                          viewMode === "rendered"
                            ? "bg-white text-slate-900 shadow-sm font-semibold"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Preview</span>
                      </button>
                      <button
                        onClick={() => setViewMode("source")}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md transition ${
                          viewMode === "source"
                            ? "bg-white text-slate-900 shadow-sm font-semibold"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        <Code className="w-3.5 h-3.5" />
                        <span>HTML</span>
                      </button>
                    </div>

                    <button
                      onClick={() => handleDeleteEmail(selectedEmail.email_id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="Delete Email"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h2 className="text-lg font-bold text-slate-900 mb-3">
                  {selectedEmail.subject}
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 pt-3 border-t border-slate-200/70">
                  <div>
                    <span className="text-slate-400">From: </span>
                    <strong className="text-slate-800">
                      BookLeaf Communications &lt;support@bookleafpub.com&gt;
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400">To: </span>
                    <strong className="text-slate-800">
                      {selectedEmail.recipient_name} &lt;
                      {selectedEmail.recipient_email}&gt;
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Dispatched: </span>
                    <span className="text-slate-700">
                      {new Date(selectedEmail.sent_at).toLocaleString("en-IN", {
                        timeZone: "Asia/Kolkata",
                      })}{" "}
                      IST
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Transport: </span>
                    <span className="text-emerald-700 font-semibold">
                      Nodemailer SMTP ({selectedEmail.status})
                    </span>
                  </div>
                </div>
              </div>

              {/* Email Content Body */}
              <div className="flex-1 p-5 overflow-y-auto bg-slate-100/60">
                {viewMode === "rendered" ? (
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-2 overflow-hidden">
                    <iframe
                      srcDoc={selectedEmail.html_content}
                      title="Email Preview"
                      className="w-full min-h-[500px] border-0 rounded-lg"
                      sandbox="allow-same-origin"
                    />
                  </div>
                ) : (
                  <div className="bg-slate-900 rounded-xl p-4 text-emerald-400 font-mono text-xs overflow-x-auto shadow-inner">
                    <pre className="whitespace-pre-wrap">
                      {selectedEmail.html_content}
                    </pre>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <Mail className="w-12 h-12 text-slate-300 mb-3" />
              <h3 className="text-base font-semibold text-slate-700">
                Select an activity email to inspect
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Click on any activity item from the stream to read the full
                branded template rendered in real-time.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Test Email Dispatch Modal */}
      {isTestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsTestModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Dispatch Test Activity Email
                </h3>
                <p className="text-xs text-slate-500">
                  Trigger an automated Nodemailer transactional notification
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-600 mb-4">
              Select the event type you want to simulate and inspect inside your
              Author Mailbox:
            </p>

            <div className="space-y-2.5 mb-6">
              {[
                {
                  id: "LOGIN",
                  label: "New Sign-in Security Alert",
                  desc: "IP, device, time, and unauthorized sign-in alert",
                  icon: ShieldAlert,
                  color: "text-blue-600",
                },
                {
                  id: "PAYMENT",
                  label: "Razorpay Payment & Invoice Receipt",
                  desc: "Official ₹2,499 tax receipt with Order & Payment IDs",
                  icon: CreditCard,
                  color: "text-emerald-600",
                },
                {
                  id: "TICKET",
                  label: "Support Ticket Reply Update",
                  desc: "Notification when admin replies to an author query",
                  icon: Ticket,
                  color: "text-amber-600",
                },
                {
                  id: "BOOK",
                  label: "Book Publishing Milestone Alert",
                  desc: "ISBN allotment and manuscript production progress",
                  icon: BookOpen,
                  color: "text-purple-600",
                },
                {
                  id: "SECURITY",
                  label: "Security Event & Session Revocation",
                  desc: "Account credential change and session notice",
                  icon: ShieldCheck,
                  color: "text-rose-600",
                },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = testType === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setTestType(item.id as any)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition flex items-start gap-3 ${
                      isSelected
                        ? "bg-indigo-50/80 border-indigo-600 ring-2 ring-indigo-500/20"
                        : "bg-slate-50/60 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <Icon className={`w-5 h-5 mt-0.5 ${item.color}`} />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900">
                        {item.label}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {item.desc}
                      </p>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-indigo-600 mt-0.5" />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsTestModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendTestEmail}
                disabled={isSendingTest}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-md transition disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>
                  {isSendingTest ? "Dispatching..." : "Send via Nodemailer"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
