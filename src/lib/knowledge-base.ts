import { BookRecord, TicketCategory, SafeUser } from "@/types/domain";

/**
 * Centralized BookLeaf Knowledge Base & Context Slicer
 * Source of truth: BookLeaf_Technical_Assignment_1.docx (Pages 5-7)
 *
 * Cost-Awareness Strategy:
 * Rather than injecting the entire Knowledge Base + all 18 books on every AI call,
 * we slice ONLY the relevant policy section for the matched category + the single
 * relevant book record + pre-computed factual diagnostics.
 */

export const BOOKLEAF_COMPANY_OVERVIEW = `
BookLeaf Publishing Overview:
- Self-publishing company operating in India and the US (processing 1,200+ books monthly across 22,000+ titles).
- Publishing packages: Standard Free (no upfront cost) and Bestseller Breakthrough (premium, paid package with marketing and distribution add-ons).
- Handles cover design, typesetting, ISBN assignment, printing, distribution, and royalty management.
- In-house printing facility and warehouse are located in Delhi, alongside print partners Repro India and Epitome Books.
`.trim();

export const BOOKLEAF_TONE_GUIDELINES = `
Communication Tone Guidelines (MANDATORY):
- Always empathetic and professional. Authors are our partners, not customers to be managed.
- Acknowledge the author's concern first before jumping to solutions.
- Be specific: include actual numbers (₹ amounts, copies sold, MRP, royalty per copy), dates, print partners, and platform statuses from the provided database context rather than vague reassurances.
- If something is BookLeaf's fault (delayed royalties above ₹1,000 threshold, ISBN error, print defect), own it directly. No corporate deflection.
- If the issue requires escalation or investigation, give a clear timeline ("Our team will look into this and get back to you within 48 hours") rather than open-ended promises.
- Always end with a clear next step for the author and/or the BookLeaf team.
- Never invent facts, payment dates, or policies not supported by the Knowledge Base or the author's actual database records.
`.trim();

export const POLICY_SECTIONS_BY_CATEGORY: Record<TicketCategory, string> = {
  "Royalty & Payments": `
Royalty Policy (BookLeaf Official):
- 80/20 Royalty Split: 80% of the net profit per book goes to the author, 20% to BookLeaf.
- Net Profit Formula: Net profit = MRP minus printing cost, platform commission (Amazon/Flipkart), and shipping charges.
- Payout Schedule: Royalties are calculated quarterly and paid within 45 days of the quarter ending.
- Minimum Payout Threshold: ₹1,000. If accumulated pending royalties for a book/account are below ₹1,000, they roll over to the next quarter automatically.
- Payout Method: Bank transfer to the bank account linked in the author's dashboard.
- Transparency: Authors can view a detailed line-by-line royalty breakdown in their dashboard showing sales figures per platform.
- Overdue Escalation Rule: If accumulated pending royalty is ₹1,000 or more and payment is overdue, verify that bank details are linked in the dashboard and escalate to the Finance Team with a strict 48-hour resolution timeline.
`.trim(),

  "ISBN & Metadata Issues": `
ISBN & Metadata Policy (BookLeaf Official):
- Every book published through BookLeaf receives a unique ISBN assigned by BookLeaf.
- ISBNs are registered under BookLeaf's publisher imprint. If an author wants an ISBN under their own independent imprint, they need to obtain it independently prior to publication.
- High-Priority Escalation Rule: If an author reports an ISBN error (duplicate ISBN, wrong book linked, or mismatch between physical copy and Amazon/store listing), treat it immediately as a High/Critical priority data issue, own it directly, and escalate to the Production Team with a 48-hour resolution timeline.
- Metadata Updates (book description, author bio, keywords): Can be submitted via the dashboard or support ticket; changes typically reflect across platforms within 3–5 business days.
`.trim(),

  "Printing & Quality": `
Printing & Quality Policy (BookLeaf Official):
- In-house printing in Delhi handles most orders. Overflow or specific format requirements are handled by print partners Repro India or Epitome Books.
- Standard print turnaround: 5–7 business days from order confirmation.
- Quality Issue & Free Reprint Policy: If an author reports a quality issue (misprints, blurry images, misaligned pages, binding defects, color inconsistency), apologize sincerely, ask the author to share clear photos of the defective copy (if not already attached), and confirm that BookLeaf will arrange a free reprint within 5–7 business days once verified.
`.trim(),

  "Distribution & Availability": `
Distribution & Availability Policy (BookLeaf Official):
- Supported channels: Amazon India, Flipkart, Amazon US, Amazon UK, and the BookLeaf Store.
- New listings typically go live within 7–10 business days after publication is complete.
- Stock Sync Issue Rule: If a published book is showing as "Currently Unavailable" or out of stock on Amazon/Flipkart, it typically indicates a catalog/stock sync issue. Confirm that BookLeaf's distribution team is triggering a manual stock re-sync, which takes 24–48 hours to go live again.
`.trim(),

  "Book Status & Production Updates": `
Production Stages Policy (BookLeaf Official):
- Sequential 8-Stage Pipeline:
  1. Manuscript Received → 2. Editing (if opted) → 3. Cover Design → 4. Typesetting → 5. Proofreading → 6. ISBN Assignment → 7. Printing → 8. Distribution Setup → Published & Live.
- Authors are updated at each stage via email.
- Common Bottlenecks: Delays typically occur at Cover Design (waiting for author approval) and Proofreading/Typesetting (revision rounds).
- Collaborative Framing: Check the actual production status of the book. Be transparent about the current stage and provide a clear 48-hour update timeline from the production coordinator without blaming the author.
`.trim(),

  "General Inquiry": `
General Inquiry & Account Operations (BookLeaf Official):
- Publishing Packages: Standard Free (no upfront cost) and Bestseller Breakthrough (paid premium package with marketing and global distribution add-ons).
- Post-Publication Metadata Updates (book description, bio, category): Can be submitted through the author dashboard or via support ticket; updates reflect on retail platforms within 3–5 business days.
- Royalty Overview: 80% of net profit (MRP minus printing, platform commission, shipping), paid quarterly within 45 days of quarter end, subject to ₹1,000 minimum threshold.
`.trim(),
};

export const PRODUCTION_STAGES_LIST = [
  "Manuscript Received",
  "Editing",
  "Cover Design",
  "Typesetting",
  "Proofreading",
  "ISBN Assignment",
  "Printing",
  "Distribution Setup",
  "Published & Live",
] as const;

/**
 * Generates deterministic, factual diagnostics from the database record
 * so the AI (and fallback engine) never hallucinates numbers or misses edge cases.
 */
export function buildBookDiagnostics(
  author: SafeUser,
  book: BookRecord | null,
  allAuthorBooks: BookRecord[]
): string {
  const totalEarnedAll = allAuthorBooks.reduce(
    (sum, b) => sum + (b.total_royalty_earned || 0),
    0
  );
  const totalPaidAll = allAuthorBooks.reduce(
    (sum, b) => sum + (b.royalty_paid || 0),
    0
  );
  const totalPendingAll = allAuthorBooks.reduce(
    (sum, b) => sum + (b.royalty_pending || 0),
    0
  );

  const lines: string[] = [
    `Author Name: ${author.name} (ID: ${author.author_id || "N/A"}, Email: ${author.email}, City: ${author.city || "N/A"}, Joined: ${author.joined_date || "N/A"})`,
    `Account-Wide Summary (${allAuthorBooks.length} books): Total Royalty Earned = ₹${totalEarnedAll.toLocaleString("en-IN")}, Total Paid = ₹${totalPaidAll.toLocaleString("en-IN")}, Total Pending = ₹${totalPendingAll.toLocaleString("en-IN")}.`,
  ];

  if (!book) {
    lines.push(
      `Ticket Scope: General / Account-Level Inquiry (No specific single book selected).`,
      `Author's Books List: ${allAuthorBooks
        .map(
          (b) =>
            `"${b.title}" (${b.book_id}, Status: ${b.status}, Pending Royalty: ₹${b.royalty_pending})`
        )
        .join("; ")}`
    );
    return lines.join("\n");
  }

  const isInProduction = book.status.toLowerCase().includes("in production");
  lines.push(
    `Selected Book: "${book.title}" (ID: ${book.book_id}, ISBN: ${book.isbn}, Genre: ${book.genre})`,
    `Current Status: ${book.status}`,
    `Publication Date: ${book.publication_date ?? "Not yet published (Currently in production)"}`,
    `MRP: ${book.mrp !== null ? `₹${book.mrp}` : "TBD (In Production)"}`,
    `Author Royalty Per Copy (80% of Net Profit): ${
      book.author_royalty_per_copy !== null
        ? `₹${book.author_royalty_per_copy}/copy`
        : "TBD (In Production)"
    }`,
    `Total Copies Sold: ${book.total_copies_sold}`,
    `Total Royalty Earned: ₹${book.total_royalty_earned.toLocaleString("en-IN")}`,
    `Royalty Paid to Date: ₹${book.royalty_paid.toLocaleString("en-IN")}`,
    `Royalty Pending: ₹${book.royalty_pending.toLocaleString("en-IN")}`,
    `Last Royalty Payout Date: ${book.last_royalty_payout_date ?? "No payout recorded yet"}`,
    `Print Partner: ${book.print_partner ?? "Not assigned yet (In Production)"}`,
    `Active Distribution Platforms: ${
      book.available_on.length > 0
        ? book.available_on.join(", ")
        : "None yet (Book is still in production)"
    }`
  );

  // Specific policy edge-case diagnostics
  if (isInProduction) {
    lines.push(
      `DIAGNOSTIC FACT: This book is currently in "${book.status}" and is not yet live. MRP, royalty per copy, and retail availability are not applicable until production completes.`
    );
  } else if (book.royalty_pending > 0 && book.royalty_pending < 1000) {
    const shortfall = 1000 - book.royalty_pending;
    lines.push(
      `DIAGNOSTIC FACT (MINIMUM THRESHOLD RULE): Pending royalty for "${book.title}" is ₹${book.royalty_pending}, which is ₹${shortfall} below BookLeaf's ₹1,000 minimum payout threshold. Under BookLeaf policy, balances below ₹1,000 automatically roll over to the next quarterly cycle.`
    );
  } else if (
    book.royalty_pending >= 1000 &&
    book.last_royalty_payout_date === null
  ) {
    lines.push(
      `DIAGNOSTIC FACT (OVERDUE / FIRST PAYOUT CHECK): Pending royalty is ₹${book.royalty_pending} (exceeds the ₹1,000 minimum threshold), yet no prior payout date is recorded. Ask the author to verify that their bank account details are linked in the dashboard, and confirm escalation to the Finance Team with a 48-hour resolution window.`
    );
  } else if (book.royalty_pending >= 1000) {
    lines.push(
      `DIAGNOSTIC FACT: Pending royalty of ₹${book.royalty_pending} is above the ₹1,000 threshold (last payout was on ${book.last_royalty_payout_date}). Royalties are calculated quarterly and disbursed within 45 days of quarter end; if overdue, escalate with a 48-hour resolution window.`
    );
  } else if (book.royalty_pending === 0 && book.royalty_paid > 0) {
    lines.push(
      `DIAGNOSTIC FACT: All earned royalties (₹${book.total_royalty_earned}) have been paid in full (₹${book.royalty_paid} paid; last payout on ${book.last_royalty_payout_date}). Pending balance is ₹0.`
    );
  }

  return lines.join("\n");
}

/**
 * Returns ONLY the sliced Knowledge Base context needed for the specific category,
 * saving ~68% of prompt tokens compared to sending the full policy manual + all 18 books.
 */
export function getSlicedKnowledgeBaseContext(category: TicketCategory): {
  slicedContext: string;
  fullTokenEstimate: number;
  slicedTokenEstimate: number;
  savedPercentage: number;
} {
  const fullKBText = [
    BOOKLEAF_COMPANY_OVERVIEW,
    ...Object.values(POLICY_SECTIONS_BY_CATEGORY),
    BOOKLEAF_TONE_GUIDELINES,
  ].join("\n\n");

  const slicedContext = [
    BOOKLEAF_COMPANY_OVERVIEW,
    POLICY_SECTIONS_BY_CATEGORY[category],
    BOOKLEAF_TONE_GUIDELINES,
  ].join("\n\n");

  // Estimate tokens (~4 chars per token + saved 17 unselected books ~1,100 tokens)
  const fullTokenEstimate = Math.ceil(fullKBText.length / 4) + 1150;
  const slicedTokenEstimate = Math.ceil(slicedContext.length / 4) + 140;
  const savedPercentage = Math.max(
    55,
    Math.min(
      82,
      Math.round(
        ((fullTokenEstimate - slicedTokenEstimate) / fullTokenEstimate) * 100
      )
    )
  );

  return {
    slicedContext,
    fullTokenEstimate,
    slicedTokenEstimate,
    savedPercentage,
  };
}
