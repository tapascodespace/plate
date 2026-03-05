import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

function getSupabaseAdminOrThrow() {
  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    throw new Error("Supabase service role key is required for cooks APIs");
  }
  return supabase;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabaseAdminOrThrow();
    const { id } = await params;

    const { data: cook } = await supabase
      .from("app_cook_profiles")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (!cook) {
      return NextResponse.json(
        { success: false, error: "Cook not found" },
        { status: 404 }
      );
    }

    const { data: user } = await supabase
      .from("app_profiles")
      .select("id, full_name, email, avatar_url")
      .eq("id", cook.user_id)
      .maybeSingle();

    const { data: dishes } = await supabase
      .from("app_dishes")
      .select("*")
      .eq("cook_profile_id", cook.id)
      .eq("is_available", true)
      .order("created_at", { ascending: false });

    const { data: orders } = await supabase
      .from("app_orders")
      .select("id, customer_id")
      .eq("cook_profile_id", cook.id)
      .order("created_at", { ascending: false })
      .limit(30);

    const orderIds = (orders ?? []).map((order) => String(order.id));
    const { data: reviews } = orderIds.length
      ? await supabase
          .from("app_reviews")
          .select("*")
          .in("order_id", orderIds)
      : { data: [] as any[] };

    const customerIds = [...new Set((orders ?? []).map((order) => String(order.customer_id)))];
    const { data: customerProfiles } = customerIds.length
      ? await supabase
          .from("app_profiles")
          .select("id, full_name, avatar_url")
          .in("id", customerIds)
      : { data: [] as any[] };

    const customerMap = new Map((customerProfiles ?? []).map((row) => [String(row.id), row]));
    const orderMap = new Map((orders ?? []).map((row) => [String(row.id), row]));

    const normalizedReviews = (reviews ?? []).map((review) => {
      const order = orderMap.get(String(review.order_id));
      const customer = order ? customerMap.get(String(order.customer_id)) : null;

      return {
        id: String(review.id),
        rating: Number(review.rating),
        comment: review.comment,
        createdAt: review.created_at,
        customer: {
          id: String(order?.customer_id ?? ""),
          name: String(customer?.full_name ?? "Customer"),
          avatar: customer?.avatar_url ?? null,
        },
      };
    });

    return NextResponse.json({
      success: true,
      data: {
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
        dishes: dishes ?? [],
        reviews: normalizedReviews,
      },
    });
  } catch (error) {
    console.error("Get cook error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch cook" },
      { status: 500 }
    );
  }
}
