import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { createBuildingAndAssignUser } from "@/lib/data/onboarding";

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession();
    const body = await request.json();

    const { name, address, city, pincode } = body;

    if (!name || !address || !city || !pincode) {
      return NextResponse.json(
        { success: false, error: "All building fields are required" },
        { status: 400 }
      );
    }

    const snapshot = await createBuildingAndAssignUser(session.sub, {
      name,
      address,
      city,
      pincode,
    });

    return NextResponse.json({
      success: true,
      data: {
        building: snapshot?.building ?? null,
        user: snapshot,
      },
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    console.error("Create building error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create building" },
      { status: 500 }
    );
  }
}
