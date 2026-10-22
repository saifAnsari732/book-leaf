"use client";

import React, { useState } from "react";
import { PortalShell } from "@/components/layout/portal-shell";
import { useFastQuery } from "@/lib/client-cache";
import { SafeUser } from "@/types/domain";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  CreditCard,
  ShieldCheck,
  Bell,
  Lock,
  Save,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Key,
  Smartphone,
  ExternalLink,
} from "lucide-react";

export default function AuthorProfilePage() {
  const sessionQuery = useFastQuery<{ success: boolean; user: SafeUser }>(
    "auth:session",
    "/api/auth/session"
  );

  const currentUser = sessionQuery.data?.user || {
    user_id: "auth-default",
    name: "Priya Sharma",
    email: "priya.sharma@example.com",
    role: "AUTHOR" as const,
    author_id: "AUTH001",
    phone: "+91 98765 43210",
    city: "Mumbai, Maharashtra",
    joined_date: "2023-04-12",
  };

  // Form states
  const [activeTab, setActiveTab] = useState<
    "profile" | "banking" | "notifications" | "security"
  >("profile");

  const [name, setName] = useState(currentUser.name);
  const [phone, setPhone] = useState(currentUser.phone || "+91 98765 43210");
  const [city, setCity] = useState(currentUser.city || "Mumbai, Maharashtra");
  const [bio, setBio] = useState(
    "Fiction and contemporary poetry author. Passionate about stories that bridge tradition and modernity."
  );

  // Bank Info States (Simulated secure storage)
  const [accountHolder, setAccountHolder] = useState("Priya Sharma");
  const [bankName, setBankName] = useState("HDFC Bank Ltd.");
  const [accountNumber, setAccountNumber] = useState("50100234918234");
  const [ifscCode, setIfscCode] = useState("HDFC0000128");
  const [panNumber, setPanNumber] = useState("ABCPS1234F");

  // Notifications
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifyWhatsapp, setNotifyWhatsapp] = useState(true);
  const [notifyRoyalty, setNotifyRoyalty] = useState(true);
  const [notifyNewsletter, setNotifyNewsletter] = useState(false);

  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, city }),
      });
      if (res.ok) {
        setSaveSuccess(true);
        sessionQuery.refresh();
        setTimeout(() => setSaveSuccess(false), 3500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <PortalShell user={currentUser}>
      <div className="space-y-8 max-w-5xl mx-auto">
        {/* ==================================================================
            PAGE HEADER & AUTHOR IDENTIFICATION CARD
            ================================================================== */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#0F4C3A] to-[#10B981] flex items-center justify-center text-white text-2xl font-serif font-bold shadow-md">
              {currentUser.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold font-serif text-slate-900">
                  {currentUser.name}
                </h1>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Verified Author
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Author ID:{" "}
                <span className="font-mono font-semibold text-slate-700">
                  {currentUser.author_id || "AUTH001"}
                </span>{" "}
                • Member since {currentUser.joined_date || "April 2023"}
              </p>
              <p className="text-xs text-slate-600 mt-1 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {currentUser.email}
              </p>
            </div>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-4 sm:pt-0 border-slate-100">
            <span className="text-xs text-slate-400">Royalty Status</span>
            <span className="text-sm font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200 mt-1">
              Active • Quarterly Transfer
            </span>
          </div>
        </div>

        {/* Feedback Alert */}
        {saveSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-4 flex items-center gap-3 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span className="text-sm font-medium">
              Profile details updated successfully!
            </span>
          </div>
        )}

        {/* ==================================================================
            NAVIGATION TABS
            ================================================================== */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-1 overflow-x-auto scrollbar-none">
          {[
            { id: "profile", label: "Author Profile", icon: User },
            { id: "banking", label: "Royalty Payout & Bank", icon: Building2 },
            { id: "notifications", label: "Notifications", icon: Bell },
            { id: "security", label: "Security & Login", icon: Lock },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition whitespace-nowrap ${
                  active
                    ? "bg-[#0F4C3A] text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ==================================================================
            TAB CONTENT: AUTHOR PROFILE
            ================================================================== */}
        {activeTab === "profile" && (
          <form
            onSubmit={handleSave}
            className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6"
          >
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Personal Information
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                These details appear on your publishing agreements and author profile.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Full Legal Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-sm p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F4C3A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Registered Email (Fixed)
                </label>
                <input
                  type="email"
                  disabled
                  value={currentUser.email}
                  className="w-full text-sm p-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Contact Phone Number
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-sm p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F4C3A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  City & State
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full text-sm p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F4C3A]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Author Biography Blurb (for Book Back Covers & Amazon Author Page)
              </label>
              <textarea
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full text-sm p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F4C3A] leading-relaxed"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl bg-[#0F4C3A] hover:bg-[#0c3c2e] text-white text-sm font-medium transition shadow-sm flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? "Saving Changes..." : "Save Changes"}</span>
              </button>
            </div>
          </form>
        )}

        {/* ==================================================================
            TAB CONTENT: BANKING & ROYALTY PAYOUTS
            ================================================================== */}
        {activeTab === "banking" && (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Royalty Disbursement Account
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Direct NEFT / RTGS transfers for quarterly net profit disbursements.
                </p>
              </div>

              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Bank KYC Verified
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold">
                  Minimum Payout Threshold: ₹1,000
                </p>
                <p className="text-amber-800">
                  Per BookLeaf Official Royalty Policy, balances under ₹1,000 roll over to the next quarter automatically. Payouts are credited within 45 days of the quarter ending.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Account Beneficiary Name
                </label>
                <input
                  type="text"
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value)}
                  className="w-full text-sm p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F4C3A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Bank Name
                </label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full text-sm p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F4C3A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Account Number
                </label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full text-sm p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F4C3A] font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  IFSC Code
                </label>
                <input
                  type="text"
                  value={ifscCode}
                  onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                  className="w-full text-sm p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F4C3A] font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  PAN Number (for TDS compliance)
                </label>
                <input
                  type="text"
                  value={panNumber}
                  onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                  className="w-full text-sm p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F4C3A] font-mono"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setSaveSuccess(true);
                  setTimeout(() => setSaveSuccess(false), 3000);
                }}
                className="px-6 py-2.5 rounded-xl bg-[#0F4C3A] hover:bg-[#0c3c2e] text-white text-sm font-medium transition shadow-sm flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Update Bank Details</span>
              </button>
            </div>
          </div>
        )}

        {/* ==================================================================
            TAB CONTENT: NOTIFICATIONS
            ================================================================== */}
        {activeTab === "notifications" && (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Communication & Alert Preferences
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Choose how BookLeaf keeps you informed about your books, support tickets, and sales.
              </p>
            </div>

            <div className="space-y-4 divide-y divide-slate-100">
              <div className="pt-3 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">
                    Ticket Updates & Support Replies
                  </h4>
                  <p className="text-xs text-slate-500">
                    Receive immediate email alerts when support operations replies to your inquiry.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notifyEmail}
                  onChange={(e) => setNotifyEmail(e.target.checked)}
                  className="w-5 h-5 rounded text-[#0F4C3A] focus:ring-[#0F4C3A]"
                />
              </div>

              <div className="pt-3 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">
                    WhatsApp Status Alerts
                  </h4>
                  <p className="text-xs text-slate-500">
                    Get delivery, print dispatch, and publishing milestone updates on WhatsApp.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notifyWhatsapp}
                  onChange={(e) => setNotifyWhatsapp(e.target.checked)}
                  className="w-5 h-5 rounded text-[#0F4C3A] focus:ring-[#0F4C3A]"
                />
              </div>

              <div className="pt-3 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">
                    Quarterly Royalty Credit Statements
                  </h4>
                  <p className="text-xs text-slate-500">
                    Receive detailed PDF earnings statements and payout transfer references.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notifyRoyalty}
                  onChange={(e) => setNotifyRoyalty(e.target.checked)}
                  className="w-5 h-5 rounded text-[#0F4C3A] focus:ring-[#0F4C3A]"
                />
              </div>

              <div className="pt-3 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">
                    #TheWriteAngle & Community News
                  </h4>
                  <p className="text-xs text-slate-500">
                    Invitations to 21-day writing challenges, literary awards, and webinars.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notifyNewsletter}
                  onChange={(e) => setNotifyNewsletter(e.target.checked)}
                  className="w-5 h-5 rounded text-[#0F4C3A] focus:ring-[#0F4C3A]"
                />
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================
            TAB CONTENT: SECURITY
            ================================================================== */}
        {activeTab === "security" && (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Security & Authentication
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage your portal password and active browser sessions.
              </p>
            </div>

            <div className="space-y-4 max-w-md">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Current Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  className="w-full text-sm p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F4C3A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="Minimum 8 characters"
                  className="w-full text-sm p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F4C3A]"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  setSaveSuccess(true);
                  setTimeout(() => setSaveSuccess(false), 3000);
                }}
                className="px-5 py-2.5 rounded-xl bg-[#0F4C3A] text-white text-xs font-medium hover:bg-[#0c3c2e] transition shadow-sm"
              >
                Update Password
              </button>
            </div>

            <div className="pt-6 border-t border-slate-100">
              <h4 className="text-sm font-semibold text-slate-900 mb-2">
                Active Session
              </h4>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                    ✓
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">
                      Current Browser Session (Encrypted JWT)
                    </p>
                    <p className="text-slate-500">
                      Signed in as {currentUser.email} • RBAC: AUTHOR
                    </p>
                  </div>
                </div>
                <span className="text-emerald-700 font-semibold">Active Now</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </PortalShell>
  );
}
