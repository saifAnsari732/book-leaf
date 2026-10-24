export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getPublicTicketTrackDetail } from "@/lib/repository";
import { checkRateLimit } from "@/lib/auth";
import { applySecurityHeaders } from "@/lib/security";

export async function GET(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown-ip";
    const rate = checkRateLimit(`track-ticket:${ip}`, 30, 60_000);
    if (!rate.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "Too many tracking lookups. Please wait a moment and try again.",
        },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id || !id.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Please provide a valid ticket or complaint reference ID.",
        },
        { status: 400 }
      );
    }

    const ticket = await getPublicTicketTrackDetail(id.trim());

    if (!ticket) {
      return NextResponse.json(
        {
          success: false,
          error: "No ticket or grievance found with this reference number. Please check the ID and try again.",
        },
        { status: 404 }
      );
    }

    const resp = NextResponse.json({
      success: true,
      ticket,
      timestamp: new Date().toISOString(),
    });
    return applySecurityHeaders(resp, { isApiRoute: true });
  } catch (error: any) {
    console.error("[Ticket Tracking API Error]", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to query ticket status. Please try again later.",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown-ip";
    const rate = checkRateLimit(`track-ticket:${ip}`, 30, 60_000);
    if (!rate.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "Too many tracking lookups. Please wait a moment and try again.",
        },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => null);
    const id = body?.id || body?.ticketId || body?.complaintId;

    if (!id || typeof id !== "string" || !id.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Please provide a valid ticket or complaint reference ID.",
        },
        { status: 400 }
      );
    }

    const ticket = await getPublicTicketTrackDetail(id.trim());

    if (!ticket) {
      return NextResponse.json(
        {
          success: false,
          error: "No ticket or grievance found with this reference number. Please check the ID and try again.",
        },
        { status: 404 }
      );
    }

    const resp = NextResponse.json({
      success: true,
      ticket,
      timestamp: new Date().toISOString(),
    });
    return applySecurityHeaders(resp, { isApiRoute: true });
  } catch (error: any) {
    console.error("[Ticket Tracking API Error]", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to query ticket status. Please try again later.",
      },
      { status: 500 }
    );
  }
}
