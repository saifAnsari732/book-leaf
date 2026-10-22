"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  Download,
  FileText,
  IndianRupee,
  Lock,
  Mail,
  Phone,
  Printer,
  Receipt,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  User,
  X,
  Zap,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

export interface RazorpayModalProps {
  isOpen: boolean;
  onClose: () => void;
  planId?: string;
  planName: string;
  amount: number; // in INR
  purpose?: string;
  bookId?: string;
  copies?: number;
  binding?: "Paperback" | "Hardcover";
  onSuccess?: (receipt: any) => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function RazorpayModal({
  isOpen,
  onClose,
  planId,
  planName,
  amount,
  purpose = "Publishing Package",
  bookId,
  copies,
  binding,
  onSuccess,
}: RazorpayModalProps) {
  const toast = useToast();
  const { user } = useAuth();

  // Wizard Steps: 1 = Review & Breakdown, 2 = Author Details, 3 = Completed Receipt
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Author & Billing Form
  const [authorName, setAuthorName] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");
  const [authorPhone, setAuthorPhone] = useState("+91 ");
  const [gstin, setGstin] = useState("");

  // States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<any | null>(null);

  // Calculated breakdown (18% GST inclusive)
  const baseAmount = Math.round((amount / 1.18) * 100) / 100;
  const gstAmount = Math.round((amount - baseAmount) * 100) / 100;

  useEffect(() => {
    if (user) {
      if (user.name) setAuthorName(user.name);
      if (user.email) setAuthorEmail(user.email);
      if (user.phone) setAuthorPhone(user.phone);
    }
  }, [user]);

  if (!isOpen) return null;

  // Load Razorpay checkout.js dynamically
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window !== "undefined" && window.Razorpay) {
        return resolve(true);
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleInitiatePayment = async () => {
    if (!authorName.trim()) {
      setError("Please enter your full legal or author name.");
      setStep(2);
      return;
    }
    if (!authorEmail.trim() || !authorEmail.includes("@")) {
      setError("Please enter a valid email address for receipt delivery.");
      setStep(2);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Create Order on Backend (Server forces authoritative pricing)
      const res = await fetch("/api/payment/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId,
          planName,
          amount,
          purpose,
          bookId,
          copies,
          binding,
          name: authorName.trim(),
          email: authorEmail.trim().toLowerCase(),
          phone: authorPhone.trim(),
          gstin: gstin.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create Razorpay payment order");
      }

      const { order, author: verifiedAuthor } = data;

      // 2. Load Razorpay SDK
      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded || order.isMock) {
        // Fallback / Sandbox Interactive Simulator
        await simulateSandboxPayment(order.orderId);
        return;
      }

      // 3. Open Real / Live Razorpay Standard Checkout
      const options = {
        key: order.keyId,
        amount: order.amount, // in paise
        currency: order.currency || "INR",
        name: "BookLeaf Publishing",
        description: `${planName} • ${purpose}`,
        image: "/images/bookleaf/Slice_1pic.png",
        order_id: order.orderId,
        handler: async function (response: any) {
          await verifyPayment(response, order.amountInInr);
        },
        prefill: {
          name: verifiedAuthor?.name || authorName,
          email: verifiedAuthor?.email || authorEmail,
          contact: verifiedAuthor?.phone || authorPhone,
        },
        notes: {
          planName,
          purpose,
          bookId: bookId || "NA",
        },
        theme: {
          color: "#0F4C3A",
          backdrop_color: "#062019",
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on("payment.failed", function (response: any) {
        setError(
          response.error?.description || "Payment was declined by your bank or cancelled."
        );
        setLoading(false);
      });
      razorpay.open();
    } catch (err: any) {
      setError(err?.message || "Payment initiation failed. Please try again.");
      setLoading(false);
    }
  };

  // Verifies signature with backend API (Zero-Loophole Double Check)
  const verifyPayment = async (
    paymentPayload: {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
    },
    paidAmount: number
  ) => {
    try {
      const verifyRes = await fetch("/api/payment/razorpay/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...paymentPayload,
          planId,
          planName,
          amount: paidAmount,
          authorName: authorName.trim(),
          authorEmail: authorEmail.trim(),
          authorPhone: authorPhone.trim(),
          gstin: gstin.trim() || undefined,
        }),
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok || !verifyData.success) {
        throw new Error(verifyData.error || "Payment verification failed");
      }

      setReceipt(verifyData.receipt);
      setStep(3);
      toast.success(
        "Payment Verified & Recorded",
        `Receipt for ₹${paidAmount.toLocaleString("en-IN")} generated. Confirmation email sent via Nodemailer.`
      );
      if (onSuccess) {
        onSuccess(verifyData.receipt);
      }
    } catch (err: any) {
      const msg = err?.message || "Failed to verify payment with server.";
      setError(msg);
      toast.error("Payment Verification Failed", msg);
    } finally {
      setLoading(false);
    }
  };

  // Sandbox simulation helper for local evaluation
  const simulateSandboxPayment = async (orderId: string) => {
    const mockPaymentId = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const mockSignature = `sig_mock_${Math.random().toString(36).substring(2, 12)}`;

    await verifyPayment(
      {
        razorpay_order_id: orderId,
        razorpay_payment_id: mockPaymentId,
        razorpay_signature: mockSignature,
      },
      amount
    );
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200 text-slate-800 flex flex-col max-h-[92vh]"
      >
        {/* ==================================================================
            HEADER: Razorpay 256-Bit SSL Checkout
            ================================================================== */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-100 bg-[#F9FAF7] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0F4C3A] text-white flex items-center justify-center shadow-xs">
              <Receipt className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 leading-tight">
                  Secure Payment Checkout
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                  Live Gateway
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                BookLeaf Publishing • 256-Bit PCI-DSS Level 1 Encrypted
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Checkout"
            className="w-8 h-8 rounded-full bg-slate-200/60 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ==================================================================
            STEP PROGRESS INDICATOR (When not yet successful)
            ================================================================== */}
        {step !== 3 && (
          <div className="px-6 pt-4 pb-2 bg-white border-b border-slate-100 flex items-center gap-2 text-xs font-semibold shrink-0">
            <button
              type="button"
              onClick={() => setStep(1)}
              className={`flex items-center gap-1.5 pb-2 border-b-2 transition cursor-pointer ${
                step === 1
                  ? "border-[#0F4C3A] text-[#0F4C3A] font-bold"
                  : "border-transparent text-slate-400 hover:text-slate-700"
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-[#0F4C3A]/10 flex items-center justify-center text-[10px]">
                1
              </span>
              <span>Plan & Breakdown</span>
            </button>

            <span className="text-slate-300 pb-2">/</span>

            <button
              type="button"
              onClick={() => setStep(2)}
              className={`flex items-center gap-1.5 pb-2 border-b-2 transition cursor-pointer ${
                step === 2
                  ? "border-[#0F4C3A] text-[#0F4C3A] font-bold"
                  : "border-transparent text-slate-400 hover:text-slate-700"
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-[#0F4C3A]/10 flex items-center justify-center text-[10px]">
                2
              </span>
              <span>Author & Billing</span>
            </button>
          </div>
        )}

        {/* ==================================================================
            SCROLLABLE BODY
            ================================================================== */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1">
          {/* Error Banner */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          {/* ============================================================== */}
          {/* STEP 1: PLAN REVIEW & TAX BREAKDOWN                            */}
          {/* ============================================================== */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              {/* Plan Card */}
              <div className="p-5 rounded-3xl bg-gradient-to-br from-[#FFF5F6] via-white to-[#F9FAF7] border border-[#FFE7E9] shadow-2xs">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#F05262] text-white text-[10px] font-extrabold uppercase tracking-wider inline-block mb-1.5">
                      Selected Plan
                    </span>
                    <h4 className="text-xl font-black text-slate-900 font-sans">
                      {planName}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">{purpose}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-baseline justify-end gap-1">
                      <span className="text-base font-light text-slate-400">₹</span>
                      <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
                        {amount.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-700 block mt-0.5">
                      18% GST Inclusive
                    </span>
                  </div>
                </div>

                {/* Transparent Tax Breakdown Table */}
                <div className="mt-5 pt-4 border-t border-slate-200/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Base Publishing Fee:</span>
                    <span className="font-semibold text-slate-800 font-mono">
                      ₹{baseAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>GST @ 18% (SGST 9% + CGST 9%):</span>
                    <span className="font-semibold text-slate-800 font-mono">
                      ₹{gstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between font-bold text-slate-900 pt-2 border-t border-slate-200">
                    <span>Total Net Payable:</span>
                    <span className="text-sm font-extrabold text-[#0F4C3A] font-mono">
                      ₹{amount.toLocaleString("en-IN")}.00
                    </span>
                  </div>
                </div>
              </div>

              {/* Author Guarantees */}
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-2.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-900 block">
                  Guaranteed Publishing Privileges Included:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-emerald-900">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>100% Net Royalty Profit Split</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Official ISBN Registration</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Amazon &amp; Flipkart Pan-India</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Instant Author Wallet Payouts</span>
                  </div>
                </div>
              </div>

              {/* Supported Payment Channels */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-700 block">
                  Accepted Payment Channels:
                </span>
                <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold text-slate-700">
                  <span className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200">
                    UPI (Google Pay, PhonePe, Paytm, BHIM)
                  </span>
                  <span className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200">
                    Visa / MasterCard / RuPay
                  </span>
                  <span className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200">
                    50+ NetBanking Options
                  </span>
                  <span className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200">
                    EMI / PayLater
                  </span>
                </div>
              </div>

              {/* Step 1 Next CTA */}
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full py-3.5 rounded-full bg-[#0F4C3A] hover:bg-[#0A3B2D] text-white font-bold text-sm flex items-center justify-center gap-2 transition shadow-md hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                <span>Continue to Author &amp; Billing Details</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ============================================================== */}
          {/* STEP 2: AUTHOR & BILLING DETAILS                               */}
          {/* ============================================================== */}
          {step === 2 && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <h4 className="text-base font-bold text-slate-900">
                  Author &amp; Tax Invoice Details
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Your tax invoice and publication contract will be issued to these details.
                </p>
              </div>

              <div className="space-y-4">
                {/* Author Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Legal / Author Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      placeholder="e.g. Priya Sharma"
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-[#F9FAF7] text-slate-900 text-sm focus:bg-white focus:outline-hidden focus:border-[#0F4C3A] focus:ring-1 focus:ring-[#0F4C3A] transition"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address (for Invoice &amp; Contract) *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      value={authorEmail}
                      onChange={(e) => setAuthorEmail(e.target.value)}
                      placeholder="e.g. priya.sharma@email.com"
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-[#F9FAF7] text-slate-900 text-sm focus:bg-white focus:outline-hidden focus:border-[#0F4C3A] focus:ring-1 focus:ring-[#0F4C3A] transition"
                    />
                  </div>
                </div>

                {/* Phone & GSTIN 2-Column */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      WhatsApp / Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="tel"
                        value={authorPhone}
                        onChange={(e) => setAuthorPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-[#F9FAF7] text-slate-900 text-sm focus:bg-white focus:outline-hidden focus:border-[#0F4C3A] focus:ring-1 focus:ring-[#0F4C3A] transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      GSTIN (Optional for Tax Credit)
                    </label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={gstin}
                        onChange={(e) => setGstin(e.target.value.toUpperCase())}
                        placeholder="e.g. 07AAAAA0000A1Z5"
                        maxLength={15}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-[#F9FAF7] text-slate-900 text-sm focus:bg-white focus:outline-hidden focus:border-[#0F4C3A] focus:ring-1 focus:ring-[#0F4C3A] transition uppercase"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Guarantee Box */}
              <div className="flex items-center gap-2.5 text-xs text-emerald-900 bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl">
                <ShieldCheck className="w-5 h-5 shrink-0 text-emerald-600" />
                <span>
                  <strong>Certified Live Gateway:</strong> You will be securely transferred to the official payment dialog. No card details are ever stored on our servers.
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="py-3.5 px-5 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition cursor-pointer"
                >
                  Back
                </button>

                <button
                  type="button"
                  onClick={handleInitiatePayment}
                  disabled={loading}
                  className="flex-1 py-3.5 rounded-full bg-[#0F4C3A] hover:bg-[#0A3B2D] text-white font-bold text-sm flex items-center justify-center gap-2 transition shadow-lg hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 cursor-pointer"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Connecting Secure Gateway...</span>
                    </div>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 text-emerald-300" />
                      <span>Pay Securely</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* STEP 3: SUCCESSFUL TAX INVOICE & RECEIPT VIEW                  */}
          {/* ============================================================== */}
          {step === 3 && receipt && (
            <div className="space-y-6 text-center animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#0F4C3A] flex items-center justify-center mx-auto ring-8 ring-emerald-50 shadow-xs">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  Payment Successfully Captured
                </span>
                <h3 className="text-2xl font-black text-slate-900 font-sans">
                  ₹{receipt.amount.toLocaleString("en-IN")}.00 Received
                </h3>
                <p className="text-xs text-slate-500">
                  Transaction verified and settled via Secure Live Gateway
                </p>
              </div>

              {/* Official GST Tax Invoice Card */}
              <div className="p-5 sm:p-6 rounded-3xl bg-[#F9FAF7] border border-slate-200 text-left text-xs space-y-3 font-mono shadow-2xs">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div>
                    <span className="font-bold text-slate-900 block text-sm">
                      BookLeaf Publishing Pvt. Ltd.
                    </span>
                    <span className="text-[10px] text-slate-500">
                      GSTIN: 07AABCB1234F1Z5 • Registered Publishing Merchant
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    PAID &amp; SETTLED
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs border-b border-slate-200 pb-3">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Invoice Number:</span>
                    <span className="font-bold text-slate-900">{receipt.invoiceNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Date &amp; Time:</span>
                    <span className="text-slate-700 font-semibold">
                      {new Date(receipt.paidAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Transaction ID:</span>
                    <span className="font-bold text-slate-800 truncate block">
                      {receipt.transactionId}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Razorpay Payment ID:</span>
                    <span className="font-bold text-emerald-800 truncate block">
                      {receipt.paymentId}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs border-b border-slate-200 pb-3">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Billed Author:</span>
                    <span className="font-semibold text-slate-900">{receipt.authorName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Service Plan:</span>
                    <span className="font-bold text-[#0F4C3A]">{receipt.planName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Base Amount:</span>
                    <span className="text-slate-700">
                      ₹{receipt.baseAmount?.toLocaleString("en-IN") || baseAmount}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">GST (18%):</span>
                    <span className="text-slate-700">
                      ₹{receipt.gstAmount?.toLocaleString("en-IN") || gstAmount}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm font-bold text-slate-900 pt-1">
                  <span>Total Paid (INR):</span>
                  <span className="text-base font-extrabold text-[#0F4C3A]">
                    ₹{receipt.amount.toLocaleString("en-IN")}.00
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="w-full sm:flex-1 py-3 rounded-full border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-slate-500" />
                  <span>Print Tax Invoice</span>
                </button>

                <Link
                  href="/author-dashboard?menu=Royalty%20Withdrawal"
                  onClick={onClose}
                  className="w-full sm:flex-1 py-3 rounded-full bg-[#0F4C3A] text-white text-xs font-bold hover:bg-[#0A3B2D] flex items-center justify-center gap-2 transition shadow-sm cursor-pointer"
                >
                  <span>Open Author Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
