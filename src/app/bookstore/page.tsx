"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Check,
  ChevronRight,
  Filter,
  Search,
  ShoppingBag,
  Star,
  SlidersHorizontal,
} from "lucide-react";
import { OFFICIAL_BOOKSTORE_CATALOG, OfficialBook } from "@/data/bookstore-catalog";

export default function BookstorePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string>("All");
  const [sortBy, setSortBy] = useState<string>("featured");

  const genres = [
    "All",
    "Poetry",
    "Finance & Wealth",
    "Contemporary Fiction",
    "Philosophy & Drama",
    "Spiritual & Healing",
    "Hindi Sahitya",
  ];

  const filteredBooks = OFFICIAL_BOOKSTORE_CATALOG.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.isbn.includes(searchQuery);

    const matchesGenre =
      selectedGenre === "All" || book.genre === selectedGenre;

    return matchesSearch && matchesGenre;
  }).sort((a, b) => {
    if (sortBy === "price-low") return a.price - b.price;
    if (sortBy === "price-high") return b.price - a.price;
    if (sortBy === "rating") return b.rating - a.rating;
    if (sortBy === "title-asc") return a.title.localeCompare(b.title);
    return 0; // featured default
  });

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans selection:bg-[#F05262]/20 selection:text-[#F05262]">
      {/* Top Banner Notice */}
      <div className="bg-[#3D081B] text-[#F2EFDD] text-[11px] sm:text-xs py-2 px-4 text-center font-medium tracking-wide">
        <span>BookLeaf Publishing Bookstore • 10,000+ Paperbacks &amp; eBooks • Free Pan-India Delivery on orders above ₹499</span>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 sm:gap-8">
            <Link
              href="/"
              className="group flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span>Back to Main Portal</span>
            </Link>

            <Link href="/bookstore" className="flex items-center gap-2">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900">
                BookLeaf<span className="text-[#F05262]">.</span>
              </span>
              <span className="text-[11px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                Official Bookstore
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium text-slate-700">
            <Link
              href="/create_book"
              className="hidden sm:inline-flex px-4 py-2 rounded-full bg-[#F05262] text-white font-bold hover:bg-[#e04555] transition shadow-xs"
            >
              Publish With Us
            </Link>
          </div>
        </div>
      </header>

      {/* Breadcrumb Navigation */}
      <div className="bg-[#FAF9F5] border-b border-slate-200/70 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Link href="/" className="hover:text-slate-900 transition">
              Home
            </Link>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className="font-semibold text-slate-900">Official Bookstore</span>
          </div>
        </div>
      </div>

      {/* Hero / Catalog Header */}
      <section className="bg-gradient-to-b from-[#FAF9F5] to-white py-10 sm:py-14 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <span className="inline-block px-3 py-1 rounded-full bg-[#F05262]/10 text-[#F05262] text-xs font-bold uppercase tracking-wider">
            Official Bestsellers &amp; New Releases
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#3D081B] tracking-tight">
            BookLeaf Publishing Bookstore
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Discover bestselling poetry, insightful memoirs, financial roadmaps, and contemporary literature published directly under the BookLeaf imprint.
          </p>
        </div>
      </section>

      {/* Catalog & Filter Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {/* Search & Sort Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, author, genre, or ISBN..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-[#F05262] focus:ring-1 focus:ring-[#F05262]"
            />
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-3 self-end md:self-auto">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5" /> Sort by:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs sm:text-sm bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-hidden focus:border-[#F05262]"
            >
              <option value="featured">Featured / Bestselling</option>
              <option value="rating">Highest Rated</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="title-asc">Title: A to Z</option>
            </select>
          </div>
        </div>

        {/* Genre Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {genres.map((genre) => (
            <button
              key={genre}
              type="button"
              onClick={() => setSelectedGenre(genre)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                selectedGenre === genre
                  ? "bg-[#3D081B] text-[#F2EFDD] shadow-xs"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              {genre}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div>
          <div className="flex items-center justify-between pb-4">
            <p className="text-xs font-semibold text-slate-500">
              Showing <strong>{filteredBooks.length}</strong> official titles
            </p>
          </div>

          {filteredBooks.length === 0 ? (
            <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <BookOpen className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">No books found</h3>
              <p className="text-xs text-slate-500">
                Try adjusting your search query or switching categories.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedGenre("All");
                }}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-[#F05262] transition"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {filteredBooks.map((book) => (
                <Link
                  key={book.id}
                  href={`/book/${book.id}`}
                  className="group bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                >
                  {/* Image Container with Subtle Hover Zoom */}
                  <div className="relative bg-[#F8F8F7] p-4 flex items-center justify-center aspect-[1/1.35] overflow-hidden">
                    <img
                      src={book.frontCover}
                      alt={book.title}
                      className="w-full h-full object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = book.fallbackCover;
                      }}
                    />

                    {/* Price Tag */}
                    <div className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-white/95 backdrop-blur-xs text-[11px] font-extrabold text-slate-900 border border-slate-200 shadow-2xs">
                      ₹{book.price}
                    </div>

                    {/* Quick view badge on hover */}
                    <div className="absolute bottom-2 inset-x-4 bg-slate-900/85 text-white text-[11px] font-bold py-1.5 rounded-lg text-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      View Official Details
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-1">
                        <span>{book.genre}</span>
                        <div className="flex items-center gap-0.5 text-amber-500">
                          <Star className="w-3 h-3 fill-amber-400" />
                          <span>{book.rating}</span>
                        </div>
                      </div>

                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-[#F05262] transition">
                        {book.title}
                      </h3>

                      <p className="text-[11px] text-slate-600 line-clamp-1 mt-0.5">
                        By {book.author}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-extrabold text-[#3D081B] text-sm sm:text-base">
                          Rs. {book.price}.00
                        </span>
                        {book.compareAtPrice && (
                          <span className="text-[10px] text-slate-400 line-through ml-1.5">
                            ₹{book.compareAtPrice}
                          </span>
                        )}
                      </div>

                      <span className="text-[11px] font-bold text-[#F05262] group-hover:translate-x-1 transition-transform">
                        Details →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer Notice */}
      <footer className="border-t border-slate-200 py-8 bg-[#FAF9F5] text-center text-xs text-slate-500">
        <p>© 2026 BookLeaf Publishing Bookstore. A division of Libresco Feeds Pvt. Ltd. All rights reserved.</p>
      </footer>
    </div>
  );
}
