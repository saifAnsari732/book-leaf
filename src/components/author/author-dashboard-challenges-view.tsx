"use client";

import React, { useState } from "react";
import { BookRecord, SafeUser } from "@/types/domain";
import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Flame,
  Send,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";

interface AuthorDashboardChallengesViewProps {
  books: BookRecord[];
  author: SafeUser;
}

export function AuthorDashboardChallengesView({
  books,
  author,
}: AuthorDashboardChallengesViewProps) {
  const [dailyWords, setDailyWords] = useState("");
  const [todayPromptResponse, setTodayPromptResponse] = useState("");
  const [submittedWords, setSubmittedWords] = useState(14800);
  const [showSubmitSuccess, setShowSubmitSuccess] = useState(false);

  function handleSubmitDay(e: React.FormEvent) {
    e.preventDefault();
    const count = parseInt(dailyWords, 10);
    if (!isNaN(count) && count > 0) {
      setSubmittedWords((prev) => prev + count);
      setDailyWords("");
      setTodayPromptResponse("");
      setShowSubmitSuccess(true);
      setTimeout(() => setShowSubmitSuccess(false), 3000);
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
            <Flame className="w-3.5 h-3.5 text-amber-600" />
            <span>BookLeaf Writing Challenges (Global Community of 25K+ Writers)</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            21-Day Writing Challenge &amp; Writeathons
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Write one poem, story, or chapter every day for 21 days. Complete the
            challenge to get your completed manuscript published in paperback with 100% royalties.
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 shrink-0 text-center min-w-[200px]">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Challenge Progress
          </span>
          <div className="flex items-center justify-center gap-2">
            <span className="font-serif text-3xl font-bold text-[#F05262]">Day 14</span>
            <span className="text-xs text-slate-400">/ 21 Days</span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full mt-2 overflow-hidden">
            <div className="bg-[#F05262] h-full rounded-full w-[66%]" />
          </div>
          <span className="text-[10px] text-slate-500 font-medium block mt-1">
            66% Completed (7 Days to Publication)
          </span>
        </div>
      </div>

      {showSubmitSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs sm:text-sm text-emerald-800 font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Day 14 Chapter words recorded! Streak maintained at 14 consecutive days.</span>
        </div>
      )}

      {/* Grid: Active Daily Challenge + Writeathon Opportunities */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Day 14 Writing Submission Workspace (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold text-[#F05262] uppercase tracking-wider block">
                Today&apos;s Creative Prompt (Day 14)
              </span>
              <h3 className="font-serif text-lg font-bold text-slate-900 mt-0.5">
                &ldquo;The Echoes of an Unsent Letter&rdquo;
              </h3>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Ends in 9h 40m</span>
            </div>
          </div>

          <form onSubmit={handleSubmitDay} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Words Written Today
              </label>
              <input
                type="number"
                min="50"
                max="5000"
                required
                placeholder="e.g. 750 words"
                value={dailyWords}
                onChange={(e) => setDailyWords(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-[#F26979] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Chapter Snippet or Notes
              </label>
              <textarea
                rows={5}
                required
                placeholder="Write or paste your poetry lines, story excerpts, or chapter text here..."
                value={todayPromptResponse}
                onChange={(e) => setTodayPromptResponse(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-[#F26979] focus:outline-none leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <span className="text-xs text-slate-500">
                Total Words Accumulated: <strong className="text-slate-900">{submittedWords.toLocaleString()}</strong> words
              </span>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#F05262] hover:bg-[#d94151] text-white text-xs font-bold transition shadow-xs flex items-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Day 14 Entry</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right: Upcoming Contests & Community Badges (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Contest 1: Global Poetry Anthology */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-[#F05262] border border-rose-200">
                Poetry Anthology 2026
              </span>
              <span className="text-xs font-bold text-emerald-700">Open for Entries</span>
            </div>
            <h4 className="font-serif text-base font-bold text-slate-900">
              Verses on the Human Stage (Vol. 4)
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Selected poems will be printed in a hardcover international anthology sold
              globally on Amazon USA, UK, and BookLeaf Bookstore.
            </p>
            <div className="pt-1 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100">
              <span>Grand Prize: ₹50,000</span>
              <span className="font-semibold text-[#F05262]">Deadline: 15 Nov 2026</span>
            </div>
          </div>

          {/* Contest 2: 21-Day Streak Badge */}
          <div className="bg-gradient-to-br from-[#0F4C3A] to-[#155A46] text-white rounded-2xl p-6 shadow-md space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <h4 className="font-bold text-sm">Author Streak: 14 Days</h4>
                <p className="text-[11px] text-emerald-200">Top 5% of all active writers</p>
              </div>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              Complete the remaining 7 days to earn the verified &ldquo;BookLeaf 21-Day Finisher&rdquo;
              gold seal on your author profile.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
