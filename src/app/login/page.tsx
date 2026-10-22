"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  UserCheck,
} from "lucide-react";

interface DemoAccount {
  author_id: string | null;
  name: string;
  email: string;
  role: "AUTHOR" | "ADMIN";
  city: string | null;
  books_count: number;
  edge_case_tag: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"AUTHOR" | "ADMIN">("AUTHOR");
  const [email, setEmail] = useState("priya.sharma@email.com");
  const [password, setPassword] = useState("author123");
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [demoAccounts, setDemoAccounts] = useState<DemoAccount[]>([]);
  const [showMatrix, setShowMatrix] = useState(false);

  useEffect(() => {
    fetch("/api/auth/demo-accounts")
      .then((r) => r.json())
      .then((data) => {
        if (data?.accounts) setDemoAccounts(data.accounts);
      })
      .catch(() => {});
  }, []);

  const handleTabChange = (tab: "AUTHOR" | "ADMIN") => {
    setActiveTab(tab);
    setError(null);
    if (tab === "ADMIN") {
      setEmail("admin@bookleafpub.com");
      setPassword("admin123");
    } else {
      setEmail("priya.sharma@email.com");
      setPassword("author123");
    }
  };

  async function performLogin(loginEmail: string, loginPass: string) {
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPass }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Invalid email or password");
        return;
      }
      const destination = data.user.role === "ADMIN" ? "/admin" : "/author";
      router.push(destination);
      router.refresh();
    } catch {
      setError("Network error while signing in. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    performLogin(email, password);
  }

  function selectDemoAccount(acc: DemoAccount) {
    setActiveTab(acc.role);
    const pass = acc.role === "ADMIN" ? "admin123" : "author123";
    setEmail(acc.email);
    setPassword(pass);
    performLogin(acc.email, pass);
  }

  return (
    <div className="min-h-screen bg-[#F9FAF7] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 selection:bg-[#0F4C3A] selection:text-white">
      {/* Top Navbar Brand Link */}
      <div className="max-w-5xl w-full mx-auto mb-8 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-[#0F4C3A] text-white flex items-center justify-center shadow-xs">
            <svg
              className="w-5 h-5 text-emerald-200"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
            >
              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
              <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
            </svg>
          </div>
          <div>
            <span className="font-serif text-lg font-bold text-slate-900 leading-tight block">
              BookLeaf Publishing
            </span>
            <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">
              Author Support Portal
            </span>
          </div>
        </Link>

        <Link
          href="/"
          className="text-xs font-semibold text-[#0F4C3A] hover:text-[#0A3B2D] transition flex items-center gap-1"
        >
          <span>Back to Home</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Main Split Container (Screen 1 in Design System) */}
      <div className="max-w-5xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 bg-white rounded-3xl border border-[#E8EDE6] shadow-sm overflow-hidden">
        {/* Left Brand Panel */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#0F3D30] via-[#0A2F25] to-[#062019] text-white p-8 sm:p-10 flex flex-col justify-between relative">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="flex items-center gap-2 mb-8">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-emerald-300">
                <BookOpen className="w-4 h-4" />
              </div>
              <span className="font-serif font-bold text-base tracking-wide text-white">
                BookLeaf Publishing
              </span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white tracking-tight leading-tight mb-4">
              Better Support for Better Stories
            </h2>

            <p className="text-emerald-100/75 text-sm leading-relaxed mb-6">
              We&apos;re here to support our authors at every step of their publishing
              journey — from royalty inquiries to production updates.
            </p>
          </div>

          {/* Book Mockup Visual Image (Matches Screen 1 in Design System) */}
          <div className="relative rounded-2xl overflow-hidden border border-white/20 shadow-lg group">
            <img
              src="/images/login-books-desk.jpg"
              alt="BookLeaf Publishing Cozy Author Desk"
              className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#062019]/90 via-[#0A2F25]/40 to-transparent flex flex-col justify-end p-4">
              <span className="font-serif italic text-xs text-emerald-200">
                “Stories create a better tomorrow.”
              </span>
              <span className="text-[10px] uppercase tracking-wider text-emerald-400/90 font-semibold mt-0.5">
                BookLeaf Publishing • Official Author Support
              </span>
            </div>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-between bg-white">
          <div>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 mb-1.5">
              Welcome Back
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mb-6">
              Sign in to your account to continue
            </p>

            {/* Segmented Control: Author vs Admin */}
            <div className="p-1 rounded-xl bg-[#F2F6F3] border border-[#E2ECE5] flex items-center gap-1 mb-6">
              <button
                type="button"
                onClick={() => handleTabChange("AUTHOR")}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold transition ${
                  activeTab === "AUTHOR"
                    ? "bg-[#0F4C3A] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Author
              </button>
              <button
                type="button"
                onClick={() => handleTabChange("ADMIN")}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold transition ${
                  activeTab === "ADMIN"
                    ? "bg-[#0F4C3A] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Admin
              </button>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-[#F9FAF7] text-slate-900 text-sm focus:bg-white focus:outline-hidden focus:border-[#0F4C3A] focus:ring-1 focus:ring-[#0F4C3A] transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-[#F9FAF7] text-slate-900 text-sm focus:bg-white focus:outline-hidden focus:border-[#0F4C3A] focus:ring-1 focus:ring-[#0F4C3A] transition"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded text-[#0F4C3A] focus:ring-[#0F4C3A] border-slate-300"
                  />
                  <span>Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setError(
                      "Demo password hint: 'author123' for Authors or 'admin123' for Admin."
                    )
                  }
                  className="text-[#0F4C3A] hover:underline font-medium"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-[#0F4C3A] hover:bg-[#0A3B2D] text-white font-semibold text-sm shadow-sm transition active:scale-[0.99] flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>Signing In...</span>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
            <p>
              Don&apos;t have an account?{" "}
              <Link href="/" className="text-[#0F4C3A] font-semibold hover:underline">
                Contact support
              </Link>
            </p>
            <button
              type="button"
              onClick={() => setShowMatrix(!showMatrix)}
              className="text-[#0F4C3A] font-medium hover:underline flex items-center gap-1"
            >
              <span>{showMatrix ? "Hide Quick Accounts" : "Quick Evaluator Accounts (11)"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Evaluator Matrix (Collapsible) */}
      {showMatrix && (
        <div className="max-w-5xl w-full mx-auto mt-6 bg-white rounded-2xl p-6 border border-[#E8EDE6] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Instant 1-Click Login Matrix (10 Authors + 1 Admin)
            </h4>
            <span className="text-[11px] text-slate-500">
              Click any account to authenticate instantly
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {demoAccounts.map((acc) => (
              <button
                key={acc.email}
                type="button"
                onClick={() => selectDemoAccount(acc)}
                className="p-3 rounded-xl border border-slate-200 hover:border-[#0F4C3A] hover:bg-[#F2F7F4] text-left transition flex items-center justify-between group"
              >
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="font-bold text-xs text-slate-900 group-hover:text-[#0F4C3A]">
                      {acc.name}
                    </span>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-semibold uppercase ${
                        acc.role === "ADMIN"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {acc.author_id || acc.role}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">{acc.email}</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0F4C3A] shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
