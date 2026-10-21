"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { SafeUser } from "@/types/domain";
import {
  BookOpen,
  FileCode2,
  Home,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  PlusCircle,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Ticket,
  UserCheck,
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

  const isAdmin = user.role === "ADMIN";

  const navItems = isAdmin
    ? [
        {
          href: "/admin",
          label: "Ops Overview",
          icon: LayoutDashboard,
          exact: true,
        },
        {
          href: "/admin/tickets",
          label: "Ticket Queue & AI Triage",
          icon: Inbox,
          exact: false,
        },
        {
          href: "/api-docs",
          label: "REST API Spec",
          icon: FileCode2,
          exact: false,
        },
      ]
    : [
        {
          href: "/author",
          label: "Overview Dashboard",
          icon: LayoutDashboard,
          exact: true,
        },
        {
          href: "/author/books",
          label: "My Books & Royalties",
          icon: BookOpen,
          exact: false,
        },
        {
          href: "/author/tickets",
          label: "My Support Tickets",
          icon: Ticket,
          exact: true,
        },
        {
          href: "/author/tickets/new",
          label: "Submit a Query",
          icon: PlusCircle,
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
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-72 lg:flex-col lg:fixed lg:inset-y-0 bg-[#0E2842] text-white border-r border-slate-800 z-30">
        <div className="p-6 border-b border-white/10">
          <Link
            href="/"
            className="flex items-center gap-3 group cursor-pointer"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white border border-white/15 group-hover:bg-white/20 transition-colors">
              <BookOpen className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <span className="font-serif text-lg font-bold tracking-tight block leading-none">
                BookLeaf
              </span>
              <span className="text-[11px] uppercase tracking-widest text-sky-300/90 font-semibold mt-1 block">
                {isAdmin ? "Admin Operations" : "Author Portal"}
              </span>
            </div>
          </Link>
        </div>

        {/* Role & Identity Card */}
        <div className="px-4 py-4 border-b border-white/10 bg-white/[0.03]">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-500/20 text-sky-300 font-semibold text-sm border border-sky-400/30">
              {user.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white truncate">
                {user.name}
              </p>
              <p className="text-xs text-slate-300 truncate">{user.email}</p>
              <div className="mt-1.5 flex items-center gap-1.5">
                <span
                  className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                    isAdmin
                      ? "bg-amber-500/20 text-amber-300 border border-amber-400/30"
                      : "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30"
                  }`}
                >
                  {isAdmin ? (
                    <ShieldCheck className="h-3 w-3" aria-hidden="true" />
                  ) : (
                    <UserCheck className="h-3 w-3" aria-hidden="true" />
                  )}
                  {user.role}
                </span>
                {user.author_id && (
                  <span className="text-[11px] font-mono text-slate-300 bg-white/10 px-1.5 py-0.5 rounded">
                    {user.author_id}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-5 space-y-1.5" aria-label="Sidebar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-150 cursor-pointer ${
                  active
                    ? "bg-white text-[#0E2842] shadow-sm font-semibold"
                    : "text-slate-200 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon
                  className={`h-4 w-4 ${
                    active ? "text-[#1B4D7E]" : "text-slate-300"
                  }`}
                  aria-hidden="true"
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* AI & Real-Time Status Footer */}
        <div className="p-4 border-t border-white/10 space-y-3">
          <div className="rounded-xl bg-white/5 border border-white/10 p-3 text-xs space-y-1.5">
            <div className="flex items-center justify-between text-sky-300 font-semibold">
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                AI Support Engine
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                Active
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Context-Sliced Policy Grounding + Real-Time Sync enabled.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-white/15 transition-colors cursor-pointer"
            >
              Switch Demo User
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-rose-500/20 border border-rose-400/30 px-3 py-2 text-xs font-semibold text-rose-200 hover:bg-rose-500/30 transition-colors cursor-pointer"
              title="Sign out"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              Exit
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-72 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden inline-flex items-center justify-center rounded-lg p-2 text-slate-700 hover:bg-slate-100 cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Menu className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
            >
              <Home className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Portal Home</span>
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-xs font-semibold text-[#1B4D7E]">
              {isAdmin ? "Operations Control Center" : "Author Workspace"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Sync Status Pill */}
            <div className="hidden sm:flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-medium text-emerald-800">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
              </span>
              <span>Live Sync</span>
              {lastSyncedAt && (
                <span className="text-emerald-600/80 text-[11px]">
                  • {lastSyncedAt}
                </span>
              )}
            </div>

            {onManualRefresh && (
              <button
                type="button"
                onClick={onManualRefresh}
                disabled={isRefreshing}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                title="Refresh live data now"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${
                    isRefreshing ? "animate-spin text-[#1B4D7E]" : ""
                  }`}
                  aria-hidden="true"
                />
                <span className="hidden md:inline">Sync</span>
              </button>
            )}

            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Switch Role
            </Link>
          </div>
        </header>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#0E2842] text-white px-4 py-4 space-y-2 border-b border-slate-800 animate-fade-scale">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-100 hover:bg-white/10"
                >
                  <Icon className="h-4 w-4 text-sky-300" aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}
            <div className="pt-2 border-t border-white/10 flex gap-2">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full rounded-lg bg-rose-500/20 px-3 py-2 text-xs font-semibold text-rose-200"
              >
                Sign Out ({user.name})
              </button>
            </div>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 px-4 sm:px-8 py-6 sm:py-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
