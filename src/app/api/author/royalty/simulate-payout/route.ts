export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "@/lib/auth";
import {
  processInstantPayoutSimulation,
  getAuthorRoyaltyDashboard,
} from "@/lib/repository";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const withdrawalId = searchParams.get("withdrawalId");
    if (!withdrawalId) {
      return NextResponse.json(
        { success: false, error: "withdrawalId is required" },
        { status: 400 }
      );
    }

    // Security Hardening: IDOR / BOLA Prevention Check
    // If user is an AUTHOR, verify that the withdrawal record belongs to their author account
    if (user.role === "AUTHOR" && user.author_id) {
      const dashboard = await getAuthorRoyaltyDashboard(user.author_id);
      const isOwned = dashboard.withdrawals.some(
        (w) => w.withdrawal_id === withdrawalId
      );

      if (!isOwned) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Access denied. You cannot process or modify payout records belonging to another author.",
          },
          { status: 403 }
        );
      }
    }

    const updated = await processInstantPayoutSimulation(withdrawalId);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Withdrawal record not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      withdrawal: updated,
      message: `Instant simulated payout processed successfully. UTR: ${updated.utr_reference}`,
    });
  } catch (error) {
    console.error("[API Simulate Payout POST] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process simulated payout" },
      { status: 500 }
    );
  }
}
