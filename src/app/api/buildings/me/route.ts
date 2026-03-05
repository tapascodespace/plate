import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { getMyBuilding } from "@/lib/data/onboarding";

export async function GET() {
  try {
    const session = await requireSession();

    const building = await getMyBuilding(session.sub);
    if (!building) {
      return NextResponse.json(
        { success: false, error: "Building not found for user" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: building,
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    console.error("Get my building error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch building" },
      { status: 500 }
    );
  }
}
