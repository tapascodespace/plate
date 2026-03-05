import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getOnboardingSnapshot } from "@/lib/data/onboarding";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.sub },
      include: {
        cookProfile: true,
        building: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const onboarding = await getOnboardingSnapshot(user.id);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        onboardingCompleted:
          onboarding?.onboardingCompleted ?? user.onboardingCompleted,
        building: onboarding?.building ?? user.building ?? null,
        cookProfile: user.cookProfile ?? null,
      },
    });
  } catch (error) {
    console.error("Get current user error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get current user" },
      { status: 500 }
    );
  }
}
