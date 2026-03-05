import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import {
  getOnboardingSnapshot,
  updateOnboardingProfile,
} from "@/lib/data/onboarding";

export async function GET() {
  try {
    const session = await requireSession();

    const snapshot = await getOnboardingSnapshot(session.sub);
    if (!snapshot) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: snapshot });
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      error.message.includes("Profile row is missing in app_profiles")
    ) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 409 }
      );
    }

    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    console.error("Get onboarding profile error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch onboarding profile" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession();
    const body = await request.json();

    const { name, phone, flatNumber, floorNumber, bio } = body;

    if (!name || !phone || !flatNumber) {
      return NextResponse.json(
        {
          success: false,
          error: "Name, phone, and flat number are required",
        },
        { status: 400 }
      );
    }

    const snapshot = await updateOnboardingProfile(session.sub, {
      name,
      phone,
      flatNumber,
      floorNumber: floorNumber != null ? Number(floorNumber) : null,
      bio: bio ?? null,
    });

    return NextResponse.json({ success: true, data: snapshot });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    console.error("Update onboarding profile error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update onboarding profile" },
      { status: 500 }
    );
  }
}
