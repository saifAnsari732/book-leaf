"use client";

import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
  ExternalLink,
} from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: ToastAction;
}

interface ToastContextType {
  toast: {
    success: (title: string, message?: string, action?: ToastAction) => string;
    error: (title: string, message?: string, action?: ToastAction) => string;
    warning: (title: string, message?: string, action?: ToastAction) => string;
    info: (title: string, message?: string, action?: ToastAction) => string;
    dismiss: (id: string) => void;
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (type: ToastType, title: string, message?: string, action?: ToastAction) => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const duration = type === "error" ? 6000 : 4500;

      const newToast: ToastItem = {
        id,
        type,
        title,
        message,
        duration,
        action,
      };

      setToasts((prev) => [...prev.slice(-4), newToast]); // Keep maximum 5 concurrent toasts

      return id;
    },
    []
  );

  const toastMethods = {
    success: (title: string, message?: string, action?: ToastAction) =>
      addToast("success", title, message, action),
    error: (title: string, message?: string, action?: ToastAction) =>
      addToast("error", title, message, action),
    warning: (title: string, message?: string, action?: ToastAction) =>
      addToast("warning", title, message, action),
    info: (title: string, message?: string, action?: ToastAction) =>
      addToast("info", title, message, action),
    dismiss,
  };

  return (
    <ToastContext.Provider value={{ toast: toastMethods }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context.toast;
}

// ============================================================================
// Toast Container & Individual Toast Item Component
// ============================================================================

function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}) {
  return (
    <div
      aria-live="polite"
      className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-md w-full pointer-events-none px-4 sm:px-0"
    >
      {toasts.map((toast) => (
        <SingleToast key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function SingleToast({
  toast,
  onDismiss,
}: {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}) {
  const [isPaused, setIsPaused] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    if (isPaused) return;

    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, toast.duration || 4500);

    timeoutRef.current = timer;
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, isPaused, onDismiss]);

  const styleConfig = {
    success: {
      bg: "bg-white",
      border: "border-emerald-200/90",
      accent: "bg-emerald-500",
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
      titleColor: "text-slate-900",
      subColor: "text-slate-600",
      indicatorBg: "bg-emerald-50",
    },
    error: {
      bg: "bg-white",
      border: "border-rose-200/90",
      accent: "bg-rose-500",
      icon: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />,
      titleColor: "text-slate-900",
      subColor: "text-slate-600",
      indicatorBg: "bg-rose-50",
    },
    warning: {
      bg: "bg-white",
      border: "border-amber-200/90",
      accent: "bg-amber-500",
      icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
      titleColor: "text-slate-900",
      subColor: "text-slate-600",
      indicatorBg: "bg-amber-50",
    },
    info: {
      bg: "bg-white",
      border: "border-indigo-200/90",
      accent: "bg-indigo-500",
      icon: <Info className="w-5 h-5 text-indigo-600 shrink-0" />,
      titleColor: "text-slate-900",
      subColor: "text-slate-600",
      indicatorBg: "bg-indigo-50",
    },
  }[toast.type];

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`pointer-events-auto relative overflow-hidden rounded-2xl ${styleConfig.bg} border ${styleConfig.border} p-4 shadow-xl shadow-slate-900/10 transition-all duration-300 transform translate-y-0 opacity-100 flex items-start gap-3.5 backdrop-blur-md`}
    >
      {/* Type Icon with Soft Background Bubble */}
      <div
        className={`w-9 h-9 rounded-xl ${styleConfig.indicatorBg} flex items-center justify-center shrink-0 border border-slate-100`}
      >
        {styleConfig.icon}
      </div>

      {/* Content Text */}
      <div className="flex-1 min-w-0 pr-2">
        <h4 className={`text-sm font-bold tracking-tight ${styleConfig.titleColor}`}>
          {toast.title}
        </h4>
        {toast.message && (
          <p className={`text-xs mt-0.5 leading-relaxed ${styleConfig.subColor}`}>
            {toast.message}
          </p>
        )}

        {/* Optional Action Button */}
        {toast.action && (
          <button
            onClick={() => {
              toast.action?.onClick();
              onDismiss(toast.id);
            }}
            className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100/80 px-2.5 py-1 rounded-lg transition"
          >
            <span>{toast.action.label}</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Close Button */}
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-lg transition shrink-0"
        title="Dismiss Notification"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Progress Bar Timer Animation */}
      <div
        className={`absolute bottom-0 left-0 h-0.5 ${styleConfig.accent}`}
        style={{
          width: "100%",
          animation: `shrinkWidth ${toast.duration || 4500}ms linear forwards`,
          animationPlayState: isPaused ? "paused" : "running",
        }}
      />
    </div>
  );
}
