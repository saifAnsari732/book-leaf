import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "@/lib/auth";
import { processInstantPayoutSimulation } from "@/lib/repository";

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
