import mongoose, { Schema, Model } from "mongoose";
import {
  UserRecord,
  BookRecord,
  TicketRecord,
  TicketMessageRecord,
  InternalNoteRecord,
  AuditLogRecord,
  TICKET_CATEGORIES,
  TICKET_PRIORITIES,
  TICKET_STATUSES,
  USER_ROLES,
  AI_PROCESSING_STATUSES,
} from "@/types/domain";

// ============================================================================
// 1. User / Author Mongoose Schema
// ============================================================================
const UserSchema = new Schema<UserRecord>(
  {
    user_id: { type: String, required: true, unique: true, index: true },
    author_id: { type: String, default: null, index: true },
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password_hash: { type: String, required: true },
    role: { type: String, enum: USER_ROLES, required: true, index: true },
    phone: { type: String, default: null },
    city: { type: String, default: null },
    joined_date: { type: String, default: null },
    created_at: { type: String, required: true },
    updated_at: { type: String, required: true },
  },
  { versionKey: false }
);

// ============================================================================
// 2. Book Mongoose Schema (Handles nullable In-Production fields gracefully)
// ============================================================================
const BookSchema = new Schema<BookRecord>(
  {
    book_id: { type: String, required: true, unique: true, index: true },
    author_id: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true },
    isbn: { type: String, required: true, trim: true },
    genre: { type: String, required: true, trim: true },
    publication_date: { type: String, default: null },
    status: { type: String, required: true, index: true },
    mrp: { type: Number, default: null },
    author_royalty_per_copy: { type: Number, default: null },
    total_copies_sold: { type: Number, required: true, default: 0 },
    total_royalty_earned: { type: Number, required: true, default: 0 },
    royalty_paid: { type: Number, required: true, default: 0 },
    royalty_pending: { type: Number, required: true, default: 0 },
    last_royalty_payout_date: { type: String, default: null },
    print_partner: { type: String, default: null },
    available_on: { type: [String], default: [] },
    created_at: { type: String, required: true },
    updated_at: { type: String, required: true },
  },
  { versionKey: false }
);

BookSchema.index({ author_id: 1, book_id: 1 });

// ============================================================================
// 3. Ticket Mongoose Schema
// ============================================================================
const AttachmentSubSchema = new Schema(
  {
    name: { type: String, required: true },
    size: { type: Number, required: true },
    type: { type: String, required: true },
    url: { type: String, default: undefined },
    fileId: { type: String, default: undefined },
    provider: {
      type: String,
      enum: ["imagekit", "local-preview"],
      default: "local-preview",
    },
  },
  { _id: false }
);

const AIMetadataSubSchema = new Schema(
  {
    status: { type: String, enum: AI_PROCESSING_STATUSES, required: true },
    provider: {
      type: String,
      enum: ["gemini", "rule-fallback"],
      required: true,
    },
    model: { type: String, required: true },
    suggested_category: {
      type: String,
      enum: TICKET_CATEGORIES,
      required: true,
    },
    suggested_priority: {
      type: String,
      enum: TICKET_PRIORITIES,
      required: true,
    },
    rationale: { type: String, required: true },
    draft_reply: { type: String, required: true },
    human_overridden: { type: Boolean, default: false },
    tokens_estimated: { type: Number, default: 0 },
    tokens_saved_pct: { type: Number, default: 0 },
    failure_reason: { type: String, default: null },
    analyzed_at: { type: String, required: true },
  },
  { _id: false }
);

const TicketSchema = new Schema<TicketRecord>(
  {
    ticket_id: { type: String, required: true, unique: true, index: true },
    author_id: { type: String, required: true, index: true },
    author_name: { type: String, required: true },
    author_email: { type: String, required: true },
    book_id: { type: String, default: null, index: true },
    book_title: { type: String, required: true },
    subject: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    attachments: { type: [AttachmentSubSchema], default: [] },
    status: {
      type: String,
      enum: TICKET_STATUSES,
      required: true,
      default: "Open",
      index: true,
    },
    category: {
      type: String,
      enum: TICKET_CATEGORIES,
      required: true,
      index: true,
    },
    priority: {
      type: String,
      enum: TICKET_PRIORITIES,
      required: true,
      index: true,
    },
    assigned_to: { type: String, default: null, index: true },
    ai_metadata: { type: AIMetadataSubSchema, required: true },
    resolved_at: { type: String, default: null },
    created_at: { type: String, required: true, index: true },
    updated_at: { type: String, required: true, index: true },
  },
  { versionKey: false }
);

// Compound indexes for common admin queue & author listing queries
TicketSchema.index({ author_id: 1, updated_at: -1 });
TicketSchema.index({ status: 1, priority: 1, created_at: -1 });
TicketSchema.index({ category: 1, status: 1 });

// ============================================================================
// 4. TicketMessage Mongoose Schema (External Conversation Thread)
// ============================================================================
const TicketMessageSchema = new Schema<TicketMessageRecord>(
  {
    message_id: { type: String, required: true, unique: true, index: true },
    ticket_id: { type: String, required: true, index: true },
    sender_role: { type: String, enum: USER_ROLES, required: true },
    sender_name: { type: String, required: true },
    sender_id: { type: String, required: true },
    content: { type: String, required: true },
    attachments: { type: [AttachmentSubSchema], default: [] },
    created_at: { type: String, required: true, index: true },
  },
  { versionKey: false }
);

TicketMessageSchema.index({ ticket_id: 1, created_at: 1 });

// ============================================================================
// 5. InternalNote Mongoose Schema (Strictly Admin-Only Collection)
// ============================================================================
const InternalNoteSchema = new Schema<InternalNoteRecord>(
  {
    note_id: { type: String, required: true, unique: true, index: true },
    ticket_id: { type: String, required: true, index: true },
    admin_id: { type: String, required: true },
    admin_name: { type: String, required: true },
    content: { type: String, required: true },
    created_at: { type: String, required: true, index: true },
  },
  { versionKey: false }
);

InternalNoteSchema.index({ ticket_id: 1, created_at: 1 });

// ============================================================================
// 6. AuditLog Mongoose Schema
// ============================================================================
const AuditLogSchema = new Schema<AuditLogRecord>(
  {
    log_id: { type: String, required: true, unique: true, index: true },
    ticket_id: { type: String, required: true, index: true },
    actor_id: { type: String, required: true },
    actor_name: { type: String, required: true },
    actor_role: {
      type: String,
      enum: ["AUTHOR", "ADMIN", "AI_SYSTEM"],
      required: true,
    },
    action: { type: String, required: true },
    details: { type: Schema.Types.Mixed, default: {} },
    created_at: { type: String, required: true, index: true },
  },
  { versionKey: false }
);

export const UserModel: Model<UserRecord> =
  mongoose.models.User || mongoose.model<UserRecord>("User", UserSchema);

export const BookModel: Model<BookRecord> =
  mongoose.models.Book || mongoose.model<BookRecord>("Book", BookSchema);

export const TicketModel: Model<TicketRecord> =
  mongoose.models.Ticket || mongoose.model<TicketRecord>("Ticket", TicketSchema);

export const TicketMessageModel: Model<TicketMessageRecord> =
  mongoose.models.TicketMessage ||
  mongoose.model<TicketMessageRecord>("TicketMessage", TicketMessageSchema);

export const InternalNoteModel: Model<InternalNoteRecord> =
  mongoose.models.InternalNote ||
  mongoose.model<InternalNoteRecord>("InternalNote", InternalNoteSchema);

export const AuditLogModel: Model<AuditLogRecord> =
  mongoose.models.AuditLog ||
  mongoose.model<AuditLogRecord>("AuditLog", AuditLogSchema);
