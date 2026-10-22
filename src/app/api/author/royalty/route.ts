import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "@/lib/auth";
import {
  getAuthorRoyaltyDashboard,
  createWithdrawalRequest,
} from "@/lib/repository";
import { CreateWithdrawalInputSchema } from "@/types/domain";

export async function GET(req: NextRequest) {
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
        { success: false, error: "Only authors can access royalty payouts" },
        { status: 403 }
      );
    }

    const data = await getAuthorRoyaltyDashboard(user.author_id);
    return NextResponse.json({
      success: true,
      author: user,
      ...data,
    });
  } catch (error) {
    console.error("[API Royalty GET] Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error fetching royalty data" },
      { status: 500 }
    );
  }
}

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
        { success: false, error: "Only authors can request withdrawals" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = CreateWithdrawalInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.issues.map((i) => i.message).join(", "),
        },
        { status: 400 }
      );
    }

    const dashboard = await getAuthorRoyaltyDashboard(user.author_id);
    if (parsed.data.amount > dashboard.metrics.withdrawableBalance) {
      return NextResponse.json(
        {
          success: false,
          error: `Requested amount (₹${parsed.data.amount.toLocaleString(
            "en-IN"
          )}) exceeds your withdrawable royalty balance of ₹${dashboard.metrics.withdrawableBalance.toLocaleString(
            "en-IN"
          )}.`,
        },
        { status: 400 }
      );
    }

    const withdrawal = await createWithdrawalRequest({
      authorId: user.author_id,
      authorName: user.name,
      bookId: parsed.data.book_id,
      salesType: parsed.data.sales_type,
      amount: parsed.data.amount,
      accountHolderName: parsed.data.account_holder_name,
      accountNumber: parsed.data.account_number,
      ifscCode: parsed.data.ifsc_code,
      bankName: parsed.data.bank_name,
    });

    return NextResponse.json({
      success: true,
      withdrawal,
      message:
        "Withdrawal request submitted successfully. Processing typically takes up to 12 business days.",
    });
  } catch (error) {
    console.error("[API Royalty POST] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit withdrawal request" },
      { status: 500 }
    );
  }
}
