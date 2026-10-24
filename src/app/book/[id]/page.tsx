"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronRight,
  Heart,
  Minus,
  Plus,
  RotateCcw,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
  BookOpen,
  Eye,
  X,
  CreditCard,
  Sparkles,
} from "lucide-react";
import {
  OFFICIAL_BOOKSTORE_CATALOG,
  getBookByIdOrSlug,
  OfficialBook,
} from "@/data/bookstore-catalog";
import { RazorpayModal } from "@/components/payment/RazorpayModal";

export default function BookProductPage() {
  const params = useParams();
  const router = useRouter();
  const idOrSlug = (params?.id as string) || "";

  const [book, setBook] = useState<OfficialBook | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [activeSide, setActiveSide] = useState<"front" | "back">("front");
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedFormat, setSelectedFormat] = useState<"Paperback" | "eBook" | "Hardcover">("Paperback");
  const [activeTab, setActiveTab] = useState<"description" | "specs" | "author" | "shipping">("description");
  const [cartDrawerOpen, setCartDrawerOpen] = useState<boolean>(false);
  const [cartItemsCount, setCartItemsCount] = useState<number>(0);
  const [liked, setLiked] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState<boolean>(false);
  const [activeLightbox, setActiveLightbox] = useState<boolean>(false);

  useEffect(() => {
    if (idOrSlug) {
      const found = getBookByIdOrSlug(idOrSlug);
      if (found) {
        setBook(found);
        setSelectedImage(found.frontCover);
        setActiveSide("front");
      } else {
        // Fallback to first book if not found
        setBook(OFFICIAL_BOOKSTORE_CATALOG[0]);
        setSelectedImage(OFFICIAL_BOOKSTORE_CATALOG[0].frontCover);
      }
    }
  }, [idOrSlug]);

  if (!book) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#F05262] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-600 font-medium">Loading BookLeaf Bookstore item...</p>
        </div>
      </div>
    );
  }

  const handleImageSwitch = (side: "front" | "back") => {
    setActiveSide(side);
    setSelectedImage(side === "front" ? book.frontCover : book.backCover);
  };

  const handleAddToCart = () => {
    setCartItemsCount((prev) => prev + quantity);
    setCartDrawerOpen(true);
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const relatedBooks = OFFICIAL_BOOKSTORE_CATALOG.filter((b) => b.id !== book.id).slice(0, 4);

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-slate-800 font-sans selection:bg-[#F05262]/20 selection:text-[#F05262]">
      {/* Top Banner Notice - Official BookLeaf Bookstore style */}
      <div className="bg-[#3D081B] text-[#F2EFDD] text-[11px] sm:text-xs py-2 px-4 text-center font-medium tracking-wide">
        <span>BookLeaf Publishing Bookstore • 100% Author-Approved Original Editions • Free Pan-India Delivery on orders above ₹499</span>
      </div>

      {/* Bookstore Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 sm:gap-8">
            <Link
              href="/"
              className="group flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span>Back to Home</span>
            </Link>

            <Link href="/" className="flex items-center gap-2">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900">
                BookLeaf<span className="text-[#F05262]">.</span>
              </span>
              <span className="hidden sm:inline-block text-[11px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                Bookstore
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-700">
            <Link href="/bookstore" className="hover:text-[#F05262] transition">
              Books
            </Link>
            <Link href="/#plans" className="hover:text-[#F05262] transition">
              Publishing Plans
            </Link>
            <Link href="/#calculator" className="hover:text-[#F05262] transition">
              Royalty Calculator
            </Link>
            <Link href="/create_book" className="hover:text-[#F05262] transition">
              Publish Your Book
            </Link>
          </nav>

          {/* Header Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleShare}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition relative"
              title="Share Book"
            >
              <Share2 className="w-4 h-4" />
              {copiedLink && (
                <span className="absolute -bottom-8 right-0 text-[10px] bg-slate-900 text-white px-2 py-0.5 rounded whitespace-nowrap shadow-md">
                  Link Copied!
                </span>
              )}
            </button>

            <button
              onClick={() => setCartDrawerOpen(true)}
              className="relative p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 transition"
              aria-label="View Shopping Cart"
            >
              <ShoppingBag className="w-4 h-4" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#F05262] text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-scale">
                  {cartItemsCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Breadcrumb Navigation */}
      <div className="bg-[#FAF9F5] border-b border-slate-200/70 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-xs text-slate-500 overflow-x-auto whitespace-nowrap">
            <Link href="/" className="hover:text-slate-900 transition">
              Home
            </Link>
            <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
            <Link href="/bookstore" className="hover:text-slate-900 transition">
              Books
            </Link>
            <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="hover:text-slate-900 transition text-slate-600">
              {book.genre}
            </span>
            <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="font-semibold text-slate-900 truncate max-w-xs sm:max-w-md">
              {book.title}
            </span>
          </div>
        </div>
      </div>

      {/* Main Product Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* ================================================================
              LEFT COLUMN: Sticky Gallery & Multi-Angle Thumbnails
              ================================================================ */}
          <div className="lg:col-span-6 lg:sticky lg:top-24 space-y-4">
            {/* Main Stage Image */}
            <div className="relative bg-[#F7F7F7] rounded-2xl p-6 sm:p-10 flex items-center justify-center border border-slate-200/80 shadow-xs group">
              {/* Verified Badge */}
              <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 backdrop-blur-sm text-[11px] font-bold text-slate-800 border border-slate-200/60 shadow-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>BookLeaf Official Imprint</span>
              </div>

              {/* Wishlist / Like button */}
              <button
                onClick={() => setLiked(!liked)}
                className={`absolute top-4 right-4 z-10 p-2.5 rounded-full border transition ${
                  liked
                    ? "bg-[#F05262] text-white border-[#F05262]"
                    : "bg-white/95 text-slate-600 hover:text-[#F05262] border-slate-200/80"
                }`}
                title="Save to Wishlist"
              >
                <Heart className={`w-4 h-4 ${liked ? "fill-white" : ""}`} />
              </button>

              {/* Main Image with Zoom Lightbox trigger */}
              <div
                onClick={() => setActiveLightbox(true)}
                className="relative max-w-[320px] sm:max-w-[360px] w-full aspect-[1/1.5] cursor-zoom-in transition-transform duration-300 group-hover:scale-[1.02]"
              >
                <img
                  src={selectedImage}
                  alt={`${book.title} ${activeSide} cover`}
                  className="w-full h-full object-contain rounded-md shadow-2xl drop-shadow-xl"
                  onError={(e) => {
                    // Fallback to local image if CDN fails
                    (e.target as HTMLImageElement).src = book.fallbackCover;
                  }}
                />

                <div className="absolute bottom-3 right-3 bg-slate-900/80 hover:bg-slate-900 text-white text-[11px] font-medium px-2.5 py-1 rounded-md flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition">
                  <Eye className="w-3.5 h-3.5" />
                  <span>Click to expand</span>
                </div>
              </div>
            </div>

            {/* Thumbnail Switcher (Front & Back Views matching BookLeaf official store) */}
            <div className="flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => handleImageSwitch("front")}
                className={`flex items-center gap-2 p-2 rounded-xl border-2 transition ${
                  activeSide === "front"
                    ? "border-[#F05262] bg-[#F05262]/5 shadow-xs"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div className="w-12 h-16 bg-slate-100 rounded overflow-hidden">
                  <img
                    src={book.frontCover}
                    alt="Front Cover Thumbnail"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = book.fallbackCover;
                    }}
                  />
                </div>
                <div className="text-left pr-2">
                  <p className="text-xs font-bold text-slate-800">Front Cover</p>
                  <p className="text-[10px] text-slate-500">Official artwork</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleImageSwitch("back")}
                className={`flex items-center gap-2 p-2 rounded-xl border-2 transition ${
                  activeSide === "back"
                    ? "border-[#F05262] bg-[#F05262]/5 shadow-xs"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div className="w-12 h-16 bg-slate-100 rounded overflow-hidden">
                  <img
                    src={book.backCover}
                    alt="Back Cover Thumbnail"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = book.fallbackCover;
                    }}
                  />
                </div>
                <div className="text-left pr-2">
                  <p className="text-xs font-bold text-slate-800">Back Cover</p>
                  <p className="text-[10px] text-slate-500">ISBN &amp; Blurb</p>
                </div>
              </button>
            </div>

            {/* Trust Badges Strip */}
            <div className="grid grid-cols-3 gap-2 pt-2 text-center text-[11px] text-slate-600 border-t border-slate-100">
              <div className="flex flex-col items-center gap-1 p-2 bg-slate-50 rounded-lg">
                <Truck className="w-4 h-4 text-[#F05262]" />
                <span className="font-semibold text-slate-800">Fast Dispatch</span>
                <span className="text-[10px] text-slate-500">Within 24–48 hrs</span>
              </div>
              <div className="flex flex-col items-center gap-1 p-2 bg-slate-50 rounded-lg">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold text-slate-800">100% Original</span>
                <span className="text-[10px] text-slate-500">Author certified</span>
              </div>
              <div className="flex flex-col items-center gap-1 p-2 bg-slate-50 rounded-lg">
                <RotateCcw className="w-4 h-4 text-blue-600" />
                <span className="font-semibold text-slate-800">Replacement</span>
                <span className="text-[10px] text-slate-500">7 Days Guarantee</span>
              </div>
            </div>
          </div>

          {/* ================================================================
              RIGHT COLUMN: Book Metadata, Pricing & Buy Flows
              ================================================================ */}
          <div className="lg:col-span-6 space-y-6">
            {/* Title & Subtitle */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold uppercase tracking-wider">
                  {book.genre}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold">
                  In Stock
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#3D081B] tracking-tight leading-tight">
                {book.title}
              </h1>

              {book.subtitle && (
                <p className="text-sm sm:text-base text-slate-600 font-medium italic">
                  {book.subtitle}
                </p>
              )}

              <p className="text-sm text-slate-600 pt-1">
                By{" "}
                <span className="font-bold text-slate-900 underline decoration-slate-300 underline-offset-4">
                  {book.author}
                </span>{" "}
                • Published by <span className="font-semibold text-[#F05262]">{book.publisher}</span>
              </p>
            </div>

            {/* Ratings & Social Proof */}
            <div className="flex items-center gap-4 py-2 border-y border-slate-100">
              <div className="flex items-center gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
                <span className="font-bold text-slate-900 text-sm ml-1.5">{book.rating}</span>
              </div>
              <span className="text-slate-300">|</span>
              <span className="text-xs text-slate-600 font-medium">
                <strong className="text-slate-900">{book.reviewsCount}</strong> verified reader reviews
              </span>
              <span className="text-slate-300">|</span>
              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> 100% Genuine Print
              </span>
            </div>

            {/* Price Block (Matching BookLeaf official store styling) */}
            <div className="space-y-1 bg-slate-50/80 p-4 rounded-2xl border border-slate-200/60">
              <div className="flex items-baseline gap-3">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Regular price:
                </span>
                <span className="text-3xl font-extrabold text-[#3D081B]">
                  Rs. {book.price}.00
                </span>
                {book.compareAtPrice && (
                  <span className="text-base text-slate-400 line-through">
                    Rs. {book.compareAtPrice}.00
                  </span>
                )}
                {book.compareAtPrice && (
                  <span className="px-2 py-0.5 rounded bg-[#F05262]/10 text-[#F05262] text-xs font-bold">
                    Save ₹{book.compareAtPrice - book.price}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500">
                Tax included. Shipping calculated at checkout. Sold directly by BookLeaf Publishing.
              </p>
            </div>

            {/* Format Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Select Edition:
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedFormat("Paperback")}
                  className={`p-3 rounded-xl border-2 text-left transition ${
                    selectedFormat === "Paperback"
                      ? "border-[#F05262] bg-[#F05262]/5 shadow-xs"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <p className="text-xs font-bold text-slate-900">Paperback</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Rs. {book.price}.00</p>
                  <span className="inline-block mt-1 text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    Physical Copy
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedFormat("eBook")}
                  className={`p-3 rounded-xl border-2 text-left transition ${
                    selectedFormat === "eBook"
                      ? "border-[#F05262] bg-[#F05262]/5 shadow-xs"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <p className="text-xs font-bold text-slate-900">eBook (PDF/ePub)</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Rs. {Math.round(book.price * 0.65)}.00</p>
                  <span className="inline-block mt-1 text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                    Instant Read
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedFormat("Hardcover")}
                  className={`p-3 rounded-xl border-2 text-left transition ${
                    selectedFormat === "Hardcover"
                      ? "border-[#F05262] bg-[#F05262]/5 shadow-xs"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <p className="text-xs font-bold text-slate-900">Collector Hardcover</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Rs. {book.price + 180}.00</p>
                  <span className="inline-block mt-1 text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-purple-100 text-purple-800">
                    Special Imprint
                  </span>
                </button>
              </div>
            </div>

            {/* Quantity Picker & Add-to-Cart Buttons (Exact Shopify Crave theme parity) */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Quantity:
                </span>
                <div className="flex items-center border-2 border-slate-300 rounded-xl overflow-hidden bg-white shadow-xs">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-4 text-sm font-bold text-slate-900 select-none min-w-[2rem] text-center">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <span className="text-xs text-slate-500">
                  Total: <strong className="text-slate-900">₹{book.price * quantity}</strong>
                </span>
              </div>

              {/* CTAs */}
              <div className="space-y-2.5 pt-2">
                {/* Add to Cart button (secondary style from BookLeaf Crave theme) */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="w-full h-12 rounded-xl border-2 border-slate-900 hover:bg-slate-900 hover:text-white text-slate-900 font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-[0.99]"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to cart</span>
                </button>

                {/* Buy It Now button (official #090909 button with #F2EFDD text) */}
                <button
                  type="button"
                  onClick={() => setShowCheckoutModal(true)}
                  className="w-full h-12 rounded-xl bg-[#090909] hover:bg-[#F05262] text-[#F2EFDD] hover:text-white font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-[0.99]"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Buy it now</span>
                </button>
              </div>

              {/* SKU & Barcode identifier */}
              <div className="pt-2 text-xs text-slate-500 flex items-center justify-between border-t border-slate-100">
                <span>SKU / ISBN-13: <strong className="text-slate-800 font-mono">{book.isbn}</strong></span>
                <span>Language: <strong className="text-slate-800">{book.language}</strong></span>
              </div>
            </div>

            {/* Quick Synopsis Excerpt */}
            <div className="p-4 rounded-xl bg-[#FAF9F5] border border-slate-200/80 text-xs text-slate-700 leading-relaxed space-y-2">
              <p className="font-semibold text-slate-900 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-[#F05262]" />
                <span>Synopsis Preview</span>
              </p>
              <p className="line-clamp-3">{book.synopsis}</p>
            </div>
          </div>
        </div>

        {/* ==================================================================
            TABS & DETAILED SPECIFICATIONS (Description, Specs, Author, Shipping)
            ================================================================== */}
        <div className="mt-16 pt-10 border-t border-slate-200">
          {/* Tab Navigation */}
          <div className="flex items-center gap-3 border-b border-slate-200 pb-px overflow-x-auto">
            <button
              onClick={() => setActiveTab("description")}
              className={`pb-3 px-4 text-sm font-bold border-b-2 transition whitespace-nowrap ${
                activeTab === "description"
                  ? "border-[#F05262] text-[#F05262]"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              Description &amp; Highlights
            </button>

            <button
              onClick={() => setActiveTab("specs")}
              className={`pb-3 px-4 text-sm font-bold border-b-2 transition whitespace-nowrap ${
                activeTab === "specs"
                  ? "border-[#F05262] text-[#F05262]"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              Product Specifications
            </button>

            <button
              onClick={() => setActiveTab("author")}
              className={`pb-3 px-4 text-sm font-bold border-b-2 transition whitespace-nowrap ${
                activeTab === "author"
                  ? "border-[#F05262] text-[#F05262]"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              About the Author
            </button>

            <button
              onClick={() => setActiveTab("shipping")}
              className={`pb-3 px-4 text-sm font-bold border-b-2 transition whitespace-nowrap ${
                activeTab === "shipping"
                  ? "border-[#F05262] text-[#F05262]"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              Shipping &amp; Authenticity
            </button>
          </div>

          {/* Tab Content */}
          <div className="py-8">
            {activeTab === "description" && (
              <div className="space-y-6 max-w-4xl">
                <div className="prose prose-slate max-w-none text-slate-700 space-y-4 text-sm sm:text-base leading-relaxed">
                  {book.fullDescription.map((para, idx) => (
                    <p key={idx}>{para}</p>
                  ))}
                </div>

                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-3">
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                    Key Edition Highlights
                  </h3>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-slate-700">
                    {book.keyHighlights.map((hl, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{hl}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {activeTab === "specs" && (
              <div className="max-w-3xl">
                <table className="w-full text-left text-xs sm:text-sm border-collapse">
                  <tbody>
                    <tr className="border-b border-slate-100">
                      <td className="py-3 font-semibold text-slate-500 w-1/3">Title</td>
                      <td className="py-3 text-slate-900 font-medium">{book.title}</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-3 font-semibold text-slate-500">Author</td>
                      <td className="py-3 text-slate-900 font-medium">{book.author}</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-3 font-semibold text-slate-500">ISBN-13</td>
                      <td className="py-3 text-slate-900 font-mono font-medium">{book.isbn}</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-3 font-semibold text-slate-500">Publisher</td>
                      <td className="py-3 text-slate-900 font-medium">{book.publisher}</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-3 font-semibold text-slate-500">Format</td>
                      <td className="py-3 text-slate-900 font-medium">{book.format} (Matte Laminated)</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-3 font-semibold text-slate-500">Number of Pages</td>
                      <td className="py-3 text-slate-900 font-medium">{book.pages} pages</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-3 font-semibold text-slate-500">Language</td>
                      <td className="py-3 text-slate-900 font-medium">{book.language}</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-3 font-semibold text-slate-500">Publication Date</td>
                      <td className="py-3 text-slate-900 font-medium">{book.publicationDate}</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-3 font-semibold text-slate-500">Item Dimensions</td>
                      <td className="py-3 text-slate-900 font-medium">{book.dimensions}</td>
                    </tr>
                    <tr>
                      <td className="py-3 font-semibold text-slate-500">Item Weight</td>
                      <td className="py-3 text-slate-900 font-medium">{book.weight}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "author" && (
              <div className="max-w-3xl space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-slate-900 text-white font-extrabold text-xl flex items-center justify-center">
                    {book.author.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{book.author}</h3>
                    <p className="text-xs text-slate-500">Author &amp; Creator at BookLeaf Publishing</p>
                  </div>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {book.authorBio ||
                    `${book.author} is a published author working with BookLeaf Publishing. Their work brings forward unique narratives and resonates deeply with thousands of readers across the country.`}
                </p>
                <div className="pt-2">
                  <Link
                    href={`/create_book?refAuthor=${encodeURIComponent(book.author)}`}
                    className="inline-flex items-center gap-2 text-xs font-bold text-[#F05262] hover:underline"
                  >
                    <span>Inspired by this author? Publish your own book with BookLeaf →</span>
                  </Link>
                </div>
              </div>
            )}

            {activeTab === "shipping" && (
              <div className="max-w-3xl space-y-4 text-sm text-slate-700 leading-relaxed">
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-emerald-900 text-sm">Direct-from-Imprint Authenticity</h4>
                    <p className="text-xs text-emerald-800 mt-1">
                      Every order placed here is printed on-demand with author royalties locked and verified by BookLeaf Publishing. Zero counterfeit copies.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 text-sm">Domestic Delivery (India)</h4>
                  <p className="text-xs text-slate-600">
                    Orders are typically processed within 24–48 hours. Shipping takes 4 to 6 business days depending on PIN code coverage via Bluedart, Delhivery, or India Post.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 text-sm">International Orders</h4>
                  <p className="text-xs text-slate-600">
                    Worldwide shipping is available to 150+ countries with automated tracking and custom duties transparency.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ==================================================================
            CUSTOMER REVIEWS & SOCIAL PROOF SECTION
            ================================================================== */}
        <section className="mt-12 pt-10 border-t border-slate-200">
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Reader Reviews</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Verified buyers sharing their thoughts on this edition
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-sm font-bold text-slate-900">{book.rating} out of 5</span>
              </div>
            </div>

            {/* Review Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {book.reviews.map((rev, i) => (
                <div key={i} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-amber-400">
                      {[...Array(5)].map((_, idx) => (
                        <Star key={idx} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>
                    <span className="text-[10px] text-slate-400">{rev.date}</span>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{rev.title}</h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{rev.content}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-800">{rev.author}</span>
                    {rev.verified && (
                      <span className="text-emerald-700 font-semibold flex items-center gap-1 text-[10px]">
                        <Check className="w-3 h-3" /> Verified Purchase
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ==================================================================
            RELATED BESTSELLERS (The other books in the trending carousel)
            ================================================================== */}
        <section className="mt-16 pt-12 border-t border-slate-200">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-[#F05262] uppercase tracking-wider">
                  Complete Your Library
                </p>
                <h2 className="text-2xl font-bold text-slate-900">
                  More Bestsellers You May Love
                </h2>
              </div>
              <Link
                href="/bookstore"
                className="text-xs font-bold text-[#F05262] hover:underline"
              >
                View Full Catalog →
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {relatedBooks.map((relBook) => (
                <Link
                  key={relBook.id}
                  href={`/book/${relBook.id}`}
                  className="group bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="relative bg-[#F9F9F8] p-4 flex items-center justify-center aspect-[1/1.3] overflow-hidden">
                    <img
                      src={relBook.frontCover}
                      alt={relBook.title}
                      className="w-full h-full object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = relBook.fallbackCover;
                      }}
                    />
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-white/90 backdrop-blur-xs text-[10px] font-bold text-slate-800 border border-slate-200 shadow-2xs">
                      ₹{relBook.price}
                    </div>
                  </div>

                  <div className="p-4 space-y-1.5 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                        {relBook.genre}
                      </p>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-[#F05262] transition">
                        {relBook.title}
                      </h3>
                      <p className="text-[11px] text-slate-600 line-clamp-1">
                        By {relBook.author}
                      </p>
                    </div>

                    <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-[11px]">
                      <span className="font-extrabold text-[#3D081B]">Rs. {relBook.price}.00</span>
                      <span className="text-[#F05262] font-bold group-hover:translate-x-1 transition-transform">
                        Details →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* ====================================================================
          SLIDE-OUT SHOPPING CART DRAWER
          ==================================================================== */}
      {cartDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between animate-slideInRight">
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#F05262]" />
                <h3 className="text-base font-bold text-slate-900">Your Cart</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 font-bold text-slate-700">
                  {cartItemsCount} items
                </span>
              </div>
              <button
                onClick={() => setCartDrawerOpen(false)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Free Shipping Progress */}
            <div className="bg-[#FAF9F5] px-5 py-3 border-b border-slate-200/80 text-xs text-slate-700">
              {book.price * quantity >= 499 ? (
                <p className="text-emerald-700 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>You unlocked <strong>Free Pan-India Delivery</strong>!</span>
                </p>
              ) : (
                <p>
                  Add <strong>₹{499 - book.price * quantity}</strong> more for <strong>Free Delivery</strong>
                </p>
              )}
            </div>

            {/* Cart Items List */}
            <div className="p-5 flex-1 overflow-y-auto space-y-4">
              <div className="flex gap-4 p-3 rounded-xl border border-slate-200 bg-slate-50/50">
                <div className="w-16 h-20 bg-white rounded-md overflow-hidden shrink-0 border border-slate-200">
                  <img
                    src={book.frontCover}
                    alt={book.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = book.fallbackCover;
                    }}
                  />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{book.title}</h4>
                    <p className="text-[11px] text-slate-500">Format: {selectedFormat}</p>
                    <p className="text-xs font-extrabold text-[#3D081B] mt-1">
                      Rs. {book.price}.00 × {quantity}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-slate-500">Qty: {quantity}</span>
                    <button
                      onClick={() => setCartItemsCount(0)}
                      className="text-[#F05262] hover:underline text-[11px] font-semibold"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Drawer Footer & Checkout */}
            <div className="p-5 border-t border-slate-200 space-y-3 bg-white">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Subtotal</span>
                <span className="font-extrabold text-slate-900 text-lg">
                  ₹{book.price * quantity}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Taxes included. Standard shipping calculated at checkout.
              </p>

              <button
                onClick={() => {
                  setCartDrawerOpen(false);
                  setShowCheckoutModal(true);
                }}
                className="w-full py-3.5 rounded-xl bg-[#090909] hover:bg-[#F05262] text-white font-bold text-sm transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <CreditCard className="w-4 h-4" />
                <span>Proceed to Checkout • ₹{book.price * quantity}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          LIGHTBOX MODAL FOR HIGH-RES COVER PREVIEW
          ==================================================================== */}
      {activeLightbox && (
        <div
          onClick={() => setActiveLightbox(false)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out"
        >
          <div className="relative max-w-2xl max-h-[90vh]">
            <img
              src={selectedImage}
              alt={`${book.title} zoomed preview`}
              className="w-full h-full object-contain rounded-lg shadow-2xl"
              onError={(e) => {
                (e.target as HTMLImageElement).src = book.fallbackCover;
              }}
            />
            <button
              onClick={() => setActiveLightbox(false)}
              className="absolute -top-10 right-0 text-white hover:text-slate-300"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      {/* ====================================================================
          INTEGRATED CHECKOUT / RAZORPAY MODAL
          ==================================================================== */}
      {showCheckoutModal && (
        <RazorpayModal
          isOpen={showCheckoutModal}
          planName={`${book.title} (${selectedFormat} Edition)`}
          planId={book.id}
          amount={book.price * quantity}
          onSuccess={() => {
            setShowCheckoutModal(false);
            alert(`🎉 Order Confirmed! Thank you for purchasing "${book.title}". Your order reference has been registered with BookLeaf Publishing.`);
          }}
          onClose={() => setShowCheckoutModal(false)}
        />
      )}
    </div>
  );
}
