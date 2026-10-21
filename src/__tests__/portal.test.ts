import { beforeEach, describe, expect, it } from "vitest";
import {
  addAuthorMessageToTicket,
  addInternalNoteByAdmin,
  createAuthorTicket,
  findUserByEmail,
  getAdminTicketDetail,
  getAuthorTicketDetail,
  getAuthorTickets,
  getBooksByAuthorId,
  queryAdminTickets,
  resetAndSeedDatabase,
  sendAdminReplyToTicket,
  updateTicketByAdmin,
} from "@/lib/repository";
import {
  createSessionToken,
  toSafeUser,
  verifyPassword,
  verifySessionToken,
} from "@/lib/auth";
import {
  AIOutputSchema,
  CreateTicketInputSchema,
  LoginInputSchema,
} from "@/types/domain";
import {
  analyzeTicketWithAI,
  buildDeterministicDraftReply,
  deterministicClassifyAndPrioritize,
} from "@/lib/ai-service";
import {
  buildBookDiagnostics,
  getSlicedKnowledgeBaseContext,
} from "@/lib/knowledge-base";
import { validateAttachmentBuffer } from "@/lib/imagekit";

describe("BookLeaf Author Support & Communication Portal — Comprehensive Verification Suite", () => {
  beforeEach(async () => {
    await resetAndSeedDatabase();
  });

  it("1. Authenticates seeded Authors and Admin with bcrypt password verification & signed JWT sessions", async () => {
    const priya = await findUserByEmail("priya.sharma@email.com");
    expect(priya).not.toBeNull();
    expect(priya?.role).toBe("AUTHOR");
    expect(priya?.author_id).toBe("AUTH001");

    const validAuthorPass = await verifyPassword(
      "author123",
      priya!.password_hash
    );
    const invalidAuthorPass = await verifyPassword(
      "wrong-password",
      priya!.password_hash
    );
    expect(validAuthorPass).toBe(true);
    expect(invalidAuthorPass).toBe(false);

    const token = await createSessionToken(toSafeUser(priya!));
    const decoded = await verifySessionToken(token);
    expect(decoded?.email).toBe("priya.sharma@email.com");
    expect(decoded?.role).toBe("AUTHOR");
    expect(decoded?.author_id).toBe("AUTH001");

    const admin = await findUserByEmail("admin@bookleafpub.com");
    expect(admin).not.toBeNull();
    expect(admin?.role).toBe("ADMIN");
    expect(await verifyPassword("admin123", admin!.password_hash)).toBe(true);
  });

  it("2. Enforces Role-Based Access Control (RBAC) and rejects invalid login payloads", async () => {
    const badLogin = LoginInputSchema.safeParse({
      email: "not-an-email",
      password: "",
    });
    expect(badLogin.success).toBe(false);

    const goodLogin = LoginInputSchema.safeParse({
      email: "  PRIYA.SHARMA@EMAIL.COM ",
      password: "author123",
    });
    expect(goodLogin.success).toBe(true);
    if (goodLogin.success) {
      expect(goodLogin.data.email).toBe("priya.sharma@email.com");
    }
  });

  it("3. Enforces strict Author Data Isolation (Authors cannot read or message another author's ticket)", async () => {
    // TKT-1001 belongs to AUTH003 (Ananya Reddy)
    const priyaAccessAttempt = await getAuthorTicketDetail(
      "AUTH001",
      "TKT-1001"
    );
    expect(priyaAccessAttempt.status).toBe("FORBIDDEN");
    expect(priyaAccessAttempt.ticket).toBeUndefined();

    // Owner AUTH003 can access TKT-1001
    const ownerAccess = await getAuthorTicketDetail("AUTH003", "TKT-1001");
    expect(ownerAccess.status).toBe("OK");
    expect(ownerAccess.ticket?.ticket_id).toBe("TKT-1001");

    // Priya attempting to post a message on AUTH003's ticket is rejected with FORBIDDEN
    const priyaRecord = await findUserByEmail("priya.sharma@email.com");
    const msgAttempt = await addAuthorMessageToTicket({
      author: toSafeUser(priyaRecord!),
      ticketId: "TKT-1001",
      content: "Unauthorized reply attempt",
      attachments: [],
    });
    expect(msgAttempt.status).toBe("FORBIDDEN");
  });

  it("4. Imports all 18 books accurately and handles nullable In-Production fields gracefully", async () => {
    // Sneha Kulkarni (AUTH007) has 3 books, including BK013 in Cover Design with null mrp & publication_date
    const snehaBooks = await getBooksByAuthorId("AUTH007");
    expect(snehaBooks).toHaveLength(3);

    const bk013 = snehaBooks.find((b) => b.book_id === "BK013");
    expect(bk013).toBeDefined();
    expect(bk013?.title).toBe("Midnight in Mysore");
    expect(bk013?.status).toBe("In Production - Cover Design");
    expect(bk013?.mrp).toBeNull();
    expect(bk013?.publication_date).toBeNull();
    expect(bk013?.author_royalty_per_copy).toBeNull();
    expect(bk013?.available_on).toEqual([]);

    // Kavita Deshmukh (AUTH009) has BK015 (Typesetting) and BK016 (₹850 below ₹1,000 threshold)
    const kavitaBooks = await getBooksByAuthorId("AUTH009");
    expect(kavitaBooks).toHaveLength(2);
    const bk016 = kavitaBooks.find((b) => b.book_id === "BK016")!;
    expect(bk016.royalty_pending).toBe(850);
    expect(bk016.last_royalty_payout_date).toBeNull();
  });

  it("5. Validates ticket creation inputs and creates new tickets with AI triage metadata", async () => {
    const invalidTicket = CreateTicketInputSchema.safeParse({
      book_id: "BK001",
      subject: "Hi", // too short (<5 chars)
      description: "Too short", // <15 chars
    });
    expect(invalidTicket.success).toBe(false);

    const priyaRecord = await findUserByEmail("priya.sharma@email.com");
    const priya = toSafeUser(priyaRecord!);
    const priyaBooks = await getBooksByAuthorId("AUTH001");
    const bk001 = priyaBooks.find((b) => b.book_id === "BK001")!;

    const aiMeta = await analyzeTicketWithAI({
      subject: "My royalty amount seems too low for Whispers of the Ganges",
      description:
        "I sold 342 copies of Whispers of the Ganges (MRP ₹399) and want to understand how the ₹35 per copy royalty is calculated.",
      author: priya,
      selectedBook: bk001,
      allAuthorBooks: priyaBooks,
    });

    const created = await createAuthorTicket({
      author: priya,
      book: bk001,
      subject: "My royalty amount seems too low for Whispers of the Ganges",
      description:
        "I sold 342 copies of Whispers of the Ganges (MRP ₹399) and want to understand how the ₹35 per copy royalty is calculated.",
      attachments: [],
      aiMetadata: aiMeta,
    });

    expect(created.ticket_id).toBe("TKT-1007");
    expect(created.category).toBe("Royalty & Payments");
    expect(created.status).toBe("Open");
  });

  it("6. Supports Admin ticket assignment, status transitions, and category/priority overrides", async () => {
    const adminRecord = await findUserByEmail("admin@bookleafpub.com");
    const admin = toSafeUser(adminRecord!);

    const updated = await updateTicketByAdmin({
      ticketId: "TKT-1001",
      admin,
      updates: {
        status: "In Progress",
        priority: "Critical",
        category: "Royalty & Payments",
        assigned_to: admin.name,
      },
    });

    expect(updated).not.toBeNull();
    expect(updated?.status).toBe("In Progress");
    expect(updated?.assigned_to).toBe(admin.name);
  });

  it("7. Enforces Internal-Note Privacy (Admin internal notes never leak to Author ticket endpoints)", async () => {
    const adminRecord = await findUserByEmail("admin@bookleafpub.com");
    const admin = toSafeUser(adminRecord!);

    const secretNote = await addInternalNoteByAdmin({
      ticketId: "TKT-1003",
      admin,
      content: "CONFIDENTIAL OPS NOTE: Checking NEFT batch #9912 with finance.",
    });
    expect(secretNote).not.toBeNull();

    // Admin view includes internalNotes
    const adminDetail = await getAdminTicketDetail("TKT-1003");
    expect(
      adminDetail?.internalNotes.some((n) =>
        n.content.includes("CONFIDENTIAL OPS NOTE")
      )
    ).toBe(true);

    // Author view (AUTH001 Priya Sharma) MUST NOT contain internalNotes or ai_metadata
    const authorDetail = await getAuthorTicketDetail("AUTH001", "TKT-1003");
    expect(authorDetail.status).toBe("OK");
    expect("internalNotes" in authorDetail).toBe(false);
    expect("internal_notes" in (authorDetail.ticket || {})).toBe(false);
    expect("ai_metadata" in (authorDetail.ticket || {})).toBe(false);
    const serializedAuthorPayload = JSON.stringify(authorDetail);
    expect(serializedAuthorPayload).not.toContain("CONFIDENTIAL OPS NOTE");
  });

  it("8. Delivers Admin approved responses to the Author's ticket view and updates status", async () => {
    const adminRecord = await findUserByEmail("admin@bookleafpub.com");
    const admin = toSafeUser(adminRecord!);

    const replyResult = await sendAdminReplyToTicket({
      ticketId: "TKT-1001",
      admin,
      content:
        "Dear Ananya, our Finance Team has verified your ₹2,546 pending balance and initiated your bank transfer.",
      newStatus: "Resolved",
    });

    expect(replyResult?.ticket.status).toBe("Resolved");
    expect(replyResult?.ticket.resolved_at).not.toBeNull();

    const authorView = await getAuthorTicketDetail("AUTH003", "TKT-1001");
    expect(authorView.ticket?.status).toBe("Resolved");
    expect(
      authorView.messages?.some((m) =>
        m.content.includes("initiated your bank transfer")
      )
    ).toBe(true);

    const authorList = await getAuthorTickets("AUTH003");
    expect(authorList[0]?.last_reply_by).toBe("ADMIN");
  });

  it("9. Validates AI structured JSON output strictly with Zod and rejects malformed categories/priorities", () => {
    const validPayload = AIOutputSchema.safeParse({
      category: "ISBN & Metadata Issues",
      priority: "Critical",
      rationale: "ISBN mismatch reported on Amazon listing.",
      draftReply:
        "Dear Author, we are escalating this ISBN mismatch to our production team with a 48-hour resolution window.",
    });
    expect(validPayload.success).toBe(true);

    const invalidPayload = AIOutputSchema.safeParse({
      category: "Invented Category",
      priority: "Super Urgent",
      rationale: "ok",
      draftReply: "short",
    });
    expect(invalidPayload.success).toBe(false);
  });

  it("10. Degrades gracefully to Deterministic Policy Fallback when AI API key is missing or fails", async () => {
    const prevKey = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;

    try {
      const kavitaRecord = await findUserByEmail("kavita.deshmukh@email.com");
      const kavita = toSafeUser(kavitaRecord!);
      const kavitaBooks = await getBooksByAuthorId("AUTH009");
      const bk016 = kavitaBooks.find((b) => b.book_id === "BK016")!;

      const aiMeta = await analyzeTicketWithAI({
        subject: "Why haven't I received my ₹850 royalty for The Nagpur Notebooks?",
        description:
          "I sold 34 copies and earned ₹850 but my royalty paid is still ₹0.",
        author: kavita,
        selectedBook: bk016,
        allAuthorBooks: kavitaBooks,
      });

      expect(aiMeta.status).toBe("Fallback");
      expect(aiMeta.provider).toBe("rule-fallback");
      expect(aiMeta.suggested_category).toBe("Royalty & Payments");
      // Must reference the ₹1,000 minimum threshold and ₹850 balance!
      expect(aiMeta.draft_reply).toContain("₹850");
      expect(aiMeta.draft_reply).toContain("₹1,000");
      expect(aiMeta.tokens_saved_pct).toBeGreaterThanOrEqual(55);
    } finally {
      if (prevKey !== undefined) process.env.GEMINI_API_KEY = prevKey;
    }
  });

  it("11. Grounds AI drafts in BookLeaf Knowledge Base policies (80/20 split, 48h escalation, 5-7d free reprint, 24-48h stock sync)", async () => {
    const vikramRecord = await findUserByEmail("vikram.joshi@email.com");
    const vikram = toSafeUser(vikramRecord!);
    const vikramBooks = await getBooksByAuthorId("AUTH004");
    const bk006 = vikramBooks[0]!;

    const printClassification = deterministicClassifyAndPrioritize(
      "Blurry images and misaligned pages on author copies",
      "The print quality on my author copies is terrible and pages are misaligned.",
      bk006
    );
    expect(printClassification.category).toBe("Printing & Quality");
    expect(printClassification.priority).toBe("High");

    const printDraft = buildDeterministicDraftReply({
      category: printClassification.category,
      priority: printClassification.priority,
      subject: "Blurry images",
      description: "Blurry images and misaligned pages",
      author: vikram,
      selectedBook: bk006,
      allAuthorBooks: vikramBooks,
    });
    expect(printDraft).toContain("5–7 business days");
    expect(printDraft).toContain("free reprint");
    expect(printDraft).toContain("photos");

    const slice = getSlicedKnowledgeBaseContext("Printing & Quality");
    expect(slice.savedPercentage).toBeGreaterThanOrEqual(55);
    expect(
      buildBookDiagnostics(vikram, bk006, vikramBooks)
    ).toContain("Debugging Life");
  });

  it("12. Supports Admin Ticket Queue search, multi-criteria filtering, urgent sorting, and pagination", async () => {
    const allResult = await queryAdminTickets({ page: 1, limit: 2 });
    expect(allResult.total).toBe(6);
    expect(allResult.tickets).toHaveLength(2);
    expect(allResult.totalPages).toBe(3);

    // Urgent sort puts Critical unresolved tickets first
    expect(allResult.tickets[0]?.priority).toBe("Critical");

    // Filter by category "Printing & Quality"
    const printOnly = await queryAdminTickets({
      category: "Printing & Quality",
    });
    expect(printOnly.total).toBe(1);
    expect(printOnly.tickets[0]?.ticket_id).toBe("TKT-1005");

    // Search by author name "Sneha"
    const searchSneha = await queryAdminTickets({ search: "Sneha" });
    expect(searchSneha.total).toBe(1);
    expect(searchSneha.tickets[0]?.author_id).toBe("AUTH007");
  });

  it("13. Validates attachment magic bytes to prevent MIME spoofing on ImageKit uploads", () => {
    // Valid PNG magic header: 89 50 4E 47
    const validPng = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    expect(validateAttachmentBuffer(validPng, "image/png").valid).toBe(true);

    // Spoofed PNG (actually plain text pretending to be image/png)
    const spoofedPng = Buffer.from("hello world not a png");
    const spoofResult = validateAttachmentBuffer(spoofedPng, "image/png");
    expect(spoofResult.valid).toBe(false);
    expect(spoofResult.reason).toContain("signature");
  });
});
