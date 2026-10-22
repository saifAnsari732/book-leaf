"use client";

import React, { useState } from "react";
import { BookRecord, SafeUser } from "@/types/domain";
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  IndianRupee,
  Lock,
  Package,
  Printer,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { RazorpayModal } from "@/components/payment/RazorpayModal";

interface AuthorDashboardCopiesViewProps {
  books: BookRecord[];
  author: SafeUser;
}

export function AuthorDashboardCopiesView({
  books,
  author,
}: AuthorDashboardCopiesViewProps) {
  const [selectedBookId, setSelectedBookId] = useState<string>(
    books[0]?.book_id || ""
  );
  const [binding, setBinding] = useState<"Paperback" | "Hardcover">("Paperback");
  const [quantity, setQuantity] = useState<number>(10);
  const [shippingAddress, setShippingAddress] = useState(
    "Flat 402, Lotus Enclave, Powai, Mumbai, Maharashtra - 400076"
  );
  const [shippingPhone, setShippingPhone] = useState("+91 98765 43210");
  const [isOrdering, setIsOrdering] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const selectedBook =
    books.find((b) => b.book_id === selectedBookId) || books[0];

  // Pricing formula: Author copy rate (₹120 for paperback, ₹240 for hardcover)
  const unitPrice = binding === "Paperback" ? 120 : 240;
  const subtotal = unitPrice * quantity;
  const shippingFee = quantity >= 25 ? 0 : 99; // Free shipping on 25+ copies
  const totalAmount = subtotal + shippingFee;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
            <Printer className="w-3.5 h-3.5 text-emerald-600" />
            <span>Author-Exclusive Subsidized Printing (Up to 60% Off MRP)</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Order Author Copies &amp; Print Runs
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Order physical copies of your published books directly from BookLeaf&apos;s
            high-speed print facility for book launches, reader signings, and personal inventory.
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 shrink-0 text-center min-w-[200px]">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Standard MRP vs Author Price
          </span>
          <div className="flex items-center justify-center gap-2">
            <span className="text-sm text-slate-400 line-through">₹399 MRP</span>
            <span className="font-serif text-2xl font-bold text-emerald-700">₹120/ea</span>
          </div>
          <span className="text-[10px] text-emerald-600 font-semibold block mt-1">
            Save ₹279 per copy
          </span>
        </div>
      </div>

      {/* Main Order Configuration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Configuration Form (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <h3 className="font-serif text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
            Configure Your Print Order
          </h3>

          {/* Book Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Book Title
            </label>
            <select
              value={selectedBookId}
              onChange={(e) => setSelectedBookId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-[#F26979] focus:outline-none bg-slate-50/50"
            >
              {books.map((b) => (
                <option key={b.book_id} value={b.book_id}>
                  {b.title} (ISBN: {b.isbn || "978-93-5400-000-0"})
                </option>
              ))}
            </select>
          </div>

          {/* Binding Type */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Binding Specification
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setBinding("Paperback")}
                className={`p-4 rounded-xl border text-left transition flex items-center justify-between ${
                  binding === "Paperback"
                    ? "bg-[#FFF5F6] border-[#F26979] shadow-xs"
                    : "bg-white border-slate-200 hover:bg-slate-50"
                }`}
              >
                <div>
                  <span className="font-bold text-xs sm:text-sm text-slate-900 block">
                    Paperback (Softcover)
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Perfect bind, 300 GSM matte/gloss
                  </span>
                </div>
                <span className="text-xs font-bold text-[#F26979]">₹120/ea</span>
              </button>

              <button
                type="button"
                onClick={() => setBinding("Hardcover")}
                className={`p-4 rounded-xl border text-left transition flex items-center justify-between ${
                  binding === "Hardcover"
                    ? "bg-[#FFF5F6] border-[#F26979] shadow-xs"
                    : "bg-white border-slate-200 hover:bg-slate-50"
                }`}
              >
                <div>
                  <span className="font-bold text-xs sm:text-sm text-slate-900 block">
                    Hardcover (Collector Edition)
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Case laminate, gold foil ribbon
                  </span>
                </div>
                <span className="text-xs font-bold text-[#F26979]">₹240/ea</span>
              </button>
            </div>
          </div>

          {/* Quantity Selector Chips */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Quantity of Copies
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[5, 10, 25, 50, 100].map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setQuantity(q)}
                  className={`py-3 rounded-xl border text-center transition font-bold text-xs sm:text-sm ${
                    quantity === q
                      ? "bg-[#0F4C3A] border-[#0F4C3A] text-white shadow-xs"
                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span>{q} copies</span>
                </button>
              ))}
            </div>
            {quantity >= 25 && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 mt-2">
                <Check className="w-3.5 h-3.5" />
                <span>Eligible for Free Expedited Courier Delivery across India!</span>
              </span>
            )}
          </div>

          {/* Delivery Details */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Dispatch Courier Address
              </label>
              <input
                type="text"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-[#F26979] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Recipient Contact Phone
              </label>
              <input
                type="text"
                value={shippingPhone}
                onChange={(e) => setShippingPhone(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-[#F26979] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Right: Order Summary & Instant Razorpay Checkout (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <h3 className="font-serif text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
            Order Invoice Summary
          </h3>

          <div className="space-y-3 text-xs sm:text-sm text-slate-600">
            <div className="flex justify-between items-center">
              <span>Book Title:</span>
              <span className="font-bold text-slate-900 truncate max-w-[200px]">
                {selectedBook?.title || "Book"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Format:</span>
              <span className="font-medium text-slate-800">{binding}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Unit Price:</span>
              <span className="font-semibold text-slate-800">₹{unitPrice} / copy</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Quantity:</span>
              <span className="font-bold text-slate-900">{quantity} copies</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Subtotal:</span>
              <span className="font-semibold text-slate-900">
                ₹{subtotal.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Shipping &amp; Handling (Blue Dart / Delhivery):</span>
              <span className="font-semibold text-slate-900">
                {shippingFee === 0 ? (
                  <span className="text-emerald-600 font-bold">FREE</span>
                ) : (
                  `₹${shippingFee}`
                )}
              </span>
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
              <span className="font-bold text-sm sm:text-base text-slate-900">
                Total Payable:
              </span>
              <span className="font-serif text-2xl font-extrabold text-[#F05262]">
                ₹{totalAmount.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          <div className="pt-2 space-y-3">
            <button
              type="button"
              onClick={() => setCheckoutOpen(true)}
              className="w-full py-3.5 rounded-full bg-[#F05262] hover:bg-[#d94151] text-white font-bold text-sm transition shadow-md hover:shadow-lg flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>Proceed to Checkout</span>
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500">
              <Truck className="w-3.5 h-3.5 text-slate-400" />
              <span>Ships within 3-5 business days with door delivery &amp; tracking</span>
            </div>
          </div>
        </div>
      </div>

      {/* Past Orders Tracking Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <h3 className="font-serif text-lg font-bold text-slate-900">
          Recent Author Print Orders &amp; Dispatch History
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3">Order ID</th>
                <th className="py-3">Title</th>
                <th className="py-3">Copies</th>
                <th className="py-3">Amount</th>
                <th className="py-3">Date</th>
                <th className="py-3">Status</th>
                <th className="py-3">Tracking</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr>
                <td className="py-3.5 font-mono font-bold text-[#0F4C3A]">#ORD-9921</td>
                <td className="py-3.5 font-semibold text-slate-900">
                  Whispers of the Ganges
                </td>
                <td className="py-3.5">25 Copies (Paperback)</td>
                <td className="py-3.5 font-semibold">₹3,000</td>
                <td className="py-3.5 text-slate-500">18 Oct 2026</td>
                <td className="py-3.5">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                    Delivered
                  </span>
                </td>
                <td className="py-3.5 font-mono text-[11px] text-blue-600 hover:underline">
                  BD883921002IN
                </td>
              </tr>
              <tr>
                <td className="py-3.5 font-mono font-bold text-[#0F4C3A]">#ORD-9844</td>
                <td className="py-3.5 font-semibold text-slate-900">
                  The Saffron Diaries
                </td>
                <td className="py-3.5">10 Copies (Paperback)</td>
                <td className="py-3.5 font-semibold">₹1,299</td>
                <td className="py-3.5 text-slate-500">04 Oct 2026</td>
                <td className="py-3.5">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                    Delivered
                  </span>
                </td>
                <td className="py-3.5 font-mono text-[11px] text-blue-600 hover:underline">
                  DL994820119IN
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Razorpay Checkout Modal */}
      {checkoutOpen && (
        <RazorpayModal
          isOpen={checkoutOpen}
          onClose={() => setCheckoutOpen(false)}
          planName={`${quantity} Author Copies of ${selectedBook?.title || "Book"}`}
          amount={totalAmount}
          purpose="Author Copies Print Order"
        />
      )}
    </div>
  );
}
