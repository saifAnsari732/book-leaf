import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json(
      {
        success: false,
        authenticated: false,
        user: null,
      },
      { status: 401 }
    );
  }

  return NextResponse.json(
    {
      success: true,
      authenticated: true,
      user,
    },
    { status: 200 }
  );
}
