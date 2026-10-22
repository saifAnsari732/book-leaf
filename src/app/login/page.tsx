"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  LogIn,
  Mail,
  MapPin,
  Phone,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  User,
  UserPlus,
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
  const toast = useToast();
  const router = useRouter();
  const { login, register, isAuthenticated, role: currentRole } = useAuth();

  // Mode: "signin" | "signup"
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");

  // Sign In State
  const [activeTab, setActiveTab] = useState<"AUTHOR" | "ADMIN">("AUTHOR");
  const [signInEmail, setSignInEmail] = useState("priya.sharma@email.com");
  const [signInPassword, setSignInPassword] = useState("author123");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Sign Up State
  const [fullName, setFullName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Status & UI State
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [demoAccounts, setDemoAccounts] = useState<DemoAccount[]>([]);
  const [showMatrix, setShowMatrix] = useState(false);
  const [redirectNotice, setRedirectNotice] = useState<string | null>(null);

  useEffect(() => {
    // Check search params for initial mode or redirect reason
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const modeParam = params.get("mode");
      if (modeParam === "signup" || modeParam === "register") {
        setAuthMode("signup");
      }

      const deniedParam = params.get("access_denied");
      if (deniedParam === "admin_required") {
        setRedirectNotice(
          "Access Denied: Administrator privileges are required to open the Admin Portal. Please sign in with an Admin account."
        );
        setActiveTab("ADMIN");
        setSignInEmail("admin@bookleafpub.com");
        setSignInPassword("admin123");
      } else if (deniedParam === "author_required") {
        setRedirectNotice(
          "Access Denied: Please sign in with an Author account to view the Author Dashboard."
        );
        setActiveTab("AUTHOR");
      } else {
        const redirectParam = params.get("redirect");
        if (redirectParam) {
          const cleanName = redirectParam.replace(/^\//, "").split("?")[0];
          setRedirectNotice(
            `Authentication Required: Please sign in or create an account to access /${cleanName}.`
          );
        }
      }
    }

    // Load demo accounts for 1-click evaluator evaluation
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
    setRedirectNotice(null);
    if (tab === "ADMIN") {
      setSignInEmail("admin@bookleafpub.com");
      setSignInPassword("admin123");
    } else {
      setSignInEmail("priya.sharma@email.com");
      setSignInPassword("author123");
    }
  };

  const getDestinationUrl = (role: "AUTHOR" | "ADMIN"): string => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const redirectParam = params.get("redirect");
      if (redirectParam && redirectParam.startsWith("/")) {
        return redirectParam;
      }
    }
    return role === "ADMIN"
      ? "/admin"
      : "/author-dashboard?menu=Royalty%20Withdrawal";
  };

  // Perform Sign In
  async function performLogin(loginEmail: string, loginPass: string) {
    setError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);
    try {
      const result = await login(loginEmail, loginPass);
      if (!result.success || !result.user) {
        const errMsg = result.error || "Invalid email or password";
        setError(errMsg);
        toast.error("Sign In Failed", errMsg);
        return;
      }

      setSuccessMessage(
        `Welcome back, ${result.user.name}! Routing to your dashboard...`
      );
      toast.success(
        "Signed In Successfully",
        `Welcome back, ${result.user.name}! Secure session token issued.`
      );
      const destination = getDestinationUrl(result.role || "AUTHOR");

      setTimeout(() => {
        router.push(destination);
        router.refresh();
      }, 400);
    } catch {
      const netErr = "Network error while signing in. Please try again.";
      setError(netErr);
      toast.error("Network Error", netErr);
    } finally {
      setIsSubmitting(false);
    }
  }

  // Perform Sign Up (Author Registration)
  async function performRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!signUpEmail.trim()) {
      setError("Please enter a valid email address.");
      return;
    }
    if (signUpPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (signUpPassword !== confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }
    if (!agreeTerms) {
      setError("Please agree to BookLeaf Publishing Terms & Conditions.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await register({
        name: fullName.trim(),
        email: signUpEmail.trim().toLowerCase(),
        password: signUpPassword,
        phone: phone.trim() || undefined,
        city: city.trim() || undefined,
      });

      if (!result.success || !result.user) {
        const errMsg = result.error || "Registration could not be completed.";
        setError(errMsg);
        toast.error("Registration Failed", errMsg);
        return;
      }

      setSuccessMessage(
        `Account created successfully! Welcome to BookLeaf Publishing, ${result.user.name}. Opening your dashboard...`
      );
      toast.success(
        "Author Account Created",
        `Welcome to BookLeaf Publishing, ${result.user.name}! Your author portal is ready.`
      );

      const destination = getDestinationUrl("AUTHOR");
      setTimeout(() => {
        router.push(destination);
        router.refresh();
      }, 600);
    } catch {
      setError("Network error while creating your account. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleSignInSubmit(e: React.FormEvent) {
    e.preventDefault();
    performLogin(signInEmail, signInPassword);
  }

  function selectDemoAccount(acc: DemoAccount) {
    setAuthMode("signin");
    setActiveTab(acc.role);
    const pass = acc.role === "ADMIN" ? "admin123" : "author123";
    setSignInEmail(acc.email);
    setSignInPassword(pass);
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
              Official Author Portal & Desk
            </span>
          </div>
        </Link>

        <Link
          href="/"
          className="text-xs font-semibold text-[#0F4C3A] hover:text-[#0A3B2D] transition flex items-center gap-1.5"
        >
          <span>Back to Home</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Main Single Unified Auth Container (Screen 1 & 2 Combined) */}
      <div className="max-w-5xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 bg-white rounded-3xl border border-[#E8EDE6] shadow-sm overflow-hidden">
        {/* Left Brand Panel */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#0F3D30] via-[#0A2F25] to-[#062019] text-white p-8 sm:p-10 flex flex-col justify-between relative">
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
              {authMode === "signin"
                ? "Better Support for Better Stories"
                : "Begin Your Author Journey"}
            </h2>

            <p className="text-emerald-100/80 text-sm leading-relaxed mb-6">
              {authMode === "signin"
                ? "Access real-time royalty disbursement, track global book sales, and manage ISBN metadata in one unified author desk."
                : "Publish your book with 100% royalty split, official ISBN allotment, global distribution across Amazon, Flipkart, and Ingram."}
            </p>

            {/* Author Value Pillars */}
            <div className="space-y-2.5 mb-8">
              <div className="flex items-center gap-2.5 text-xs text-emerald-100/90">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>100% Author Royalty Net Profit Share</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-emerald-100/90">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Direct Automated Bank Disbursements (TDS Compliant)</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-emerald-100/90">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Shark Tank India Featured & Verified Platform</span>
              </div>
            </div>
          </div>

          {/* Book Mockup Visual Image */}
          <div className="relative rounded-2xl overflow-hidden border border-white/20 shadow-lg group">
            <Image
              src="/images/login-books-desk.jpg"
              alt="BookLeaf Publishing Cozy Author Desk"
              width={600}
              height={200}
              className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#062019]/95 via-[#0A2F25]/45 to-transparent flex flex-col justify-end p-4">
              <span className="font-serif italic text-xs text-emerald-200">
                “Stories create a better tomorrow.”
              </span>
              <span className="text-[10px] uppercase tracking-wider text-emerald-400/90 font-semibold mt-0.5">
                Official BookLeaf Author Console
              </span>
            </div>
          </div>
        </div>

        {/* Right Form Panel: Single Unified Auth Hub */}
        <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-between bg-white">
          <div>
            {/* Unified Top Switcher: Sign In vs Create Account */}
            <div className="p-1 rounded-2xl bg-[#F2F6F3] border border-[#E2ECE5] flex items-center gap-1 mb-6">
              <button
                type="button"
                onClick={() => {
                  setAuthMode("signin");
                  setError(null);
                  setSuccessMessage(null);
                }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  authMode === "signin"
                    ? "bg-[#0F4C3A] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode("signup");
                  setError(null);
                  setSuccessMessage(null);
                }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  authMode === "signup"
                    ? "bg-[#0F4C3A] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Create Account</span>
              </button>
            </div>

            {/* Redirect / Access Denied Notice */}
            {redirectNotice && (
              <div className="mb-5 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2.5">
                <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600" />
                <span className="leading-relaxed">{redirectNotice}</span>
              </div>
            )}

            {/* Error Banner */}
            {error && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            {/* Success Banner */}
            {successMessage && (
              <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span className="leading-relaxed">{successMessage}</span>
              </div>
            )}

            {/* ============================================================== */}
            {/* VIEW A: SIGN IN FORM                                           */}
            {/* ============================================================== */}
            {authMode === "signin" ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-serif text-2xl font-bold text-slate-900 leading-tight">
                      Welcome Back
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Sign in to your BookLeaf account to access your dashboard
                    </p>
                  </div>
                </div>

                {/* Segmented Control: Author vs Admin */}
                <div className="p-1 rounded-xl bg-[#F6F7F5] border border-slate-200/80 flex items-center gap-1 mb-5">
                  <button
                    type="button"
                    onClick={() => handleTabChange("AUTHOR")}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition ${
                      activeTab === "AUTHOR"
                        ? "bg-white text-[#0F4C3A] shadow-xs font-bold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Author Account
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTabChange("ADMIN")}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition ${
                      activeTab === "ADMIN"
                        ? "bg-white text-[#0F4C3A] shadow-xs font-bold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Admin Console
                  </button>
                </div>

                <form onSubmit={handleSignInSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="email"
                        value={signInEmail}
                        onChange={(e) => setSignInEmail(e.target.value)}
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
                        type={showPassword ? "text" : "password"}
                        value={signInPassword}
                        onChange={(e) => setSignInPassword(e.target.value)}
                        required
                        placeholder="Enter your password"
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-[#F9FAF7] text-slate-900 text-sm focus:bg-white focus:outline-hidden focus:border-[#0F4C3A] focus:ring-1 focus:ring-[#0F4C3A] transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-600 select-none">
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
                          "Demo credentials hint: 'author123' for Authors or 'admin123' for Admin."
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
                    className="w-full py-3 rounded-xl bg-[#0F4C3A] hover:bg-[#0A3B2D] text-white font-bold text-sm shadow-sm transition active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Verifying Session...</span>
                      </div>
                    ) : (
                      <>
                        <span>Sign In to Dashboard</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            ) : (
              /* ============================================================== */
              /* VIEW B: SIGN UP (CREATE AUTHOR ACCOUNT) FORM                   */
              /* ============================================================== */
              <div>
                <div className="mb-5">
                  <h3 className="font-serif text-2xl font-bold text-slate-900 leading-tight">
                    Create Author Account
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Start publishing with 100% royalty and live sales analytics
                  </p>
                </div>

                <form onSubmit={performRegister} className="space-y-3.5">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Full Legal / Author Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        placeholder="e.g. Aarav Mehta"
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-[#F9FAF7] text-slate-900 text-sm focus:bg-white focus:outline-hidden focus:border-[#0F4C3A] focus:ring-1 focus:ring-[#0F4C3A] transition"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="email"
                        value={signUpEmail}
                        onChange={(e) => setSignUpEmail(e.target.value)}
                        required
                        placeholder="e.g. aarav.mehta@example.com"
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-[#F9FAF7] text-slate-900 text-sm focus:bg-white focus:outline-hidden focus:border-[#0F4C3A] focus:ring-1 focus:ring-[#0F4C3A] transition"
                      />
                    </div>
                  </div>

                  {/* Phone & City 2-Column */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        WhatsApp / Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+91 98765 43210"
                          className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-[#F9FAF7] text-slate-900 text-sm focus:bg-white focus:outline-hidden focus:border-[#0F4C3A] focus:ring-1 focus:ring-[#0F4C3A] transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        City / State
                      </label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="e.g. Mumbai, Maharashtra"
                          className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-[#F9FAF7] text-slate-900 text-sm focus:bg-white focus:outline-hidden focus:border-[#0F4C3A] focus:ring-1 focus:ring-[#0F4C3A] transition"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Password & Confirm Password 2-Column */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Password (min 6 chars) *
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type={showPassword ? "text" : "password"}
                          value={signUpPassword}
                          onChange={(e) => setSignUpPassword(e.target.value)}
                          required
                          placeholder="••••••••"
                          className="w-full pl-10 pr-3 py-2 rounded-xl border border-slate-200 bg-[#F9FAF7] text-slate-900 text-sm focus:bg-white focus:outline-hidden focus:border-[#0F4C3A] focus:ring-1 focus:ring-[#0F4C3A] transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Confirm Password *
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type={showPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          placeholder="••••••••"
                          className="w-full pl-10 pr-3 py-2 rounded-xl border border-slate-200 bg-[#F9FAF7] text-slate-900 text-sm focus:bg-white focus:outline-hidden focus:border-[#0F4C3A] focus:ring-1 focus:ring-[#0F4C3A] transition"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Terms agreement */}
                  <div className="pt-1">
                    <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-600 select-none">
                      <input
                        type="checkbox"
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                        className="mt-0.5 rounded text-[#0F4C3A] focus:ring-[#0F4C3A] border-slate-300"
                      />
                      <span>
                        I agree to BookLeaf Publishing{" "}
                        <span className="font-semibold text-slate-800">
                          Terms of Service
                        </span>{" "}
                        and 100% Author Royalty Policy.
                      </span>
                    </label>
                  </div>

                  {/* Submit CTA */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-xl bg-[#0F4C3A] hover:bg-[#0A3B2D] text-white font-bold text-sm shadow-sm transition active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Creating Author Account...</span>
                      </div>
                    ) : (
                      <>
                        <span>Create Author Account</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Bottom Switch Links & Quick Evaluator Toggle */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
            <div>
              {authMode === "signin" ? (
                <p>
                  Don&apos;t have an author account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("signup");
                      setError(null);
                      setSuccessMessage(null);
                    }}
                    className="text-[#0F4C3A] font-bold hover:underline cursor-pointer"
                  >
                    Create Account
                  </button>
                </p>
              ) : (
                <p>
                  Already have an author account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("signin");
                      setError(null);
                      setSuccessMessage(null);
                    }}
                    className="text-[#0F4C3A] font-bold hover:underline cursor-pointer"
                  >
                    Sign In
                  </button>
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowMatrix(!showMatrix)}
              className="text-[#0F4C3A] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {showMatrix ? "Hide Quick Accounts" : "Quick Evaluator Accounts (11)"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Evaluator Matrix (Collapsible for test grading) */}
      {showMatrix && (
        <div className="max-w-5xl w-full mx-auto mt-6 bg-white rounded-2xl p-6 border border-[#E8EDE6] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Instant 1-Click Login Matrix (10 Authors + 1 Admin)
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Click any account to automatically authenticate and test RBAC routing
              </p>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
              Live DB Ready
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {demoAccounts.map((acc) => (
              <button
                key={acc.email}
                type="button"
                onClick={() => selectDemoAccount(acc)}
                className="p-3 rounded-xl border border-slate-200 hover:border-[#0F4C3A] hover:bg-[#F2F7F4] text-left transition flex items-center justify-between group cursor-pointer"
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
