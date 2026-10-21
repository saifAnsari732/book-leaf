import { BookOpen, Sparkles } from "lucide-react";

export default function GlobalLoading() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Top animated progress bar */}
      <div className="h-1 w-full bg-slate-200 overflow-hidden relative">
        <div className="h-full w-1/3 bg-gradient-to-r from-[#1B4D7E] via-blue-500 to-emerald-600 animate-progress-scan rounded-full" />
      </div>

      {/* Center animated editorial badge + skeleton */}
      <div className="max-w-5xl w-full mx-auto px-6 py-12 space-y-8">
        <div className="flex items-center gap-4">
          <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-[#1B4D7E] text-white shadow-md">
            <BookOpen className="h-6 w-6 animate-pulse" aria-hidden="true" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white">
              <Sparkles className="h-2.5 w-2.5" aria-hidden="true" />
            </span>
          </div>
          <div>
            <div className="h-5 w-56 rounded-md animate-shimmer mb-2" />
            <div className="h-3.5 w-80 rounded-md animate-shimmer" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3"
            >
              <div className="h-3.5 w-24 rounded animate-shimmer" />
              <div className="h-7 w-20 rounded animate-shimmer" />
              <div className="h-3 w-32 rounded animate-shimmer" />
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="h-5 w-48 rounded animate-shimmer" />
          {[1, 2, 3].map((row) => (
            <div
              key={row}
              className="h-14 w-full rounded-lg animate-shimmer"
            />
          ))}
        </div>
      </div>

      <div className="pb-6 text-center text-xs text-slate-400">
        BookLeaf Publishing • Synchronizing Portal State...
      </div>
    </div>
  );
}
