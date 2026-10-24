import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";

function loadEnv() {
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
}

loadEnv();

async function main() {
  console.log("=== NODEMAILER SMTP VERIFICATION TEST ===");
  console.log("Host:", process.env.SMTP_HOST);
  console.log("Port:", process.env.SMTP_PORT);
  console.log("User:", process.env.SMTP_USER);
  console.log("From:", process.env.SMTP_FROM);
  console.log("Complaint Receiver:", process.env.COMPLAINT_RECEIVER_EMAIL);

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || "465"),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  try {
    console.log("\n1. Verifying SMTP credentials & SSL handshake...");
    const verified = await transporter.verify();
    console.log("✅ transporter.verify() SUCCESS:", verified);

    console.log("\n2. Sending Live Test Email to:", process.env.COMPLAINT_RECEIVER_EMAIL);
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: process.env.COMPLAINT_RECEIVER_EMAIL,
      subject: "✅ [VERIFIED] BookLeaf Publishing Support & Grievance Portal Email Dispatcher",
      text: "This is a live test email confirming that Nodemailer SMTP integration is working 100% on port 465 with Gmail SSL for BookLeaf Publishing.",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
          <div style="background: #0f172a; padding: 24px 30px; border-bottom: 3px solid #10b981;">
            <h1 style="color: #ffffff; margin: 0; font-size: 18px; font-weight: 700;">BookLeaf Publishing Grievance Portal</h1>
            <p style="color: #94a3b8; margin: 4px 0 0 0; font-size: 12px;">Automated Nodemailer Verification Alert</p>
          </div>
          <div style="padding: 30px;">
            <div style="display: inline-block; background: #ecfdf5; color: #047857; font-weight: 700; font-size: 11px; padding: 4px 10px; border-radius: 9999px; text-transform: uppercase; margin-bottom: 16px;">
              SMTP Live &amp; Operational
            </div>
            <h2 style="color: #0f172a; font-size: 17px; margin-top: 0; font-weight: 600;">Nodemailer SMTP Dispatcher Verified!</h2>
            <p style="color: #475569; font-size: 14px; line-height: 1.6;">
              This email confirms that the Gmail SMTP transport (<code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: monospace;">smtp.gmail.com:465</code>) is active and successfully delivering ticket, complaint, and tracking updates.
            </p>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0;">
              <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <tr>
                  <td style="color: #64748b; padding: 4px 0;">SMTP Host:</td>
                  <td style="color: #0f172a; font-weight: 600; padding: 4px 0;">smtp.gmail.com:465 (SSL)</td>
                </tr>
                <tr>
                  <td style="color: #64748b; padding: 4px 0;">Sender Address:</td>
                  <td style="color: #0f172a; font-weight: 600; padding: 4px 0;">ansarisaifuddin732@gmail.com</td>
                </tr>
                <tr>
                  <td style="color: #64748b; padding: 4px 0;">Admin Receiver:</td>
                  <td style="color: #0f172a; font-weight: 600; padding: 4px 0;">ansarisaifuddin732@gmail.com</td>
                </tr>
              </table>
            </div>
          </div>
        </div>
      `,
    });

    console.log("✅ LIVE EMAIL DISPATCHED SUCCESSFULLY!");
    console.log("Message ID:", info.messageId);
    console.log("Server Response:", info.response);
    console.log("Accepted:", info.accepted);
  } catch (error) {
    console.error("❌ SMTP Verification Failed:", error);
    process.exit(1);
  }
}

main();
