import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import prisma from "@/lib/db";

function getSupabaseAdminOrThrow() {
  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    throw new Error("Supabase service role key is required for cook profile APIs");
  }
  return supabase;
}

export async function GET() {
  try {
    const session = await requireSession();
    const supabase = getSupabaseAdminOrThrow();

    const { data: cookProfile } = await supabase
      .from("app_cook_profiles")
      .select("*")
      .eq("user_id", session.sub)
      .maybeSingle();

    if (!cookProfile) {
      const fallbackProfile = await prisma.cookProfile.findUnique({
        where: { userId: session.sub },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
          dishes: {
            orderBy: { createdAt: "desc" },
          },
        },
      });

      if (!fallbackProfile) {
        return NextResponse.json(
          { success: false, error: "Cook profile not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: {
          id: fallbackProfile.id,
          bio: fallbackProfile.bio,
          specialties: fallbackProfile.specialties,
          neighborhood: fallbackProfile.neighborhood,
          city: fallbackProfile.city,
          kitchen: fallbackProfile.kitchen,
          coverImage: fallbackProfile.coverImage,
          acceptingOrders: fallbackProfile.acceptingOrders,
          deliveryRadius: fallbackProfile.deliveryRadius,
          prepTimeMin: fallbackProfile.prepTimeMin,
          rating: fallbackProfile.rating,
          totalReviews: fallbackProfile.totalReviews,
          dishes: fallbackProfile.dishes,
          user: {
            id: fallbackProfile.user.id,
            name: fallbackProfile.user.name,
            email: fallbackProfile.user.email,
            avatar: fallbackProfile.user.avatar,
          },
        },
      });
    }

    const { data: profile } = await supabase
      .from("app_profiles")
      .select("id, full_name, email, avatar_url")
      .eq("id", session.sub)
      .maybeSingle();

    const { data: dishes } = await supabase
      .from("app_dishes")
      .select("*")
      .eq("cook_profile_id", cookProfile.id)
      .order("created_at", { ascending: false });

    return NextResponse.json({
      success: true,
      data: {
        id: String(cookProfile.id),
        bio: cookProfile.bio,
        specialties: cookProfile.specialties,
        neighborhood: cookProfile.neighborhood,
        city: cookProfile.city,
        kitchen: cookProfile.kitchen,
        coverImage: cookProfile.cover_image,
        acceptingOrders: cookProfile.accepting_orders,
        deliveryRadius: cookProfile.delivery_radius,
        prepTimeMin: cookProfile.prep_time_min,
        rating: cookProfile.rating,
        totalReviews: cookProfile.total_reviews,
        dishes: dishes ?? [],
        user: {
          id: String(profile?.id ?? session.sub),
          name: String(profile?.full_name ?? "Cook"),
          email: String(profile?.email ?? ""),
          avatar: profile?.avatar_url ?? null,
        },
      },
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    console.error("Get cook profile error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch cook profile" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await requireSession();
    const supabase = getSupabaseAdminOrThrow();

    const { data: cookProfile } = await supabase
      .from("app_cook_profiles")
      .select("id")
      .eq("user_id", session.sub)
      .maybeSingle();

    if (!cookProfile) {
      const body = await request.json();

      const updatedFallback = await prisma.cookProfile.update({
        where: { userId: session.sub },
        data: {
          ...(body.bio !== undefined ? { bio: body.bio } : {}),
          ...(body.specialties !== undefined
            ? {
                specialties: Array.isArray(body.specialties)
                  ? body.specialties.join(", ")
                  : body.specialties,
              }
            : {}),
          ...(body.neighborhood !== undefined
            ? { neighborhood: body.neighborhood }
            : {}),
          ...(body.city !== undefined ? { city: body.city } : {}),
          ...(body.kitchen !== undefined ? { kitchen: body.kitchen } : {}),
          ...(body.coverImage !== undefined ? { coverImage: body.coverImage } : {}),
          ...(body.acceptingOrders !== undefined
            ? { acceptingOrders: Boolean(body.acceptingOrders) }
            : {}),
          ...(body.deliveryRadius !== undefined
            ? { deliveryRadius: Number(body.deliveryRadius) }
            : {}),
          ...(body.prepTimeMin !== undefined
            ? { prepTimeMin: Number(body.prepTimeMin) }
            : {}),
        },
      });

      return NextResponse.json({ success: true, data: updatedFallback });
    }

    const body = await request.json();

    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (body.bio !== undefined) updatePayload.bio = body.bio;
    if (body.specialties !== undefined) {
      updatePayload.specialties = Array.isArray(body.specialties)
        ? body.specialties.join(", ")
        : body.specialties;
    }
    if (body.neighborhood !== undefined) updatePayload.neighborhood = body.neighborhood;
    if (body.city !== undefined) updatePayload.city = body.city;
    if (body.kitchen !== undefined) updatePayload.kitchen = body.kitchen;
    if (body.coverImage !== undefined) updatePayload.cover_image = body.coverImage;
    if (body.acceptingOrders !== undefined) {
      updatePayload.accepting_orders = Boolean(body.acceptingOrders);
    }
    if (body.deliveryRadius !== undefined) {
      updatePayload.delivery_radius = Number(body.deliveryRadius);
    }
    if (body.prepTimeMin !== undefined) {
      updatePayload.prep_time_min = Number(body.prepTimeMin);
    }

    const { data: updatedProfile } = await supabase
      .from("app_cook_profiles")
      .update(updatePayload)
      .eq("id", cookProfile.id)
      .select("*")
      .single();

    return NextResponse.json({ success: true, data: updatedProfile });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    console.error("Update cook profile error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update cook profile" },
      { status: 500 }
    );
  }
}
