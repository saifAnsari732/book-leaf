import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { findUserById, updateUserProfile } from "@/lib/repository";

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const fullUser = await findUserById(session.user_id);
    return NextResponse.json({
      success: true,
      user: fullUser || session,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { name, phone, city } = body;

    const success = await updateUserProfile(session.user_id, {
      name,
      phone,
      city,
    });

    return NextResponse.json({
      success,
      message: "Profile updated successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
