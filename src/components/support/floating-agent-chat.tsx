"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  MessageCircle,
  X,
  Send,
  BookOpen,
  Clock,
  ShieldCheck,
  User,
  ChevronRight,
  Headphones,
} from "lucide-react";

interface ChatMessage {
  id: string;
  role: "assistant" | "user";
  content: string;
  timestamp: string;
}

export function FloatingAgentChat() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      role: "assistant",
      content:
        "Hello! I'm Nishtha from BookLeaf Publishing Support. How can I assist you with publishing packages, 100% royalty splits, ISBN assignment, or author tools today?",
      timestamp: "Just now",
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Do not render floating bubble on dashboard pages to keep dashboard clean and professional
  const isDashboard =
    pathname?.startsWith("/author-dashboard") || pathname?.startsWith("/dashboard");

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  if (isDashboard) {
    return null;
  }

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      role: "user",
      content: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const historyPayload = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/ai/gemini-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: trimmed,
          history: historyPayload,
        }),
      });

      const data = await res.json();
      const botResponse =
        data?.response ||
        "I'm here to assist you! You can publish your book in 2–3 weeks with BookLeaf with an 80/20 royalty split. Feel free to ask more!";

      const assistantMsg: ChatMessage = {
        id: `assistant_${Date.now()}`,
        role: "assistant",
        content: botResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant_${Date.now()}`,
          role: "assistant",
          content:
            "I experienced a brief connection hiccup. BookLeaf support is also available via WhatsApp at +91 194 355 0930!",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    "How does 100% royalty work?",
    "What are your publishing packages?",
    "How long does publishing take?",
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Chat Bubble Popup Card */}
      {isOpen && (
        <div className="mb-3 w-80 sm:w-96 rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden animate-fade-in flex flex-col h-[520px]">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-[#0F223D] via-[#0F4C3A] to-[#17365D] text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-[#00A859] bg-slate-200 shrink-0">
                <Image
                  src="https://static.elfsight.com/configurator/assets/avatars/5-female-20-small-320x320.jpg"
                  alt="Nishtha - BookLeaf Author Support"
                  width={44}
                  height={44}
                  className="w-full h-full object-cover"
                  unoptimized
                />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-900" />
              </div>
              <div>
                <h4 className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
                  <span>Nishtha</span>
                  <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-medium border border-emerald-500/30">
                    Help Desk
                  </span>
                </h4>
                <p className="text-[11px] text-slate-300">
                  Author Support Specialist • Online
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 p-3.5 bg-slate-50 overflow-y-auto space-y-3 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.role === "assistant" && (
                  <div className="w-7 h-7 rounded-full bg-[#0F4C3A] text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Headphones className="w-3.5 h-3.5 text-emerald-200" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl p-3 space-y-1 shadow-2xs ${
                    m.role === "user"
                      ? "bg-[#0F4C3A] text-white rounded-br-xs"
                      : "bg-white text-slate-800 border border-slate-200 rounded-bl-xs"
                  }`}
                >
                  <p className="leading-relaxed whitespace-pre-wrap">{m.content}</p>
                  <span
                    className={`block text-[9px] ${
                      m.role === "user" ? "text-emerald-200/80 text-right" : "text-slate-400"
                    }`}
                  >
                    {m.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-slate-500 text-xs pl-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-[11px]">Consulting publishing guidelines...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="px-3 py-2 bg-slate-100 border-t border-slate-200 flex gap-1.5 overflow-x-auto no-scrollbar shrink-0">
            {quickPrompts.map((q, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInput(q);
                }}
                className="shrink-0 px-2.5 py-1 rounded-full bg-white border border-slate-200 text-[10px] text-slate-700 hover:border-[#0F4C3A] hover:text-[#0F4C3A] transition truncate max-w-[150px]"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Box & WhatsApp Row */}
          <div className="p-3 bg-white border-t border-slate-200 shrink-0 space-y-2">
            <form onSubmit={handleSend} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about publishing, royalties, ISBN..."
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:border-[#0F4C3A] focus:ring-1 focus:ring-[#0F4C3A] bg-slate-50 focus:bg-white"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="w-9 h-9 rounded-xl bg-[#0F4C3A] hover:bg-[#0A3B2D] disabled:opacity-40 text-white flex items-center justify-center shrink-0 transition"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-100 text-slate-500">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>Verified Editorial Helpdesk</span>
              </span>
              <a
                href="https://wa.me/911943550930?text=Hello%20BookLeaf%20Support%2C%20I%20have%20an%20inquiry%20regarding%20publishing%20my%20book."
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#25D366] font-bold hover:underline flex items-center gap-0.5"
              >
                <span>WhatsApp Live Chat</span>
                <ChevronRight className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle chat assistant"
        className="w-14 h-14 rounded-full bg-[#0F4C3A] hover:bg-[#0A3B2D] text-white flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 group relative"
      >
        <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-white ring-1 ring-slate-200" />
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6 fill-white" />
        )}
      </button>
    </div>
  );
}
