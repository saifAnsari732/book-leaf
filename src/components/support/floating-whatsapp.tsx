"use client";

import React from "react";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";

export function FloatingWhatsApp() {
  return (
    <aside aria-label="WhatsApp Support Contact" className="fixed bottom-6 right-6 z-50">
      <a
        href="https://wa.me/911943550930?text=Hello%20BookLeaf%20Publishing%20Team%2C%20I%20have%20an%20inquiry%20regarding%20publishing%20my%20book."
        target="_blank"
        rel="noopener noreferrer"
        className="relative flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20be5a] text-white shadow-2xl hover:shadow-[0_8px_30px_rgba(37,211,102,0.45)] transition-all duration-300 hover:scale-110 active:scale-95 group cursor-pointer focus:outline-hidden focus:ring-4 focus:ring-[#25D366]/40"
        title="Chat on WhatsApp (+91 194 355 0930)"
      >
        <WhatsAppIcon className="w-7 h-7 fill-white text-white drop-shadow-xs" />

        {/* Pulsing Emerald Active Status Indicator */}
        <span
          className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-300 rounded-full border-2 border-white animate-pulse"
          aria-hidden="true"
        />

        {/* Floating Tooltip Bubble on Hover (Desktop) */}
        <span className="hidden sm:group-hover:inline-flex absolute right-16 px-3 py-1.5 rounded-xl bg-slate-900/90 text-white text-xs font-semibold whitespace-nowrap shadow-lg backdrop-blur-xs transition-opacity duration-200 pointer-events-none items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#25D366]" />
          Chat on WhatsApp
        </span>
      </a>
    </aside>
  );
}
