import nodemailer from "nodemailer";

export type EmailCategory =
  | "LOGIN_ALERT"
  | "PAYMENT_RECEIPT"
  | "TICKET_UPDATE"
  | "BOOK_PUBLISHING"
  | "SECURITY_ALERT"
  | "GENERAL";

export interface EmailActivityRecord {
  email_id: string;
  recipient_email: string;
  recipient_name: string;
  user_id?: string;
  author_id?: string;
  subject: string;
  category: EmailCategory;
  html_content: string;
  text_content: string;
  status: "SENT" | "DELIVERED" | "SIMULATED";
  sent_at: string;
  read_at: string | null;
  meta?: Record<string, any>;
}

// In-Memory store for activity emails (with initial pre-seeded activity so user immediately sees rich data)
const emailStore: EmailActivityRecord[] = [
  {
    email_id: "em_welcome_01",
    recipient_email: "priya.sharma@email.com",
    recipient_name: "Priya Sharma",
    user_id: "USR_TEST_01",
    author_id: "AUTH001",
    subject: "Welcome to BookLeaf Publishing Author Portal",
    category: "BOOK_PUBLISHING",
    html_content: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
        <div style="background: #0f172a; padding: 28px 32px; border-bottom: 3px solid #f59e0b;">
          <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.5px;">BookLeaf Publishing</h1>
          <p style="color: #94a3b8; margin: 4px 0 0 0; font-size: 13px;">Author Support & Royalties Network</p>
        </div>
        <div style="padding: 32px;">
          <h2 style="color: #0f172a; font-size: 18px; margin-top: 0; font-weight: 600;">Welcome to BookLeaf, Priya Sharma!</h2>
          <p style="color: #475569; font-size: 14px; line-height: 1.6;">Your author account is fully verified and active. You can monitor your book distribution across Amazon, Flipkart, track royalty withdrawals, and access 24/7 AI-powered support.</p>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 24px 0;">
            <p style="margin: 0 0 8px 0; font-size: 13px; color: #64748b; font-weight: 600; text-transform: uppercase;">Active Titles</p>
            <p style="margin: 0; font-size: 15px; color: #0f172a; font-weight: 600;">Whispers of the Monsoon (ISBN: 978-93-91234-01-2)</p>
          </div>
          <p style="color: #64748b; font-size: 13px; line-height: 1.5;">If you ever have any questions regarding printing timelines or monthly payouts, submit a query or chat with our automated agent.</p>
        </div>
      </div>
    `,
    text_content:
      "Welcome to BookLeaf Publishing, Priya Sharma! Your author account is verified.",
    status: "DELIVERED",
    sent_at: "2026-01-15T10:00:00.000Z",
    read_at: "2026-01-15T11:20:00.000Z",
  },
];

/**
 * Creates Nodemailer Transporter instance
 */
function createTransporter() {
  const host = process.env.SMTP_HOST?.trim();
  const port = Number(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  return null;
}

/**
 * Base email layout wrapper with modern BookLeaf branding
 */
export function wrapEmailHtml(content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BookLeaf Publishing</title>
</head>
<body style="margin: 0; padding: 24px; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
    <!-- Header -->
    <div style="background-color: #0f172a; padding: 24px 32px; border-bottom: 3px solid #f59e0b; display: flex; align-items: center; justify-content: space-between;">
      <div>
        <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.5px;">BookLeaf Publishing</h1>
        <p style="color: #94a3b8; margin: 4px 0 0 0; font-size: 13px;">Author Support & Portal Communications</p>
      </div>
    </div>
    <!-- Content Body -->
    <div style="padding: 32px 32px 28px 32px;">
      ${content}
    </div>
    <!-- Footer -->
    <div style="background-color: #f8fafc; padding: 20px 32px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; line-height: 1.5;">
      <p style="margin: 0 0 6px 0;">This is an automated notification from <strong>BookLeaf Publishing Portal</strong>.</p>
      <p style="margin: 0;">BookLeaf Publishing India &bull; Ground Floor, Cyber City, Gurugram &bull; support@bookleafpub.com</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * 1. Template: Login Activity Security Alert
 */
export function renderLoginAlertEmail(params: {
  name: string;
  email: string;
  ip: string;
  device: string;
  timestamp: string;
  location?: string;
}): { subject: string; html: string; text: string } {
  const subject = `Security Alert: New Sign-in to BookLeaf Portal`;
  const html = wrapEmailHtml(`
    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
      <span style="background-color: #eff6ff; color: #2563eb; padding: 8px 14px; border-radius: 9999px; font-size: 12px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase;">Security Alert</span>
    </div>
    <h2 style="color: #0f172a; font-size: 18px; margin: 0 0 12px 0; font-weight: 600;">New Login Detected</h2>
    <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">Hello <strong>${params.name}</strong>, a new sign-in occurred for your account on BookLeaf Portal.</p>
    
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin-bottom: 24px;">
      <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
        <tr>
          <td style="color: #64748b; padding: 6px 0; width: 130px;">Time</td>
          <td style="color: #0f172a; font-weight: 600; padding: 6px 0;">${new Date(params.timestamp).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST</td>
        </tr>
        <tr>
          <td style="color: #64748b; padding: 6px 0;">IP Address</td>
          <td style="color: #0f172a; font-weight: 600; font-family: monospace; padding: 6px 0;">${params.ip}</td>
        </tr>
        <tr>
          <td style="color: #64748b; padding: 6px 0;">Device / Browser</td>
          <td style="color: #0f172a; font-weight: 600; padding: 6px 0;">${params.device}</td>
        </tr>
        <tr>
          <td style="color: #64748b; padding: 6px 0;">Account Email</td>
          <td style="color: #0f172a; font-weight: 600; padding: 6px 0;">${params.email}</td>
        </tr>
      </table>
    </div>

    <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin: 0 0 20px 0;">If this was you, no action is needed. If you did not perform this login, please revoke your active sessions and update your password immediately.</p>
    
    <div style="margin-top: 24px;">
      <a href="/login" style="display: inline-block; background-color: #0f172a; color: #ffffff; padding: 11px 22px; font-size: 13px; font-weight: 600; text-decoration: none; border-radius: 6px;">Manage Sessions</a>
    </div>
  `);

  const text = `New sign-in detected for ${params.email} on ${params.device} from IP ${params.ip} at ${params.timestamp}.`;
  return { subject, html, text };
}

/**
 * 2. Template: Payment & Receipt Confirmation
 */
export function renderPaymentReceiptEmail(params: {
  name: string;
  email: string;
  amount: number;
  currency?: string;
  orderId: string;
  paymentId: string;
  itemDescription: string;
  timestamp: string;
}): { subject: string; html: string; text: string } {
  const currency = params.currency || "INR";
  const formattedAmount = `₹${params.amount.toLocaleString("en-IN")}`;
  const subject = `Payment Confirmation: ${formattedAmount} Received for ${params.itemDescription}`;

  const html = wrapEmailHtml(`
    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
      <span style="background-color: #ecfdf5; color: #059669; padding: 8px 14px; border-radius: 9999px; font-size: 12px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase;">Payment Verified</span>
    </div>
    <h2 style="color: #0f172a; font-size: 18px; margin: 0 0 8px 0; font-weight: 600;">Payment Receipt</h2>
    <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">Dear <strong>${params.name}</strong>, thank you for your payment. Your transaction has been verified successfully.</p>
    
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 12px;">
        <span style="font-size: 14px; color: #475569;">Amount Paid</span>
        <span style="font-size: 22px; color: #0f172a; font-weight: 700;">${formattedAmount}</span>
      </div>
      <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
        <tr>
          <td style="color: #64748b; padding: 6px 0; width: 140px;">Purpose / Plan</td>
          <td style="color: #0f172a; font-weight: 600; padding: 6px 0;">${params.itemDescription}</td>
        </tr>
        <tr>
          <td style="color: #64748b; padding: 6px 0;">Razorpay Payment ID</td>
          <td style="color: #0f172a; font-weight: 600; font-family: monospace; padding: 6px 0;">${params.paymentId}</td>
        </tr>
        <tr>
          <td style="color: #64748b; padding: 6px 0;">Order Reference</td>
          <td style="color: #0f172a; font-weight: 600; font-family: monospace; padding: 6px 0;">${params.orderId}</td>
        </tr>
        <tr>
          <td style="color: #64748b; padding: 6px 0;">Transaction Date</td>
          <td style="color: #0f172a; font-weight: 600; padding: 6px 0;">${new Date(params.timestamp).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST</td>
        </tr>
      </table>
    </div>

    <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin: 0 0 20px 0;">An invoice copy has been generated and filed with BookLeaf Publishing Accounts. You can download and inspect your receipt history anytime inside the Author Dashboard.</p>
  `);

  const text = `Payment of ${formattedAmount} received for ${params.itemDescription}. Order ID: ${params.orderId}, Payment ID: ${params.paymentId}.`;
  return { subject, html, text };
}

/**
 * 3. Template: Support Ticket Activity Notification
 */
export function renderTicketUpdateEmail(params: {
  name: string;
  ticketId: string;
  subject: string;
  status: string;
  priority: string;
  messagePreview: string;
  actorName: string;
  actorRole: string;
  timestamp: string;
}): { subject: string; html: string; text: string } {
  const emailSubject = `[Ticket #${params.ticketId}] Update: ${params.subject}`;
  const html = wrapEmailHtml(`
    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
      <span style="background-color: #fef3c7; color: #b45309; padding: 8px 14px; border-radius: 9999px; font-size: 12px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase;">Ticket Activity</span>
    </div>
    <h2 style="color: #0f172a; font-size: 18px; margin: 0 0 8px 0; font-weight: 600;">Update on Ticket #${params.ticketId}</h2>
    <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">Hello <strong>${params.name}</strong>, a new response was posted by <strong>${params.actorName}</strong> (${params.actorRole}).</p>
    
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin-bottom: 20px;">
      <p style="color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase; margin: 0 0 8px 0;">Subject: ${params.subject}</p>
      <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px; color: #0f172a; font-size: 14px; line-height: 1.6;">
        ${params.messagePreview}
      </div>
      <div style="margin-top: 12px; display: flex; gap: 16px; font-size: 12px; color: #64748b;">
        <span>Status: <strong style="color: #0f172a;">${params.status}</strong></span>
        <span>Priority: <strong style="color: #0f172a;">${params.priority}</strong></span>
      </div>
    </div>

    <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin: 0;">You can view the full conversation history or reply directly from your author portal.</p>
  `);

  const text = `Ticket #${params.ticketId} update from ${params.actorName}: ${params.messagePreview}`;
  return { subject: emailSubject, html, text };
}

/**
 * 4. Template: Book Publishing Milestone Notification
 */
export function renderBookPublishingEmail(params: {
  name: string;
  bookTitle: string;
  isbn: string;
  genre: string;
  status: string;
  royaltyPerCopy?: number | null;
  timestamp: string;
}): { subject: string; html: string; text: string } {
  const subject = `Book Milestone: '${params.bookTitle}' is now ${params.status}`;
  const html = wrapEmailHtml(`
    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
      <span style="background-color: #f3e8ff; color: #7e22ce; padding: 8px 14px; border-radius: 9999px; font-size: 12px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase;">Publishing Update</span>
    </div>
    <h2 style="color: #0f172a; font-size: 18px; margin: 0 0 8px 0; font-weight: 600;">Manuscript Status Updated</h2>
    <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">Dear <strong>${params.name}</strong>, your book <strong>'${params.bookTitle}'</strong> has entered the <strong>${params.status}</strong> stage.</p>
    
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin-bottom: 20px;">
      <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
        <tr>
          <td style="color: #64748b; padding: 6px 0; width: 140px;">Title</td>
          <td style="color: #0f172a; font-weight: 600; padding: 6px 0;">${params.bookTitle}</td>
        </tr>
        <tr>
          <td style="color: #64748b; padding: 6px 0;">ISBN Allotment</td>
          <td style="color: #0f172a; font-weight: 600; font-family: monospace; padding: 6px 0;">${params.isbn}</td>
        </tr>
        <tr>
          <td style="color: #64748b; padding: 6px 0;">Genre</td>
          <td style="color: #0f172a; font-weight: 600; padding: 6px 0;">${params.genre}</td>
        </tr>
        ${
          params.royaltyPerCopy
            ? `<tr>
                 <td style="color: #64748b; padding: 6px 0;">Author Royalty / Copy</td>
                 <td style="color: #0f172a; font-weight: 600; padding: 6px 0;">₹${params.royaltyPerCopy}</td>
               </tr>`
            : ""
        }
      </table>
    </div>

    <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin: 0;">Our editorial and print logistics teams are actively reviewing the proofs. You will receive an alert once physical proof copies are shipped.</p>
  `);

  const text = `Book '${params.bookTitle}' (ISBN: ${params.isbn}) is now ${params.status}.`;
  return { subject, html, text };
}

/**
 * 5. Template: Security & Session Revocation Alert
 */
export function renderSecurityAlertEmail(params: {
  name: string;
  email: string;
  eventType: string;
  details: string;
  timestamp: string;
}): { subject: string; html: string; text: string } {
  const subject = `Security Notice: ${params.eventType}`;
  const html = wrapEmailHtml(`
    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
      <span style="background-color: #fee2e2; color: #b91c1c; padding: 8px 14px; border-radius: 9999px; font-size: 12px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase;">Security Alert</span>
    </div>
    <h2 style="color: #0f172a; font-size: 18px; margin: 0 0 8px 0; font-weight: 600;">${params.eventType}</h2>
    <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">Hello <strong>${params.name}</strong>, a security-related action was recorded for your account:</p>
    
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin-bottom: 20px;">
      <p style="color: #0f172a; font-size: 14px; margin: 0 0 8px 0; font-weight: 600;">${params.details}</p>
      <p style="color: #64748b; font-size: 12px; margin: 0;">Recorded at: ${new Date(params.timestamp).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST</p>
    </div>

    <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin: 0;">If you initiated this change, no further action is necessary.</p>
  `);

  const text = `Security Notice: ${params.eventType}. ${params.details}`;
  return { subject, html, text };
}

/**
 * 6. Template: Admin Grievance / Ticket Notification (Dual Notification)
 * BookLeaf Publishing Grievance Portal
 */
export function renderAdminTicketAlertEmail(params: {
  ticketId: string;
  authorName: string;
  authorEmail: string;
  authorPhone?: string;
  category: string;
  priority: string;
  subject: string;
  description: string;
  bookTitle?: string;
  status: string;
  timestamp: string;
  portalUrl?: string;
}): { subject: string; html: string; text: string } {
  const subject = `[BookLeaf] [${params.ticketId}] New Complaint / Ticket: ${params.subject}`;
  const portalLink = params.portalUrl || `/admin/tickets/${params.ticketId}`;

  const html = wrapEmailHtml(`
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
      <span style="background-color: #2563eb; color: #ffffff; padding: 6px 14px; border-radius: 9999px; font-size: 12px; font-weight: 700; font-family: monospace;">
        ${params.ticketId}
      </span>
      <span style="background-color: #fee2e2; color: #b91c1c; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase;">
        Priority: ${params.priority}
      </span>
    </div>

    <h2 style="color: #0f172a; font-size: 18px; margin: 0 0 8px 0; font-weight: 700;">New Ticket Received</h2>
    <p style="color: #475569; font-size: 14px; margin: 0 0 20px 0;">An author or student has submitted a new support request / grievance in the portal.</p>

    <div style="border-top: 1px solid #e2e8f0; padding-top: 14px; margin-bottom: 14px;">
      <h3 style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; font-weight: 700; margin: 0 0 10px 0;">Complainant Details</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
        <tr>
          <td style="color: #64748b; padding: 6px 0; width: 35%;">Full Name</td>
          <td style="color: #0f172a; font-weight: 600; padding: 6px 0;">${params.authorName}</td>
        </tr>
        <tr>
          <td style="color: #64748b; padding: 6px 0;">Email Address</td>
          <td style="color: #0f172a; font-weight: 600; padding: 6px 0;">${params.authorEmail}</td>
        </tr>
        ${params.authorPhone ? `
        <tr>
          <td style="color: #64748b; padding: 6px 0;">Mobile / Phone</td>
          <td style="color: #0f172a; font-weight: 600; padding: 6px 0;">${params.authorPhone}</td>
        </tr>` : ""}
        ${params.bookTitle ? `
        <tr>
          <td style="color: #64748b; padding: 6px 0;">Related Title</td>
          <td style="color: #0f172a; font-weight: 600; padding: 6px 0;">${params.bookTitle}</td>
        </tr>` : ""}
      </table>
    </div>

    <div style="border-top: 1px solid #e2e8f0; padding-top: 14px; margin-bottom: 14px;">
      <h3 style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; font-weight: 700; margin: 0 0 10px 0;">Ticket Overview</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
        <tr>
          <td style="color: #64748b; padding: 6px 0; width: 35%;">Category</td>
          <td style="color: #0f172a; font-weight: 600; padding: 6px 0;">${params.category}</td>
        </tr>
        <tr>
          <td style="color: #64748b; padding: 6px 0;">Subject</td>
          <td style="color: #0f172a; font-weight: 600; padding: 6px 0;">${params.subject}</td>
        </tr>
        <tr>
          <td style="color: #64748b; padding: 6px 0;">Initial Status</td>
          <td style="color: #2563eb; font-weight: 700; padding: 6px 0;">${params.status}</td>
        </tr>
      </table>
    </div>

    <div style="border-top: 1px solid #e2e8f0; padding-top: 14px; margin-bottom: 20px;">
      <h3 style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; font-weight: 700; margin: 0 0 10px 0;">Description</h3>
      <div style="background-color: #f8fafc; border-left: 4px solid #2563eb; padding: 14px 16px; border-radius: 4px; font-size: 13px; line-height: 1.6; color: #334155;">
        ${params.description.replace(/\n/g, '<br/>')}
      </div>
    </div>

    <div style="margin-top: 24px; text-align: center;">
      <a href="${portalLink}" style="display: inline-block; background-color: #0f172a; color: #ffffff; padding: 12px 26px; font-size: 13px; font-weight: 600; text-decoration: none; border-radius: 6px;">
        Open Admin Ticket Console &rarr;
      </a>
    </div>
  `);

  const text = `New Complaint/Ticket [${params.ticketId}]: ${params.subject} by ${params.authorName} (${params.authorEmail}). Category: ${params.category}, Status: ${params.status}.`;
  return { subject, html, text };
}

/**
 * 7. Template: Complainant / Author Registration Confirmation
 * BookLeaf Publishing Grievance Portal
 */
export function renderComplainantAcknowledgementEmail(params: {
  name: string;
  email: string;
  ticketId: string;
  category: string;
  subject: string;
  status: string;
  trackingUrl?: string;
}): { subject: string; html: string; text: string } {
  const subject = `Complaint / Ticket Received [Ref: ${params.ticketId}] - Support Portal`;
  const trackUrl = params.trackingUrl || `/track?id=${params.ticketId}`;

  const html = wrapEmailHtml(`
    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
      <span style="background-color: #eff6ff; color: #1d4ed8; padding: 8px 14px; border-radius: 9999px; font-size: 12px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase;">
        Registration Confirmed
      </span>
    </div>

    <h2 style="color: #0f172a; font-size: 18px; margin: 0 0 12px 0; font-weight: 700;">Complaint / Ticket Registration Confirmation</h2>
    <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 16px 0;">Dear <strong>${params.name}</strong>,</p>
    <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">Thank you for reaching out. We have successfully registered your request. Our dedicated team is actively reviewing the submission and will address it promptly.</p>

    <!-- Unique Reference ID Box -->
    <div style="background-color: #eff6ff; border: 1.5px dashed #3b82f6; border-radius: 8px; padding: 18px; margin: 20px 0; text-align: center;">
      <div style="font-size: 11px; color: #1e40af; text-transform: uppercase; font-weight: 700; letter-spacing: 0.08em;">
        Your Unique Reference ID
      </div>
      <div style="font-size: 24px; font-weight: 800; color: #1d4ed8; margin-top: 6px; font-family: monospace; letter-spacing: 0.5px;">
        ${params.ticketId}
      </div>
    </div>

    <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin: 0 0 16px 0;">Please keep this reference ID for tracking and future inquiries.</p>

    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
      <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
        <tr>
          <td style="color: #64748b; padding: 4px 0; width: 30%;">Category:</td>
          <td style="color: #0f172a; font-weight: 600; padding: 4px 0;">${params.category}</td>
        </tr>
        <tr>
          <td style="color: #64748b; padding: 4px 0;">Subject:</td>
          <td style="color: #0f172a; font-weight: 600; padding: 4px 0;">${params.subject}</td>
        </tr>
        <tr>
          <td style="color: #64748b; padding: 4px 0;">Status:</td>
          <td style="color: #2563eb; font-weight: 700; padding: 4px 0;">${params.status}</td>
        </tr>
      </table>
    </div>

    <p style="color: #475569; font-size: 13px; line-height: 1.6; margin: 0 0 20px 0;">You can track the live progress of your grievance at any time on our website using your Reference ID.</p>

    <div style="text-align: center; margin: 24px 0;">
      <a href="${trackUrl}" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 12px 28px; font-size: 14px; font-weight: 700; text-decoration: none; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(37,99,235,0.2);">
        Track Ticket Status Live &rarr;
      </a>
    </div>

    <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin: 24px 0 0 0;">
      Sincerely,<br/>
      <strong style="color: #0f172a;">Support & Grievance Department</strong>
    </p>
  `);

  const text = `Dear ${params.name}, your complaint/ticket [${params.ticketId}] has been registered. Track it here: ${trackUrl}`;
  return { subject, html, text };
}

/**
 * 8. Template: Status Update Email Notification
 * BookLeaf Publishing Grievance Portal
 */
export function renderStatusUpdateEmail(params: {
  name: string;
  email: string;
  ticketId: string;
  oldStatus: string;
  newStatus: string;
  subject: string;
  adminNote?: string;
  trackingUrl?: string;
}): { subject: string; html: string; text: string } {
  const emailSubject = `[BookLeaf] Ticket Status Update: [${params.ticketId}] is now ${params.newStatus}`;
  const trackUrl = params.trackingUrl || `/track?id=${params.ticketId}`;

  const html = wrapEmailHtml(`
    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
      <span style="background-color: #f0fdf4; color: #166534; padding: 8px 14px; border-radius: 9999px; font-size: 12px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase;">
        Status Updated
      </span>
    </div>

    <h2 style="color: #0f172a; font-size: 18px; margin: 0 0 12px 0; font-weight: 700;">Complaint / Ticket Status Updated</h2>
    <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 16px 0;">Dear <strong>${params.name}</strong>,</p>
    <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">The status of your ticket (Reference: <strong>${params.ticketId}</strong>) has been updated.</p>

    <!-- Status Change Badge Box -->
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin-bottom: 20px;">
      <div style="font-size: 13px; color: #64748b; margin-bottom: 6px;">Status changed from <strong style="color: #0f172a;">${params.oldStatus}</strong> to:</div>
      <div style="display: inline-block; padding: 6px 16px; border-radius: 6px; font-weight: 700; font-size: 15px; background: #dbeafe; color: #1e40af; border: 1px solid #bfdbfe;">
        ${params.newStatus}
      </div>
    </div>

    ${params.adminNote ? `
    <div style="margin-bottom: 20px;">
      <div style="font-size: 12px; text-transform: uppercase; font-weight: 700; color: #64748b; margin-bottom: 8px;">Administrator Note / Response:</div>
      <div style="background: #f1f5f9; border-left: 4px solid #2563eb; padding: 14px 16px; border-radius: 4px; font-size: 13px; line-height: 1.6; color: #334155;">
        ${params.adminNote.replace(/\n/g, '<br/>')}
      </div>
    </div>` : ""}

    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; margin-bottom: 20px; font-size: 13px;">
      <p style="margin: 0; color: #64748b;">Subject: <strong style="color: #0f172a;">${params.subject}</strong></p>
    </div>

    <p style="color: #475569; font-size: 13px; line-height: 1.6; margin: 0 0 20px 0;">Thank you for your patience as we work on resolving your concern.</p>

    <div style="text-align: center; margin: 24px 0;">
      <a href="${trackUrl}" style="display: inline-block; background-color: #0f172a; color: #ffffff; padding: 12px 28px; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 8px;">
        View Live Ticket Status &rarr;
      </a>
    </div>

    <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin: 24px 0 0 0;">
      Sincerely,<br/>
      <strong style="color: #0f172a;">Support & Grievance Department</strong>
    </p>
  `);

  const text = `Ticket [${params.ticketId}] status changed from ${params.oldStatus} to ${params.newStatus}. ${params.adminNote ? `Note: ${params.adminNote}` : ""}`;
  return { subject: emailSubject, html, text };
}

/**
 * Resolves the operational complaint receiver email address.
 * In production (NODE_ENV === "production"), defaults to HR@bookleafpub.in.
 * In development, uses COMPLAINT_RECEIVER_EMAIL or falls back to test account.
 */
export function getComplaintReceiverEmail(): string {
  if (process.env.NODE_ENV === "production") {
    return process.env.COMPLAINT_RECEIVER_EMAIL || "HR@bookleafpub.in";
  }
  return (
    process.env.COMPLAINT_RECEIVER_EMAIL ||
    process.env.SMTP_USER ||
    "ansarisaifuddin732@gmail.com"
  );
}

/**
 * Dispatches an instant grievance notification to HR@bookleafpub.in (production recipient) and admin desk
 */
export async function sendAdminGrievanceAlert(params: {
  ticketId: string;
  authorName: string;
  authorEmail: string;
  authorPhone?: string;
  category: string;
  priority: string;
  subject: string;
  description: string;
  bookTitle?: string;
  status: string;
}): Promise<EmailActivityRecord> {
  const isProduction = process.env.NODE_ENV === "production";
  const primaryReceiver = getComplaintReceiverEmail();
  const hrRecipient = "HR@bookleafpub.in";

  const { subject, html, text } = renderAdminTicketAlertEmail({
    ...params,
    timestamp: new Date().toISOString(),
  });

  // If in development/testing and primaryReceiver is not HR, also dispatch copy to HR
  if (primaryReceiver.toLowerCase() !== hrRecipient.toLowerCase()) {
    sendEmail({
      to: hrRecipient,
      name: "BookLeaf HR Desk",
      subject: `[HR Grievance Alert] ${subject}`,
      category: "TICKET_UPDATE",
      html,
      text,
      meta: {
        type: "ADMIN_GRIEVANCE_ALERT",
        recipient: "HR",
        ticketId: params.ticketId,
        authorEmail: params.authorEmail,
      },
    }).catch((err) => console.warn("[HR Alert Dispatch Error]", err));
  }

  // Primary receipt dispatch (HR@bookleafpub.in in production)
  return sendEmail({
    to: primaryReceiver,
    name: isProduction ? "BookLeaf HR Operations Desk" : "Admin Support Desk",
    subject,
    category: "TICKET_UPDATE",
    html,
    text,
    meta: {
      type: "ADMIN_GRIEVANCE_ALERT",
      ticketId: params.ticketId,
      authorEmail: params.authorEmail,
    },
  });
}

/**
 * Dispatches complainant / author acknowledgment email with tracking link
 */
export async function sendComplainantAcknowledgement(params: {
  ticketId: string;
  authorName: string;
  authorEmail: string;
  category: string;
  subject: string;
  status: string;
  userId?: string;
  authorId?: string;
}): Promise<EmailActivityRecord> {
  const { subject, html, text } = renderComplainantAcknowledgementEmail({
    name: params.authorName,
    email: params.authorEmail,
    ticketId: params.ticketId,
    category: params.category,
    subject: params.subject,
    status: params.status,
  });

  return sendEmail({
    to: params.authorEmail,
    name: params.authorName,
    userId: params.userId,
    authorId: params.authorId,
    subject,
    category: "TICKET_UPDATE",
    html,
    text,
    meta: {
      type: "COMPLAINANT_ACKNOWLEDGEMENT",
      ticketId: params.ticketId,
    },
  });
}

/**
 * Dispatches ticket status update email to author / complainant
 */
export async function sendStatusUpdateEmail(params: {
  ticketId: string;
  authorName: string;
  authorEmail: string;
  oldStatus: string;
  newStatus: string;
  subject: string;
  adminNote?: string;
  userId?: string;
  authorId?: string;
}): Promise<EmailActivityRecord> {
  const { subject, html, text } = renderStatusUpdateEmail({
    name: params.authorName,
    email: params.authorEmail,
    ticketId: params.ticketId,
    oldStatus: params.oldStatus,
    newStatus: params.newStatus,
    subject: params.subject,
    adminNote: params.adminNote,
  });

  return sendEmail({
    to: params.authorEmail,
    name: params.authorName,
    userId: params.userId,
    authorId: params.authorId,
    subject,
    category: "TICKET_UPDATE",
    html,
    text,
    meta: {
      type: "STATUS_UPDATE",
      ticketId: params.ticketId,
      oldStatus: params.oldStatus,
      newStatus: params.newStatus,
    },
  });
}

/**
 * Dispatches an instant admin alert when author sends a reply message to a ticket
 */
export async function sendAuthorReplyToAdmin(params: {
  ticketId: string;
  authorName: string;
  authorEmail: string;
  replyContent: string;
}): Promise<EmailActivityRecord> {
  const hrRecipient = "HR@bookleafpub.in";
  const adminRecipient = getComplaintReceiverEmail();

  const subject = `[BookLeaf] [${params.ticketId}] Author Replied: ${params.authorName}`;
  const html = wrapEmailHtml(`
    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
      <span style="background-color: #fef3c7; color: #92400e; padding: 6px 14px; border-radius: 9999px; font-size: 12px; font-weight: 700; text-transform: uppercase;">
        Author Reply Received
      </span>
      <span style="color: #64748b; font-size: 13px; font-family: monospace;">Ref: ${params.ticketId}</span>
    </div>
    <h2 style="color: #0f172a; font-size: 18px; margin: 0 0 12px 0;">New Message from Author</h2>
    <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 16px 0;">
      Author <strong>${params.authorName}</strong> (${params.authorEmail}) has replied to ticket <strong>${params.ticketId}</strong>:
    </p>
    <div style="background-color: #f8fafc; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 6px; font-size: 14px; line-height: 1.6; color: #1e293b; margin: 16px 0;">
      ${params.replyContent.replace(/\n/g, '<br/>')}
    </div>
    <div style="text-align: center; margin-top: 24px;">
      <a href="/admin/tickets/${params.ticketId}" style="display: inline-block; background-color: #0f172a; color: #ffffff; padding: 12px 28px; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 8px;">
        Open Admin Console to Reply &rarr;
      </a>
    </div>
  `);

  const text = `Author ${params.authorName} (${params.authorEmail}) replied to ticket ${params.ticketId}: ${params.replyContent}`;

  // Notify HR
  const hrRecord = await sendEmail({
    to: hrRecipient,
    name: "BookLeaf HR Desk",
    subject,
    category: "TICKET_UPDATE",
    html,
    text,
    meta: {
      type: "HR_AUTHOR_REPLY_ALERT",
      ticketId: params.ticketId,
      authorEmail: params.authorEmail,
    },
  });

  // Also notify Admin if distinct
  if (adminRecipient && adminRecipient.toLowerCase() !== hrRecipient.toLowerCase()) {
    sendEmail({
      to: adminRecipient,
      name: "Support Desk Admin",
      subject,
      category: "TICKET_UPDATE",
      html,
      text,
      meta: {
        type: "AUTHOR_REPLY_ALERT",
        ticketId: params.ticketId,
        authorEmail: params.authorEmail,
      },
    }).catch((e) => console.warn("[Admin Reply Alert Error]", e));
  }

  return hrRecord;
}

/**
 * Core sendEmail function: Attempts SMTP via nodemailer, falls back to simulated delivery,
 * and records into Email Activity Store for live UI browsing.
 */
export async function sendEmail(params: {
  to: string;
  name?: string;
  userId?: string;
  authorId?: string;
  subject: string;
  category: EmailCategory;
  html: string;
  text: string;
  meta?: Record<string, any>;
}): Promise<EmailActivityRecord> {
  const emailId = `em_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const now = new Date().toISOString();

  let deliveryStatus: "SENT" | "DELIVERED" | "SIMULATED" = "SIMULATED";

  const transporter = createTransporter();
  if (transporter) {
    try {
      const from =
        process.env.SMTP_FROM ||
        "BookLeaf Publishing <support@bookleafpub.com>";
      await transporter.sendMail({
        from,
        to: params.to,
        subject: params.subject,
        text: params.text,
        html: params.html,
      });
      deliveryStatus = "SENT";
    } catch (err: any) {
      console.warn(
        "[BookLeaf Nodemailer] SMTP send failed, falling back to simulated store:",
        err?.message || err
      );
      deliveryStatus = "SIMULATED";
    }
  }

  const record: EmailActivityRecord = {
    email_id: emailId,
    recipient_email: params.to,
    recipient_name: params.name || params.to.split("@")[0],
    user_id: params.userId,
    author_id: params.authorId,
    subject: params.subject,
    category: params.category,
    html_content: params.html,
    text_content: params.text,
    status: deliveryStatus,
    sent_at: now,
    read_at: null,
    meta: params.meta,
  };

  // Add to in-memory activity inbox (newest first)
  emailStore.unshift(record);

  return record;
}

/**
 * High-level Activity Email Dispatcher
 */
export async function dispatchActivityEmail(
  type: "LOGIN" | "PAYMENT" | "TICKET" | "BOOK" | "SECURITY",
  payload: any
): Promise<EmailActivityRecord> {
  switch (type) {
    case "LOGIN": {
      const { subject, html, text } = renderLoginAlertEmail(payload);
      return sendEmail({
        to: payload.email,
        name: payload.name,
        userId: payload.userId,
        authorId: payload.authorId,
        subject,
        category: "LOGIN_ALERT",
        html,
        text,
        meta: { ip: payload.ip, device: payload.device },
      });
    }
    case "PAYMENT": {
      const { subject, html, text } = renderPaymentReceiptEmail(payload);
      return sendEmail({
        to: payload.email,
        name: payload.name,
        userId: payload.userId,
        authorId: payload.authorId,
        subject,
        category: "PAYMENT_RECEIPT",
        html,
        text,
        meta: { orderId: payload.orderId, paymentId: payload.paymentId },
      });
    }
    case "TICKET": {
      const { subject, html, text } = renderTicketUpdateEmail(payload);
      return sendEmail({
        to: payload.email,
        name: payload.name,
        userId: payload.userId,
        authorId: payload.authorId,
        subject,
        category: "TICKET_UPDATE",
        html,
        text,
        meta: { ticketId: payload.ticketId, status: payload.status },
      });
    }
    case "BOOK": {
      const { subject, html, text } = renderBookPublishingEmail(payload);
      return sendEmail({
        to: payload.email,
        name: payload.name,
        userId: payload.userId,
        authorId: payload.authorId,
        subject,
        category: "BOOK_PUBLISHING",
        html,
        text,
        meta: { isbn: payload.isbn, status: payload.status },
      });
    }
    case "SECURITY": {
      const { subject, html, text } = renderSecurityAlertEmail(payload);
      return sendEmail({
        to: payload.email,
        name: payload.name,
        userId: payload.userId,
        authorId: payload.authorId,
        subject,
        category: "SECURITY_ALERT",
        html,
        text,
        meta: { eventType: payload.eventType },
      });
    }
    default:
      throw new Error(`Unsupported email activity type: ${type}`);
  }
}

/**
 * Retrieves Email Box activity history for user or admin
 */
export async function getEmailHistory(params?: {
  userId?: string;
  authorId?: string;
  category?: string;
  search?: string;
}): Promise<EmailActivityRecord[]> {
  let list = [...emailStore];

  if (params?.userId) {
    list = list.filter(
      (em) => !em.user_id || em.user_id === params.userId
    );
  }

  if (params?.category && params.category !== "ALL") {
    list = list.filter((em) => em.category === params.category);
  }

  if (params?.search) {
    const q = params.search.toLowerCase().trim();
    list = list.filter(
      (em) =>
        em.subject.toLowerCase().includes(q) ||
        em.recipient_email.toLowerCase().includes(q) ||
        em.text_content.toLowerCase().includes(q)
    );
  }

  return list;
}

/**
 * Retrieves a single email by ID
 */
export function getEmailById(emailId: string): EmailActivityRecord | null {
  return emailStore.find((em) => em.email_id === emailId) || null;
}

/**
 * Marks email as read
 */
export function markEmailAsRead(emailId: string): boolean {
  const item = emailStore.find((em) => em.email_id === emailId);
  if (item) {
    item.read_at = new Date().toISOString();
    return true;
  }
  return false;
}

/**
 * Deletes an email from store
 */
export function deleteEmail(emailId: string): boolean {
  const idx = emailStore.findIndex((em) => em.email_id === emailId);
  if (idx !== -1) {
    emailStore.splice(idx, 1);
    return true;
  }
  return false;
}
