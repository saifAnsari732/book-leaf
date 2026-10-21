import React from "react";
import {
  TicketCategory,
  TicketPriority,
  TicketStatus,
} from "@/types/domain";
import { PRODUCTION_STAGES_LIST } from "@/lib/knowledge-base";
import {
  AlertCircle,
  AlertTriangle,
  ArrowDown,
  CheckCircle2,
  Clock,
  FileText,
  HelpCircle,
  IndianRupee,
  Layers,
  Printer,
  Truck,
  XCircle,
} from "lucide-react";

export function formatINR(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function formatNullableINR(
  amount: number | null | undefined,
  fallbackText = "TBD (In Production)"
): string {
  if (amount === null || amount === undefined) {
    return fallbackText;
  }
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "Not yet scheduled";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function TicketStatusBadge({ status }: { status: TicketStatus }) {
  const styles: Record<
    TicketStatus,
    { bg: string; icon: React.ReactNode }
  > = {
    Open: {
      bg: "bg-blue-50 text-blue-800 border-blue-200",
      icon: <AlertCircle className="h-3.5 w-3.5 text-blue-600" aria-hidden="true" />,
    },
    "In Progress": {
      bg: "bg-amber-50 text-amber-800 border-amber-200",
      icon: <Clock className="h-3.5 w-3.5 text-amber-600" aria-hidden="true" />,
    },
    Resolved: {
      bg: "bg-emerald-50 text-emerald-800 border-emerald-200",
      icon: (
        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
      ),
    },
    Closed: {
      bg: "bg-slate-100 text-slate-700 border-slate-300",
      icon: <XCircle className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />,
    },
  };

  const current = styles[status] || styles.Open;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${current.bg}`}
    >
      {current.icon}
      {status}
    </span>
  );
}

export function TicketPriorityBadge({
  priority,
}: {
  priority: TicketPriority;
}) {
  const styles: Record<
    TicketPriority,
    { bg: string; icon: React.ReactNode }
  > = {
    Critical: {
      bg: "bg-red-50 text-red-800 border-red-200",
      icon: (
        <AlertTriangle className="h-3.5 w-3.5 text-red-600" aria-hidden="true" />
      ),
    },
    High: {
      bg: "bg-orange-50 text-orange-800 border-orange-200",
      icon: (
        <AlertCircle className="h-3.5 w-3.5 text-orange-600" aria-hidden="true" />
      ),
    },
    Medium: {
      bg: "bg-blue-50 text-blue-800 border-blue-200",
      icon: <Clock className="h-3.5 w-3.5 text-blue-600" aria-hidden="true" />,
    },
    Low: {
      bg: "bg-slate-100 text-slate-700 border-slate-200",
      icon: (
        <ArrowDown className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
      ),
    },
  };

  const current = styles[priority] || styles.Medium;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-semibold ${current.bg}`}
    >
      {current.icon}
      {priority}
    </span>
  );
}

export function TicketCategoryBadge({
  category,
}: {
  category: TicketCategory;
}) {
  const icons: Record<TicketCategory, React.ReactNode> = {
    "Royalty & Payments": (
      <IndianRupee className="h-3.5 w-3.5 text-emerald-700" aria-hidden="true" />
    ),
    "ISBN & Metadata Issues": (
      <FileText className="h-3.5 w-3.5 text-indigo-700" aria-hidden="true" />
    ),
    "Printing & Quality": (
      <Printer className="h-3.5 w-3.5 text-rose-700" aria-hidden="true" />
    ),
    "Distribution & Availability": (
      <Truck className="h-3.5 w-3.5 text-sky-700" aria-hidden="true" />
    ),
    "Book Status & Production Updates": (
      <Layers className="h-3.5 w-3.5 text-amber-700" aria-hidden="true" />
    ),
    "General Inquiry": (
      <HelpCircle className="h-3.5 w-3.5 text-slate-600" aria-hidden="true" />
    ),
  };

  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-800">
      {icons[category]}
      {category}
    </span>
  );
}

export function BookProductionStagePipeline({ status }: { status: string }) {
  const isPublished = status === "Published & Live";
  let currentStageIndex = 8;

  if (!isPublished) {
    const normalized = status.toLowerCase();
    if (normalized.includes("manuscript")) currentStageIndex = 0;
    else if (normalized.includes("editing")) currentStageIndex = 1;
    else if (normalized.includes("cover design")) currentStageIndex = 2;
    else if (normalized.includes("typesetting")) currentStageIndex = 3;
    else if (normalized.includes("proofreading")) currentStageIndex = 4;
    else if (normalized.includes("isbn")) currentStageIndex = 5;
    else if (normalized.includes("printing")) currentStageIndex = 6;
    else if (normalized.includes("distribution")) currentStageIndex = 7;
    else currentStageIndex = 2;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-slate-700">
          Pipeline Stage:{" "}
          <span
            className={
              isPublished
                ? "text-emerald-700 font-semibold"
                : "text-amber-700 font-semibold"
            }
          >
            {status}
          </span>
        </span>
        <span className="text-slate-500">
          Step {currentStageIndex + 1} of {PRODUCTION_STAGES_LIST.length}
        </span>
      </div>
      <div className="grid grid-cols-9 gap-1">
        {PRODUCTION_STAGES_LIST.map((stageName, idx) => {
          const completed = idx <= currentStageIndex;
          const isCurrent = idx === currentStageIndex && !isPublished;
          return (
            <div key={stageName} className="group relative">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  isPublished
                    ? "bg-emerald-500"
                    : isCurrent
                    ? "bg-amber-500 animate-pulse"
                    : completed
                    ? "bg-[#1B4D7E]"
                    : "bg-slate-200"
                }`}
                title={stageName}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
