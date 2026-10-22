"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { SafeUser } from "@/types/domain";
import {
  Bell,
  BookOpen,
  FileCode2,
  Headphones,
  HelpCircle,
  IndianRupee,
  Layers,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  PlusCircle,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Ticket,
  User,
  UserCheck,
  Wallet,
  BarChart3,
  X,
} from "lucide-react";

interface PortalShellProps {
  user: SafeUser;
  children: React.ReactNode;
  lastSyncedAt?: string | null;
  onManualRefresh?: () => void;
  isRefreshing?: boolean;
}

export function PortalShell({
  user,
  children,
  lastSyncedAt,
  onManualRefresh,
  isRefreshing = false,
}: PortalShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const isAdmin = user.role === "ADMIN";

  const navItems = isAdmin
    ? [
        {
          href: "/admin",
          label: "Dashboard",
          icon: LayoutDashboard,
          exact: true,
        },
        {
          href: "/admin/tickets",
          label: "Tickets Queue",
          icon: Ticket,
          exact: false,
        },
        {
          href: "/admin/ai-assistant",
          label: "AI Co-Pilot",
          icon: Sparkles,
          exact: false,
        },
        {
          href: "/admin/knowledge-base",
          label: "Knowledge Base",
          icon: Layers,
          exact: false,
        },
        {
          href: "/admin/profile",
          label: "Settings",
          icon: Settings,
          exact: false,
        },
        {
          href: "/api-docs",
          label: "REST API Docs",
          icon: FileCode2,
          exact: false,
        },
      ]
    : [
        {
          href: "/author",
          label: "Dashboard",
          icon: LayoutDashboard,
          exact: true,
        },
        {
          href: "/author-dashboard?menu=Royalty%20Withdrawal",
          label: "Royalty & Wallet",
          icon: Wallet,
          exact: false,
        },
        {
          href: "/author/books",
          label: "My Books",
          icon: BookOpen,
          exact: false,
        },
        {
          href: "/author-dashboard?menu=Sales%20Reports",
          label: "Sales Reports",
          icon: BarChart3,
          exact: false,
        },
        {
          href: "/author/tickets",
          label: "Support Tickets",
          icon: Ticket,
          exact: true,
        },
        {
          href: "/author/tickets/new",
          label: "Create Ticket",
          icon: PlusCircle,
          exact: false,
        },
        {
          href: "/author/profile",
          label: "Profile & Settings",
          icon: User,
          exact: false,
        },
      ];

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F9FAF7] flex flex-col lg:flex-row text-slate-800">
      {/* ==================================================================
          DESKTOP SIDEBAR (Dark Navy Slate #0B1728 - Matches 12-Screen Design)
          ================================================================== */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-[#0B1728] text-slate-300 border-r border-slate-800 z-30 justify-between">
        <div>
          {/* Brand Logo Header */}
          <div className="h-20 px-6 flex items-center border-b border-slate-800/80">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0F4C3A] to-[#10B981] flex items-center justify-center text-white shadow-sm">
                <svg
                  className="w-5 h-5 text-emerald-100"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                >
                  <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                  <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-lg font-bold text-white tracking-tight leading-tight">
                  BookLeaf
                </span>
                <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">
                  {isAdmin ? "Admin Ops" : "Author Portal"}
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5" aria-label="Sidebar">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = item.exact
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                    active
                      ? "bg-[#0F4C3A] text-white font-semibold shadow-xs"
                      : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${active ? "text-emerald-300" : "text-slate-400"}`}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Card in Sidebar */}
        <div className="p-4 border-t border-slate-800/80">
          <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-emerald-900 text-emerald-200 font-bold text-xs flex items-center justify-center shrink-0 border border-emerald-700">
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">{user.name}</p>
                <p className="text-[10px] text-emerald-400 uppercase font-semibold">
                  {user.author_id || user.role}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              title="Sign Out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ==================================================================
          MAIN CONTENT AREA
          ================================================================== */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Top Search & Notifications Header */}
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-[#E8EDE6] h-16 px-4 sm:px-8 flex items-center justify-between gap-4">
          {/* Mobile menu toggle */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Global Search Input (Matches 12-Screen Header) */}
            <div className="relative hidden sm:block w-72 md:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search anything..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 rounded-full border border-slate-200 bg-[#F9FAF7] text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:border-[#0F4C3A] transition"
              />
            </div>
          </div>

          {/* Right Header Icons & User Pill */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/author/tickets"
              className="p-2 rounded-full text-slate-500 hover:bg-slate-100 transition relative"
              title="Support Alerts"
            >
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-emerald-500 absolute top-1.5 right-1.5" />
            </Link>

            <Link
              href={isAdmin ? "/admin/profile" : "/author/profile"}
              className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full border border-slate-200 bg-white hover:bg-slate-50 transition"
            >
              <div className="w-7 h-7 rounded-full bg-[#EBF3EE] text-[#0F4C3A] font-bold text-xs flex items-center justify-center border border-[#C4DDD0]">
                {user.name[0]}
              </div>
              <span className="text-xs font-semibold text-slate-700 hidden sm:inline">
                {user.name}
              </span>
            </Link>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#0B1728] text-slate-300 p-4 border-b border-slate-800 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-slate-800"
                >
                  <Icon className="w-4 h-4 text-emerald-400" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-rose-300 hover:bg-rose-950/40"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
