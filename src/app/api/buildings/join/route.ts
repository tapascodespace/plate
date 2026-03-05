import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { joinBuildingAndAssignUser } from "@/lib/data/onboarding";

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession();
    const body = await request.json();

    const inviteCode = String(body.inviteCode ?? "").trim().toUpperCase();
    if (!inviteCode) {
      return NextResponse.json(
        { success: false, error: "Invite code is required" },
        { status: 400 }
      );
    }

    const snapshot = await joinBuildingAndAssignUser(session.sub, inviteCode);

    return NextResponse.json({
      success: true,
      data: {
        building: snapshot?.building ?? null,
        user: snapshot,
      },
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Invalid invite code") {
      return NextResponse.json(
        { success: false, error: "Invalid invite code" },
        { status: 404 }
      );
    }

    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    console.error("Join building error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to join building" },
      { status: 500 }
    );
  }
}
