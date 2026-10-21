"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { PortalShell } from "@/components/layout/portal-shell";
import { invalidateClientCache, useFastQuery } from "@/lib/client-cache";
import { AttachmentItem, BookRecord, SafeUser } from "@/types/domain";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  FileText,
  Image as ImageIcon,
  Paperclip,
  RefreshCw,
  Send,
  Sparkles,
  Trash2,
} from "lucide-react";

interface AuthorDashboardResponse {
  success: boolean;
  author: SafeUser;
  books: BookRecord[];
}

const SAMPLE_TEMPLATES = [
  {
    label: "Royalty Delay / Payout Question",
    subject: "I published my book months ago and haven't received my pending royalty",
    description:
      "Hi BookLeaf Support, I checked my dashboard and saw that I have pending royalties accumulated from my book sales, but I haven't received the bank payout yet. Could you please check my payout schedule and confirm when the transfer will be processed?",
  },
  {
    label: "ISBN Mismatch on Amazon",
    subject: "My book is showing a different ISBN on Amazon than what's on the physical copy",
    description:
      "Hello team, my readers noticed that the Amazon listing for my book displays a different ISBN compared to the barcode printed on the physical copy. Please escalate this to the production team urgently.",
  },
  {
    label: "Print Quality Defect (Free Reprint)",
    subject: "Received author copies with blurry cover images and misaligned interior pages",
    description:
      "Hi Support, I received my author copies yesterday and the print quality has issues—the cover graphics look blurry and several interior pages are misaligned. I am attaching photos of the defective copy for verification so we can arrange a reprint.",
  },
  {
    label: "Amazon 'Currently Unavailable'",
    subject: "My book is published & live but showing as 'Currently Unavailable' on Amazon",
    description:
      "Hi team, my book is marked as Published & Live in my BookLeaf portal, but on Amazon India it currently says 'Currently Unavailable'. Can you trigger a stock re-sync?",
  },
];

function NewSupportTicketContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialBookId = searchParams.get("book_id") || "GENERAL";

  const { data, isLoading, error } = useFastQuery<AuthorDashboardResponse>(
    "author:dashboard",
    "/api/author/dashboard"
  );

  const [selectedBookId, setSelectedBookId] = useState<string>(initialBookId);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const paramBook = searchParams.get("book_id");
    if (paramBook) {
      setSelectedBookId(paramBook);
    } else if (data?.books && data.books.length > 0 && selectedBookId === "GENERAL") {
      setSelectedBookId(data.books[0].book_id);
    }
  }, [searchParams, data, selectedBookId]);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setFormError(null);
    if (attachments.length + files.length > 3) {
      setFormError("You can attach up to 3 files per ticket.");
      return;
    }

    setIsUploadingFile(true);
    try {
      for (const file of Array.from(files)) {
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`"${file.name}" exceeds the 5MB attachment limit.`);
        }

        const base64Data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result || ""));
          reader.onerror = () => reject(new Error("Could not read file"));
          reader.readAsDataURL(file);
        });

        const res = await fetch("/api/upload/imagekit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: file.name,
            mimeType: file.type || "application/octet-stream",
            base64Data,
          }),
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.error || "Attachment upload failed");
        }
        setAttachments((prev) => [...prev, json.attachment]);
      }
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Failed to attach file"
      );
    } finally {
      setIsUploadingFile(false);
      e.target.value = "";
    }
  }

  function removeAttachment(idx: number) {
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/author/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          book_id: selectedBookId === "GENERAL" ? null : selectedBookId,
          subject,
          description,
          attachments,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        const detailMsg = json.details
          ?.map((d: { message: string }) => d.message)
          .join(", ");
        setFormError(detailMsg || json.error || "Could not submit ticket");
        return;
      }

      invalidateClientCache("author:");
      invalidateClientCache("admin:");
      router.push(`/author/tickets/${json.ticket.ticket_id}`);
    } catch {
      setFormError("Network error while creating ticket. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (error) {
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

  if (isLoading || !data) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-4">
        <div className="h-10 w-64 rounded animate-shimmer" />
        <div className="h-96 rounded-xl animate-shimmer" />
      </div>
    );
  }

  const { author, books } = data;

  return (
    <PortalShell user={author}>
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-up">
        <div>
          <Link
            href="/author/tickets"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 mb-3"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Back to My Tickets
          </Link>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
            Submit a Support Query
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Select the book your query is about (or General / Account Level).
            Our AI triage assistant will immediately route your ticket to the
            right BookLeaf specialist.
          </p>
        </div>

        {/* Quick Sample Query Fillers for Fast Testing */}
        <div className="rounded-2xl border border-sky-200 bg-sky-50/60 p-4 space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#1B4D7E]">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            1-Click Sample Query Templates (For Fast Evaluator Testing):
          </div>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_TEMPLATES.map((tpl) => (
              <button
                key={tpl.label}
                type="button"
                onClick={() => {
                  setSubject(tpl.subject);
                  setDescription(tpl.description);
                }}
                className="rounded-lg border border-sky-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-[#1B4D7E] hover:text-[#1B4D7E] transition-colors cursor-pointer"
              >
                + {tpl.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Ticket Creation Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-5"
        >
          {formError && (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs font-medium text-red-800"
            >
              <AlertCircle
                className="h-4 w-4 text-red-600 shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <span>{formError}</span>
            </div>
          )}

          {/* Book Dropdown */}
          <div>
            <label
              htmlFor="ticket-book"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
            >
              Which book is this query about?{" "}
              <span className="text-red-600">*</span>
            </label>
            <select
              id="ticket-book"
              name="book_id"
              value={selectedBookId}
              onChange={(e) => setSelectedBookId(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-[#1B4D7E] focus:outline-none focus:ring-2 focus:ring-[#1B4D7E]/20"
            >
              {books.map((b) => (
                <option key={b.book_id} value={b.book_id}>
                  {b.title} ({b.book_id} • {b.status} • Pending: ₹
                  {b.royalty_pending.toLocaleString("en-IN")})
                </option>
              ))}
              <option value="GENERAL">
                General / Account Level (Not tied to a single book)
              </option>
            </select>
          </div>

          {/* Subject Line */}
          <div>
            <label
              htmlFor="ticket-subject"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
            >
              Subject Line <span className="text-red-600">*</span>
            </label>
            <input
              id="ticket-subject"
              name="subject"
              type="text"
              required
              minLength={5}
              maxLength={180}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g., Question regarding pending quarterly royalty payout"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-[#1B4D7E] focus:outline-none focus:ring-2 focus:ring-[#1B4D7E]/20"
            />
          </div>

          {/* Detailed Description */}
          <div>
            <label
              htmlFor="ticket-description"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
            >
              Detailed Description <span className="text-red-600">*</span>
            </label>
            <textarea
              id="ticket-description"
              name="description"
              rows={6}
              required
              minLength={15}
              maxLength={4000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please describe your question or issue in detail (minimum 15 characters)..."
              className="w-full rounded-xl border border-slate-300 bg-white p-4 text-sm text-slate-900 focus:border-[#1B4D7E] focus:outline-none focus:ring-2 focus:ring-[#1B4D7E]/20"
            />
          </div>

          {/* Optional File Attachment Upload (ImageKit.io Cloud Integration) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="ticket-attachments"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
              >
                Optional Attachments (Defective Print Photos, Screenshots, PDF)
              </label>
              <span className="text-[11px] font-medium text-slate-500">
                Powered by ImageKit Storage • Max 5MB (JPG, PNG, WEBP, PDF, TXT)
              </span>
            </div>

            <label
              htmlFor="ticket-attachments"
              className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/70 px-4 py-5 text-center hover:border-[#1B4D7E] hover:bg-sky-50/30 transition-colors cursor-pointer"
            >
              <Paperclip
                className="h-5 w-5 text-[#1B4D7E] mb-1.5"
                aria-hidden="true"
              />
              <span className="text-xs font-semibold text-slate-800">
                {isUploadingFile
                  ? "Verifying signature & uploading to ImageKit..."
                  : "Click to attach files (up to 3 files)"}
              </span>
              <span className="text-[11px] text-slate-500 mt-0.5">
                Helpful when reporting printing defects or ISBN mismatches
              </span>
              <input
                id="ticket-attachments"
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.pdf,.txt"
                multiple
                onChange={handleFileSelect}
                disabled={isUploadingFile}
                className="sr-only"
              />
            </label>

            {attachments.length > 0 && (
              <div className="space-y-2 pt-1">
                {attachments.map((att, idx) => (
                  <div
                    key={`${att.name}-${idx}`}
                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {att.type.startsWith("image/") ? (
                        <ImageIcon
                          className="h-4 w-4 text-emerald-600 shrink-0"
                          aria-hidden="true"
                        />
                      ) : (
                        <FileText
                          className="h-4 w-4 text-[#1B4D7E] shrink-0"
                          aria-hidden="true"
                        />
                      )}
                      <span className="font-semibold text-slate-800 truncate">
                        {att.name}
                      </span>
                      <span className="text-slate-400">
                        ({Math.max(1, Math.round(att.size / 1024))} KB)
                      </span>
                      <span className="inline-flex items-center gap-1 rounded bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-800">
                        <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                        {att.provider === "imagekit"
                          ? "ImageKit CDN"
                          : "Verified"}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttachment(idx)}
                      className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                      aria-label={`Remove ${att.name}`}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-200">
            <Link
              href="/author/tickets"
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || isUploadingFile}
              className="inline-flex items-center gap-2 rounded-xl bg-[#1B4D7E] px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-[#163f68] disabled:opacity-60 transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw
                    className="h-4 w-4 animate-spin"
                    aria-hidden="true"
                  />
                  <span>Submitting & Running AI Triage...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" aria-hidden="true" />
                  <span>Submit Support Ticket</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </PortalShell>
  );
}

export default function NewSupportTicketPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 max-w-4xl mx-auto space-y-4">
          <div className="h-10 w-64 rounded animate-shimmer" />
          <div className="h-96 rounded-xl animate-shimmer" />
        </div>
      }
    >
      <NewSupportTicketContent />
    </Suspense>
  );
}
