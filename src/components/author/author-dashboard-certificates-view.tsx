"use client";

import React, { useState } from "react";
import { BookRecord, SafeUser } from "@/types/domain";
import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Download,
  ExternalLink,
  QrCode,
  Share2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

interface AuthorDashboardCertificatesViewProps {
  books: BookRecord[];
  author: SafeUser;
}

export function AuthorDashboardCertificatesView({
  books,
  author,
}: AuthorDashboardCertificatesViewProps) {
  const [selectedBook, setSelectedBook] = useState<BookRecord>(
    books[0] || {
      book_id: "bk-1",
      title: "Whispers of the Ganges",
      author_id: "AUTH001",
      isbn: "978-93-5400-112-4",
      status: "Published",
      genre: "Poetry & Anthologies",
      total_sales_count: 1420,
      royalty_earned: 42600,
      royalty_pending: 3570,
    } as any
  );
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  function handleDownload() {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
            <Award className="w-3.5 h-3.5 text-amber-600" />
            <span>Official BookLeaf Publishing Certification Authority</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Author Publication Certificates &amp; Credentials
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Every book published with BookLeaf receives an ISO-standard digital
            Certificate of Publication with verified ISBN registration, cryptographic
            timestamp, and verified author seal.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#0F4C3A] hover:bg-[#0A3B2D] text-white text-xs sm:text-sm font-bold shadow-xs transition"
          >
            <Download className="w-4 h-4" />
            <span>Download All Certificates (PDF)</span>
          </button>
        </div>
      </div>

      {downloadSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs sm:text-sm text-emerald-800 font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>High-Resolution Vector Certificate PDF downloaded successfully!</span>
        </div>
      )}

      {/* Main Certificate Showcase & Selector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Book Certificate Selector (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Select Certified Title
          </h4>

          {books.map((b) => {
            const isSelected = selectedBook?.book_id === b.book_id;
            return (
              <div
                key={b.book_id}
                onClick={() => setSelectedBook(b)}
                className={`p-4 rounded-xl border cursor-pointer transition flex items-center justify-between gap-3 ${
                  isSelected
                    ? "bg-[#FFF5F6] border-[#F26979] shadow-xs"
                    : "bg-white border-slate-200 hover:bg-slate-50"
                }`}
              >
                <div className="min-w-0">
                  <h5 className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                    {b.title}
                  </h5>
                  <span className="text-[11px] text-slate-500 font-mono block">
                    ISBN: {b.isbn || "978-93-5400-000-0"}
                  </span>
                </div>
                <Award
                  className={`w-5 h-5 shrink-0 ${
                    isSelected ? "text-[#F26979]" : "text-slate-300"
                  }`}
                />
              </div>
            );
          })}
        </div>

        {/* Right: Rendered Formal Publication Certificate (8 cols) */}
        <div className="lg:col-span-8 bg-gradient-to-b from-amber-50/40 via-white to-amber-50/20 rounded-3xl border-4 border-amber-200/60 p-8 sm:p-12 shadow-xl relative overflow-hidden text-center space-y-6">
          {/* Subtle Decorative Guilloche Border Element */}
          <div className="absolute top-4 left-4 right-4 bottom-4 border border-amber-300/40 rounded-2xl pointer-events-none" />

          {/* Top Logo & Title */}
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-[#F05262] text-white flex items-center justify-center font-serif font-bold text-2xl shadow-md">
              /
            </div>
            <span className="font-serif text-2xl sm:text-3xl font-extrabold tracking-wide text-slate-900">
              BookLeaf Publishing
            </span>
            <span className="text-[11px] font-bold text-amber-700 tracking-widest uppercase">
              International Registry of Published Works
            </span>
          </div>

          <div className="pt-2">
            <span className="font-serif text-3xl sm:text-4xl font-normal italic text-slate-800 tracking-tight block">
              Certificate of Publication
            </span>
            <p className="text-xs text-slate-500 mt-2">
              This document certifies that the literary work described herein has been
              officially registered, typeset, and published internationally.
            </p>
          </div>

          <div className="space-y-2 py-4">
            <span className="text-xs text-slate-400 uppercase tracking-widest block">
              Awarded to Author
            </span>
            <h3 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#0F4C3A] tracking-tight">
              {author.name || "Priya Sharma"}
            </h3>
            <p className="text-xs text-slate-500">Author Registration ID: {author.author_id || "AUTH001"}</p>
          </div>

          <div className="bg-white/80 backdrop-blur-xs rounded-2xl border border-amber-200/80 p-5 max-w-lg mx-auto shadow-xs space-y-1">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block">
              Registered Title
            </span>
            <h4 className="font-serif text-xl sm:text-2xl font-bold text-slate-900">
              &ldquo;{selectedBook?.title || "Whispers of the Ganges"}&rdquo;
            </h4>
            <div className="flex items-center justify-center gap-4 text-xs text-slate-600 pt-1 font-mono">
              <span>ISBN: {selectedBook?.isbn || "978-93-5400-112-4"}</span>
              <span>•</span>
              <span>Genre: {selectedBook?.genre || "Fiction"}</span>
            </div>
          </div>

          {/* Bottom Verification Seal & Signatures */}
          <div className="pt-6 border-t border-amber-200/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full border-2 border-amber-400 bg-amber-50 flex items-center justify-center text-amber-700 font-bold text-[10px] tracking-tight">
                VERIFIED
              </div>
              <div className="text-left">
                <span className="font-bold text-slate-800 block text-xs">
                  Libresco Feeds Pvt Ltd.
                </span>
                <span className="text-[10px]">CIN: U22100JK2019PTC010936</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F05262] hover:bg-[#e04555] text-white text-xs font-bold transition shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save PDF</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
