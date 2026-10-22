import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "@/lib/auth";
import { saveAuthorBankDetails } from "@/lib/repository";
import { SaveBankDetailsInputSchema } from "@/types/domain";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    if (user.role !== "AUTHOR" || !user.author_id) {
      return NextResponse.json(
        { success: false, error: "Only authors can update bank details" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = SaveBankDetailsInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.issues.map((i) => i.message).join(", "),
        },
        { status: 400 }
      );
    }

    const saved = await saveAuthorBankDetails({
      authorId: user.author_id,
      accountHolderName: parsed.data.account_holder_name,
      accountNumber: parsed.data.account_number,
      ifscCode: parsed.data.ifsc_code,
      bankName: parsed.data.bank_name,
      panNumber: parsed.data.pan_number,
    });

    return NextResponse.json({
      success: true,
      bankDetails: saved,
      message: "Bank details saved and verified successfully.",
    });
  } catch (error) {
    console.error("[API Bank Details POST] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update bank details" },
      { status: 500 }
    );
  }
}
