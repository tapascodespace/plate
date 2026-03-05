import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getCookProfileByUser } from "@/lib/data/orders";

function getSupabaseAdminOrThrow() {
  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    throw new Error("Supabase service role key is required for dishes APIs");
  }
  return supabase;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdminOrThrow();
    const { searchParams } = new URL(request.url);

    const q = searchParams.get("q")?.trim();
    const cuisine = searchParams.get("cuisine")?.trim();
    const category = searchParams.get("category")?.trim();
    const vegetarian = searchParams.get("vegetarian") === "true";
    const vegan = searchParams.get("vegan") === "true";
    const maxPriceRaw = searchParams.get("maxPrice");

    let query = supabase.from("app_dishes").select("*").eq("is_available", true);

    if (q) query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%`);
    if (cuisine) query = query.ilike("cuisine", `%${cuisine}%`);
    if (category) query = query.ilike("category", `%${category}%`);
    if (vegetarian) query = query.eq("is_vegetarian", true);
    if (vegan) query = query.eq("is_vegan", true);

    const maxPrice = maxPriceRaw ? Number(maxPriceRaw) : NaN;
    if (!Number.isNaN(maxPrice)) query = query.lte("price", maxPrice);

    const { data: dishes } = await query.order("created_at", { ascending: false });

    const cookProfileIds = [...new Set((dishes ?? []).map((dish) => String(dish.cook_profile_id)))];
    const { data: cookProfiles } = cookProfileIds.length
      ? await supabase
          .from("app_cook_profiles")
          .select("id, user_id")
          .in("id", cookProfileIds)
      : { data: [] as any[] };

    const cookUserIds = [...new Set((cookProfiles ?? []).map((profile) => String(profile.user_id)))];
    const { data: profiles } = cookUserIds.length
      ? await supabase
          .from("app_profiles")
          .select("id, full_name, avatar_url")
          .in("id", cookUserIds)
      : { data: [] as any[] };

    const cookProfileMap = new Map((cookProfiles ?? []).map((p) => [String(p.id), p]));
    const profileMap = new Map((profiles ?? []).map((p) => [String(p.id), p]));

    const data = (dishes ?? []).map((dish) => {
      const cookProfile = cookProfileMap.get(String(dish.cook_profile_id));
      const cookUser = cookProfile ? profileMap.get(String(cookProfile.user_id)) : null;

      return {
        id: String(dish.id),
        name: String(dish.name),
        description: dish.description,
        price: Number(dish.price),
        image: dish.image,
        category: dish.category,
        cuisine: dish.cuisine,
        isAvailable: Boolean(dish.is_available),
        isVegetarian: Boolean(dish.is_vegetarian),
        isVegan: Boolean(dish.is_vegan),
        spiceLevel: Number(dish.spice_level ?? 0),
        servingSize: dish.serving_size,
        prepTimeMin: Number(dish.prep_time_min ?? 30),
        cookProfileId: String(dish.cook_profile_id),
        createdAt: dish.created_at,
        updatedAt: dish.updated_at,
        cookProfile: {
          id: String(dish.cook_profile_id),
          user: {
            id: String(cookProfile?.user_id ?? ""),
            name: String(cookUser?.full_name ?? "Cook"),
            avatar: cookUser?.avatar_url ?? null,
          },
        },
      };
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("List dishes error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch dishes" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession();
    if (session.role !== "COOK") {
      return NextResponse.json(
        { success: false, error: "Only cooks can create dishes" },
        { status: 403 }
      );
    }

    const supabase = getSupabaseAdminOrThrow();
    const cookProfile = await getCookProfileByUser(session.sub);

    if (!cookProfile) {
      return NextResponse.json(
        { success: false, error: "Cook profile not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      name,
      description,
      price,
      cuisine,
      category,
      image,
      prepTimeMin,
      isVegetarian,
      isVegan,
      spiceLevel,
      servingSize,
    } = body;

    if (!name || price == null) {
      return NextResponse.json(
        { success: false, error: "Name and price are required" },
        { status: 400 }
      );
    }

    const { data: dish } = await supabase
      .from("app_dishes")
      .insert({
        cook_profile_id: cookProfile.id,
        name,
        description: description ?? null,
        price: Number(price),
        image: image ?? null,
        cuisine: cuisine ?? null,
        category: category ?? null,
        prep_time_min: prepTimeMin ? Number(prepTimeMin) : 30,
        is_vegetarian: Boolean(isVegetarian),
        is_vegan: Boolean(isVegan),
        spice_level: spiceLevel ? Number(spiceLevel) : 0,
        serving_size: servingSize ?? null,
      })
      .select("*")
      .single();

    return NextResponse.json({ success: true, data: dish }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    console.error("Create dish error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create dish" },
      { status: 500 }
    );
  }
}
