"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { PortalShell } from "@/components/layout/portal-shell";
import { EmailActivityBox } from "@/components/author/email-activity-box";
import { Mail, RefreshCw } from "lucide-react";

export default function InboxPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login?redirect=/inbox");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="flex items-center gap-3 text-slate-500 font-medium text-sm">
          <RefreshCw className="w-5 h-5 animate-spin text-indigo-600" />
          <span>Loading secure mailbox...</span>
        </div>
      </div>
    );
  }

  return (
    <PortalShell user={user}>
      <div className="max-w-7xl mx-auto py-2">
        <EmailActivityBox
          currentUserId={user.user_id}
          currentUserEmail={user.email}
          currentUserName={user.name}
        />
      </div>
    </PortalShell>
  );
}
