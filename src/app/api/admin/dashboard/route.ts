import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getAdminOverviewMetrics } from "@/lib/repository";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }
    if (user.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          error: "Access denied. Administrator privileges required.",
        },
        { status: 403 }
      );
    }

    const metrics = await getAdminOverviewMetrics();
    return NextResponse.json({
      success: true,
      metrics,
      serverTimestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to load admin overview metrics" },
      { status: 500 }
    );
  }
}
