export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getAllDemoAccounts } from "@/lib/repository";
import { redisGet, redisSet, REDIS_KEYS } from "@/lib/redis";

export async function GET() {
  try {
    const cached = await redisGet<unknown[]>(REDIS_KEYS.demoAccounts);
    if (cached) {
      return NextResponse.json({
        success: true,
        accounts: cached,
        cached: true,
      });
    }

    const accounts = await getAllDemoAccounts();
    await redisSet(REDIS_KEYS.demoAccounts, accounts, 300); // 5 mins TTL

    return NextResponse.json({
      success: true,
      accounts,
      cached: false,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Could not load demo accounts" },
      { status: 500 }
    );
  }
}

