"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthorRoyaltyRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/author-dashboard?menu=Royalty%20Withdrawal");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#F2EDEB] flex items-center justify-center p-6">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-[#F26979] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-slate-600">
          Loading Royalty &amp; Wallet...
        </p>
      </div>
    </div>
  );
}
