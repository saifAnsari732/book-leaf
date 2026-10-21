"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  KeyRound,
  Lock,
  Mail,
  RefreshCw,
  ShieldCheck,
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
  const [email, setEmail] = useState("priya.sharma@email.com");
  const [password, setPassword] = useState("author123");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [demoAccounts, setDemoAccounts] = useState<DemoAccount[]>([]);

  useEffect(() => {
    fetch("/api/auth/demo-accounts")
      .then((r) => r.json())
      .then((data) => {
        if (data?.accounts) setDemoAccounts(data.accounts);
      })
      .catch(() => {});
  }, []);

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
    const pass = acc.role === "ADMIN" ? "admin123" : "author123";
    setEmail(acc.email);
    setPassword(pass);
    performLogin(acc.email, pass);
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between py-8 px-4 sm:px-8">
      <div className="max-w-6xl w-full mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-3 group cursor-pointer"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1B4D7E] text-white shadow-sm">
              <BookOpen className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <span className="font-serif text-lg font-bold text-slate-900 block leading-none">
                BookLeaf Publishing
              </span>
              <span className="text-xs text-slate-500">
                Author Support & Operations Portal
              </span>
            </div>
          </Link>
          <Link
            href="/api-docs"
            className="text-xs font-semibold text-[#1B4D7E] hover:underline"
          >
            View REST API Documentation →
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Email/Password Login Card */}
          <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm animate-fade-up">
            <div className="mb-6">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 border border-sky-200 px-3 py-1 text-xs font-semibold text-[#1B4D7E] mb-3">
                <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                Role-Based Portal Authentication
              </span>
              <h1 className="font-serif text-2xl font-bold text-slate-900">
                Sign in to your account
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                Authors view their personal books, royalties, and live tickets.
                Admins access the global queue and AI response workbench.
              </p>
            </div>

            {error && (
              <div
                role="alert"
                className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs font-medium text-red-800"
              >
                <AlertCircle
                  className="h-4 w-4 text-red-600 shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="login-email"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
                >
                  Email Address <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <Mail
                    className="h-4 w-4 text-slate-400 absolute left-3.5 top-3"
                    aria-hidden="true"
                  />
                  <input
                    id="login-email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="priya.sharma@email.com"
                    className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:border-[#1B4D7E] focus:outline-none focus:ring-2 focus:ring-[#1B4D7E]/20"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="login-password"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
                >
                  Password <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <KeyRound
                    className="h-4 w-4 text-slate-400 absolute left-3.5 top-3"
                    aria-hidden="true"
                  />
                  <input
                    id="login-password"
                    name="password"
                    type="password"
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:border-[#1B4D7E] focus:outline-none focus:ring-2 focus:ring-[#1B4D7E]/20"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#1B4D7E] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#163f68] disabled:opacity-60 transition-all cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw
                      className="h-4 w-4 animate-spin"
                      aria-hidden="true"
                    />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Portal</span>
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-200 text-xs text-slate-500 space-y-1.5">
              <p className="font-semibold text-slate-700">
                Default Seeded Credentials:
              </p>
              <p>
                • <strong>Admin Portal:</strong>{" "}
                <code className="font-mono text-slate-800">
                  admin@bookleafpub.com
                </code>{" "}
                / <code className="font-mono text-slate-800">admin123</code>
              </p>
              <p>
                • <strong>All 10 Authors:</strong>{" "}
                <code className="font-mono text-slate-800">
                  &lt;author-email&gt;
                </code>{" "}
                / <code className="font-mono text-slate-800">author123</code>
              </p>
            </div>
          </div>

          {/* Right: 1-Click Evaluator Switchboard for All Seeded Accounts */}
          <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm animate-fade-up delay-75">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-serif text-xl font-bold text-slate-900">
                  1-Click Evaluator Quick-Login Matrix
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Click any seeded account from{" "}
                  <code className="font-mono">bookleaf_sample_data.json</code>{" "}
                  to sign in immediately and test its specific data state.
                </p>
              </div>
              <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                10 Authors + 1 Admin
              </span>
            </div>

            <div className="space-y-2.5 max-h-[540px] overflow-y-auto pr-1">
              {demoAccounts.map((acc) => {
                const isAdmin = acc.role === "ADMIN";
                return (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => selectDemoAccount(acc)}
                    disabled={isSubmitting}
                    className={`w-full text-left rounded-xl border p-3.5 transition-all flex items-center justify-between gap-3 cursor-pointer ${
                      isAdmin
                        ? "border-amber-300 bg-amber-50/60 hover:bg-amber-100/70"
                        : "border-slate-200 bg-slate-50/60 hover:bg-sky-50/70 hover:border-sky-300"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            isAdmin
                              ? "bg-[#0E2842] text-amber-300"
                              : "bg-[#1B4D7E] text-white"
                          }`}
                        >
                          {isAdmin ? (
                            <ShieldCheck
                              className="h-3 w-3"
                              aria-hidden="true"
                            />
                          ) : (
                            <UserCheck
                              className="h-3 w-3"
                              aria-hidden="true"
                            />
                          )}
                          {acc.role}
                        </span>
                        {acc.author_id && (
                          <span className="font-mono text-xs font-semibold text-slate-600">
                            {acc.author_id}
                          </span>
                        )}
                        <span className="text-sm font-bold text-slate-900">
                          {acc.name}
                        </span>
                        {acc.city && (
                          <span className="text-xs text-slate-500">
                            ({acc.city})
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
                        <span className="font-mono text-[11px] text-slate-500">
                          {acc.email}
                        </span>
                        <span>•</span>
                        <span className="font-medium text-slate-800">
                          {acc.edge_case_tag}
                        </span>
                      </div>
                    </div>
                    <span className="shrink-0 inline-flex items-center gap-1 rounded-lg bg-white border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-[#1B4D7E] shadow-sm">
                      Launch
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
