import { z } from "zod";

export const TICKET_CATEGORIES = [
  "Royalty & Payments",
  "ISBN & Metadata Issues",
  "Printing & Quality",
  "Distribution & Availability",
  "Book Status & Production Updates",
  "General Inquiry",
] as const;

export type TicketCategory = (typeof TICKET_CATEGORIES)[number];

export const TICKET_PRIORITIES = [
  "Critical",
  "High",
  "Medium",
  "Low",
] as const;

export type TicketPriority = (typeof TICKET_PRIORITIES)[number];

export const TICKET_STATUSES = [
  "Open",
  "In Progress",
  "Resolved",
  "Closed",
] as const;

export type TicketStatus = (typeof TICKET_STATUSES)[number];

export const USER_ROLES = ["AUTHOR", "ADMIN"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const AI_PROCESSING_STATUSES = [
  "Completed",
  "Fallback",
  "Failed",
  "Pending",
] as const;
export type AIProcessingStatus = (typeof AI_PROCESSING_STATUSES)[number];

// ============================================================================
// Core Entity Interfaces
// ============================================================================

export interface UserRecord {
  user_id: string;
  author_id: string | null; // AUTH001..AUTH010 for authors, null for admins
  name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  phone: string | null;
  city: string | null;
  joined_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface SafeUser {
  user_id: string;
  author_id: string | null;
  name: string;
  email: string;
  role: UserRole;
  phone: string | null;
  city: string | null;
  joined_date: string | null;
}

export interface BookRecord {
  book_id: string;
  author_id: string;
  title: string;
  isbn: string;
  genre: string;
  publication_date: string | null;
  status: string;
  mrp: number | null;
  author_royalty_per_copy: number | null;
  total_copies_sold: number;
  total_royalty_earned: number;
  royalty_paid: number;
  royalty_pending: number;
  last_royalty_payout_date: string | null;
  print_partner: string | null;
  available_on: string[];
  created_at: string;
  updated_at: string;
}

export interface AttachmentItem {
  name: string;
  size: number;
  type: string;
  url?: string;
  fileId?: string;
  provider?: "imagekit" | "local-preview";
}

export interface AIMetadata {
  status: AIProcessingStatus;
  provider: "gemini" | "rule-fallback";
  model: string;
  suggested_category: TicketCategory;
  suggested_priority: TicketPriority;
  rationale: string;
  draft_reply: string;
  human_overridden: boolean;
  tokens_estimated: number;
  tokens_saved_pct: number;
  failure_reason: string | null;
  analyzed_at: string;
}

export interface TicketRecord {
  ticket_id: string;
  author_id: string;
  author_name: string;
  author_email: string;
  book_id: string | null; // null means "General / Account Level"
  book_title: string;
  subject: string;
  description: string;
  attachments: AttachmentItem[];
  status: TicketStatus;
  category: TicketCategory;
  priority: TicketPriority;
  assigned_to: string | null;
  ai_metadata: AIMetadata;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface TicketMessageRecord {
  message_id: string;
  ticket_id: string;
  sender_role: UserRole;
  sender_name: string;
  sender_id: string;
  content: string;
  attachments: AttachmentItem[];
  created_at: string;
}

export interface InternalNoteRecord {
  note_id: string;
  ticket_id: string;
  admin_id: string;
  admin_name: string;
  content: string;
  created_at: string;
}

export interface AuditLogRecord {
  log_id: string;
  ticket_id: string;
  actor_id: string;
  actor_name: string;
  actor_role: UserRole | "AI_SYSTEM";
  action: string;
  details: Record<string, unknown>;
  created_at: string;
}

// ============================================================================
// Strict Zod Validation Schemas for APIs & AI Output
// ============================================================================

export const LoginInputSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email address is required")
    .email("Please enter a valid email address")
    .transform((v) => v.toLowerCase()),
  password: z.string().min(1, "Password is required"),
});

export const AttachmentSchema = z.object({
  name: z.string().trim().min(1).max(200),
  size: z
    .number()
    .int()
    .nonnegative()
    .max(5 * 1024 * 1024, "Attachment size cannot exceed 5MB"),
  type: z
    .string()
    .trim()
    .refine(
      (t) =>
        [
          "image/jpeg",
          "image/png",
          "image/webp",
          "application/pdf",
          "text/plain",
        ].includes(t),
      "Only JPG, PNG, WEBP, PDF, or TXT attachments are allowed"
    ),
  url: z.string().trim().max(2000).optional(),
  fileId: z.string().trim().max(200).optional(),
  provider: z.enum(["imagekit", "local-preview"]).optional(),
});

export const CreateTicketInputSchema = z.object({
  book_id: z
    .string()
    .trim()
    .nullable()
    .optional()
    .transform((v) => (!v || v === "GENERAL" ? null : v)),
  subject: z
    .string()
    .trim()
    .min(5, "Subject must be at least 5 characters")
    .max(180, "Subject must be under 180 characters"),
  description: z
    .string()
    .trim()
    .min(15, "Please provide a detailed description (at least 15 characters)")
    .max(4000, "Description must be under 4000 characters"),
  attachments: z.array(AttachmentSchema).max(3).optional().default([]),
});

export const AuthorReplyInputSchema = z.object({
  content: z
    .string()
    .trim()
    .min(2, "Message cannot be empty")
    .max(4000, "Message must be under 4000 characters"),
  attachments: z.array(AttachmentSchema).max(3).optional().default([]),
});

export const AdminUpdateTicketInputSchema = z
  .object({
    status: z.enum(TICKET_STATUSES).optional(),
    category: z.enum(TICKET_CATEGORIES).optional(),
    priority: z.enum(TICKET_PRIORITIES).optional(),
    assigned_to: z.string().trim().max(120).nullable().optional(),
  })
  .refine(
    (data) =>
      data.status !== undefined ||
      data.category !== undefined ||
      data.priority !== undefined ||
      data.assigned_to !== undefined,
    "At least one field (status, category, priority, or assigned_to) must be provided"
  );

export const AdminNoteInputSchema = z.object({
  content: z
    .string()
    .trim()
    .min(3, "Internal note must be at least 3 characters")
    .max(2500, "Internal note must be under 2500 characters"),
});

export const AdminSendReplyInputSchema = z.object({
  content: z
    .string()
    .trim()
    .min(5, "Reply content must be at least 5 characters")
    .max(5000, "Reply content must be under 5000 characters"),
  status: z.enum(TICKET_STATUSES).optional(),
  new_status: z.enum(TICKET_STATUSES).optional(),
});

export const AdminRegenerateDraftInputSchema = z.object({
  custom_instruction: z.string().trim().max(500).optional(),
});

// Strict schema for validating AI output before saving
export const AIOutputSchema = z.object({
  category: z.enum(TICKET_CATEGORIES),
  priority: z.enum(TICKET_PRIORITIES),
  rationale: z.string().trim().min(5).max(800),
  draftReply: z.string().trim().min(20).max(5000),
});

export type AIValidatedOutput = z.infer<typeof AIOutputSchema>;

// ============================================================================
// Royalty & Withdrawal Types (Real BookLeaf Dashboard parity)
// ============================================================================

export type WithdrawalStatus =
  | "PENDING"
  | "PROCESSING"
  | "APPROVED"
  | "TRANSFERRED"
  | "REJECTED";

export interface RoyaltyWithdrawalRecord {
  withdrawal_id: string;
  author_id: string;
  author_name: string;
  book_id: string | null;
  book_title: string;
  sales_type: "Indian" | "International" | "All";
  gross_amount: number;
  tds_amount: number; // 10% under section 194J
  net_amount: number;
  account_holder_name: string;
  account_number: string;
  ifsc_code: string;
  bank_name: string;
  status: WithdrawalStatus;
  payout_channel: "NEFT" | "IMPS" | "RAZORPAYX";
  utr_reference: string | null;
  sla_days: number;
  created_at: string;
  processed_at: string | null;
}

export interface BankAccountRecord {
  author_id: string;
  account_holder_name: string;
  account_number: string;
  ifsc_code: string;
  bank_name: string;
  pan_number?: string;
  is_verified: boolean;
  updated_at: string;
}

export const CreateWithdrawalInputSchema = z.object({
  book_id: z.string().nullable().optional(),
  sales_type: z.enum(["Indian", "International", "All"]).default("All"),
  amount: z
    .number()
    .min(1000, "Minimum withdrawal threshold is ₹1,000")
    .max(500000, "Maximum per transaction is ₹5,00,000"),
  account_holder_name: z.string().min(2, "Account holder name is required"),
  account_number: z.string().min(8, "Valid account number is required"),
  ifsc_code: z.string().min(6, "Valid IFSC code is required"),
  bank_name: z.string().min(2, "Bank name is required"),
});

export const SaveBankDetailsInputSchema = z.object({
  account_holder_name: z.string().min(2, "Account holder name is required"),
  account_number: z.string().min(8, "Valid account number is required"),
  ifsc_code: z.string().min(6, "Valid IFSC code is required"),
  bank_name: z.string().min(2, "Bank name is required"),
  pan_number: z.string().optional(),
});

export interface CreateBookInput {
  title: string;
  subtitle?: string;
  author_name: string;
  language: string;
  genre: string;
  trim_size: string;
  binding: "Paperback" | "Hardcover" | "Both";
  manuscript_url?: string;
  blurb?: string;
  target_mrp: number;
}
