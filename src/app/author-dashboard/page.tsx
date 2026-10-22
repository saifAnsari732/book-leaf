"use client";

import React, { Suspense } from "react";
import { AuthorDashboardContent } from "./author-dashboard-content";

export default function AuthorDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F2EDEB] flex items-center justify-center p-6">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-3 border-[#F26979] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-semibold text-slate-600">
              Loading BookLeaf Author Dashboard...
            </p>
          </div>
        </div>
      }
    >
      <AuthorDashboardContent />
    </Suspense>
  );
}
