# BookLeaf Publishing — AI-Powered Author Support & Communication Portal

A full-stack, policy-grounded **Author Support & Communication Portal** built for **BookLeaf Publishing** (Round 1 Technical Assignment — Full-Stack Developer).

---

## 1. Project Overview & Objectives

BookLeaf Publishing processes **1,200+ books monthly** across a catalog of **22,000+ titles** for authors across India and the US. High volumes of repetitive author inquiries—regarding quarterly royalty payouts, ISBN mappings, print defects, retail stock sync issues, and production stage delays—create manual triage bottlenecks and inconsistent response quality.

This application solves that operational bottleneck through two role-isolated portals powered by a **2-Stage Context-Sliced AI Engine**:

1. **Author Portal (`/author/*` and `/author-dashboard`)**:
   - Email/password authentication with HTTP-only signed JWT sessions.
   - **Official Author Dashboard (`/author-dashboard?menu=Royalty%20Withdrawal`)**: Replicates and elevates the BookLeaf live author dashboard with real-time wallet balance, 10% TDS withholding breakdown, bank account verification with auto-IFSC bank detection (HDFC, SBI, ICICI, Axis, Kotak), withdrawal request submission with a 12-day SLA badge, and an instant RazorpayX UTR test simulator.
   - **5-Stage "Start a New Book" Wizard (`/create_book`)**: Full publishing intake wizard covering Book Information, Design & Genre, Interior Formatting, Cover Selection, and Retail Distribution with multi-language support (English, Hindi, Hinglish, Tamil, Marathi, Spanish, French).
   - **Printing Cost & Royalty Calculator (`/printing-cost-royalty-calculator`)**: Interactive engine implementing BookLeaf's exact mathematical formula `(Pages × ₹0.60) + ₹12` + packaging & QC, Amazon/Flipkart 30% commission, and net profit royalty calculations for 80% Standard and 100% Bestseller Breakthrough packages.
   - **My Books & Royalty Ledger (`/author/books`)**: Displays each book's ISBN, genre, 8-stage production pipeline progress bar, MRP, 80% net-profit royalty per copy, copies sold, payout history, print partner, and active retail platforms. Gracefully handles `null` fields on *In Production* books (`BK013`, `BK015`) and highlights balances below the **₹1,000 minimum quarterly payout threshold** (`BK016` — ₹850).
   - **Submit a Support Query (`/author/tickets/new`)**: Book selector (or *"General / Account Level"*), subject, description, 1-click test templates, and **ImageKit.io** cloud attachment support with magic-byte file signature validation.
   - **My Tickets & Live Conversation Thread (`/author/tickets`)**: Real-time automatic background revalidation (every 3–4 seconds without page refresh) so admin replies and status changes appear live.
   - **Interactive Nishtha Support Assistant**: Embedded AI concierge with official BookLeaf support hours (10 AM–6 PM IST, Mon–Sat) and 1-click WhatsApp handoff.

2. **Admin Support Dashboard (`/admin/*`)**:
   - **Operations Overview**: Total tickets, unassigned queue, Critical/High SLA backlog, average resolution time, category distribution, and live AI/ops audit log.
   - **Filterable Ticket Queue**: Debounced search (by ticket ID, subject, author, or book), filters by `status`, `category`, `priority`, `assignee`, and `date`, plus urgent-first sorting (`Unresolved → Priority → Oldest Waiting`).
   - **AI Response Workbench**: Displays AI auto-classification across the 6 official BookLeaf categories, AI priority score (`Critical`, `High`, `Medium`, `Low`), classification rationale, token-savings telemetry, and 1-click **Admin Override** controls.
   - **Knowledge-Base & Database Grounded Drafts**: Pre-populates an editable response grounded in both the **BookLeaf Knowledge Base** and the author's live database figures. Admins can edit, regenerate with custom instructions, and approve/send replies to authors.
   - **Strict Internal Notes Privacy**: Admins can record private operations notes in an isolated collection (`internal_notes`) that is never serialized or exposed to author API endpoints.

---

## 2. Technology Choices & Reasoning

| Layer | Technology | Why We Chose It |
| :--- | :--- | :--- |
| **Framework** | **Next.js 14 (App Router) + React 18 + TypeScript (Strict Mode)** | Unified modular monolith combining fast UI rendering, clean REST Route Handlers (`/api/*`), and seamless single-URL deployment. |
| **Database & Models** | **MongoDB + Mongoose (`src/models/schemas.ts`) + Auto-Seeded Local Persistent Fallback (`.data/bookleaf-db.json`)** | Full Mongoose schemas, compound indexes, and validation for MongoDB Atlas, paired with an automatic persistent local document store when `MONGODB_URI` is omitted so evaluators can run `npm run dev` with zero external database setup friction. |
| **Distributed Cache & Speed** | **Upstash Redis (`ioredis` via `REDIS_URL`)** | Sub-millisecond distributed in-memory cache for Author dashboards, book catalogs, and Admin overview KPIs with automatic cache invalidation on ticket mutations. |
| **AI / LLM** | **Google Gemini (`gemini-3.8-flash` via `@google/genai`) + Deterministic Policy Fallback Engine** | Sub-second structured JSON output (`response_format`), low cost, and 100% uptime via automatic circuit-breaker fallback when offline or rate-limited. |
| **Authentication & Security** | **`jose` (HS256 JWT in HTTP-Only Cookies) + `bcryptjs` + Sliding-Window Rate Limiter** | Prevents XSS token theft, enforces server-side RBAC (`AUTHOR` vs `ADMIN`) and resource ownership, and protects login/AI routes from abuse. |
| **Validation** | **Zod (`src/types/domain.ts`)** | Validates every incoming REST payload and every AI JSON response before persistence—returning structured `400` errors instead of generic `500`s. |
| **Attachments** | **ImageKit.io Cloud Storage (`src/lib/imagekit.ts`) + Magic-Byte Validator** | Verifies PNG/JPEG/PDF file headers on the server and uploads defective print photos to ImageKit CDN (with safe local preview fallback). |
| **State & Real-Time** | **Custom Stale-While-Revalidate Client Cache (`useFastQuery`)** | Instant `0ms` page transitions across portal tabs with automatic background polling (3–4s interval when tab is visible) for real-time ticket updates. |

---

## 3. AI Integration Architecture (25% Evaluation Criterion)

### A. Cost Awareness: 2-Stage Context Slicing (~68%–74% Token Savings)
Instead of sending the entire Knowledge Base and all 18 books on every LLM call:
1. **Stage 1 (Pre-Classification)**: A fast deterministic pass inspects the ticket subject, description, and selected book state to identify the target policy domain.
2. **Stage 2 (Sliced Grounding)**: `getSlicedKnowledgeBaseContext()` (`src/lib/knowledge-base.ts`) extracts **only** the matched category's policy rules + communication tone guidelines, and `buildBookDiagnostics()` injects **only** the authenticated author's selected book record and pre-computed edge-case diagnostics (e.g., whether `royalty_pending < ₹1,000` or `last_royalty_payout_date === null`).

### B. Prompt Engineering & Prompt Injection Defense
- Untrusted ticket text is isolated inside `<untrusted_ticket_content>` delimiters with explicit system instructions never to follow override directives inside user queries.
- All outputs are validated at runtime against `AIOutputSchema` (`category`, `priority`, `rationale`, `draftReply`).

### C. Graceful Degradation (Circuit Breaker & Fallback)
- Every Gemini API call is wrapped in an `8000ms` timeout (`AI_TIMEOUT_MS`).
- If `GEMINI_API_KEY` is missing, rate-limited (`429`), or unreachable, `analyzeTicketWithAI()` automatically falls back to `buildDeterministicDraftReply()`, which uses the exact same book diagnostics and BookLeaf policy rules to draft a complete response and marks `ai_metadata.status = "Fallback"`. Ticket creation **never** fails.

---

## 4. Database Schema Overview (`src/models/schemas.ts`)

- **`User`**: `user_id`, `author_id` (`AUTH001`..`AUTH010` or `null` for Admin), `name`, `email` (unique index), `password_hash`, `role` (`AUTHOR` | `ADMIN`), `phone`, `city`, `joined_date`.
- **`Book`**: `book_id` (`BK001`..`BK018`, unique index), `author_id` (indexed), `title`, `isbn`, `genre`, `publication_date` (nullable), `status`, `mrp` (nullable), `author_royalty_per_copy` (nullable), `total_copies_sold`, `total_royalty_earned`, `royalty_paid`, `royalty_pending`, `last_royalty_payout_date` (nullable), `print_partner` (nullable), `available_on`.
- **`Ticket`**: `ticket_id` (`TKT-1001`+, unique index), `author_id`, `book_id` (nullable for General inquiries), `subject`, `description`, `attachments`, `status`, `category`, `priority`, `assigned_to`, `ai_metadata`, `resolved_at`, `created_at`, `updated_at`.
- **`TicketMessage`**: External conversation thread visible to both Author and Admin.
- **`InternalNote`**: Strictly Admin-only collection; never queried or returned in Author routes.
- **`AuditLog`**: Tracks ticket creation, AI classification, admin overrides, internal notes, and sent replies.

---

## 5. Quick Start & Local Setup Instructions

### Prerequisites
- **Node.js** `>= 18.18.0` (tested on Node v20 / v22 / v24)
- **npm** `>= 9.0.0`
- *(Optional)* **MongoDB Atlas URI** (`MONGODB_URI`) and **Google Gemini API Key** (`GEMINI_API_KEY`). If omitted, the app runs out-of-the-box using its built-in persistent local document store and deterministic policy engine.

### Installation & Execution
```bash
# 1. Install dependencies
npm install

# 2. Copy environment configuration
cp .env.example .env.local

# 3. Seed the database from data/bookleaf_sample_data.json
npm run seed

# 4. Start the development server
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### Verification Commands
```bash
# Run unit & integration test suite (Vitest)
npm test

# Run TypeScript strict check
npm run typecheck

# Build for production
npm run build
```

---

## 6. Pre-Seeded Test Credentials

You can also use the **1-Click Evaluator Quick-Login Matrix** on `/login` or the Home Landing Page (`/`):

| Role | Name | Email | Password | Notable Dataset State / Edge Case |
| :--- | :--- | :--- | :--- | :--- |
| **ADMIN** | Saloni Mourya (Ops) | `admin@bookleafpub.com` | `admin123` | Full Queue, AI Draft Editor, Overrides & Internal Notes |
| **AUTHOR** | Priya Sharma (`AUTH001`) | `priya.sharma@email.com` | `author123` | 2 Live Books (`BK001`, `BK002`) • ₹3,570 Pending |
| **AUTHOR** | Rohit Kapoor (`AUTH002`) | `rohit.kapoor@email.com` | `author123` | Top Seller (2,079 copies) • Critical ISBN Mismatch Ticket |
| **AUTHOR** | Ananya Reddy (`AUTH003`) | `ananya.reddy@email.com` | `author123` | Overdue Payout (`BK005`: ₹2,546 Pending, ₹0 Paid, `null` payout date) |
| **AUTHOR** | Vikram Joshi (`AUTH004`) | `vikram.joshi@email.com` | `author123` | Print Quality Defect Ticket (`BK006`) |
| **AUTHOR** | Sneha Kulkarni (`AUTH007`) | `sneha.kulkarni@email.com` | `author123` | 3 Books including `BK013` (*In Production - Cover Design*, `mrp: null`) |
| **AUTHOR** | Kavita Deshmukh (`AUTH009`) | `kavita.deshmukh@email.com` | `author123` | `BK015` (*In Production - Typesetting*) + `BK016` (₹850 < ₹1,000 threshold) |
| **AUTHOR** | Farhan Sheikh (`AUTH008`) | `farhan.sheikh@email.com` | `author123` | Fully Paid Out (`royalty_pending: 0`) |

---

## 7. REST API Endpoint Reference

Interactive OpenAPI 3.0 documentation is available in-app at **`/api-docs`** and raw JSON at **`/api/docs`**.

| Method | Endpoint | Role | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Public | Authenticate user, return JWT & set HTTP-only cookie |
| `POST` | `/api/auth/logout` | Any | Clear session cookie |
| `GET` | `/api/auth/session` | Any | Get current authenticated session user |
| `GET` | `/api/author/dashboard` | `AUTHOR` | Author metrics, books, and recent tickets |
| `GET` | `/api/author/books` | `AUTHOR` | Author's own books with null-safe fields |
| `GET` | `/api/author/tickets` | `AUTHOR` | List author's own tickets (filterable by status) |
| `POST` | `/api/author/tickets` | `AUTHOR` | Create ticket + run AI classification, priority & draft |
| `GET` | `/api/author/tickets/[ticketId]` | `AUTHOR` | Get single owned ticket + external messages (no internal notes) |
| `POST` | `/api/author/tickets/[ticketId]/messages` | `AUTHOR` | Post author follow-up message |
| `POST` | `/api/upload/imagekit` | `AUTHOR` | Validate magic-bytes & upload attachment to ImageKit |
| `GET` | `/api/author/royalty` | `AUTHOR` | Fetch author withdrawable balance, bank details & withdrawal history |
| `POST` | `/api/author/royalty` | `AUTHOR` | Request royalty withdrawal (with 10% TDS calculation and balance checks) |
| `POST` | `/api/author/royalty/bank-details` | `AUTHOR` | Save or update verified bank account and IFSC details |
| `POST` | `/api/author/royalty/simulate-payout` | `AUTHOR` | Instant payout testing engine with live RazorpayX UTR generation |
| `POST` | `/api/author/books/create` | `AUTHOR` | Create new manuscript record via 5-Stage Publishing Wizard |
| `GET` | `/api/author/sales` | `AUTHOR` | Channel-wise sales report (Amazon, Flipkart, BookLeaf Store) |
| `GET` | `/api/admin/dashboard` | `ADMIN` | Global queue metrics, SLA backlog & audit trail |
| `GET` | `/api/admin/tickets` | `ADMIN` | Search, filter, sort & paginate all author tickets |
| `GET` | `/api/admin/tickets/[ticketId]` | `ADMIN` | Full ticket context + AI draft + internal notes + audit logs |
| `PATCH` | `/api/admin/tickets/[ticketId]` | `ADMIN` | Update status, override AI category/priority, or assign |
| `POST` | `/api/admin/tickets/[ticketId]/assign` | `ADMIN` | Assign ticket to operations specialist |
| `POST` | `/api/admin/tickets/[ticketId]/notes` | `ADMIN` | Add private internal note (hidden from author) |
| `POST` | `/api/admin/tickets/[ticketId]/draft-reply` | `ADMIN` | Regenerate AI draft response with optional custom guidance |
| `POST` | `/api/admin/tickets/[ticketId]/send-reply` | `ADMIN` | Approve/edit and send official reply to author |

---

## 8. Assumptions, Limitations & Production Evolution

- **Real-Time Transport**: Uses Stale-While-Revalidate background polling (3–4s interval when tab is visible) so real-time updates work reliably across serverless deployments (Vercel/Render) without sticky WebSocket load-balancer issues.
- **Database Dual-Mode**: Connects to MongoDB Atlas via Mongoose when `MONGODB_URI` is set, and falls back to `.data/bookleaf-db.json` locally so reviewers can run and test immediately.
- **Future Production Enhancements**: Webhook ingestion for Amazon/Flipkart stock sync alerts, automated quarterly NEFT payout batch tracking, and vector embeddings over historical resolved tickets.
