import { NextResponse } from "next/server";
import { getAllDemoAccounts } from "@/lib/repository";

export async function GET() {
  try {
    const accounts = await getAllDemoAccounts();
    return NextResponse.json({
      success: true,
      accounts,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Could not load demo accounts" },
      { status: 500 }
    );
  }
}
