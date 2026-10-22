import React from "react";

/**
 * High-Speed Shimmer Skeleton Loaders
 * Provides instant perceived loading across Author and Admin portals
 */

export function Shimmer({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative overflow-hidden bg-slate-200/70 rounded-md ${className}`}
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/50 to-transparent" />
    </div>
  );
}

/**
 * 1. Metric Cards Grid Skeleton (Bento Grid)
 */
export function MetricCardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3"
        >
          <div className="flex items-center justify-between">
            <Shimmer className="w-10 h-10 rounded-xl" />
            <Shimmer className="w-16 h-5 rounded-full" />
          </div>
          <div className="space-y-1.5">
            <Shimmer className="w-24 h-3.5" />
            <Shimmer className="w-32 h-7 rounded-lg" />
          </div>
          <Shimmer className="w-40 h-3" />
        </div>
      ))}
    </div>
  );
}

/**
 * 2. Full Dashboard Viewport Skeleton
 */
export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Top Banner Skeleton */}
      <div className="h-28 rounded-2xl bg-slate-800/20 border border-slate-200 p-6 flex flex-col justify-center space-y-2">
        <Shimmer className="w-48 h-5 rounded" />
        <Shimmer className="w-96 h-4 rounded" />
      </div>

      {/* Metrics */}
      <MetricCardsSkeleton count={4} />

      {/* Main 2-Column Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <Shimmer className="w-36 h-5" />
            <Shimmer className="w-20 h-8 rounded-lg" />
          </div>
          <div className="space-y-3 pt-2">
            {[1, 2, 3, 4].map((r) => (
              <Shimmer key={r} className="w-full h-14 rounded-xl" />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <Shimmer className="w-28 h-5" />
          <Shimmer className="w-full h-36 rounded-xl" />
          <div className="space-y-2 pt-2">
            <Shimmer className="w-full h-4" />
            <Shimmer className="w-3/4 h-4" />
            <Shimmer className="w-1/2 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 3. Table Stream Skeleton
 */
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
        <Shimmer className="w-32 h-4" />
        <Shimmer className="w-24 h-6 rounded-lg" />
      </div>
      <div className="divide-y divide-slate-100 p-4 space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center justify-between gap-4 py-2">
            <div className="flex items-center gap-3 flex-1">
              <Shimmer className="w-9 h-9 rounded-xl shrink-0" />
              <div className="space-y-1.5 flex-1">
                <Shimmer className="w-48 h-4" />
                <Shimmer className="w-32 h-3" />
              </div>
            </div>
            <Shimmer className="w-20 h-6 rounded-full shrink-0" />
            <Shimmer className="w-16 h-4 shrink-0 hidden sm:block" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * 4. Email Box Split-Pane Skeleton
 */
export function EmailBoxSkeleton() {
  return (
    <div className="space-y-6">
      {/* Top Banner Skeleton */}
      <div className="h-32 rounded-2xl bg-slate-900/10 border border-slate-200 p-6 space-y-3" />

      {/* Two-Pane Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[500px]">
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
          <Shimmer className="w-32 h-4 mb-4" />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-3 border border-slate-100 rounded-xl space-y-2">
              <div className="flex justify-between">
                <Shimmer className="w-20 h-4 rounded-full" />
                <Shimmer className="w-12 h-3" />
              </div>
              <Shimmer className="w-40 h-4" />
              <Shimmer className="w-full h-3" />
            </div>
          ))}
        </div>

        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <div className="flex justify-between items-center">
            <Shimmer className="w-28 h-6 rounded-full" />
            <Shimmer className="w-20 h-8 rounded-lg" />
          </div>
          <Shimmer className="w-3/4 h-6" />
          <div className="h-px bg-slate-100 my-4" />
          <div className="space-y-3">
            <Shimmer className="w-full h-24 rounded-xl" />
            <Shimmer className="w-full h-36 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
