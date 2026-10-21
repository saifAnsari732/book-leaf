import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import {
  getImageKitAuthParams,
  uploadToImageKitServer,
} from "@/lib/imagekit";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json(
      { success: false, error: "Authentication required" },
      { status: 401 }
    );
  }

  const authParams = getImageKitAuthParams();
  return NextResponse.json({
    success: true,
    ...authParams,
  });
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => null);
    if (
      !body ||
      typeof body.fileName !== "string" ||
      typeof body.mimeType !== "string" ||
      typeof body.base64Data !== "string"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "fileName, mimeType, and base64Data are required",
        },
        { status: 400 }
      );
    }

    const uploaded = await uploadToImageKitServer({
      fileName: body.fileName,
      mimeType: body.mimeType,
      base64Data: body.base64Data,
      authorId: user.author_id || user.user_id,
    });

    return NextResponse.json(
      {
        success: true,
        attachment: uploaded,
      },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error:
          err instanceof Error ? err.message : "Failed to upload attachment",
      },
      { status: 400 }
    );
  }
}
