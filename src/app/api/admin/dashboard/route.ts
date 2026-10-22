import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getAdminOverviewMetrics } from "@/lib/repository";
import { redisGet, redisSet, REDIS_KEYS } from "@/lib/redis";

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

    const cached = await redisGet<unknown>(REDIS_KEYS.adminMetrics);
    if (cached) {
      return NextResponse.json({
        success: true,
        metrics: cached,
        cached: true,
        serverTimestamp: new Date().toISOString(),
      });
    }

    const metrics = await getAdminOverviewMetrics();
    await redisSet(REDIS_KEYS.adminMetrics, metrics, 20); // 20s TTL

    return NextResponse.json({
      success: true,
      metrics,
      cached: false,
      serverTimestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to load admin overview metrics" },
      { status: 500 }
    );
  }
}

