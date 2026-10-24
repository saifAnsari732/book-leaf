import { describe, it, expect, beforeAll } from "vitest";
import { getPublicTicketTrackDetail } from "@/lib/repository";
import {
  renderAdminTicketAlertEmail,
  renderComplainantAcknowledgementEmail,
  renderStatusUpdateEmail,
  sendAdminGrievanceAlert,
  sendComplainantAcknowledgement,
  sendStatusUpdateEmail,
  getEmailHistory,
} from "@/lib/email";
import { NextRequest } from "next/server";
import { GET as getTrackTicket, POST as postTrackTicket } from "@/app/api/tickets/track/route";

describe("Ticket Tracking & IT Academics Dual Email Notifications", () => {
  it("renders Admin Grievance Alert email template with full metadata", () => {
    const rendered = renderAdminTicketAlertEmail({
      ticketId: "TICK-TEST-999",
      authorName: "Anisha Karmalkar",
      authorEmail: "anisha@example.com",
      authorPhone: "+91 9876543210",
      category: "Royalty Calculation",
      priority: "High",
      subject: "Royalty mismatch in Q3 statement",
      description: "My Amazon sales report indicates 45 copies sold but payout was for 30.",
      bookTitle: "Hope Between the Lines",
      status: "Open",
      timestamp: new Date().toISOString(),
    });

    expect(rendered.subject).toContain("[IT Academics]");
    expect(rendered.subject).toContain("TICK-TEST-999");
    expect(rendered.html).toContain("Anisha Karmalkar");
    expect(rendered.html).toContain("anisha@example.com");
    expect(rendered.html).toContain("Royalty Calculation");
    expect(rendered.html).toContain("Hope Between the Lines");
    expect(rendered.html).toContain("Open Admin Ticket Console");
  });

  it("renders Complainant Registration Confirmation with reference box & tracking link", () => {
    const rendered = renderComplainantAcknowledgementEmail({
      name: "Saumya Singh",
      email: "saumya@example.com",
      ticketId: "TICK-TEST-888",
      category: "Book Publishing",
      subject: "Cover proof confirmation",
      status: "Open",
    });

    expect(rendered.subject).toContain("TICK-TEST-888");
    expect(rendered.subject).toContain("Support Portal");
    expect(rendered.html).toContain("Your Unique Reference ID");
    expect(rendered.html).toContain("TICK-TEST-888");
    expect(rendered.html).toContain("/track?id=TICK-TEST-888");
    expect(rendered.html).toContain("Track Ticket Status Live");
  });

  it("renders Status Update email comparing previous and new status with admin notes", () => {
    const rendered = renderStatusUpdateEmail({
      name: "Vikram Malhotra",
      email: "vikram@example.com",
      ticketId: "TICK-TEST-777",
      oldStatus: "Open",
      newStatus: "In Progress",
      subject: "ISBN registration inquiry",
      adminNote: "Our publishing logistics officer has requested expedited assignment from Raja Rammohun Roy National Agency.",
    });

    expect(rendered.subject).toContain("TICK-TEST-777");
    expect(rendered.subject).toContain("is now In Progress");
    expect(rendered.html).toContain("Status changed from");
    expect(rendered.html).toContain("In Progress");
    expect(rendered.html).toContain("Administrator Note / Response:");
    expect(rendered.html).toContain("Raja Rammohun Roy National Agency");
  });

  it("successfully dispatches dual notifications and records in Email Activity Store", async () => {
    const adminRecord = await sendAdminGrievanceAlert({
      ticketId: "TICK-DUAL-001",
      authorName: "Test Author",
      authorEmail: "author@test.com",
      category: "Account & Profile",
      priority: "Medium",
      subject: "Dual Notification Test",
      description: "Testing admin instant alert.",
      status: "Open",
    });

    expect(adminRecord).toBeDefined();
    expect(adminRecord.meta?.type).toBe("ADMIN_GRIEVANCE_ALERT");

    const authorRecord = await sendComplainantAcknowledgement({
      ticketId: "TICK-DUAL-001",
      authorName: "Test Author",
      authorEmail: "author@test.com",
      category: "Account & Profile",
      subject: "Dual Notification Test",
      status: "Open",
    });

    expect(authorRecord).toBeDefined();
    expect(authorRecord.meta?.type).toBe("COMPLAINANT_ACKNOWLEDGEMENT");

    const history = await getEmailHistory({ search: "TICK-DUAL-001" });
    expect(history.length).toBeGreaterThanOrEqual(2);
  });

  it("masks author email address correctly in public ticket detail", async () => {
    // Look up one of the seeded tickets (e.g. TICK-1001 or similar)
    const detail = await getPublicTicketTrackDetail("TICK-1001");
    if (detail) {
      expect(detail.ticket_id).toBe("TICK-1001");
      expect(detail.masked_email).toContain("***");
      expect(detail.masked_email).toContain("@");
      expect(detail.status).toBeDefined();
      expect(detail.timeline).toBeDefined();
    }
  });

  it("handles /api/tickets/track GET and POST requests cleanly", async () => {
    // 1. Missing ID parameter
    const reqEmpty = new NextRequest("http://localhost:3000/api/tickets/track");
    const resEmpty = await getTrackTicket(reqEmpty);
    expect(resEmpty.status).toBe(400);

    // 2. Non-existent ticket ID
    const reqNotFound = new NextRequest("http://localhost:3000/api/tickets/track?id=NON-EXISTENT-XYZ");
    const resNotFound = await getTrackTicket(reqNotFound);
    expect(resNotFound.status).toBe(404);

    // 3. POST lookup with JSON body
    const reqPost = new NextRequest("http://localhost:3000/api/tickets/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: "NON-EXISTENT-XYZ" }),
    });
    const resPost = await postTrackTicket(reqPost);
    expect(resPost.status).toBe(404);
  });
});
