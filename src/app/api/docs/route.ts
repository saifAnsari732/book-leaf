import { NextResponse } from "next/server";

export async function GET() {
  const openApiSpec = {
    openapi: "3.0.3",
    info: {
      title: "BookLeaf Publishing — Author Support & Communication Portal API",
      version: "1.0.0",
      description:
        "RESTful API for the BookLeaf Author Portal and Admin Operations Dashboard, featuring JWT/Cookie authentication, strict RBAC ownership enforcement, Zod input validation, and Context-Sliced Gemini 3.8 Flash AI integration.",
    },
    servers: [
      {
        url: process.env.APP_URL || "http://localhost:3000",
        description: "Application Server",
      },
    ],
    components: {
      securitySchemes: {
        SessionCookie: {
          type: "apiKey",
          in: "cookie",
          name: "bookleaf_session",
        },
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    paths: {
      "/api/auth/login": {
        post: {
          tags: ["Authentication"],
          summary: "Authenticate Author or Admin with email and password",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                example: {
                  email: "priya.sharma@email.com",
                  password: "author123",
                },
              },
            },
          },
          responses: {
            "200": { description: "Authenticated successfully; sets HTTP-only cookie" },
            "400": { description: "Zod input validation error" },
            "401": { description: "Invalid credentials" },
            "429": { description: "Rate limit exceeded" },
          },
        },
      },
      "/api/auth/logout": {
        post: {
          tags: ["Authentication"],
          summary: "Clear active session cookie",
          responses: { "200": { description: "Logged out" } },
        },
      },
      "/api/auth/session": {
        get: {
          tags: ["Authentication"],
          summary: "Retrieve currently authenticated user profile and role",
          responses: {
            "200": { description: "Active session user" },
            "401": { description: "Unauthenticated" },
          },
        },
      },
      "/api/author/dashboard": {
        get: {
          tags: ["Author Portal"],
          summary: "Get logged-in author's summary metrics, books, and recent tickets",
          security: [{ SessionCookie: [] }, { BearerAuth: [] }],
          responses: {
            "200": { description: "Author dashboard metrics and books" },
            "401": { description: "Authentication required" },
            "403": { description: "Requires AUTHOR role" },
          },
        },
      },
      "/api/author/books": {
        get: {
          tags: ["Author Portal"],
          summary: "Get all books belonging exclusively to the authenticated author",
          security: [{ SessionCookie: [] }, { BearerAuth: [] }],
          responses: {
            "200": { description: "Author's books array with null-safe fields" },
            "403": { description: "Requires AUTHOR role" },
          },
        },
      },
      "/api/author/tickets": {
        get: {
          tags: ["Author Portal"],
          summary: "List tickets submitted by the authenticated author",
          parameters: [
            {
              name: "status",
              in: "query",
              schema: {
                type: "string",
                enum: ["ALL", "Open", "In Progress", "Resolved", "Closed"],
              },
            },
          ],
          responses: { "200": { description: "List of author's tickets" } },
        },
        post: {
          tags: ["Author Portal"],
          summary: "Submit a new support ticket (triggers AI auto-classification, priority scoring, and policy-grounded draft generation)",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                example: {
                  book_id: "BK001",
                  subject: "Pending royalty payout question for Whispers of the Ganges",
                  description:
                    "Hi team, I have ₹3,570 in pending royalty. When will the next quarterly transfer happen?",
                  attachments: [],
                },
              },
            },
          },
          responses: {
            "201": { description: "Ticket created & classified" },
            "400": { description: "Validation error" },
            "403": { description: "Ownership violation on book_id" },
          },
        },
      },
      "/api/author/tickets/{ticketId}": {
        get: {
          tags: ["Author Portal"],
          summary: "Get single ticket detail and conversation thread (internal notes strictly excluded)",
          responses: {
            "200": { description: "Ticket detail and external messages" },
            "403": { description: "Ownership check failed (another author's ticket)" },
            "404": { description: "Ticket not found" },
          },
        },
      },
      "/api/author/tickets/{ticketId}/messages": {
        post: {
          tags: ["Author Portal"],
          summary: "Post an author follow-up message on an existing ticket",
          responses: {
            "201": { description: "Message posted" },
            "400": { description: "Validation error or ticket closed" },
            "403": { description: "Ownership violation" },
          },
        },
      },
      "/api/admin/dashboard": {
        get: {
          tags: ["Admin Portal"],
          summary: "Get global queue metrics, status/priority breakdowns, urgent backlog, and audit activity",
          responses: {
            "200": { description: "Admin overview metrics" },
            "403": { description: "Requires ADMIN role" },
          },
        },
      },
      "/api/admin/tickets": {
        get: {
          tags: ["Admin Portal"],
          summary: "Search, filter, sort, and paginate all incoming author tickets",
          parameters: [
            { name: "search", in: "query", schema: { type: "string" } },
            { name: "status", in: "query", schema: { type: "string" } },
            { name: "category", in: "query", schema: { type: "string" } },
            { name: "priority", in: "query", schema: { type: "string" } },
            { name: "assignee", in: "query", schema: { type: "string" } },
            { name: "dateFrom", in: "query", schema: { type: "string" } },
            { name: "dateTo", in: "query", schema: { type: "string" } },
            {
              name: "sortBy",
              in: "query",
              schema: { type: "string", enum: ["urgent", "newest", "oldest"] },
            },
            { name: "page", in: "query", schema: { type: "integer" } },
            { name: "limit", in: "query", schema: { type: "integer" } },
          ],
          responses: { "200": { description: "Paginated ticket queue" } },
        },
      },
      "/api/admin/tickets/{ticketId}": {
        get: {
          tags: ["Admin Portal"],
          summary: "Get complete ticket context including author books, AI draft, external messages, internal notes, and audit logs",
          responses: { "200": { description: "Full admin ticket detail" } },
        },
        patch: {
          tags: ["Admin Portal"],
          summary: "Update ticket status, override AI category/priority, or update assignee",
          responses: { "200": { description: "Ticket updated" } },
        },
      },
      "/api/admin/tickets/{ticketId}/assign": {
        post: {
          tags: ["Admin Portal"],
          summary: "Assign ticket to self or another operations team member",
          responses: { "200": { description: "Ticket assigned" } },
        },
      },
      "/api/admin/tickets/{ticketId}/notes": {
        post: {
          tags: ["Admin Portal"],
          summary: "Add a private internal note (never visible to authors)",
          responses: { "201": { description: "Internal note saved" } },
        },
      },
      "/api/admin/tickets/{ticketId}/draft-reply": {
        post: {
          tags: ["Admin Portal"],
          summary: "Regenerate AI draft response grounded in BookLeaf Knowledge Base and book diagnostics",
          responses: { "200": { description: "AI draft regenerated" } },
        },
      },
      "/api/admin/tickets/{ticketId}/send-reply": {
        post: {
          tags: ["Admin Portal"],
          summary: "Approve/edit and send official support reply to the author",
          responses: { "201": { description: "Reply sent to author" } },
        },
      },
    },
  };

  return NextResponse.json(openApiSpec);
}
