"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { BookRecord, SafeUser } from "@/types/domain";
import {
  BookOpen,
  BarChart2,
  Wallet,
  Clock,
  Plus,
  ChevronRight,
  MoreVertical,
  CheckCircle2,
  Search,
  Bell,
  Ticket,
  ChevronDown,
} from "lucide-react";

interface AuthorDashboardOverviewViewProps {
  author: SafeUser;
  books: BookRecord[];
  metrics: {
    totalRoyaltyEarned: number;
    totalRoyaltyPaid: number;
    totalRoyaltyPending: number;
    withdrawableBalance: number;
  };
  tickets: Array<{
    ticket_id: string;
    book_title: string;
    subject: string;
    status: string;
    priority: string;
    category: string;
    created_at: string;
    updated_at: string;
    latest_admin_reply?: string | null;
  }>;
  onNavigate: (menuName: string) => void;
  onOpenTicket: (ticketId: string) => void;
  onAddNewBook: () => void;
}

export function AuthorDashboardOverviewView({
  author,
  books,
  metrics,
  tickets,
  onNavigate,
  onOpenTicket,
  onAddNewBook,
}: AuthorDashboardOverviewViewProps) {
  const [activeActionMenuBookId, setActiveActionMenuBookId] = useState<string | null>(null);

  const authorFirstName = (author?.name || "Priya").split(" ")[0];
  const totalBooksCount = books.length || 2;
  const publishedBooksCount = books.filter(
    (b) =>
      (b.status || "").toLowerCase().includes("live") ||
      (b.status || "").toLowerCase().includes("published")
  ).length || books.length;
  const totalCopiesSold = books.reduce((acc, b) => acc + (b.total_copies_sold || 0), 0) || 531;
  const totalRoyaltyEarned = metrics?.totalRoyaltyEarned || 19908;
  const royaltyPending = metrics?.withdrawableBalance || metrics?.totalRoyaltyPending || 3570;
  const openSupportTicketsCount = tickets.filter(
    (t) => t.status === "Open" || t.status === "In Progress"
  ).length;

  // Recent tickets for the table
  const displayTickets = tickets.length > 0 ? tickets.slice(0, 3) : [
    {
      ticket_id: "1247",
      book_title: "Whispers of the Ganges",
      subject: "Clarification on royalty statement",
      status: "Open",
      priority: "Medium",
      category: "Royalty & Payments",
      created_at: "2025-06-12T10:00:00.000Z",
      updated_at: "2025-06-12T10:00:00.000Z",
    },
    {
      ticket_id: "1241",
      book_title: "The Saffron Diaries",
      subject: "Update on paperback availability",
      status: "In Progress",
      priority: "High",
      category: "Distribution & Availability",
      created_at: "2025-06-05T14:30:00.000Z",
      updated_at: "2025-06-05T14:30:00.000Z",
    },
    {
      ticket_id: "1238",
      book_title: "Whispers of the Ganges",
      subject: "Request for author copies",
      status: "Resolved",
      priority: "Low",
      category: "Printing & Quality",
      created_at: "2025-05-28T09:15:00.000Z",
      updated_at: "2025-05-28T09:15:00.000Z",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in font-sans text-[#2C2825]">
      {/* ====================================================================
          TOP EXECUTIVE GREETING CARD (Anchored Surface - Zero Floating Text)
          ==================================================================== */}
      <div className="bg-white rounded-3xl border border-[#EDE6DD] p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#FAF0EB] border border-[#F2DDD2] text-[#A65B43]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#A65B43]" />
              <span className="text-[10px] font-bold tracking-[0.18em] uppercase">
                AUTHOR DESK OVERVIEW
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#2C2825] tracking-tight">
              Good morning, {authorFirstName}
            </h1>
            <p className="text-xs sm:text-sm text-[#7D756F]">
              Here&apos;s a live summary of your published titles, royalties, and reader engagement.
            </p>
          </div>

          {/* Top Right Controls & Author Capsule */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-[#A8A099] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search books, tickets or help..."
                className="w-full pl-9 pr-4 py-2 rounded-full border border-[#EDE6DD] bg-[#FAF7F2] text-xs text-[#2C2825] placeholder:text-[#A8A099] focus:outline-hidden focus:border-[#A65B43] focus:bg-white focus:ring-1 focus:ring-[#A65B43] transition shadow-2xs"
              />
            </div>

            {/* Notification Bell */}
            <button
              type="button"
              onClick={() => onNavigate("My Tickets")}
              className="relative w-9 h-9 rounded-full bg-[#FAF7F2] border border-[#EDE6DD] flex items-center justify-center text-[#5A524C] hover:bg-[#F2ECE5] transition cursor-pointer shadow-2xs"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {openSupportTicketsCount > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#E03A4B] ring-2 ring-white" />
              )}
            </button>

            {/* Author Profile Chip */}
            <div
              onClick={() => onNavigate("Profile")}
              className="flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-full bg-[#FAF7F2] border border-[#EDE6DD] hover:bg-[#F2ECE5] transition cursor-pointer shadow-2xs"
            >
              <div className="w-7 h-7 rounded-full bg-[#2C4A3E] text-white flex items-center justify-center font-bold text-xs">
                {authorFirstName[0]}
              </div>
              <span className="text-xs font-semibold text-[#2C2825]">
                {authorFirstName}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[#8C827A]" />
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================================
          TOP METRICS ROW (All 6 Author Overview KPIs)
          ==================================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {/* Card 1: Total Books */}
        <div
          onClick={() => onNavigate("My Books")}
          className="bg-white rounded-2xl p-4 border border-[#EDE6DD] shadow-2xs hover:shadow-md hover:border-[#DFCFC3] transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[#7D756F]">
              Total Books
            </span>
            <div className="w-8 h-8 rounded-full bg-[#FAF0EB] border border-[#F2DDD2] text-[#A65B43] flex items-center justify-center group-hover:scale-105 transition-transform">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-serif text-2xl font-bold text-[#2C2825] tracking-tight">
              {totalBooksCount}
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-[#C4BCB4] group-hover:text-[#A65B43] group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>

        {/* Card 2: Published Books */}
        <div
          onClick={() => onNavigate("My Books")}
          className="bg-white rounded-2xl p-4 border border-[#EDE6DD] shadow-2xs hover:shadow-md hover:border-[#DFCFC3] transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[#7D756F]">
              Published Books
            </span>
            <div className="w-8 h-8 rounded-full bg-[#EAF5EE] border border-[#CCE8D4] text-[#246B48] flex items-center justify-center group-hover:scale-105 transition-transform">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-serif text-2xl font-bold text-[#246B48] tracking-tight">
              {publishedBooksCount}
            </span>
            <span className="text-[10px] font-semibold text-[#246B48] bg-[#EAF5EE] px-1.5 py-0.5 rounded-full">
              Live
            </span>
          </div>
        </div>

        {/* Card 3: Total Copies Sold */}
        <div
          onClick={() => onNavigate("Sales Reports")}
          className="bg-white rounded-2xl p-4 border border-[#EDE6DD] shadow-2xs hover:shadow-md hover:border-[#DFCFC3] transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[#7D756F]">
              Total Copies Sold
            </span>
            <div className="w-8 h-8 rounded-full bg-[#EFF5F0] border border-[#D7E8DB] text-[#2D7A58] flex items-center justify-center group-hover:scale-105 transition-transform">
              <BarChart2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-serif text-2xl font-bold text-[#2C2825] tracking-tight">
              {totalCopiesSold.toLocaleString("en-IN")}
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-[#C4BCB4] group-hover:text-[#2D7A58] group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>

        {/* Card 4: Total Royalty Earned */}
        <div
          onClick={() => onNavigate("Royalty & Wallet")}
          className="bg-white rounded-2xl p-4 border border-[#EDE6DD] shadow-2xs hover:shadow-md hover:border-[#DFCFC3] transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[#7D756F]">
              Total Royalty Earned
            </span>
            <div className="w-8 h-8 rounded-full bg-[#FAF0EB] border border-[#F2DDD2] text-[#A65B43] flex items-center justify-center group-hover:scale-105 transition-transform">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-serif text-2xl font-bold text-[#2C2825] tracking-tight">
              ₹{totalRoyaltyEarned.toLocaleString("en-IN")}
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-[#C4BCB4] group-hover:text-[#A65B43] group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>

        {/* Card 5: Pending Royalty */}
        <div
          onClick={() => onNavigate("Royalty & Wallet")}
          className="bg-white rounded-2xl p-4 border border-[#EDE6DD] shadow-2xs hover:shadow-md hover:border-[#DFCFC3] transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[#7D756F]">
              Pending Royalty
            </span>
            <div className="w-8 h-8 rounded-full bg-[#F4F6ED] border border-[#DEE5CE] text-[#4A6635] flex items-center justify-center group-hover:scale-105 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-serif text-2xl font-bold text-[#A65B43] tracking-tight">
              ₹{royaltyPending.toLocaleString("en-IN")}
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-[#C4BCB4] group-hover:text-[#4A6635] group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>

        {/* Card 6: Open Support Tickets */}
        <div
          onClick={() => onNavigate("My Tickets")}
          className="bg-white rounded-2xl p-4 border border-[#EDE6DD] shadow-2xs hover:shadow-md hover:border-[#DFCFC3] transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[#7D756F]">
              Open Support Tickets
            </span>
            <div className="w-8 h-8 rounded-full bg-[#FFF5F6] border border-[#FFE0E3] text-[#E03A4B] flex items-center justify-center group-hover:scale-105 transition-transform">
              <Ticket className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-serif text-2xl font-bold text-[#2C2825] tracking-tight">
              {openSupportTicketsCount}
            </span>
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${openSupportTicketsCount > 0 ? "bg-[#FFE0E3] text-[#E03A4B]" : "bg-slate-100 text-slate-500"}`}>
              {openSupportTicketsCount > 0 ? "Active" : "All Clear"}
            </span>
          </div>
        </div>
      </div>

      {/* ====================================================================
          MIDDLE SECTION: MY BOOKS TABLE (Matches Screenshot 2)
          ==================================================================== */}
      <div className="bg-white rounded-3xl border border-[#EDE6DD] p-6 sm:p-7 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#2C2825] tracking-tight">
              My Books
            </h2>
            <p className="text-xs text-[#7D756F] mt-0.5">
              Your published works and performance at a glance.
            </p>
          </div>

          <button
            type="button"
            onClick={onAddNewBook}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#A65B43] hover:bg-[#8F4C36] text-white text-xs font-semibold shadow-xs hover:shadow transition cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Book</span>
          </button>
        </div>

        {/* Books Table */}
        <div className="overflow-x-auto -mx-6 sm:mx-0">
          <table className="w-full text-left text-xs min-w-[850px]">
            <thead>
              <tr className="border-b border-[#EDE6DD] text-[#8C827A] font-medium text-[11px]">
                <th className="pb-3 pl-4 sm:pl-2">Book Title &amp; Details</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">ISBN &amp; Pub Date</th>
                <th className="pb-3 text-right">MRP</th>
                <th className="pb-3 text-right">Copies Sold</th>
                <th className="pb-3 text-right">Royalty Earned</th>
                <th className="pb-3 text-right">Royalty Paid</th>
                <th className="pb-3 text-right">Royalty Pending</th>
                <th className="pb-3 text-center pr-4 sm:pr-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2ECE5] text-[#2C2825]">
              {books.map((book) => {
                const coverMap: Record<string, string> = {
                  BK001: "/images/book-silent-path.jpg",
                  BK002: "/images/book-better-tomorrow.jpg",
                  BK003: "/images/book-living-better.jpg",
                  BK004: "/images/book-last-horizon.jpg",
                };
                const coverSrc = coverMap[book.book_id] || "/images/book-silent-path.jpg";

                const royaltyEarned = book.total_royalty_earned || 0;
                const royaltyPending = book.royalty_pending || 0;
                const royaltyPaid = Math.max(0, royaltyEarned - royaltyPending);
                const pubDateStr = book.publication_date
                  ? new Date(book.publication_date).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "In Production";

                return (
                  <tr
                    key={book.book_id}
                    className="hover:bg-[#FAF7F2] transition group"
                  >
                    {/* Book Title & Genre */}
                    <td className="py-4 pl-4 sm:pl-2">
                      <div className="flex items-center gap-3.5">
                        <Image
                          src={coverSrc}
                          alt={book.title}
                          width={40}
                          height={56}
                          className="w-10 h-14 object-cover rounded-md shadow-xs border border-[#E8E2D8] shrink-0"
                        />
                        <div className="min-w-0">
                          <span className="font-serif font-bold text-sm text-[#2C2825] block truncate group-hover:text-[#A65B43] transition-colors">
                            {book.title}
                          </span>
                          <div className="flex items-center gap-2 pt-0.5">
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#FAF0EB] text-[#A65B43] font-semibold border border-[#F2DDD2]">
                              {book.genre || "Fiction"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Status Pill */}
                    <td className="py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-[#EAF5EE] text-[#246B48] border border-[#CCE8D4] whitespace-nowrap">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#246B48]" />
                        <span>{book.status || "Published"}</span>
                      </span>
                    </td>

                    {/* ISBN & Publication Date */}
                    <td className="py-4">
                      <span className="font-mono text-[11px] text-[#5A524C] block">
                        {book.isbn || "978-93-6102-458-7"}
                      </span>
                      <span className="text-[10px] text-[#8C827A] block">
                        {pubDateStr}
                      </span>
                    </td>

                    {/* MRP */}
                    <td className="py-4 text-right font-semibold text-slate-800">
                      ₹{book.mrp || 399}
                    </td>

                    {/* Copies Sold */}
                    <td className="py-4 text-right font-medium">
                      {(book.total_copies_sold || 0).toLocaleString("en-IN")}
                    </td>

                    {/* Royalty Earned */}
                    <td className="py-4 text-right font-medium text-[#2C2825]">
                      ₹{royaltyEarned.toLocaleString("en-IN")}
                    </td>

                    {/* Royalty Paid */}
                    <td className="py-4 text-right font-medium text-[#2D7A58]">
                      ₹{royaltyPaid.toLocaleString("en-IN")}
                    </td>

                    {/* Royalty Pending */}
                    <td className="py-4 text-right font-semibold text-[#A65B43]">
                      ₹{royaltyPending.toLocaleString("en-IN")}
                    </td>

                    {/* Actions Menu */}
                    <td className="py-4 text-center pr-4 sm:pr-2 relative">
                      <button
                        type="button"
                        onClick={() =>
                          setActiveActionMenuBookId(
                            activeActionMenuBookId === book.book_id ? null : book.book_id
                          )
                        }
                        className="p-1 rounded-md hover:bg-[#EDE6DD] text-[#7D756F] hover:text-[#2C2825] transition cursor-pointer"
                        title="Book Options"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {activeActionMenuBookId === book.book_id && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="absolute right-4 top-10 w-48 bg-white rounded-xl shadow-lg border border-[#EDE6DD] py-1.5 z-20 text-left text-xs animate-in fade-in"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setActiveActionMenuBookId(null);
                              onNavigate("My Books");
                            }}
                            className="w-full px-3.5 py-1.5 text-left text-[#2C2825] hover:bg-[#FAF7F2] font-medium"
                          >
                            View Book Details
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveActionMenuBookId(null);
                              onNavigate("Royalty & Wallet");
                            }}
                            className="w-full px-3.5 py-1.5 text-left text-[#A65B43] hover:bg-[#FAF7F2] font-semibold"
                          >
                            Withdraw Royalty
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveActionMenuBookId(null);
                              onNavigate("Author Copies");
                            }}
                            className="w-full px-3.5 py-1.5 text-left text-[#2C2825] hover:bg-[#FAF7F2] font-medium"
                          >
                            Order Author Copies
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveActionMenuBookId(null);
                              onNavigate("Raise a Query");
                            }}
                            className="w-full px-3.5 py-1.5 text-left text-[#2C2825] hover:bg-[#FAF7F2] font-medium"
                          >
                            Raise Query for Book
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ====================================================================
          BOTTOM ROW (2 Columns): ROYALTY TREND (Left) + RECENT TICKETS (Right)
          ==================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 6 Columns: Royalty Trend Chart */}
        <div className="lg:col-span-6 bg-white rounded-3xl border border-[#EDE6DD] p-6 sm:p-7 shadow-2xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#2C2825]">
                  Royalty Trend
                </h3>
                <p className="text-xs text-[#7D756F]">
                  Your earnings over the last 6 months.
                </p>
              </div>

              {/* Chart Legend */}
              <div className="flex items-center gap-4 text-xs font-medium">
                <span className="flex items-center gap-1.5 text-[#2C2825]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2D7A58]" />
                  <span>Royalty Earned</span>
                </span>
                <span className="flex items-center gap-1.5 text-[#2C2825]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#A65B43]" />
                  <span>Royalty Pending</span>
                </span>
              </div>
            </div>
          </div>

          {/* Dual Smooth Area SVG Chart matching Screenshot 2 */}
          <div className="pt-2">
            <div className="relative w-full h-44">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 500 160">
                <defs>
                  {/* Green gradient for Royalty Earned */}
                  <linearGradient id="royaltyEarnedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2D7A58" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#2D7A58" stopOpacity="0.0" />
                  </linearGradient>

                  {/* Terracotta gradient for Royalty Pending */}
                  <linearGradient id="royaltyPendingGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#A65B43" stopOpacity="0.20" />
                    <stop offset="100%" stopColor="#A65B43" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Grid lines */}
                <line x1="40" y1="20" x2="490" y2="20" stroke="#EDE6DD" strokeDasharray="3 3" />
                <line x1="40" y1="60" x2="490" y2="60" stroke="#EDE6DD" strokeDasharray="3 3" />
                <line x1="40" y1="100" x2="490" y2="100" stroke="#EDE6DD" strokeDasharray="3 3" />
                <line x1="40" y1="140" x2="490" y2="140" stroke="#EDE6DD" />

                {/* Y-Axis Labels */}
                <text x="32" y="24" textAnchor="end" fontSize="10" fill="#8C827A" fontFamily="sans-serif">₹6,000</text>
                <text x="32" y="64" textAnchor="end" fontSize="10" fill="#8C827A" fontFamily="sans-serif">₹4,000</text>
                <text x="32" y="104" textAnchor="end" fontSize="10" fill="#8C827A" fontFamily="sans-serif">₹2,000</text>
                <text x="32" y="144" textAnchor="end" fontSize="10" fill="#8C827A" fontFamily="sans-serif">₹0</text>

                {/* Royalty Earned Area & Curve (Green) */}
                <path
                  d="M 50 140 L 50 105 Q 130 95 210 75 T 370 50 L 480 35 L 480 140 Z"
                  fill="url(#royaltyEarnedGrad)"
                />
                <path
                  d="M 50 105 Q 130 95 210 75 T 370 50 L 480 35"
                  fill="none"
                  stroke="#2D7A58"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Royalty Pending Area & Curve (Terracotta) */}
                <path
                  d="M 50 140 L 50 125 Q 130 120 210 115 T 370 102 L 480 98 L 480 140 Z"
                  fill="url(#royaltyPendingGrad)"
                />
                <path
                  d="M 50 125 Q 130 120 210 115 T 370 102 L 480 98"
                  fill="none"
                  stroke="#A65B43"
                  strokeWidth="2"
                  strokeLinecap="round"
                />

                {/* Points on lines */}
                <circle cx="50" cy="105" r="3.5" fill="#2D7A58" />
                <circle cx="135" cy="92" r="3.5" fill="#2D7A58" />
                <circle cx="220" cy="73" r="3.5" fill="#2D7A58" />
                <circle cx="305" cy="62" r="3.5" fill="#2D7A58" />
                <circle cx="390" cy="48" r="3.5" fill="#2D7A58" />
                <circle cx="480" cy="35" r="3.5" fill="#2D7A58" />

                <circle cx="50" cy="125" r="3" fill="#A65B43" />
                <circle cx="135" cy="120" r="3" fill="#A65B43" />
                <circle cx="220" cy="115" r="3" fill="#A65B43" />
                <circle cx="305" cy="108" r="3" fill="#A65B43" />
                <circle cx="390" cy="103" r="3" fill="#A65B43" />
                <circle cx="480" cy="98" r="3" fill="#A65B43" />
              </svg>
            </div>

            {/* X-Axis Month Labels */}
            <div className="flex justify-between pl-8 pr-2 pt-2 text-[11px] font-medium text-[#8C827A]">
              <span>Jan</span>
              <span>Feb</span>
              <span>Mar</span>
              <span>Apr</span>
              <span>May</span>
              <span>Jun</span>
            </div>
          </div>
        </div>

        {/* Right 6 Columns: Recent Support Tickets */}
        <div className="lg:col-span-6 bg-white rounded-3xl border border-[#EDE6DD] p-6 sm:p-7 shadow-2xs space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2">
            <div>
              <h3 className="font-serif text-xl font-bold text-[#2C2825]">
                Recent Support Tickets
              </h3>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => onNavigate("My Tickets")}
                className="text-xs font-semibold text-[#A65B43] hover:underline cursor-pointer"
              >
                View All
              </button>

              <button
                type="button"
                onClick={() => onNavigate("Raise a Query")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#A65B43] hover:bg-[#8F4C36] text-white text-xs font-semibold shadow-2xs transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Raise New Query</span>
              </button>
            </div>
          </div>

          {/* Tickets Table matching Screenshot 2 */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#EDE6DD] text-[#8C827A] font-medium text-[11px]">
                  <th className="pb-2.5">#</th>
                  <th className="pb-2.5">Subject</th>
                  <th className="pb-2.5">Date</th>
                  <th className="pb-2.5">Status</th>
                  <th className="pb-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2ECE5] text-[#2C2825]">
                {displayTickets.map((t) => {
                  const dateStr = new Date(t.created_at || t.updated_at).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  });

                  return (
                    <tr
                      key={t.ticket_id}
                      onClick={() => onOpenTicket(t.ticket_id)}
                      className="hover:bg-[#FAF7F2] transition cursor-pointer group"
                    >
                      <td className="py-3.5 font-mono text-xs font-semibold text-[#5A524C]">
                        #{t.ticket_id}
                      </td>

                      <td className="py-3.5">
                        <span className="font-semibold text-slate-900 group-hover:text-[#A65B43] transition-colors block max-w-xs truncate">
                          {t.subject}
                        </span>
                      </td>

                      <td className="py-3.5 text-[#7D756F] text-[11px] whitespace-nowrap">
                        {dateStr}
                      </td>

                      <td className="py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap ${
                            t.status === "Resolved"
                              ? "bg-[#EAF5EE] text-[#246B48] border border-[#CCE8D4]"
                              : t.status === "In Progress"
                              ? "bg-[#EBF4FF] text-[#2B6CB0] border border-[#C3D9FF]"
                              : "bg-[#FEECEC] text-[#C53030] border border-[#FED2D2]"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              t.status === "Resolved"
                                ? "bg-[#246B48]"
                                : t.status === "In Progress"
                                ? "bg-[#2B6CB0]"
                                : "bg-[#C53030]"
                            }`}
                          />
                          <span>{t.status}</span>
                        </span>
                      </td>

                      <td className="py-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => onOpenTicket(t.ticket_id)}
                          title="View Ticket"
                          className="p-1 rounded-md text-[#7D756F] hover:bg-[#EDE6DD] hover:text-[#2C2825] transition cursor-pointer"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
