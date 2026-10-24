"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function UniversalDashboardPage() {
  const router = useRouter();
  const { user, role, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated || !user) {
      router.replace("/login?redirect=/dashboard");
      return;
    }

    if (role === "ADMIN") {
      router.replace("/admin");
    } else {
      router.replace("/author-dashboard?menu=Royalty%20Withdrawal");
    }
  }, [isLoading, isAuthenticated, role, user, router]);

  return (
    <div className="min-h-screen bg-[#F9FAF7] flex flex-col items-center justify-center p-6">
      <div className="flex flex-col items-center gap-4 text-center max-w-sm">
        <div className="w-12 h-12 border-3 border-[#0F4C3A] border-t-transparent rounded-full animate-spin" />
        <div>
          <h2 className="text-base font-bold text-slate-800">
            Routing to Your Dashboard...
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Verifying RBAC permissions and session credentials.
          </p>
        </div>
      </div>
    </div>
  );
}
