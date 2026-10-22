export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getSessionUser, toSafeUser } from "@/lib/auth";
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

    // Security Hardening: Never leak password_hash to the client
    const safeUser = fullUser ? toSafeUser(fullUser) : session;

    return NextResponse.json({
      success: true,
      user: safeUser,
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

    // Sanitize text inputs
    const sanitizedName = typeof name === "string" ? name.trim().slice(0, 100) : undefined;
    const sanitizedPhone = typeof phone === "string" ? phone.trim().slice(0, 20) : null;
    const sanitizedCity = typeof city === "string" ? city.trim().slice(0, 80) : null;

    const success = await updateUserProfile(session.user_id, {
      name: sanitizedName,
      phone: sanitizedPhone,
      city: sanitizedCity,
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
