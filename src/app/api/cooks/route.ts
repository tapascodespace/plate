import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

function getSupabaseAdminOrThrow() {
  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    throw new Error("Supabase service role key is required for cooks APIs");
  }
  return supabase;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdminOrThrow();
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim();
    const neighborhood = searchParams.get("neighborhood")?.trim();
    const city = searchParams.get("city")?.trim();

    let query = supabase
      .from("app_cook_profiles")
      .select("*")
      .order("rating", { ascending: false })
      .order("total_reviews", { ascending: false });

    if (q) query = query.or(`specialties.ilike.%${q}%,bio.ilike.%${q}%`);
    if (neighborhood) query = query.ilike("neighborhood", `%${neighborhood}%`);
    if (city) query = query.ilike("city", `%${city}%`);

    const { data: cooks } = await query;

    const userIds = [...new Set((cooks ?? []).map((cook) => String(cook.user_id)))];
    const { data: profiles } = userIds.length
      ? await supabase
          .from("app_profiles")
          .select("id, full_name, email, avatar_url")
          .in("id", userIds)
      : { data: [] as any[] };

    const cookIds = [...new Set((cooks ?? []).map((cook) => String(cook.id)))];
    const { data: dishes } = cookIds.length
      ? await supabase
          .from("app_dishes")
          .select("id, cook_profile_id")
          .eq("is_available", true)
          .in("cook_profile_id", cookIds)
      : { data: [] as any[] };

    const profileMap = new Map((profiles ?? []).map((p) => [String(p.id), p]));
    const dishCountByCook = new Map<string, number>();
    for (const dish of dishes ?? []) {
      const cookId = String(dish.cook_profile_id);
      dishCountByCook.set(cookId, (dishCountByCook.get(cookId) ?? 0) + 1);
    }

    const data = (cooks ?? []).map((cook) => {
      const user = profileMap.get(String(cook.user_id));
      return {
        id: String(cook.id),
        userId: String(cook.user_id),
        bio: cook.bio,
        specialties: cook.specialties,
        neighborhood: cook.neighborhood,
        city: cook.city,
        kitchen: cook.kitchen,
        rating: Number(cook.rating ?? 0),
        totalReviews: Number(cook.total_reviews ?? 0),
        user: {
          id: String(user?.id ?? cook.user_id),
          name: String(user?.full_name ?? "Cook"),
          email: String(user?.email ?? ""),
          avatar: user?.avatar_url ?? null,
        },
        dishCount: dishCountByCook.get(String(cook.id)) ?? 0,
      };
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("List cooks error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch cooks" },
      { status: 500 }
    );
  }
}
