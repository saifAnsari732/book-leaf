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
  BookOpen,
  CheckCircle2,
  FileText,
  Headphones,
  HelpCircle,
  Image as ImageIcon,
  Paperclip,
  Sparkles,
  Trash2,
  UploadCloud,
} from "lucide-react";

interface AuthorDashboardResponse {
  success: boolean;
  author: SafeUser;
  books: BookRecord[];
}

const QUICK_TEMPLATES = [
  {
    title: "Royalty Inquiry",
    category: "Royalty & Payments",
    subject: "Quarterly royalty status verification",
    description:
      "Hello BookLeaf Support Team, I am writing to inquire about my pending royalty balance. I would like to verify whether my account details are confirmed for the upcoming settlement cycle.",
  },
  {
    title: "ISBN Mismatch on Amazon",
    category: "ISBN & Metadata Issues",
    subject: "ISBN on Amazon does not match physical copy",
    description:
      "Hello, readers have informed me that the ISBN displayed on the Amazon listing differs from the ISBN printed on the physical copies. Please escalate this to the metadata team for catalog correction.",
  },
  {
    title: "Defective Author Copies",
    category: "Printing & Quality",
    subject: "Received author copies with printing alignment issues",
    description:
      "Hi Support, I received my author copies and noticed that interior pages have printing alignment flaws. I am uploading photos for verification to request a complimentary reprint under BookLeaf quality policy.",
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
  const [category, setCategory] = useState("Royalty & Payments");
  const [priority, setPriority] = useState("Medium");
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
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const uploadRes = await fetch("/api/upload/imagekit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: file.name,
            mimeType: file.type || "application/octet-stream",
            base64Data,
          }),
        });

        const uploadJson = await uploadRes.json();
        if (!uploadRes.ok || !uploadJson.success) {
          throw new Error(uploadJson.error || "Failed to upload file");
        }

        setAttachments((prev) => [...prev, uploadJson.attachment]);
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploadingFile(false);
      e.target.value = "";
    }
  }

  function removeAttachment(fileId?: string, index?: number) {
    setAttachments((prev) =>
      prev.filter((att, i) => (att.fileId ? att.fileId !== fileId : i !== index))
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (subject.trim().length < 5) {
      setFormError("Subject must be at least 5 characters long.");
      return;
    }
    if (description.trim().length < 15) {
      setFormError("Please provide a detailed description (at least 15 characters).");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/author/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          book_id: selectedBookId === "GENERAL" ? null : selectedBookId,
          subject: subject.trim(),
          description: description.trim(),
          attachments,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setFormError(json.error || "Failed to submit support ticket.");
        return;
      }

      invalidateClientCache("author:tickets:ALL");
      invalidateClientCache("author:dashboard");

      router.push(`/author/tickets/${json.ticket.ticket_id}`);
    } catch {
      setFormError("Network error while creating ticket. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F9FAF7] flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-3xl border border-[#E8EDE6] bg-white p-8 text-center shadow-sm">
          <AlertCircle className="w-10 h-10 text-amber-600 mx-auto mb-3" />
          <h2 className="font-serif text-xl font-bold text-slate-900 mb-2">
            Session Expired
          </h2>
          <button
            onClick={() => router.push("/login")}
            className="rounded-full bg-[#0F4C3A] px-6 py-2.5 text-xs font-semibold text-white"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="min-h-screen bg-[#F9FAF7] flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-2 border-[#0F4C3A] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-medium text-slate-500">Loading Ticket Creator...</p>
        </div>
      </div>
    );
  }

  const { author, books } = data;

  return (
    <PortalShell user={author}>
      <div className="space-y-6">
        {/* ================================================================
            PAGE HEADER (Matches Screen 6: Create Support Ticket)
            ================================================================ */}
        <div>
          <Link
            href="/author/tickets"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0F4C3A] hover:underline mb-3"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to My Tickets</span>
          </Link>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Create Support Ticket
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Tell us what you need help with. Our team is here to assist you.
          </p>
        </div>

        {/* ================================================================
            TWO COLUMN LAYOUT: FORM (Left) + NEED HELP PANEL (Right)
            ================================================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form Card (Left 8 Cols - Matches Screen 6) */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-[#E8EDE6] shadow-xs p-6 sm:p-8">
            {formError && (
              <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Select Book */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Select Book (Optional)
                </label>
                <select
                  value={selectedBookId}
                  onChange={(e) => setSelectedBookId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-[#F9FAF7] text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:border-[#0F4C3A]"
                >
                  <option value="GENERAL">General / Account Level Query (No Specific Book)</option>
                  {books.map((b) => (
                    <option key={b.book_id} value={b.book_id}>
                      {b.title} ({b.book_id}) — {b.status}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Subject *
                </label>
                <input
                  type="text"
                  placeholder="Enter ticket subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-[#F9FAF7] text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:border-[#0F4C3A]"
                />
              </div>

              {/* Category & Priority Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-[#F9FAF7] text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:border-[#0F4C3A]"
                  >
                    <option value="Royalty & Payments">Royalty & Payments</option>
                    <option value="ISBN & Metadata Issues">ISBN & Metadata Issues</option>
                    <option value="Printing & Quality">Printing & Quality</option>
                    <option value="Distribution & Availability">Distribution & Availability</option>
                    <option value="Book Status & Production Updates">Book Status & Production Updates</option>
                    <option value="General Inquiry">General Inquiry</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Priority *
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-[#F9FAF7] text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:border-[#0F4C3A]"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Description *
                </label>
                <textarea
                  rows={5}
                  placeholder="Please describe your issue in detail..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-[#F9FAF7] text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:border-[#0F4C3A]"
                />
              </div>

              {/* Drag & Drop Attachments (Matches Screen 6) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Attachments (Optional)
                </label>
                <label className="border-2 border-dashed border-[#C4DDD0] hover:border-[#0F4C3A] bg-[#F9FAF7] hover:bg-[#F2F7F4] rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition text-center block">
                  <UploadCloud className="w-8 h-8 text-[#0F4C3A] mb-2" />
                  <span className="text-xs font-semibold text-slate-800">
                    {isUploadingFile ? "Uploading to ImageKit CDN..." : "Drag & drop files here or click to upload"}
                  </span>
                  <span className="text-[11px] text-slate-500 mt-1">
                    PDF, JPG, PNG (Max 5MB per file)
                  </span>
                  <input
                    type="file"
                    multiple
                    accept="image/png,image/jpeg,image/webp,application/pdf"
                    onChange={handleFileSelect}
                    disabled={isUploadingFile}
                    className="hidden"
                  />
                </label>

                {/* Uploaded File Badges */}
                {attachments.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {attachments.map((att, i) => (
                      <div
                        key={att.fileId || i}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 shadow-2xs"
                      >
                        <Paperclip className="w-3.5 h-3.5 text-[#0F4C3A]" />
                        <span className="truncate max-w-[150px]">{att.name}</span>
                        <button
                          type="button"
                          onClick={() => removeAttachment(att.fileId, i)}
                          className="text-slate-400 hover:text-rose-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => router.push("/author/tickets")}
                  className="px-5 py-2.5 rounded-full border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isUploadingFile}
                  className="px-7 py-2.5 rounded-full bg-[#0F4C3A] hover:bg-[#0A3B2D] text-white text-xs font-semibold shadow-xs transition disabled:opacity-50"
                >
                  {isSubmitting ? "Submitting..." : "Submit Ticket"}
                </button>
              </div>
            </form>
          </div>

          {/* Need Help? Side Card (Right 4 Cols - Matches Screen 6) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl border border-[#E8EDE6] shadow-xs p-6 space-y-5">
              <h3 className="font-serif font-bold text-base text-slate-900">
                Need Help?
              </h3>

              <div className="space-y-3">
                <Link
                  href="/#faq"
                  className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 hover:border-[#0F4C3A] hover:bg-[#F9FAF7] transition group"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-200">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#0F4C3A]">
                      Check our FAQ
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Find quick answers to common questions
                    </p>
                  </div>
                </Link>

                <div className="p-3 rounded-xl border border-slate-100 bg-[#F9FAF7] space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#0F4C3A]">
                    <Sparkles className="w-4 h-4 text-[#10B981]" />
                    <span>Quick Prompt Templates</span>
                  </div>
                  <div className="space-y-1.5 pt-1">
                    {QUICK_TEMPLATES.map((tmpl) => (
                      <button
                        key={tmpl.title}
                        type="button"
                        onClick={() => {
                          setSubject(tmpl.subject);
                          setDescription(tmpl.description);
                          setCategory(tmpl.category);
                        }}
                        className="w-full text-left p-2 rounded-lg bg-white border border-slate-200 hover:border-[#0F4C3A] text-[11px] text-slate-700 font-medium transition"
                      >
                        {tmpl.title}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl border border-slate-100">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-200">
                    <Headphones className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      Contact Support
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Our operations team replies within 24–48 hours
                    </p>
                  </div>
                </div>

                {/* Support Books & Plant Illustration (Matches Screen 6) */}
                <div className="rounded-2xl overflow-hidden border border-slate-100 shadow-2xs pt-2">
                  <img
                    src="/images/support-books-plant.jpg"
                    alt="BookLeaf Author Support"
                    className="w-full h-36 object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PortalShell>
  );
}

export default function NewSupportTicketPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F9FAF7] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#0F4C3A] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <NewSupportTicketContent />
    </Suspense>
  );
}
