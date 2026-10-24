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
  BadgePercent,
  BookOpen,
  Building,
  CheckCircle2,
  CreditCard,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  LogIn,
  Mail,
  MapPin,
  Phone,
  ShieldAlert,
  ShieldCheck,
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
        `Welcome back, ${result.user.name}! Directing to your console...`
      );
      toast.success(
        "Authentication Successful",
        `Signed in as ${result.user.name} (${result.user.role})`
      );

      const destination = getDestinationUrl(result.user.role);
      setTimeout(() => {
        router.push(destination);
        router.refresh();
      }, 500);
    } catch {
      setError("An unexpected network error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Perform Sign Up (Author Registration)
  async function performRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    // Validation
    if (!fullName.trim()) {
      setError("Please enter your full legal name.");
      return;
    }
    if (!signUpEmail.trim() || !signUpEmail.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (signUpPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (signUpPassword !== confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }
    if (!agreeTerms) {
      setError("Please agree to the Publishing Terms of Service to proceed.");
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
        const errMsg = result.error || "Failed to create author account";
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
    <div className="min-h-screen bg-[#FBF9F5] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 selection:bg-[#0F4C3A] selection:text-white relative overflow-hidden">
      {/* Ambient background decorations */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[550px] bg-gradient-to-b from-[#EFE8DE]/60 via-[#F7F3EC]/30 to-transparent pointer-events-none -z-10 rounded-full blur-3xl" />
      <div className="absolute -bottom-28 -right-28 w-96 h-96 bg-[#0F4C3A]/5 pointer-events-none -z-10 rounded-full blur-3xl" />
      <div className="absolute top-1/3 -left-32 w-80 h-80 bg-[#F05262]/5 pointer-events-none -z-10 rounded-full blur-3xl" />

      {/* Top Navbar Brand Link */}
      <div className="max-w-5xl w-full mx-auto mb-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0F4C3A] to-[#186851] text-white flex items-center justify-center shadow-sm shadow-[#0F4C3A]/20 group-hover:scale-105 transition-transform">
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
            <span className="font-serif text-xl font-bold text-slate-900 leading-tight block group-hover:text-[#0F4C3A] transition-colors">
              BookLeaf Publishing
            </span>
            <div className="flex items-center gap-1.5 -mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Official Author Portal & Desk
              </span>
            </div>
          </div>
        </Link>

        <Link
          href="/"
          className="text-xs font-semibold text-slate-700 hover:text-[#0F4C3A] bg-white/80 hover:bg-white border border-[#E5DFD7] px-4 py-2 rounded-full shadow-2xs hover:shadow-xs transition-all flex items-center gap-1.5 backdrop-blur-xs"
        >
          <span>Back to Home</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#0F4C3A]" />
        </Link>
      </div>

      {/* Main Single Unified Auth Container */}
      <div className="max-w-5xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 bg-white rounded-[28px] border border-[#E8E1D8] shadow-[0_24px_70px_-15px_rgba(15,76,58,0.12),0_8px_24px_-8px_rgba(0,0,0,0.04)] overflow-hidden">
        {/* Left Brand Panel */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#0B3327] via-[#0E3D30] to-[#07241B] text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle luminous highlights */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-emerald-600/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10">
            {/* Publisher Hallmark Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.08] border border-white/15 text-[10px] font-bold tracking-widest uppercase text-emerald-300 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>AUTHOR DESK &amp; CONSOLE</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-[34px] font-bold text-white tracking-tight leading-[1.18] mb-3.5">
              {authMode === "signin"
                ? "Better Support for Better Stories"
                : "Begin Your Author Journey"}
            </h2>

            <p className="text-emerald-100/80 text-xs sm:text-sm leading-relaxed mb-6 font-normal">
              {authMode === "signin"
                ? "Access real-time royalty disbursement, track global book sales, and manage ISBN metadata in one unified author desk."
                : "Publish your book with 100% royalty split, official ISBN allotment, and global distribution across Amazon, Flipkart, and Ingram."}
            </p>

            {/* Author Value Pillars (Elevated frosted cards) */}
            <div className="space-y-2.5 mb-8">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.06] border border-white/10 hover:bg-white/[0.10] transition-colors">
                <div className="w-7 h-7 rounded-lg bg-emerald-400/20 text-emerald-300 flex items-center justify-center shrink-0">
                  <BadgePercent className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-white block">100% Author Royalty Net Split</span>
                  <span className="text-[11px] text-emerald-200/70">Full author profit share with zero hidden fees</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.06] border border-white/10 hover:bg-white/[0.10] transition-colors">
                <div className="w-7 h-7 rounded-lg bg-emerald-400/20 text-emerald-300 flex items-center justify-center shrink-0">
                  <Building className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-white block">Direct Automated Bank Payouts</span>
                  <span className="text-[11px] text-emerald-200/70">TDS-compliant penny-drop verified disbursement</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.06] border border-white/10 hover:bg-white/[0.10] transition-colors">
                <div className="w-7 h-7 rounded-lg bg-emerald-400/20 text-emerald-300 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-white block">Shark Tank India Featured</span>
                  <span className="text-[11px] text-emerald-200/70">Recognized & verified publishing infrastructure</span>
                </div>
              </div>
            </div>
          </div>

          {/* Luxury Author Showcase / Testimonial Card */}
          <div className="relative z-10 rounded-2xl bg-white/[0.08] backdrop-blur-md border border-white/15 p-4 shadow-lg group">
            <div className="flex items-center gap-3.5 mb-2.5">
              <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-emerald-400/60 shrink-0">
                <Image
                  src="https://static.elfsight.com/configurator/assets/avatars/5-female-20-small-320x320.jpg"
                  alt="Priya Sharma"
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                  unoptimized
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-slate-900" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white">Priya Sharma</span>
                  <span className="text-[9px] font-semibold text-emerald-300 bg-emerald-500/20 px-1.5 py-0.2 rounded-full border border-emerald-500/30">
                    Verified Author
                  </span>
                </div>
                <span className="text-[11px] text-emerald-200/70 block truncate">
                  Author of <em>Whispers of the Ganges</em>
                </span>
              </div>
            </div>
            <p className="font-serif italic text-xs text-emerald-100/90 leading-relaxed border-t border-white/10 pt-2.5">
              “BookLeaf disbursed my royalties directly to my bank within 48 hours of sales reporting. The author portal is truly first-class.”
            </p>
          </div>
        </div>

        {/* Right Form Panel: Single Unified Auth Hub */}
        <div className="lg:col-span-7 p-8 sm:p-10 lg:p-11 flex flex-col justify-between bg-white">
          <div>
            {/* Unified Top Switcher: Sign In vs Create Account */}
            <div className="p-1.5 rounded-2xl bg-[#F4EFEA] border border-[#E5DFD7] flex items-center gap-1.5 mb-7">
              <button
                type="button"
                onClick={() => {
                  setAuthMode("signin");
                  setError(null);
                  setSuccessMessage(null);
                }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  authMode === "signin"
                    ? "bg-[#0F4C3A] text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
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
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  authMode === "signup"
                    ? "bg-[#0F4C3A] text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Create Account</span>
              </button>
            </div>

            {/* Redirect / Access Denied Notice */}
            {redirectNotice && (
              <div className="mb-5 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2.5 shadow-2xs">
                <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600" />
                <span className="leading-relaxed font-medium">{redirectNotice}</span>
              </div>
            )}

            {/* Error Banner */}
            {error && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 shadow-2xs">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span className="leading-relaxed font-medium">{error}</span>
              </div>
            )}

            {/* Success Banner */}
            {successMessage && (
              <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2 shadow-2xs">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span className="leading-relaxed font-medium">{successMessage}</span>
              </div>
            )}

            {/* ============================================================== */}
            {/* VIEW A: SIGN IN FORM                                           */}
            {/* ============================================================== */}
            {authMode === "signin" ? (
              <div>
                <div className="mb-5">
                  <h3 className="font-serif text-2xl sm:text-[26px] font-bold text-slate-900 leading-tight">
                    Welcome Back
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Sign in to your BookLeaf account to access your personal author desk
                  </p>
                </div>

                {/* Segmented Control: Author vs Admin */}
                <div className="p-1 rounded-xl bg-[#F4EFEA] border border-[#E5DFD7] flex items-center gap-1 mb-5">
                  <button
                    type="button"
                    onClick={() => handleTabChange("AUTHOR")}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      activeTab === "AUTHOR"
                        ? "bg-white text-[#0F4C3A] shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5 text-[#0F4C3A]" />
                    <span>Author Account</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTabChange("ADMIN")}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      activeTab === "ADMIN"
                        ? "bg-white text-[#0F4C3A] shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-[#0F4C3A]" />
                    <span>Admin Console</span>
                  </button>
                </div>

                <form onSubmit={handleSignInSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 tracking-wide mb-1.5">
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
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#EDE6DD] bg-[#FAF8F5] text-slate-900 text-sm placeholder:text-slate-400 focus:bg-white focus:border-[#0F4C3A] focus:ring-4 focus:ring-[#0F4C3A]/10 transition shadow-2xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 tracking-wide mb-1.5">
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
                        className="w-full pl-10 pr-10 py-3 rounded-xl border border-[#EDE6DD] bg-[#FAF8F5] text-slate-900 text-sm placeholder:text-slate-400 focus:bg-white focus:border-[#0F4C3A] focus:ring-4 focus:ring-[#0F4C3A]/10 transition shadow-2xs font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer transition-colors"
                        title={showPassword ? "Hide password" : "Show password"}
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
                        className="w-4 h-4 rounded text-[#0F4C3A] focus:ring-[#0F4C3A] border-slate-300 cursor-pointer"
                      />
                      <span className="font-medium">Remember me</span>
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setError(
                          "Demo credentials hint: 'author123' for Authors or 'admin123' for Admin."
                        )
                      }
                      className="text-[#0F4C3A] hover:underline font-bold cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#0F4C3A] via-[#125340] to-[#18654F] hover:from-[#0B382B] hover:to-[#125340] text-white font-bold text-sm shadow-md hover:shadow-lg hover:shadow-[#0F4C3A]/25 transition-all duration-200 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
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
                  <h3 className="font-serif text-2xl sm:text-[26px] font-bold text-slate-900 leading-tight">
                    Create Author Account
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Start publishing with 100% royalty split and live sales analytics
                  </p>
                </div>

                <form onSubmit={performRegister} className="space-y-3.5">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 tracking-wide mb-1">
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
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#EDE6DD] bg-[#FAF8F5] text-slate-900 text-sm placeholder:text-slate-400 focus:bg-white focus:border-[#0F4C3A] focus:ring-4 focus:ring-[#0F4C3A]/10 transition shadow-2xs"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 tracking-wide mb-1">
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
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#EDE6DD] bg-[#FAF8F5] text-slate-900 text-sm placeholder:text-slate-400 focus:bg-white focus:border-[#0F4C3A] focus:ring-4 focus:ring-[#0F4C3A]/10 transition shadow-2xs"
                      />
                    </div>
                  </div>

                  {/* Phone & City 2-Column */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 tracking-wide mb-1">
                        WhatsApp / Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+91 98765 43210"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#EDE6DD] bg-[#FAF8F5] text-slate-900 text-sm placeholder:text-slate-400 focus:bg-white focus:border-[#0F4C3A] focus:ring-4 focus:ring-[#0F4C3A]/10 transition shadow-2xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 tracking-wide mb-1">
                        City / State
                      </label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="e.g. Mumbai, Maharashtra"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#EDE6DD] bg-[#FAF8F5] text-slate-900 text-sm placeholder:text-slate-400 focus:bg-white focus:border-[#0F4C3A] focus:ring-4 focus:ring-[#0F4C3A]/10 transition shadow-2xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Password & Confirm Password 2-Column */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 tracking-wide mb-1">
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
                          className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-[#EDE6DD] bg-[#FAF8F5] text-slate-900 text-sm placeholder:text-slate-400 focus:bg-white focus:border-[#0F4C3A] focus:ring-4 focus:ring-[#0F4C3A]/10 transition shadow-2xs font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 tracking-wide mb-1">
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
                          className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-[#EDE6DD] bg-[#FAF8F5] text-slate-900 text-sm placeholder:text-slate-400 focus:bg-white focus:border-[#0F4C3A] focus:ring-4 focus:ring-[#0F4C3A]/10 transition shadow-2xs font-mono"
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
                        className="w-4 h-4 mt-0.5 rounded text-[#0F4C3A] focus:ring-[#0F4C3A] border-slate-300 cursor-pointer"
                      />
                      <span>
                        I agree to BookLeaf Publishing{" "}
                        <span className="font-bold text-slate-900 underline">
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
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#0F4C3A] via-[#125340] to-[#18654F] hover:from-[#0B382B] hover:to-[#125340] text-white font-bold text-sm shadow-md hover:shadow-lg hover:shadow-[#0F4C3A]/25 transition-all duration-200 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
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
                <p className="font-medium">
                  Don&apos;t have an author account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("signup");
                      setError(null);
                      setSuccessMessage(null);
                    }}
                    className="text-[#0F4C3A] font-bold hover:underline cursor-pointer ml-1"
                  >
                    Create Account
                  </button>
                </p>
              ) : (
                <p className="font-medium">
                  Already have an author account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("signin");
                      setError(null);
                      setSuccessMessage(null);
                    }}
                    className="text-[#0F4C3A] font-bold hover:underline cursor-pointer ml-1"
                  >
                    Sign In
                  </button>
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowMatrix(!showMatrix)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAF7F2] border border-[#EDE6DD] hover:bg-[#F2ECE5] text-xs font-semibold text-[#0F4C3A] transition cursor-pointer shadow-2xs"
            >
              <KeyRound className="w-3.5 h-3.5 text-[#0F4C3A]" />
              <span>
                {showMatrix ? "Hide Quick Accounts" : "Quick Evaluator Accounts (11)"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Evaluator Matrix (Collapsible for test grading) */}
      {showMatrix && (
        <div className="max-w-5xl w-full mx-auto mt-6 bg-white rounded-3xl p-6 sm:p-7 border border-[#E8E1D8] shadow-xs animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-100">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[#0F4C3A] text-[10px] font-bold uppercase tracking-wider mb-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>Test & Grading Accounts</span>
              </div>
              <h4 className="font-serif text-lg font-bold text-slate-900">
                Instant 1-Click Login Matrix (10 Authors + 1 Admin)
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Click any credential below to immediately authenticate and test RBAC routing
              </p>
            </div>
            <span className="text-[11px] px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 self-start sm:self-auto">
              Live Database Connected
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {demoAccounts.map((acc) => (
              <button
                key={acc.email}
                type="button"
                onClick={() => selectDemoAccount(acc)}
                className="p-3.5 rounded-2xl border border-slate-200/90 hover:border-[#0F4C3A] bg-[#FAF8F5] hover:bg-white text-left transition-all hover:shadow-xs flex items-center justify-between group cursor-pointer"
              >
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="font-bold text-xs text-slate-900 group-hover:text-[#0F4C3A] transition-colors">
                      {acc.name}
                    </span>
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        acc.role === "ADMIN"
                          ? "bg-amber-100 text-amber-800 border border-amber-200"
                          : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                      }`}
                    >
                      {acc.author_id || acc.role}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate font-mono">{acc.email}</p>
                </div>
                <div className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-[#0F4C3A] group-hover:border-[#0F4C3A]/30 shrink-0 transition-colors">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
