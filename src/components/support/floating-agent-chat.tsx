"use client";

import React, { useState } from "react";
import Image from "next/image";
import { MessageCircle, X, Send, Sparkles, Clock, ShieldCheck } from "lucide-react";

export function FloatingAgentChat() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Chat Bubble Popup Card */}
      {isOpen && (
        <div className="mb-3 w-80 sm:w-96 rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden animate-fade-in flex flex-col">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-[#0F223D] to-[#17365D] text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-[#F05262] bg-slate-200 shrink-0">
                <Image
                  src="https://static.elfsight.com/configurator/assets/avatars/5-female-20-small-320x320.jpg"
                  alt="Nishtha"
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
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </h4>
                <p className="text-[11px] text-slate-300">
                  Customer Success Executive
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

          {/* Body Speech Bubble */}
          <div className="p-4 bg-slate-50 space-y-3">
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs text-xs text-slate-700 space-y-2">
              <p className="font-medium leading-relaxed">
                👋 Hi there! How can I help you today?
              </p>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Whether you have questions about book publishing packages, ISBN tracking, or royalty payouts, our team is here for you!
              </p>
            </div>

            {/* Operating Hours Banner */}
            <div className="px-3 py-2 rounded-xl bg-[#FFF5F6] border border-[#FFE7E9] text-[11px] text-slate-600 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-[#F05262] shrink-0" />
              <span>Support hours: 10:00 AM – 6:00 PM IST (Mon–Sat)</span>
            </div>
          </div>

          {/* Action CTA */}
          <div className="p-4 bg-white border-t border-slate-100 space-y-2">
            <a
              href="https://wa.me/911943550930?text=Hello%20BookLeaf%20Support%2C%20I%20have%20an%20inquiry%20regarding%20publishing%20my%20book."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Chat on WhatsApp (+91 194 355 0930)</span>
            </a>
            <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>Official BookLeaf Verified WhatsApp Support</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white flex items-center justify-center shadow-xl hover:scale-105 transition-all group relative"
        title="Chat with Nishtha (BookLeaf Support)"
      >
        <MessageCircle className="w-7 h-7 fill-white text-[#25D366]" />
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-300 rounded-full border-2 border-white animate-pulse" />
      </button>
    </div>
  );
}
