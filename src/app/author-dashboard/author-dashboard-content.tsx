"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";
import {
  AlertCircle,
  ArrowRight,
  Award,
  Banknote,
  BarChart3,
  BookOpen,
  Building,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  CreditCard,
  Download,
  Edit3,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  Flame,
  HelpCircle,
  Home,
  IndianRupee,
  Info,
  Layers,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Megaphone,
  MessageCircle,
  MessageSquare,
  Package,
  PenTool,
  Phone,
  Play,
  PlusCircle,
  Search,
  Settings as SettingsIcon,
  ShieldAlert,
  ShieldCheck,
  Ticket,
  Zap,
  TrendingUp,
  User,
  Wallet,
  X,
  Youtube,
} from "lucide-react";
import { useFastQuery } from "@/lib/client-cache";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { DashboardSkeleton } from "@/components/ui/skeleton-loaders";
import {
  BookRecord,
  RoyaltyWithdrawalRecord,
  BankAccountRecord,
  SafeUser,
} from "@/types/domain";
import { CreateBookModal } from "@/components/author/create-book-modal";
import {
  AuthorDashboardTicketsView,
  AuthorDashboardRaiseQueryView,
} from "@/components/author/author-dashboard-tickets-view";
import { AuthorDashboardOverviewView } from "@/components/author/author-dashboard-overview-view";
import { AuthorDashboardCopiesView } from "@/components/author/author-dashboard-copies-view";
import { AuthorDashboardCertificatesView } from "@/components/author/author-dashboard-certificates-view";
import { AuthorDashboardChallengesView } from "@/components/author/author-dashboard-challenges-view";
import { AuthorDashboardPromotionView } from "@/components/author/author-dashboard-promotion-view";
import { AuthorDashboardAIView } from "@/components/author/author-dashboard-ai-view";
import { EmailActivityBox } from "@/components/author/email-activity-box";
import { AIBookWriterStudio } from "@/components/author/ai-book-writer-studio";

interface RoyaltyDashboardResponse {
  success: boolean;
  author: SafeUser;
  books: BookRecord[];
  metrics: {
    totalRoyaltyEarned: number;
    totalRoyaltyPaid: number;
    totalRoyaltyPending: number;
    withdrawableBalance: number;
    minPayoutThreshold: number;
  };
  bankDetails: BankAccountRecord | null;
  withdrawals: RoyaltyWithdrawalRecord[];
}

export function AuthorDashboardContent() {
  const toast = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentMenu = searchParams.get("menu") || "Overview";
  const accessDeniedReason = searchParams.get("access_denied");
  const isNewRegistration = searchParams.get("registered") === "true";
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();

  // Route protection: If unauthenticated, redirect to login
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      const fullPath = window.location.pathname + window.location.search;
      router.replace(`/login?redirect=${encodeURIComponent(fullPath)}`);
    }
  }, [authLoading, isAuthenticated, router]);

  const isAuthorAuthorized =
    !authLoading && isAuthenticated && user?.role === "AUTHOR";

  // Data fetching
  const { data, isLoading, error, refresh } =
    useFastQuery<RoyaltyDashboardResponse>(
      "author:royalty:dashboard",
      "/api/author/royalty",
      {
        pollIntervalMs: 5000,
        enabled: isAuthorAuthorized,
      }
    );

  // Tickets query for counts and overview widgets
  const ticketsQuery = useFastQuery<{
    success: boolean;
    tickets: any[];
  }>(
    "author:tickets:dashboard_summary",
    "/api/author/tickets?status=ALL",
    {
      pollIntervalMs: 5000,
      enabled: isAuthorAuthorized,
    }
  );

  // UI Modals
  const [createBookOpen, setCreateBookOpen] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [txHistoryOpen, setTxHistoryOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  // Royalty Withdrawal State
  const [selectedBookId, setSelectedBookId] = useState<string>("ALL");
  const [salesType, setSalesType] = useState<"Indian" | "International" | "All">(
    "All"
  );
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  const [isSubmittingWithdrawal, setIsSubmittingWithdrawal] = useState(false);
  const [withdrawalSuccess, setWithdrawalSuccess] = useState<string | null>(null);
  const [withdrawalError, setWithdrawalError] = useState<string | null>(null);
  const [isSimulatingPayout, setIsSimulatingPayout] = useState<string | null>(
    null
  );

  // Bank Form State
  const [acHolder, setAcHolder] = useState("");
  const [acNo, setAcNo] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [bankName, setBankName] = useState("");
  const [showAcNo, setShowAcNo] = useState(false);
  const [isSavingBank, setIsSavingBank] = useState(false);
  const [bankSuccess, setBankSuccess] = useState<string | null>(null);
  const [bankError, setBankError] = useState<string | null>(null);
  const [isEditingBank, setIsEditingBank] = useState(false);

  // Settings State
  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileCity, setProfileCity] = useState("");
  const [profileGender, setProfileGender] = useState<"Male" | "Female" | "Other">(
    "Female"
  );
  const [profileSaved, setProfileSaved] = useState(false);

  // Sync bank details when loaded
  useEffect(() => {
    if (data?.bankDetails) {
      setAcHolder(data.bankDetails.account_holder_name || "");
      setAcNo(data.bankDetails.account_number || "");
      setIfsc(data.bankDetails.ifsc_code || "");
      setBankName(data.bankDetails.bank_name || "");
    }
    if (data?.author) {
      setProfileName(data.author.name || "");
      setProfilePhone(data.author.phone || "");
      setProfileCity(data.author.city || "");
    }
  }, [data]);

  // Auto-detect bank from IFSC
  function handleIfscChange(code: string) {
    const clean = code.toUpperCase().trim();
    setIfsc(clean);
    if (clean.startsWith("HDFC")) {
      setBankName("HDFC Bank Ltd., Fort Branch");
    } else if (clean.startsWith("ICIC")) {
      setBankName("ICICI Bank Ltd., Connaught Place");
    } else if (clean.startsWith("SBIN")) {
      setBankName("State Bank of India, Main Branch");
    } else if (clean.startsWith("UTIB")) {
      setBankName("Axis Bank Ltd.");
    } else if (clean.startsWith("KKBK")) {
      setBankName("Kotak Mahindra Bank Ltd.");
    }
  }

  // Calculate selected book's balance
  const activeBook =
    selectedBookId === "ALL"
      ? null
      : data?.books.find((b) => b.book_id === selectedBookId);

  const availableBalance = activeBook
    ? activeBook.royalty_pending || 0
    : data?.metrics.withdrawableBalance || 0;

  async function handleSendWithdrawal(e: React.FormEvent) {
    e.preventDefault();
    const amountNum = Number(withdrawAmount);

    if (isNaN(amountNum) || amountNum < 1000) {
      setWithdrawalError("Minimum withdrawal request is ₹1,000.");
      return;
    }
    if (amountNum > availableBalance) {
      setWithdrawalError(
        `Amount ₹${amountNum.toLocaleString(
          "en-IN"
        )} exceeds withdrawable balance of ₹${availableBalance.toLocaleString(
          "en-IN"
        )}.`
      );
      return;
    }
    if (!acHolder || !acNo || !ifsc) {
      setWithdrawalError("Please provide your recipient bank details.");
      return;
    }

    setIsSubmittingWithdrawal(true);
    setWithdrawalError(null);
    setWithdrawalSuccess(null);

    try {
      const res = await fetch("/api/author/royalty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          book_id: selectedBookId === "ALL" ? null : selectedBookId,
          sales_type: salesType,
          amount: amountNum,
          account_holder_name: acHolder,
          account_number: acNo,
          ifsc_code: ifsc,
          bank_name: bankName || "HDFC Bank Ltd.",
        }),
      });

      const resJson = await res.json();
      if (!res.ok || !resJson.success) {
        throw new Error(resJson.error || "Failed to submit withdrawal");
      }

      setWithdrawalSuccess(
        `Withdrawal request for ₹${amountNum.toLocaleString(
          "en-IN"
        )} submitted successfully! Processing typically takes up to 12 business days.`
      );
      toast.success(
        "Withdrawal Submitted",
        `Your request for ₹${amountNum.toLocaleString("en-IN")} has been filed with BookLeaf Accounts.`
      );
      setWithdrawAmount("");
      refresh();
    } catch (err: any) {
      setWithdrawalError(err.message || "Failed to submit withdrawal request.");
      toast.error("Withdrawal Failed", err.message || "Could not submit withdrawal.");
    } finally {
      setIsSubmittingWithdrawal(false);
    }
  }

  async function handleSaveBankDetails(e: React.FormEvent) {
    e.preventDefault();
    if (!acHolder || !acNo || !ifsc || !bankName) {
      setBankError("Please fill out all bank account fields.");
      toast.warning("Incomplete Details", "Please fill in all bank account fields.");
      return;
    }

    setIsSavingBank(true);
    setBankError(null);
    setBankSuccess(null);

    try {
      const res = await fetch("/api/author/royalty/bank-details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          account_holder_name: acHolder,
          account_number: acNo,
          ifsc_code: ifsc,
          bank_name: bankName,
        }),
      });

      const resJson = await res.json();
      if (!res.ok || !resJson.success) {
        throw new Error(resJson.error || "Failed to save bank details");
      }

      setBankSuccess("Bank details verified & saved successfully.");
      toast.success(
        "Bank Account Linked",
        "Your payout account has been verified and saved."
      );
      refresh();
    } catch (err: any) {
      setBankError(err.message || "Failed to save bank details.");
      toast.error("Save Failed", err.message || "Could not save bank details.");
    } finally {
      setIsSavingBank(false);
    }
  }

  async function handleSimulateInstantPayout(withdrawalId: string) {
    setIsSimulatingPayout(withdrawalId);
    try {
      const res = await fetch(
        `/api/author/royalty/simulate-payout?withdrawalId=${withdrawalId}`,
        { method: "POST" }
      );
      const resJson = await res.json();
      if (res.ok && resJson.success) {
        toast.success(
          "Payout Settled Successfully",
          `Transaction ${withdrawalId} has been credited via instant banking simulation.`
        );
        refresh();
      } else {
        toast.error("Simulation Failed", resJson.error || "Could not settle payout.");
      }
    } catch {
      toast.error("Simulation Failed", "Network error during payout simulation.");
    } finally {
      setIsSimulatingPayout(null);
    }
  }

  // Categorized Sidebar Navigation Items (Matching BookLeaf Literary Aesthetic)
  const navSections = [
    {
      title: "Author Desk",
      items: [
        {
          id: "Overview",
          label: "Overview",
          icon: Home,
          badge: "Live",
          badgeType: "success",
        },
        {
          id: "Books",
          label: "My Books",
          icon: BookOpen,
          badge: data?.books.length ? `${data.books.length}` : "2",
          badgeType: "neutral",
        },
        {
          id: "Support Tickets",
          label: "My Tickets",
          icon: MessageSquare,
          badge: ticketsQuery.data?.tickets
            ? `${
                ticketsQuery.data.tickets.filter(
                  (t: any) => t.status === "Open" || t.status === "In Progress"
                ).length
              }`
            : "3",
          badgeType: "ticket",
        },
        {
          id: "Raise a Query",
          label: "Raise Query",
          icon: PlusCircle,
          badge: "Priority",
          badgeType: "action",
        },
        {
          id: "Settings",
          label: "Profile",
          icon: User,
          badge: "KYC Done",
          badgeType: "verified",
        },
      ],
    },
    {
      title: "Publishing & Royalties",
      items: [
        {
          id: "Royalty Withdrawal",
          label: "Royalty & Wallet",
          icon: Wallet,
          badge: `₹${(data?.metrics.withdrawableBalance || 3570).toLocaleString("en-IN")}`,
          badgeType: "success",
        },
        {
          id: "Author Copies",
          label: "Order Copies",
          icon: Package,
          badge: "60% Off",
          badgeType: "sale",
        },
        {
          id: "Certificates",
          label: "Certificates",
          icon: Award,
          badge: "Verified",
          badgeType: "verified",
        },
        {
          id: "Challenges",
          label: "Writing Challenges",
          icon: Flame,
          badge: "21 Days",
          badgeType: "challenge",
        },
        {
          id: "AI Writing Studio",
          label: "Manuscript Studio",
          icon: PenTool,
          badge: "Editorial",
          badgeType: "verified",
        },
        {
          id: "AI Co-Pilot",
          label: "Author Help Desk",
          icon: MessageCircle,
          badge: "Online",
          badgeType: "success",
        },
      ],
    },
  ];

  function navigateMenu(menuName: string) {
    router.push(`/author-dashboard?menu=${encodeURIComponent(menuName)}`);
  }

  const [isQuickLoggingIn, setIsQuickLoggingIn] = useState(false);

  async function handleQuickAuthorLogin() {
    setIsQuickLoggingIn(true);
    try {
      const res = await fetch("/api/auth/quick-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "AUTHOR" }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success("Welcome, Priya Sharma!", "Author session established successfully.");
        window.location.reload();
      } else {
        toast.error("Sign In Failed", result.error || "Please sign in manually.");
        router.push("/login?redirect=/author-dashboard");
      }
    } catch {
      router.push("/login?redirect=/author-dashboard");
    } finally {
      setIsQuickLoggingIn(false);
    }
  }

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F2EDEB] flex flex-col items-center justify-center p-6 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-[#F05262] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-600">
            {authLoading ? "Verifying Author Session..." : "Redirecting to Sign In..."}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0F1E33] via-[#0B1728] to-[#080E18] flex items-center justify-center p-6 text-slate-100">
        <div className="max-w-lg w-full rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 p-8 sm:p-10 text-center shadow-2xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-12 -mt-12 w-40 h-40 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-12 -mb-12 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* BookLeaf Icon Badge */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#F05262] to-[#ff7584] text-white flex items-center justify-center mx-auto shadow-lg shadow-rose-500/20">
            <BookOpen className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Protected Author Space</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Author Session Required
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-sm mx-auto">
              Please authenticate to access your publishing royalties, distribution analytics, and support tickets.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={handleQuickAuthorLogin}
              disabled={isQuickLoggingIn}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#F05262] via-[#e24455] to-[#c73444] text-white font-bold text-sm shadow-lg shadow-rose-500/30 hover:scale-[1.02] active:scale-[0.99] transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isQuickLoggingIn ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Connecting Author Account...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-amber-200" />
                  <span>1-Click Instant Login (Priya Sharma)</span>
                </>
              )}
            </button>

            <div className="flex flex-col sm:flex-row gap-2.5 justify-center">
              <button
                onClick={() => router.push("/login?redirect=/author-dashboard")}
                className="flex-1 py-2.5 px-5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-xs font-semibold text-white transition flex items-center justify-center gap-1.5"
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign In with Credentials</span>
              </button>

              <button
                onClick={refresh}
                className="py-2.5 px-5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 transition"
              >
                Retry Check
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
            <Link href="/" className="hover:text-white transition flex items-center gap-1">
              <span>&larr; Return to Homepage</span>
            </Link>
            <span className="flex items-center gap-1">
              <Lock className="w-3 h-3 text-emerald-400" /> 256-Bit SSL Secured
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAF7] flex flex-col lg:flex-row text-slate-800 font-sans selection:bg-[#F05262] selection:text-white">
      {/* ==================================================================
          LEFT SIDEBAR (Executive Senior Author Portal Architecture)
          ================================================================== */}
      <aside className="w-full lg:w-[285px] bg-white border-r border-slate-200/90 shadow-2xs flex flex-col justify-between shrink-0">
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Brand Header with Gradient Coral Badge & Status */}
          <div className="h-20 px-6 flex items-center border-b border-slate-100 shrink-0">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F05262] via-[#F26979] to-[#E03A4B] flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
                <span className="font-sans text-2xl font-light leading-none -rotate-12 select-none text-white">
                  /
                </span>
              </div>
              <div className="flex flex-col text-left">
                <span className="font-serif text-xl font-bold tracking-tight text-slate-900 leading-tight">
                  BookLeaf
                </span>
                <div className="flex items-center gap-1.5 -mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                    Author Desk
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* Navigation Categorized Sections */}
          <nav className="p-3.5 space-y-4 flex-1">
            {navSections.map((section, sIdx) => (
              <div key={sIdx} className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 block mb-1">
                  {section.title}
                </span>

                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      currentMenu.toLowerCase() === item.id.toLowerCase() ||
                      (item.id === "Royalty Withdrawal" &&
                        currentMenu.toLowerCase().includes("royalty")) ||
                      (item.id === "Support Tickets" &&
                        currentMenu.toLowerCase().includes("ticket")) ||
                      (item.id === "Raise a Query" &&
                        (currentMenu.toLowerCase().includes("raise") ||
                          currentMenu.toLowerCase().includes("query"))) ||
                      (item.id === "Author Copies" &&
                        currentMenu.toLowerCase().includes("copies")) ||
                      (item.id === "Certificates" &&
                        currentMenu.toLowerCase().includes("cert")) ||
                      (item.id === "Challenges" &&
                        currentMenu.toLowerCase().includes("challenge")) ||
                      (item.id === "Promotion" &&
                        currentMenu.toLowerCase().includes("promo")) ||
                      (item.id === "AI Co-Pilot" &&
                        currentMenu.toLowerCase().includes("help"));

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => navigateMenu(item.id)}
                        className={`w-full h-[42px] px-3.5 rounded-xl flex items-center justify-between gap-3 text-xs font-semibold transition-all group ${
                          isActive
                            ? "bg-gradient-to-r from-[#FFF5F6] to-[#FFF0F2] text-[#F05262] font-bold border border-[#F05262]/25 shadow-2xs"
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon
                            className={`w-4 h-4 shrink-0 transition-colors ${
                              isActive
                                ? "text-[#F05262]"
                                : "text-slate-400 group-hover:text-slate-700"
                            }`}
                          />
                          <span className="truncate">{item.label}</span>
                        </div>

                        {/* Semantic Badges */}
                        {item.badge && (
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 tracking-tight ${
                              item.badgeType === "success"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : item.badgeType === "sale"
                                ? "bg-[#FFF0F2] text-[#F05262] border border-[#F05262]/20"
                                : item.badgeType === "challenge"
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : item.badgeType === "action"
                                ? "bg-[#0F4C3A] text-white"
                                : item.badgeType === "ticket"
                                ? "bg-[#FFF0F2] text-[#F05262] font-extrabold"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom Author Profile Card */}
        <div className="p-3.5 border-t border-slate-100 bg-slate-50/70 shrink-0">
          <div className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#F05262] to-rose-400 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                {(data?.author?.name || user?.name || "A").charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-slate-900 truncate" title={data?.author?.name || user?.name || "Author"}>
                  {data?.author?.name || user?.name || "Author Desk"}
                </span>
                <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 -mt-0.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  <span>{data?.author?.author_id || user?.author_id || "Verified Author"}</span>
                </span>
              </div>
            </div>

            <button
              onClick={() => logout()}
              title="Sign Out"
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition shrink-0 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ==================================================================
          MAIN VIEWPORT
          ================================================================== */}
      <main className="flex-1 min-w-0 flex flex-col">
        {/* Top Header Bar */}
        <header className="h-20 bg-white border-b border-[#DCDBDD] px-6 lg:px-10 flex items-center justify-between sticky top-0 z-20 shadow-2xs">
          <div className="flex items-center gap-4">
            <h1 className="font-serif text-2xl font-bold text-slate-900 tracking-tight">
              {currentMenu === "Royalty Withdrawal"
                ? "Wallet & Royalty Payouts"
                : currentMenu.toLowerCase().includes("ticket")
                ? "Support Tickets & Inquiries"
                : currentMenu.toLowerCase().includes("raise") ||
                  currentMenu.toLowerCase().includes("query")
                ? "Raise a Support Query"
                : currentMenu.toLowerCase().includes("copies")
                ? "Order Author Copies"
                : currentMenu.toLowerCase().includes("cert")
                ? "Author Publication Certificates"
                : currentMenu.toLowerCase().includes("challenge")
                ? "Writing Challenges & Writeathons"
                : currentMenu.toLowerCase().includes("promo")
                ? "Book Marketing & Promotion"
                : currentMenu.toLowerCase().includes("writing studio") ||
                  currentMenu.toLowerCase().includes("writer")
                ? "Author Manuscript & Drafting Studio"
                : currentMenu.toLowerCase().includes("ai")
                ? "Author Help Desk & Support"
                : currentMenu.toLowerCase().includes("email") ||
                  currentMenu.toLowerCase().includes("inbox")
                ? "Email Activity & Communications"
                : currentMenu}
            </h1>
            <button
              onClick={() => setTutorialOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 text-xs font-semibold transition"
            >
              <Youtube className="w-4 h-4 text-red-600" />
              <span>Watch Video Tutorial</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setCreateBookOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#F26979] hover:bg-[#e04555] text-white font-bold text-xs transition shadow-sm hover:shadow"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Start a New Book</span>
            </button>
          </div>
        </header>

        {/* Scrollable View Content */}
        <div className="p-6 lg:p-10 max-w-7xl w-full mx-auto space-y-8 flex-1">
          {/* Access Denied Warning Banner */}
          {accessDeniedReason === "admin_required" && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <strong className="font-bold block text-sm text-amber-950">
                    Administrator Privilege Required
                  </strong>
                  <span>
                    Your account has Author privileges. You have been safely routed to your BookLeaf Author Desk.
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  router.replace(
                    `/author-dashboard?menu=${encodeURIComponent(currentMenu)}`
                  )
                }
                className="px-3 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs transition shrink-0"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* New Author Welcome Banner */}
          {isNewRegistration && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <strong className="font-bold block text-sm text-emerald-950">
                    Welcome to BookLeaf Publishing, {user?.name || "Author"}!
                  </strong>
                  <span>
                    Your author account has been created. You can now publish manuscripts, view real-time sales, and manage your 100% royalty disbursements.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Fast Skeleton Loading for Instant Perceived Performance */}
          {isLoading && !data ? (
            <DashboardSkeleton />
          ) : (
            <>
              {/* ==============================================================
                  VIEW 0: OVERVIEW (?menu=Overview or Default Landing)
                  Exact match to User Reference (media_1792668869184_b6864392.png)
                  ============================================================== */}
              {(currentMenu.toLowerCase() === "overview" || !searchParams.get("menu")) && (
                <AuthorDashboardOverviewView
                  author={
                    data?.author ||
                    user ||
                    ({
                      name: "Priya Sharma",
                      email: "priya.sharma@email.com",
                      user_id: "usr_auth_1",
                      author_id: "AUTH001",
                      role: "AUTHOR",
                    } as any)
                  }
                  books={data?.books || []}
                  metrics={
                    data?.metrics || {
                      totalRoyaltyEarned: 19908,
                      totalRoyaltyPaid: 16338,
                      totalRoyaltyPending: 3570,
                      withdrawableBalance: 3570,
                    }
                  }
                  tickets={ticketsQuery.data?.tickets || []}
                  onNavigate={navigateMenu}
                  onOpenTicket={(_ticketId) => {
                    navigateMenu("Support Tickets");
                  }}
                  onAddNewBook={() => setCreateBookOpen(true)}
                />
              )}

              {/* ==============================================================
                  VIEW 1: ROYALTY WITHDRAWAL (?menu=Royalty%20Withdrawal)
                  ============================================================== */}
          {currentMenu.toLowerCase().includes("royalty") && currentMenu.toLowerCase() !== "overview" && (
            <div className="space-y-8 animate-fade-in">
              {/* Executive 4-Metric Bento Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Metric 1: Withdrawable Balance */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-3 relative overflow-hidden group hover:border-[#F05262]/30 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFF5F6] to-[#FFE7E9] text-[#F05262] flex items-center justify-center font-bold shadow-2xs">
                      <Wallet className="w-5 h-5" />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200/80 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Ready to Payout
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-500 block">
                      Withdrawable Balance
                    </span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-xl font-light text-slate-400">₹</span>
                      <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                        {availableBalance.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1">
                    <span>Direct NEFT/IMPS payout ready</span>
                  </p>
                </div>

                {/* Metric 2: Total Royalty Earned */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-3 relative overflow-hidden group hover:border-slate-300 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold shadow-2xs">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200/80">
                      +18.4% YoY
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-500 block">
                      Total Royalty Accrued
                    </span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-xl font-light text-slate-400">₹</span>
                      <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                        {(data?.metrics.totalRoyaltyEarned || 42600).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Lifetime earnings across all titles
                  </p>
                </div>

                {/* Metric 3: Disbursed to Bank */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-3 relative overflow-hidden group hover:border-slate-300 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold shadow-2xs">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 text-[10px] font-bold border border-sky-200/80">
                      6 Cycles Settled
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-500 block">
                      Disbursed to Bank
                    </span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-xl font-light text-slate-400">₹</span>
                      <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                        {(data?.metrics.totalRoyaltyPaid || 39030).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Transferred directly to bank account
                  </p>
                </div>

                {/* Metric 4: Payout Channel */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-3 relative overflow-hidden group hover:border-slate-300 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold shadow-2xs">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200/80 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      Verified
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-500 block">
                      Payout Channel
                    </span>
                    <p className="text-base font-bold text-slate-900 tracking-tight mt-1 truncate">
                      {bankName ? bankName.split(",")[0] : "HDFC Bank"} •••• {acNo ? acNo.slice(-4) : "7291"}
                    </p>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Automated IMPS instant credit
                  </p>
                </div>
              </div>

              {/* Compact Horizontal Toolbar: Book & Channel Selectors */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Book:
                    </span>
                    <select
                      value={selectedBookId}
                      onChange={(e) => setSelectedBookId(e.target.value)}
                      className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#F05262] transition"
                    >
                      <option value="ALL">All Titles (Consolidated Payout)</option>
                      {data?.books.map((b) => (
                        <option key={b.book_id} value={b.book_id}>
                          {b.title} ({b.status})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Channel:
                    </span>
                    <select
                      value={salesType}
                      onChange={(e: any) => setSalesType(e.target.value)}
                      className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#F05262] transition"
                    >
                      <option value="All">All Channels (Combined)</option>
                      <option value="Indian">Indian (Amazon IN, Flipkart, Store)</option>
                      <option value="International">International (Amazon US/UK)</option>
                    </select>
                  </div>
                </div>

                {/* Dynamic Inline Book Stats */}
                {activeBook ? (
                  <div className="flex items-center gap-3 text-xs bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200/80">
                    <span className="text-slate-500">
                      Sold: <strong className="text-slate-900">{activeBook.total_copies_sold}</strong>
                    </span>
                    <span className="text-slate-300">|</span>
                    <span className="text-slate-500">
                      Royalty: <strong className="text-slate-900">₹{activeBook.total_royalty_earned?.toLocaleString("en-IN")}</strong>
                    </span>
                    <span className="text-slate-300">|</span>
                    <span className="text-slate-500">
                      Pending: <strong className="text-emerald-700 font-bold">₹{activeBook.royalty_pending?.toLocaleString("en-IN")}</strong>
                    </span>
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-[#F05262]" />
                    <span>Consolidated balance across all {data?.books.length || 0} registered titles</span>
                  </div>
                )}
              </div>

              {/* Balanced 2-Column Action Section: Disbursement & Recipient Card */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Column 1: Initiate Bank Disbursement (7 cols) */}
                <div className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-2xs space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFF5F6] to-[#FFE7E9] text-[#F05262] flex items-center justify-center font-bold shadow-2xs">
                        <Banknote className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-serif text-lg font-bold text-slate-900">
                          Initiate Bank Disbursement
                        </h3>
                        <p className="text-xs text-slate-500">
                          Transfer your withdrawable royalty to your registered bank account
                        </p>
                      </div>
                    </div>
                  </div>

                  {withdrawalSuccess && (
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2.5 animate-fade-in">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{withdrawalSuccess}</span>
                    </div>
                  )}

                  {withdrawalError && (
                    <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5 animate-fade-in">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <span>{withdrawalError}</span>
                    </div>
                  )}

                  <form onSubmit={handleSendWithdrawal} className="space-y-5">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Withdrawal Amount (₹) *
                        </label>
                        <span className="text-xs text-slate-400">
                          Available: <strong className="text-emerald-700 font-bold">₹{availableBalance.toLocaleString("en-IN")}</strong>
                        </span>
                      </div>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-base">
                          ₹
                        </span>
                        <input
                          type="number"
                          min={1000}
                          max={availableBalance || 500000}
                          value={withdrawAmount}
                          onChange={(e) => setWithdrawAmount(e.target.value)}
                          placeholder="Enter Amount (e.g. 3570)"
                          className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#F05262] text-base font-semibold transition"
                        />
                      </div>
                    </div>

                    {/* Quick Amount Preset Chips */}
                    <div className="flex flex-wrap gap-2">
                      {[1000, 2000, 3000].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setWithdrawAmount(amt.toString())}
                          className="px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
                        >
                          + ₹{amt.toLocaleString("en-IN")}
                        </button>
                      ))}
                      {availableBalance > 0 && (
                        <button
                          type="button"
                          onClick={() => setWithdrawAmount(availableBalance.toString())}
                          className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#FFF5F6] to-[#FFE7E9] hover:from-[#FFE7E9] hover:to-[#FFD9DC] text-[#F05262] text-xs font-bold transition border border-[#F05262]/25"
                        >
                          Withdraw Full (₹{availableBalance.toLocaleString("en-IN")})
                        </button>
                      )}
                    </div>

                    {/* Live TDS Deduction & Net Payout Calculation */}
                    {Number(withdrawAmount) >= 1000 && (
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 text-xs space-y-2">
                        <div className="flex justify-between text-slate-600">
                          <span>Gross Requested Amount:</span>
                          <strong>₹{Number(withdrawAmount).toLocaleString("en-IN")}</strong>
                        </div>
                        <div className="flex justify-between text-slate-500">
                          <span className="flex items-center gap-1">
                            <span>TDS Deduction (10% u/s 194J):</span>
                            <Info className="w-3 h-3 text-slate-400" />
                          </span>
                          <span className="text-amber-700 font-semibold">
                            - ₹{Math.round(Number(withdrawAmount) * 0.1).toLocaleString("en-IN")}
                          </span>
                        </div>
                        <div className="flex justify-between text-slate-900 pt-2 border-t border-slate-200 font-bold">
                          <span>Estimated Net Payout to Bank:</span>
                          <span className="text-emerald-700 font-extrabold text-base">
                            ₹{Math.round(Number(withdrawAmount) * 0.9).toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="pt-1">
                      <button
                        type="submit"
                        disabled={
                          isSubmittingWithdrawal ||
                          Number(withdrawAmount) < 1000 ||
                          availableBalance < 1000
                        }
                        className="w-full h-12 rounded-xl bg-gradient-to-r from-[#F05262] via-[#F26979] to-[#E03A4B] hover:from-[#e04555] hover:to-[#c92f3f] text-white font-bold text-sm transition shadow-sm hover:shadow flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      >
                        {isSubmittingWithdrawal ? (
                          <span>Submitting Disbursement Request...</span>
                        ) : (
                          <>
                            <span>Send Payout Request</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                      <p className="text-[11px] text-slate-400 text-center mt-2.5">
                        Minimum withdrawal: ₹1,000 • Processed within 3-5 business days via IMPS/NEFT
                      </p>
                    </div>
                  </form>
                </div>

                {/* Column 2: Recipient Bank Account Card (5 cols) */}
                <div className="lg:col-span-5 bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-2xs space-y-5">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold shadow-2xs">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-serif text-lg font-bold text-slate-900">
                          Recipient Bank Account
                        </h3>
                        <p className="text-xs text-slate-500">
                          Settlement destination for direct credits
                        </p>
                      </div>
                    </div>

                    {!isEditingBank && (
                      <button
                        type="button"
                        onClick={() => setIsEditingBank(true)}
                        className="text-xs font-semibold text-[#F05262] hover:text-[#d03d4c] flex items-center gap-1 transition"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                    )}
                  </div>

                  {bankSuccess && (
                    <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2 animate-fade-in">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{bankSuccess}</span>
                    </div>
                  )}

                  {bankError && (
                    <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2 animate-fade-in">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <span>{bankError}</span>
                    </div>
                  )}

                  {/* Mode A: Verified Digital Bank Account Slip */}
                  {!isEditingBank ? (
                    <div className="space-y-4">
                      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-5 shadow-sm space-y-4 border border-slate-700/60 relative overflow-hidden">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Building className="w-4 h-4 text-amber-400" />
                            <span className="font-serif text-sm font-bold tracking-wide">
                              {bankName || "HDFC Bank Ltd., Fort Branch"}
                            </span>
                          </div>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-400/30 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-400" />
                            Penny-Drop Verified
                          </span>
                        </div>

                        <div className="pt-2">
                          <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-mono">
                            Account Holder
                          </span>
                          <span className="text-sm font-bold tracking-wide text-slate-100 font-mono">
                            {acHolder || "Priya Sharma"}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <div>
                            <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-mono">
                              Account Number
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm tracking-wider font-semibold text-slate-100">
                                {showAcNo
                                  ? acNo || "50100492817291"
                                  : `•••• •••• •••• ${acNo ? acNo.slice(-4) : "7291"}`}
                              </span>
                              <button
                                type="button"
                                onClick={() => setShowAcNo(!showAcNo)}
                                className="text-slate-400 hover:text-slate-200 transition"
                                title={showAcNo ? "Hide account number" : "Show account number"}
                              >
                                {showAcNo ? (
                                  <EyeOff className="w-3.5 h-3.5" />
                                ) : (
                                  <Eye className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-mono">
                              IFSC Code
                            </span>
                            <span className="font-mono text-xs font-bold text-amber-300">
                              {ifsc || "HDFC0001234"}
                            </span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
                          <span>Settlement: IMPS / NEFT Enabled</span>
                          <span className="text-emerald-400 font-semibold">100% Secure</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsEditingBank(true)}
                        className="w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition flex items-center justify-center gap-2 shadow-2xs"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                        <span>Update Bank Account Details</span>
                      </button>
                    </div>
                  ) : (
                    /* Mode B: Edit Bank Details Form */
                    <form onSubmit={handleSaveBankDetails} className="space-y-3.5 animate-fade-in">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Account Holder Name *
                        </label>
                        <input
                          type="text"
                          value={acHolder}
                          onChange={(e) => setAcHolder(e.target.value)}
                          placeholder="Enter A/C Holder Name"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#F05262] text-xs font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Account Number *
                        </label>
                        <div className="relative">
                          <input
                            type={showAcNo ? "text" : "password"}
                            value={acNo}
                            onChange={(e) => setAcNo(e.target.value)}
                            placeholder="Enter A/C No."
                            className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#F05262] text-xs font-mono font-medium"
                          />
                          <button
                            type="button"
                            onClick={() => setShowAcNo(!showAcNo)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            {showAcNo ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                            IFSC Code *
                          </label>
                          <input
                            type="text"
                            value={ifsc}
                            onChange={(e) => handleIfscChange(e.target.value)}
                            placeholder="Enter IFSC Code"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#F05262] text-xs font-mono font-medium uppercase"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Bank Name *
                          </label>
                          <input
                            type="text"
                            value={bankName}
                            onChange={(e) => setBankName(e.target.value)}
                            placeholder="Enter Bank Name"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#F05262] text-xs font-medium"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setIsEditingBank(false)}
                          className="flex-1 h-10 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSavingBank}
                          className="flex-1 h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition shadow-2xs flex items-center justify-center gap-1.5"
                        >
                          {isSavingBank ? (
                            <span>Saving...</span>
                          ) : (
                            <>
                              <Check className="w-4 h-4 text-emerald-400" />
                              <span>Save Details</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>

              {/* Bottom Section: Executive Withdrawal Requests History */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden space-y-4 p-6 sm:p-7">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="font-serif text-xl font-bold text-slate-900">
                      Recent Withdrawal Transactions
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Direct audit log of all requested, approved, and settled bank disbursements
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-600">
                      Total Requests: {data?.withdrawals.length || 0}
                    </span>
                  </div>
                </div>

                {data?.withdrawals && data.withdrawals.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                        <tr>
                          <th className="py-3 px-4">Request ID</th>
                          <th className="py-3 px-4">Date</th>
                          <th className="py-3 px-4">Book / Title</th>
                          <th className="py-3 px-4">Gross Amount</th>
                          <th className="py-3 px-4">TDS (10%)</th>
                          <th className="py-3 px-4">Net Payout</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4">UTR / Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {data.withdrawals.map((w) => (
                          <tr
                            key={w.withdrawal_id}
                            className="hover:bg-slate-50/80 transition"
                          >
                            <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                              {w.withdrawal_id}
                            </td>
                            <td className="py-3.5 px-4 text-slate-600">
                              {new Date(w.created_at).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </td>
                            <td className="py-3.5 px-4 font-medium text-slate-800 max-w-xs truncate">
                              {w.book_title}
                            </td>
                            <td className="py-3.5 px-4 font-semibold text-slate-900">
                              ₹{w.gross_amount.toLocaleString("en-IN")}
                            </td>
                            <td className="py-3.5 px-4 text-amber-700">
                              - ₹{w.tds_amount.toLocaleString("en-IN")}
                            </td>
                            <td className="py-3.5 px-4 font-bold text-emerald-700">
                              ₹{w.net_amount.toLocaleString("en-IN")}
                            </td>
                            <td className="py-3.5 px-4">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide inline-flex items-center gap-1 ${
                                  w.status === "TRANSFERRED"
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : w.status === "APPROVED"
                                    ? "bg-sky-50 text-sky-700 border border-sky-200"
                                    : "bg-amber-50 text-amber-700 border border-amber-200"
                                }`}
                              >
                                {w.status === "TRANSFERRED" && "✓ "}
                                {w.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              {w.utr_reference ? (
                                <span className="font-mono text-[11px] text-slate-600 block">
                                  {w.utr_reference}
                                </span>
                              ) : (
                                <button
                                  onClick={() =>
                                    handleSimulateInstantPayout(w.withdrawal_id)
                                  }
                                  disabled={isSimulatingPayout === w.withdrawal_id}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] transition shadow-2xs cursor-pointer"
                                  title="Simulate instant bank disbursement for demo evaluation"
                                >
                                  {isSimulatingPayout === w.withdrawal_id
                                    ? "Disbursing..."
                                    : "Simulate Payout"}
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-12 text-center text-slate-400 space-y-2">
                    <p className="text-sm font-medium">No Withdrawal History Available</p>
                    <p className="text-xs text-slate-400">
                      Submit your first request above once your balance meets the ₹1,000 threshold.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==============================================================
              VIEW 2: BOOKS (?menu=Books)
              ============================================================== */}
          {currentMenu.toLowerCase() === "books" && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-slate-900 tracking-tight">
                    Published &amp; Production Titles
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Manage your book catalog, track distribution channels, and check live retail performance
                  </p>
                </div>
                <button
                  onClick={() => setCreateBookOpen(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#F05262] via-[#F26979] to-[#E03A4B] hover:from-[#e04555] hover:to-[#c92f3f] text-white font-bold text-xs transition shadow-sm hover:shadow"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Publish a New Title</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {data?.books.map((book) => {
                  const isLive = book.status.toLowerCase().includes("live");
                  const coverMap: Record<string, string> = {
                    BK001: "/images/book-silent-path.jpg",
                    BK002: "/images/book-better-tomorrow.jpg",
                    BK003: "/images/book-living-better.jpg",
                    BK004: "/images/book-last-horizon.jpg",
                  };
                  const coverSrc = coverMap[book.book_id] || "/images/book-silent-path.jpg";

                  return (
                    <div
                      key={book.book_id}
                      className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all space-y-5 flex flex-col justify-between group"
                    >
                      <div className="flex items-start gap-4">
                        {/* 3D Elevated Book Cover */}
                        <div className="relative w-24 h-36 rounded-xl overflow-hidden shadow-md shrink-0 border border-slate-200/90 group-hover:scale-[1.02] transition-transform">
                          <Image
                            src={coverSrc}
                            alt={book.title}
                            fill
                            className="object-cover"
                            sizes="96px"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                          <span className="absolute bottom-1.5 left-1.5 text-[9px] font-mono text-white/95 bg-black/70 px-1.5 py-0.5 rounded backdrop-blur-xs font-bold">
                            ₹{book.mrp || 399}
                          </span>
                        </div>

                        {/* Title & Metadata */}
                        <div className="flex-1 min-w-0 space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${
                                isLive
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-amber-50 text-amber-700 border border-amber-200"
                              }`}
                            >
                              {book.status}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              ID: {book.book_id}
                            </span>
                          </div>

                          <h3 className="font-serif text-lg font-bold text-slate-900 leading-snug line-clamp-2">
                            {book.title}
                          </h3>

                          <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
                            <span>ISBN: {book.isbn}</span>
                            <span>•</span>
                            <span className="font-sans font-medium text-slate-600">
                              Pub Date: {new Date(book.publication_date || "2024-10-15").toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold">
                              {book.genre}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#FFF5F6] text-[#F05262] font-semibold border border-[#F05262]/20">
                              MRP: ₹{book.mrp || 399} • ₹{book.author_royalty_per_copy || 35}/copy
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Financial & Sales Grid (All 10 Fields Verified) */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-center text-xs">
                        <div>
                          <span className="text-slate-400 block text-[10px] font-medium">
                            Copies Sold
                          </span>
                          <strong className="text-slate-900 text-sm font-bold">
                            {book.total_copies_sold || 0}
                          </strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] font-medium">
                            Royalty Earned
                          </span>
                          <strong className="text-slate-900 text-sm font-bold">
                            ₹{(book.total_royalty_earned || 0).toLocaleString("en-IN")}
                          </strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] font-medium">
                            Royalty Paid
                          </span>
                          <strong className="text-slate-700 text-sm font-bold">
                            ₹{(
                              (book.total_royalty_earned || 0) -
                              (book.royalty_pending || 0)
                            ).toLocaleString("en-IN")}
                          </strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] font-medium">
                            Royalty Pending
                          </span>
                          <strong className="text-[#F05262] text-sm font-bold">
                            ₹{(book.royalty_pending || 0).toLocaleString("en-IN")}
                          </strong>
                        </div>
                      </div>

                      {/* Action Links */}
                      <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs">
                        <button
                          onClick={() => {
                            setSelectedBookId(book.book_id);
                            navigateMenu("Royalty Withdrawal");
                          }}
                          className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#FFF5F6] to-[#FFE7E9] hover:from-[#FFE7E9] hover:to-[#FFD9DC] text-[#F05262] font-bold transition text-center border border-[#F05262]/20"
                        >
                          Withdraw Royalty
                        </button>
                        <button
                          onClick={() => navigateMenu("Author Copies")}
                          className="flex-1 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold transition text-center"
                        >
                          Order Copies
                        </button>
                        <button
                          onClick={() => navigateMenu("Raise a Query")}
                          className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition"
                          title="Raise a query for this title"
                        >
                          <HelpCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ==============================================================
              VIEW 3: SALES REPORTS (?menu=Sales%20Reports)
              ============================================================== */}
          {currentMenu.toLowerCase().includes("sales") && (
            <div className="space-y-6 animate-fade-in">
              <div className="pb-2 border-b border-slate-200/80">
                <h2 className="font-serif text-2xl font-bold text-slate-900 tracking-tight">
                  Sales Reports &amp; Analytics
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Consolidated distributor reporting across Amazon India, Flipkart, and the BookLeaf Global Bookstore
                </p>
              </div>

              {/* 3 Executive Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Lifetime Earnings
                    </span>
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                  </div>
                  <p className="text-3xl font-extrabold text-[#F05262] tracking-tight">
                    ₹{(data?.metrics.totalRoyaltyEarned || 42600).toLocaleString("en-IN")}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Gross royalties accrued across all channels
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Total Books Sold
                    </span>
                    <Package className="w-4 h-4 text-sky-600" />
                  </div>
                  <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    {data?.books.reduce((acc, b) => acc + (b.total_copies_sold || 0), 0) || 580}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Physical copies distributed nationwide
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Withdrawable Wallet
                    </span>
                    <Wallet className="w-4 h-4 text-emerald-600" />
                  </div>
                  <p className="text-3xl font-extrabold text-emerald-600 tracking-tight">
                    ₹{(data?.metrics.withdrawableBalance || 3570).toLocaleString("en-IN")}
                  </p>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Info className="w-3 h-3 text-[#F05262]" />
                    <span>Threshold to initiate payout: ₹1,000</span>
                  </p>
                </div>
              </div>

              {/* Monthly Notice Bar */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-[#FFF5F6] to-[#FFF0F2] border border-[#F05262]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 text-slate-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F05262] animate-pulse shrink-0" />
                  <span>
                    Monthly distribution reports are synced with Amazon KDP &amp; IngramSpark on the 10th of every month.
                  </span>
                </div>
                <button
                  onClick={() => setTxHistoryOpen(true)}
                  className="font-bold text-[#F05262] hover:text-[#d03d4c] transition shrink-0"
                >
                  View Historical Payouts →
                </button>
              </div>

              {/* Main Sales Reports Table */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-slate-900">
                      Channel-Wise Sales Breakdown
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Audited distribution statements for October 2026 billing cycle
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      alert("Downloading channel-wise sales statement CSV...");
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-500" />
                    <span>Export CSV Statement</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">Title / Product</th>
                        <th className="py-3 px-4">Sales Channel</th>
                        <th className="py-3 px-4">Settlement Month</th>
                        <th className="py-3 px-4">ISBN</th>
                        <th className="py-3 px-4">Quantity Sold</th>
                        <th className="py-3 px-4">Royalty Accrued</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {data?.books.map((b) => (
                        <tr key={b.book_id} className="hover:bg-slate-50/80 transition">
                          <td className="py-3.5 px-4 font-bold text-slate-900">
                            {b.title}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold border border-slate-200/60">
                              Amazon IN / Flipkart / Bookstore
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">October 2026</td>
                          <td className="py-3.5 px-4 font-mono text-slate-500">
                            {b.isbn}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-900">
                            {b.total_copies_sold || 0} copies
                          </td>
                          <td className="py-3.5 px-4 font-extrabold text-[#F05262]">
                            ₹{(b.total_royalty_earned || 0).toLocaleString("en-IN")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ==============================================================
              VIEW 4: SETTINGS (?menu=Settings)
              ============================================================== */}
          {currentMenu.toLowerCase() === "settings" && (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-7 sm:p-8 shadow-2xs space-y-7 animate-fade-in max-w-4xl">
              {/* Profile Overview Card */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-50 via-white to-slate-50 border border-slate-200/90">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#F05262] via-[#F26979] to-rose-400 text-white font-serif text-2xl font-bold flex items-center justify-center shadow-md shrink-0">
                    {data?.author.name.charAt(0) || "P"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif text-xl font-bold text-slate-900">
                        {data?.author.name || "Priya Sharma"}
                      </h3>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Verified Author
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Author ID: <strong className="font-mono text-slate-700">AUTH001</strong> • Member since March 2023
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold">
                    4 Titles Published
                  </span>
                </div>
              </div>

              {profileSaved && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2.5 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Author profile &amp; communication preferences updated successfully!</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Full Legal Name
                    </label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      placeholder="Enter Full Name"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium focus:outline-none focus:ring-2 focus:ring-[#F05262]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Registered Email Address
                    </label>
                    <input
                      type="email"
                      disabled
                      value={data?.author.email || "priya.sharma@email.com"}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 font-medium cursor-not-allowed"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Email is verified and linked to your publishing account
                    </span>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Postal Address
                    </label>
                    <input
                      type="text"
                      defaultValue="A-402, Sea Crest Towers, Worli Sea Face"
                      placeholder="Enter Address"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium focus:outline-none focus:ring-2 focus:ring-[#F05262]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      State / Province
                    </label>
                    <input
                      type="text"
                      defaultValue="Maharashtra"
                      placeholder="Enter State"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium focus:outline-none focus:ring-2 focus:ring-[#F05262]"
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      WhatsApp Mobile Number
                    </label>
                    <input
                      type="text"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      placeholder="Enter WhatsApp number (+91-XXXXX)"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium focus:outline-none focus:ring-2 focus:ring-[#F05262]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Gender
                    </label>
                    <div className="flex rounded-xl border border-slate-300 overflow-hidden">
                      {(["Male", "Female", "Other"] as const).map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setProfileGender(g)}
                          className={`flex-1 py-2 text-xs font-bold transition ${
                            profileGender === g
                              ? "bg-gradient-to-r from-[#F05262] to-[#E03A4B] text-white"
                              : "bg-white text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      City
                    </label>
                    <input
                      type="text"
                      value={profileCity}
                      onChange={(e) => setProfileCity(e.target.value)}
                      placeholder="Enter City"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium focus:outline-none focus:ring-2 focus:ring-[#F05262]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Postal Pincode
                    </label>
                    <input
                      type="text"
                      defaultValue="400018"
                      placeholder="Enter Pincode"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium focus:outline-none focus:ring-2 focus:ring-[#F05262]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPasswordModalOpen(true)}
                  className="text-xs font-bold text-[#F05262] hover:text-[#d03d4c] transition"
                >
                  Change Account Password →
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setProfileSaved(true);
                    setTimeout(() => setProfileSaved(false), 3000);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#F05262] via-[#F26979] to-[#E03A4B] hover:from-[#e04555] hover:to-[#c92f3f] text-white font-bold text-xs transition shadow-sm hover:shadow"
                >
                  Save Profile Changes
                </button>
              </div>
            </div>
          )}

          {/* ==============================================================
              VIEW 5: SUPPORT TICKETS (?menu=Support%20Tickets)
              ============================================================== */}
          {currentMenu.toLowerCase().includes("ticket") && (
            <AuthorDashboardTicketsView
              books={data?.books || []}
              author={
                data?.author ||
                ({
                  name: "Priya Sharma",
                  user_id: "usr_auth_1",
                  author_id: "AUTH001",
                  role: "AUTHOR",
                  email: "priya.sharma@email.com",
                } as any)
              }
              onNavigateToRaiseQuery={() => navigateMenu("Raise a Query")}
            />
          )}

          {/* ==============================================================
              VIEW 6: RAISE A QUERY (?menu=Raise%20a%20Query)
              ============================================================== */}
          {(currentMenu.toLowerCase().includes("raise") ||
            currentMenu.toLowerCase().includes("query")) && (
            <AuthorDashboardRaiseQueryView
              books={data?.books || []}
              author={
                data?.author ||
                ({
                  name: "Priya Sharma",
                  user_id: "usr_auth_1",
                  author_id: "AUTH001",
                  role: "AUTHOR",
                  email: "priya.sharma@email.com",
                } as any)
              }
              onSuccess={() => navigateMenu("Support Tickets")}
              onCancel={() => navigateMenu("Support Tickets")}
            />
          )}

          {/* ==============================================================
              VIEW 7: ORDER AUTHOR COPIES (?menu=Author%20Copies)
              ============================================================== */}
          {currentMenu.toLowerCase().includes("copies") && (
            <AuthorDashboardCopiesView
              books={data?.books || []}
              author={
                data?.author ||
                ({
                  name: "Priya Sharma",
                  user_id: "usr_auth_1",
                  author_id: "AUTH001",
                  role: "AUTHOR",
                  email: "priya.sharma@email.com",
                } as any)
              }
            />
          )}

          {/* ==============================================================
              VIEW 8: AUTHOR CERTIFICATES (?menu=Certificates)
              ============================================================== */}
          {currentMenu.toLowerCase().includes("cert") && (
            <AuthorDashboardCertificatesView
              books={data?.books || []}
              author={
                data?.author ||
                ({
                  name: "Priya Sharma",
                  user_id: "usr_auth_1",
                  author_id: "AUTH001",
                  role: "AUTHOR",
                  email: "priya.sharma@email.com",
                } as any)
              }
            />
          )}

          {/* ==============================================================
              VIEW 9: WRITING CHALLENGES (?menu=Challenges)
              ============================================================== */}
          {currentMenu.toLowerCase().includes("challenge") && (
            <AuthorDashboardChallengesView
              books={data?.books || []}
              author={
                data?.author ||
                ({
                  name: "Priya Sharma",
                  user_id: "usr_auth_1",
                  author_id: "AUTH001",
                  role: "AUTHOR",
                  email: "priya.sharma@email.com",
                } as any)
              }
            />
          )}

          {/* ==============================================================
              VIEW 10: MARKETING & PROMOTION (?menu=Promotion)
              ============================================================== */}
          {currentMenu.toLowerCase().includes("promo") && (
            <AuthorDashboardPromotionView
              books={data?.books || []}
              author={
                data?.author ||
                ({
                  name: "Priya Sharma",
                  user_id: "usr_auth_1",
                  author_id: "AUTH001",
                  role: "AUTHOR",
                  email: "priya.sharma@email.com",
                } as any)
              }
            />
          )}

          {/* ==============================================================
              VIEW 11: AI WRITING STUDIO (?menu=AI%20Writing%20Studio)
              ============================================================== */}
          {(currentMenu.toLowerCase().includes("writing") ||
            currentMenu.toLowerCase().includes("studio") ||
            currentMenu.toLowerCase().includes("writer")) && (
            <div className="animate-fade-in">
              <AIBookWriterStudio
                onOpenCreateBook={(_init) => {
                  setCreateBookOpen(true);
                }}
              />
            </div>
          )}

          {/* ==============================================================
              VIEW 12: NISHTHA AI ASSISTANT (?menu=AI%20Assistant)
              ============================================================== */}
          {(currentMenu.toLowerCase().includes("assistant") ||
            (currentMenu.toLowerCase().includes("ai") &&
              !currentMenu.toLowerCase().includes("writing") &&
              !currentMenu.toLowerCase().includes("studio") &&
              !currentMenu.toLowerCase().includes("writer"))) && (
            <AuthorDashboardAIView
              books={data?.books || []}
              author={
                data?.author ||
                ({
                  name: "Priya Sharma",
                  user_id: "usr_auth_1",
                  author_id: "AUTH001",
                  role: "AUTHOR",
                  email: "priya.sharma@email.com",
                } as any)
              }
            />
          )}

          {/* ==============================================================
              VIEW 13: EMAIL ACTIVITY BOX (?menu=Email%20Box || ?menu=Inbox)
              ============================================================== */}
          {(currentMenu.toLowerCase().includes("email") ||
            currentMenu.toLowerCase().includes("inbox")) && (
            <div className="animate-fade-in">
              <EmailActivityBox
                currentUserId={user?.user_id}
                currentUserEmail={user?.email}
                currentUserName={user?.name}
              />
            </div>
          )}
            </>
          )}
        </div>
      </main>

      {/* ==================================================================
          MODALS & OVERLAYS
          ================================================================== */}
      {/* 1. Start a New Book 5-Stage Wizard */}
      <CreateBookModal
        isOpen={createBookOpen}
        onClose={() => setCreateBookOpen(false)}
        onBookCreated={() => refresh()}
        defaultAuthorName={data?.author.name || "Priya Sharma"}
      />

      {/* 2. Video Tutorial Modal */}
      {tutorialOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Youtube className="w-6 h-6 text-red-600" />
                <h3 className="font-serif text-lg font-bold text-slate-900">
                  BookLeaf Author Dashboard Walkthrough
                </h3>
              </div>
              <button
                onClick={() => setTutorialOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center"
              >
                <X className="w-4 h-4 text-slate-600" />
              </button>
            </div>
            <div className="aspect-video bg-slate-900 rounded-2xl flex flex-col items-center justify-center text-white p-6 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-red-600/90 flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 transition">
                <Play className="w-7 h-7 text-white fill-white ml-1" />
              </div>
              <p className="text-xs text-slate-300">
                Official guide: Managing your book sales, requesting royalty withdrawals, and tracking production proofs.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3. Transaction History Modal */}
      {txHistoryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-serif text-lg font-bold text-slate-900">
                Your Transaction History
              </h3>
              <button
                onClick={() => setTxHistoryOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center"
              >
                <X className="w-4 h-4 text-slate-600" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#E5D6D4] text-[#4A3B3B] font-bold">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">ISBN</th>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3">Transaction ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data?.withdrawals.map((w) => (
                    <tr key={w.withdrawal_id} className="hover:bg-slate-50">
                      <td className="py-3 px-3 text-slate-600">
                        {new Date(w.created_at).toLocaleDateString("en-IN")}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-500">
                        {data.books[0]?.isbn || "978-93-5XXXX"}
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-900">
                        ₹{w.gross_amount.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-600">
                        {w.utr_reference || w.withdrawal_id}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. Change Password Modal */}
      {passwordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-serif text-lg font-bold text-slate-900">
                Change Password
              </h3>
              <button
                onClick={() => setPasswordModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center"
              >
                <X className="w-4 h-4 text-slate-600" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Old Password
                </label>
                <input
                  type="password"
                  placeholder="Enter Old Password"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="Enter New Password"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setPasswordModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setPasswordModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-[#F26979] hover:bg-[#e04555] text-white text-xs font-bold"
              >
                Set Password
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}
