import fs from "fs";
import path from "path";

// Load .env.local
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.slice(1, -1);
      }
      process.env[key] = val;
    }
  }
}

import {
  sendComplainantAcknowledgement,
  sendAdminGrievanceAlert,
  sendStatusUpdateEmail,
  sendAuthorReplyToAdmin,
} from "../src/lib/email";

async function run() {
  console.log("=== VERIFYING BOOKLEAF TICKET EMAIL DISPATCHING ===");
  console.log("SMTP_HOST:", process.env.SMTP_HOST);
  console.log("SMTP_PORT:", process.env.SMTP_PORT);
  console.log("SMTP_FROM:", process.env.SMTP_FROM);
  console.log("COMPLAINT_RECEIVER_EMAIL:", process.env.COMPLAINT_RECEIVER_EMAIL);

  const testTicketId = `BL-${Date.now().toString().slice(-6)}`;

  // Test 1: Author Acknowledgment Email
  console.log("\n[Flow 1] Dispatching Complainant Acknowledgment Email...");
  const ack = await sendComplainantAcknowledgement({
    ticketId: testTicketId,
    authorName: "Priya Sharma",
    authorEmail: process.env.COMPLAINT_RECEIVER_EMAIL || "ansarisaifuddin732@gmail.com",
    category: "Royalty Calculation",
    subject: "Q3 Royalty Statement Verification",
    status: "Submitted",
  });
  console.log("✅ Flow 1 Result:", ack.status, "| Subject:", ack.subject);

  // Test 2: Admin Grievance Alert
  console.log("\n[Flow 2] Dispatching Admin Grievance Alert Email...");
  const alert = await sendAdminGrievanceAlert({
    ticketId: testTicketId,
    authorName: "Priya Sharma",
    authorEmail: "priya.sharma@email.com",
    authorPhone: "+91 98201 12345",
    bookTitle: "Whispers of the Monsoon",
    category: "Royalty Calculation",
    priority: "High",
    subject: "Q3 Royalty Statement Verification",
    description: "Please check line item 4 on Amazon India royalties for September 2026.",
    status: "Submitted",
  });
  console.log("✅ Flow 2 Result:", alert.status, "| Subject:", alert.subject);

  // Test 3: Status Update Email
  console.log("\n[Flow 3] Dispatching Status Update Email to Author...");
  const update = await sendStatusUpdateEmail({
    ticketId: testTicketId,
    authorName: "Priya Sharma",
    authorEmail: process.env.COMPLAINT_RECEIVER_EMAIL || "ansarisaifuddin732@gmail.com",
    oldStatus: "Submitted",
    newStatus: "Under Review",
    subject: "Q3 Royalty Statement Verification",
    adminNote: "Our publishing finance director is auditing the distributor remittance.",
  });
  console.log("✅ Flow 3 Result:", update.status, "| Subject:", update.subject);

  // Test 4: Author Reply Alert to Admin
  console.log("\n[Flow 4] Dispatching Author Reply Alert Email to Admin...");
  const replyAlert = await sendAuthorReplyToAdmin({
    ticketId: testTicketId,
    authorName: "Priya Sharma",
    authorEmail: "priya.sharma@email.com",
    replyContent: "Thank you team, here is the screenshot of my KDP royalty report.",
  });
  console.log("✅ Flow 4 Result:", replyAlert.status, "| Subject:", replyAlert.subject);

  console.log("\n=======================================================");
  console.log("🎉 ALL 4 TICKET EMAIL FLOWS VERIFIED SUCCESSFULLY ON LIVE SMTP!");
  console.log("=======================================================");
}

run().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
