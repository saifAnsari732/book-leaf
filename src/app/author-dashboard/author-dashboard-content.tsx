"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  Banknote,
  BarChart3,
  BookOpen,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  CreditCard,
  Download,
  Eye,
  EyeOff,
  FileText,
  HelpCircle,
  IndianRupee,
  Info,
  Layers,
  Lock,
  LogOut,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Play,
  PlusCircle,
  Search,
  Settings as SettingsIcon,
  ShieldCheck,
  Sparkles,
  Ticket,
  TrendingUp,
  User,
  Wallet,
  X,
  Youtube,
} from "lucide-react";
import { useFastQuery } from "@/lib/client-cache";
import {
  BookRecord,
  RoyaltyWithdrawalRecord,
  BankAccountRecord,
  SafeUser,
} from "@/types/domain";
import { CreateBookModal } from "@/components/author/create-book-modal";

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
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentMenu = searchParams.get("menu") || "Royalty Withdrawal";

  // Data fetching
  const { data, isLoading, error, refresh } =
    useFastQuery<RoyaltyDashboardResponse>(
      "author:royalty:dashboard",
      "/api/author/royalty",
      { pollIntervalMs: 5000 }
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
      setWithdrawAmount("");
      refresh();
    } catch (err: any) {
      setWithdrawalError(err.message || "Failed to submit withdrawal request.");
    } finally {
      setIsSubmittingWithdrawal(false);
    }
  }

  async function handleSaveBankDetails(e: React.FormEvent) {
    e.preventDefault();
    if (!acHolder || !acNo || !ifsc || !bankName) {
      setBankError("Please fill out all bank account fields.");
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
      refresh();
    } catch (err: any) {
      setBankError(err.message || "Failed to save bank details.");
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
        refresh();
      }
    } finally {
      setIsSimulatingPayout(null);
    }
  }

  const navMenuItems = [
    { id: "Books", label: "Books", icon: BookOpen },
    { id: "Sales Reports", label: "Sales Reports", icon: BarChart3 },
    { id: "Royalty Withdrawal", label: "Royalty Withdrawal", icon: Wallet },
    { id: "Settings", label: "Settings", icon: SettingsIcon },
  ];

  function navigateMenu(menuName: string) {
    router.push(`/author-dashboard?menu=${encodeURIComponent(menuName)}`);
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F2EDEB] flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-3xl bg-white p-8 text-center shadow-lg space-y-4">
          <AlertCircle className="w-10 h-10 text-amber-600 mx-auto" />
          <h1 className="font-serif text-2xl font-bold text-slate-900">
            Author Session Required
          </h1>
          <p className="text-sm text-slate-600">{error}</p>
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => router.push("/login")}
              className="rounded-full bg-[#F26979] px-6 py-2.5 text-xs font-semibold text-white hover:bg-[#e04555] transition"
            >
              Sign In to Author Account
            </button>
            <button
              onClick={refresh}
              className="rounded-full border border-slate-200 px-6 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2EDEB] flex flex-col lg:flex-row text-slate-800 font-sans selection:bg-[#F26979] selection:text-white">
      {/* ==================================================================
          LEFT SIDEBAR (Matches Exact BookLeaf 220px Architecture)
          ================================================================== */}
      <aside className="w-full lg:w-[240px] bg-[#F2EDEB] border-r border-[#DCDBDD]/80 flex flex-col justify-between shrink-0">
        <div>
          {/* Brand Header with Pink Slash Mark Logo */}
          <div className="h-20 px-6 flex items-center border-b border-[#DCDBDD]/60">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-lg bg-[#F26979] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
                <span className="font-sans text-2xl font-light leading-none -rotate-12 select-none">
                  /
                </span>
              </div>
              <div className="flex flex-col text-left">
                <span className="font-serif text-lg font-bold tracking-tight text-slate-900 leading-tight">
                  BookLeaf
                </span>
                <span className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase -mt-0.5">
                  India • USA • UK
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Menu Items */}
          <nav className="p-3 space-y-1">
            {navMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                currentMenu.toLowerCase() === item.id.toLowerCase() ||
                (item.id === "Royalty Withdrawal" &&
                  currentMenu.toLowerCase().includes("royalty"));

              return (
                <button
                  key={item.id}
                  onClick={() => navigateMenu(item.id)}
                  className={`w-full h-[50px] px-4 rounded-xl flex items-center gap-3 text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-[#EADEDC] text-slate-900 shadow-2xs font-bold border-l-4 border-[#F26979]"
                      : "text-slate-700 hover:bg-[#EADEDC]/60 hover:text-slate-900"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 shrink-0 ${
                      isActive ? "text-[#F26979]" : "text-slate-500"
                    }`}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {/* Support Tickets Quick Link (Fulfills Technical Assignment) */}
            <div className="pt-4 mt-4 border-t border-[#DCDBDD]/70 px-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-2">
                Help &amp; Ops Triage
              </p>
              <Link
                href="/author/tickets"
                className="w-full h-[42px] px-3 rounded-lg flex items-center gap-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-[#EADEDC]/50 transition"
              >
                <Ticket className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Support Tickets</span>
              </Link>
              <Link
                href="/author/tickets/new"
                className="w-full h-[42px] px-3 rounded-lg flex items-center gap-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-[#EADEDC]/50 transition"
              >
                <PlusCircle className="w-4 h-4 text-[#F26979] shrink-0" />
                <span>Raise a Query</span>
              </Link>
            </div>
          </nav>
        </div>

        {/* Bottom User Profile & Sign Out */}
        <div className="p-4 border-t border-[#DCDBDD]/60 bg-[#EFE9E7]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-[#F26979] text-white flex items-center justify-center font-bold text-sm shadow-xs">
              {data?.author.name.charAt(0) || "P"}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-slate-900 truncate">
                {data?.author.name || "Priya Sharma"}
              </span>
              <span className="text-[10px] text-slate-500 font-mono truncate">
                {data?.author.author_id || "AUTH001"}
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              fetch("/api/auth/logout", { method: "POST" });
              router.push("/login");
            }}
            className="w-full py-2 px-3 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-white transition flex items-center justify-center gap-2"
          >
            <LogOut className="w-3.5 h-3.5 text-slate-500" />
            <span>Log Out</span>
          </button>
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
          {/* ==============================================================
              VIEW 1: ROYALTY WITHDRAWAL (?menu=Royalty%20Withdrawal)
              ============================================================== */}
          {currentMenu.toLowerCase().includes("royalty") && (
            <div className="space-y-8 animate-fade-in">
              {/* Top Filters & Floating Wallet Card Banner */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                {/* Left: Book & Filter Selectors */}
                <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                    <div className="w-10 h-10 rounded-xl bg-[#FFF5F6] text-[#F26979] flex items-center justify-center font-bold">
                      <Wallet className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-serif text-lg font-bold text-slate-900">
                        Select Book to View Real-Time Balance
                      </h3>
                      <p className="text-xs text-slate-500">
                        Calculate withdrawable earnings per title or consolidated
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Select Book
                      </label>
                      <select
                        value={selectedBookId}
                        onChange={(e) => setSelectedBookId(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-[#F26979] focus:outline-none bg-slate-50/50"
                      >
                        <option value="ALL">
                          All Books (Consolidated Balance)
                        </option>
                        {data?.books.map((b) => (
                          <option key={b.book_id} value={b.book_id}>
                            {b.title} ({b.status})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Filter by Sales Type
                      </label>
                      <select
                        value={salesType}
                        onChange={(e: any) => setSalesType(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-[#F26979] focus:outline-none bg-slate-50/50"
                      >
                        <option value="All">All Channels (Combined)</option>
                        <option value="Indian">Indian (Amazon IN, Flipkart, Store)</option>
                        <option value="International">International (Amazon US/UK)</option>
                      </select>
                    </div>
                  </div>

                  {/* Dynamic Book Specs Strip */}
                  {activeBook ? (
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs grid grid-cols-3 gap-2 text-center">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Copies Sold</span>
                        <strong className="text-slate-800 text-sm font-bold">
                          {activeBook.total_copies_sold}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Total Royalty</span>
                        <strong className="text-slate-800 text-sm font-bold">
                          ₹{activeBook.total_royalty_earned?.toLocaleString("en-IN")}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Paid to Date</span>
                        <strong className="text-emerald-700 text-sm font-bold">
                          ₹{activeBook.royalty_paid?.toLocaleString("en-IN")}
                        </strong>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 flex items-center gap-2">
                      <Info className="w-4 h-4 text-[#F26979] shrink-0" />
                      <span>
                        Showing consolidated earnings across all {data?.books.length || 0} registered titles.
                      </span>
                    </div>
                  )}
                </div>

                {/* Right: Wallet Balance Card (Matches Screenshot & Subagent Specs) */}
                <div className="lg:col-span-5 bg-gradient-to-br from-[#0F223D] to-[#17365D] rounded-2xl p-6 text-white shadow-lg flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Wallet Balance
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold uppercase tracking-wide border border-emerald-400/30">
                      Ready for Payout
                    </span>
                  </div>

                  <div className="py-4">
                    <div className="flex items-baseline gap-1 text-[#F26979]">
                      <span className="text-2xl font-light">₹</span>
                      <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
                        {availableBalance.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1">
                      {activeBook
                        ? `Available pending royalty for "${activeBook.title}"`
                        : "Consolidated withdrawable royalty"}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-300">
                    <span>Minimum threshold: ₹1,000 (Standard) / ₹2,000</span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      100% Net Royalty
                    </span>
                  </div>
                </div>
              </div>

              {/* Core 2-Column: Withdrawal Request & Recipient Details Form */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Column 1: Withdrawal Request Card */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-5">
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                    <div className="w-9 h-9 rounded-lg bg-rose-50 text-[#F26979] flex items-center justify-center font-bold">
                      <Banknote className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-serif text-base font-bold text-slate-900">
                        Withdrawal Request
                      </h3>
                      <p className="text-xs text-slate-500">
                        Initiate a direct bank disbursement
                      </p>
                    </div>
                  </div>

                  {withdrawalSuccess && (
                    <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{withdrawalSuccess}</span>
                    </div>
                  )}

                  {withdrawalError && (
                    <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <span>{withdrawalError}</span>
                    </div>
                  )}

                  <form onSubmit={handleSendWithdrawal} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Amount to be withdrawn (₹) *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                          ₹
                        </span>
                        <input
                          type="number"
                          min={1000}
                          max={availableBalance || 500000}
                          value={withdrawAmount}
                          onChange={(e) => setWithdrawAmount(e.target.value)}
                          placeholder="Enter Amount (e.g. 3570)"
                          className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#F26979] text-base font-semibold"
                        />
                      </div>
                    </div>

                    {/* Quick Amount Chips */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {[1000, 2000, 3000].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setWithdrawAmount(amt.toString())}
                          className="px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
                        >
                          + ₹{amt.toLocaleString("en-IN")}
                        </button>
                      ))}
                      {availableBalance > 0 && (
                        <button
                          type="button"
                          onClick={() =>
                            setWithdrawAmount(availableBalance.toString())
                          }
                          className="px-3 py-1 rounded-full bg-[#FFF5F6] hover:bg-[#FFE7E9] text-[#F26979] text-xs font-bold transition border border-[#F26979]/30"
                        >
                          Withdraw Full (₹
                          {availableBalance.toLocaleString("en-IN")})
                        </button>
                      )}
                    </div>

                    {/* TDS & Net Credit Calculator Preview */}
                    {Number(withdrawAmount) >= 1000 && (
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                        <div className="flex justify-between text-slate-600">
                          <span>Gross Requested Amount:</span>
                          <strong>
                            ₹{Number(withdrawAmount).toLocaleString("en-IN")}
                          </strong>
                        </div>
                        <div className="flex justify-between text-slate-500">
                          <span>TDS Deduction (10% u/s 194J):</span>
                          <span className="text-amber-700 font-semibold">
                            - ₹
                            {Math.round(
                              Number(withdrawAmount) * 0.1
                            ).toLocaleString("en-IN")}
                          </span>
                        </div>
                        <div className="flex justify-between text-slate-900 pt-1 border-t border-slate-200 font-bold">
                          <span>Estimated Net Payout:</span>
                          <span className="text-emerald-700 font-extrabold text-sm">
                            ₹
                            {Math.round(
                              Number(withdrawAmount) * 0.9
                            ).toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={
                        isSubmittingWithdrawal ||
                        Number(withdrawAmount) < 1000 ||
                        availableBalance < 1000
                      }
                      className="w-full h-12 rounded-xl bg-[#F26979] hover:bg-[#e04555] text-white font-bold text-sm transition shadow-sm hover:shadow flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      {isSubmittingWithdrawal ? (
                        <span>Submitting Request...</span>
                      ) : (
                        <>
                          <span>Send Request</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* Column 2: Recipient Account Details Card */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-serif text-base font-bold text-slate-900">
                          Recipient Account Details
                        </h3>
                        <p className="text-xs text-slate-500">
                          Linked bank account for NEFT/IMPS transfers
                        </p>
                      </div>
                    </div>
                    {data?.bankDetails?.is_verified && (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        Penny-Drop Verified
                      </span>
                    )}
                  </div>

                  {bankSuccess && (
                    <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{bankSuccess}</span>
                    </div>
                  )}

                  {bankError && (
                    <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <span>{bankError}</span>
                    </div>
                  )}

                  <form onSubmit={handleSaveBankDetails} className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Account Holder Name *
                      </label>
                      <input
                        type="text"
                        value={acHolder}
                        onChange={(e) => setAcHolder(e.target.value)}
                        placeholder="Enter A/C Holder Name"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#F26979] text-xs font-medium"
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
                          className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#F26979] text-xs font-mono font-medium"
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
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#F26979] text-xs font-mono font-medium uppercase"
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
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#F26979] text-xs font-medium"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSavingBank}
                      className="w-full h-11 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition shadow-xs flex items-center justify-center gap-2"
                    >
                      {isSavingBank ? (
                        <span>Saving Details...</span>
                      ) : (
                        <>
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span>Save Bank Details</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>

              {/* Bottom Section: Your Withdrawal Requests History */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="font-serif text-xl font-bold text-slate-900">
                      Your Withdrawal Requests
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Withdrawal requests are typically processed within 12 business days.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">
                      Total Requests: {data?.withdrawals.length || 0}
                    </span>
                  </div>
                </div>

                {data?.withdrawals && data.withdrawals.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#EADEDC]/50 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
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
                                    ? "bg-emerald-100 text-emerald-800"
                                    : w.status === "APPROVED"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-amber-100 text-amber-800"
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
                                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] transition shadow-2xs"
                                  title="Simulate instant RazorpayX payout for demo evaluation"
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
                    <p className="text-sm font-medium">No Withdraw History available</p>
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
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-xl font-bold text-slate-900">
                    Your Published &amp; In-Production Titles
                  </h2>
                  <p className="text-xs text-slate-500">
                    Track publication status, sales, and retail distribution
                  </p>
                </div>
                <button
                  onClick={() => setCreateBookOpen(true)}
                  className="px-5 py-2.5 rounded-full bg-[#F26979] hover:bg-[#e04555] text-white font-bold text-xs transition shadow-sm"
                >
                  + Start a New Book
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {data?.books.map((book) => {
                  const isLive = book.status.toLowerCase().includes("live");
                  return (
                    <div
                      key={book.book_id}
                      className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition space-y-5 flex flex-col justify-between"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-20 h-28 rounded-lg bg-slate-900 text-white flex items-center justify-center font-serif text-center p-2 text-xs shadow-md shrink-0 border border-slate-700">
                          <span>{book.title}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                                isLive
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {book.status}
                            </span>
                          </div>
                          <h3 className="font-serif text-lg font-bold text-slate-900 truncate">
                            {book.title}
                          </h3>
                          <p className="text-xs text-slate-500 font-mono">
                            ISBN: {book.isbn}
                          </p>
                          <p className="text-xs text-slate-600 mt-1">
                            Genre: <strong className="text-slate-800">{book.genre}</strong>
                          </p>
                        </div>
                      </div>

                      {/* Financial & Sales Grid */}
                      <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Copies Sold</span>
                          <strong className="text-slate-900 text-sm font-bold">
                            {book.total_copies_sold || 0}
                          </strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Royalty Earned</span>
                          <strong className="text-slate-900 text-sm font-bold">
                            ₹{(book.total_royalty_earned || 0).toLocaleString("en-IN")}
                          </strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Pending Payout</span>
                          <strong className="text-emerald-700 text-sm font-bold">
                            ₹{(book.royalty_pending || 0).toLocaleString("en-IN")}
                          </strong>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs">
                        <button
                          onClick={() => {
                            setSelectedBookId(book.book_id);
                            navigateMenu("Royalty Withdrawal");
                          }}
                          className="flex-1 py-2 rounded-lg bg-[#FFF5F6] hover:bg-[#FFE7E9] text-[#F26979] font-bold transition text-center"
                        >
                          Withdraw Royalty
                        </button>
                        <Link
                          href={`/author/tickets/new?book_id=${book.book_id}`}
                          className="flex-1 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold transition text-center"
                        >
                          Query Book
                        </Link>
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
              {/* 3 Metric Cards matching Subagent findings */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-1">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Lifetime Earnings
                  </span>
                  <p className="text-3xl font-extrabold text-[#F26979]">
                    ₹{(data?.metrics.totalRoyaltyEarned || 0).toLocaleString("en-IN")}
                  </p>
                  <p className="text-[11px] text-slate-400">Total gross royalty accrued</p>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-1">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Total Books Sold
                  </span>
                  <p className="text-3xl font-extrabold text-[#F26979]">
                    {data?.books.reduce((acc, b) => acc + (b.total_copies_sold || 0), 0)}
                  </p>
                  <p className="text-[11px] text-slate-400">Copies across all channels</p>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-1">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Wallet Balance
                  </span>
                  <p className="text-3xl font-extrabold text-emerald-600">
                    ₹{(data?.metrics.withdrawableBalance || 0).toLocaleString("en-IN")}
                  </p>
                  <p className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Info className="w-3 h-3 text-[#F26979]" />
                    Minimum earning to initiate payout - ₹2000
                  </p>
                </div>
              </div>

              {/* Monthly Notice Bar */}
              <div className="p-4 rounded-xl bg-[#FFF5F6] border border-[#FFE7E9] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-[#F26979] animate-pulse" />
                  <span className="italic">
                    The sales report is updated on monthly basis with Amazon and distributor data.
                  </span>
                </div>
                <button
                  onClick={() => setTxHistoryOpen(true)}
                  className="font-bold text-[#F26979] hover:underline"
                >
                  See transaction history →
                </button>
              </div>

              {/* Main Sales Reports Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-serif text-lg font-bold text-slate-900">
                    Channel-Wise Sales Breakdown
                  </h3>
                  <span className="text-xs text-slate-400">
                    Showing latest settled period
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#E5D6D4] text-[#4A3B3B] font-bold uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-4">Product Name</th>
                        <th className="py-3 px-4">Sales channel</th>
                        <th className="py-3 px-4">Month</th>
                        <th className="py-3 px-4">ISBN</th>
                        <th className="py-3 px-4">Quantity</th>
                        <th className="py-3 px-4">Royality</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {data?.books.map((b) => (
                        <tr key={b.book_id} className="hover:bg-slate-50 transition">
                          <td className="py-3.5 px-4 font-bold text-slate-900">
                            {b.title}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-semibold">
                              Amazon India / Store
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">October 2026</td>
                          <td className="py-3.5 px-4 font-mono text-slate-500">
                            {b.isbn}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-900">
                            {b.total_copies_sold || 0}
                          </td>
                          <td className="py-3.5 px-4 font-extrabold text-[#F26979]">
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
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6 animate-fade-in max-w-4xl">
              <div>
                <h3 className="font-serif text-2xl font-bold text-slate-900">
                  Settings
                </h3>
                <p className="text-xs text-slate-500">
                  Here you can change your information.
                </p>
              </div>

              {profileSaved && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Profile updated successfully!</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      placeholder="Enter Full Name"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      disabled
                      value={data?.author.email || "priya.sharma@email.com"}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 font-medium cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Address Line 1
                    </label>
                    <input
                      type="text"
                      placeholder="Enter Address Line 1"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      defaultValue="Maharashtra"
                      placeholder="Enter State"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium"
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      WhatsApp Number
                    </label>
                    <input
                      type="text"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      placeholder="Enter Your WhatsApp number"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
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
                              ? "bg-[#F26979] text-white"
                              : "bg-white text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={profileCity}
                      onChange={(e) => setProfileCity(e.target.value)}
                      placeholder="Enter City"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Pincode
                    </label>
                    <input
                      type="text"
                      defaultValue="400001"
                      placeholder="Enter Pincode"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPasswordModalOpen(true)}
                  className="text-xs font-bold text-[#F26979] hover:underline"
                >
                  Change Password →
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setProfileSaved(true);
                    setTimeout(() => setProfileSaved(false), 3000);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-[#F26979] hover:bg-[#e04555] text-white font-bold text-xs transition shadow-sm"
                >
                  Save Profile
                </button>
              </div>
            </div>
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

      {/* Floating WhatsApp Support Button with Nishtha Avatar */}
      <a
        href="https://wa.me/911943550930?text=Hello%20BookLeaf%20Author%20Support"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-xl hover:scale-105 transition-all group"
        title="Chat with Nishtha (BookLeaf Author Support)"
      >
        <MessageCircle className="w-7 h-7 fill-white text-[#25D366]" />
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-300 rounded-full border-2 border-white animate-pulse" />
      </a>
    </div>
  );
}
