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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabaseAdminOrThrow();
    const { id } = await params;

    const { data: dish } = await supabase
      .from("app_dishes")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (!dish) {
      return NextResponse.json(
        { success: false, error: "Dish not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: dish });
  } catch (error) {
    console.error("Get dish error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch dish" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSession();
    const supabase = getSupabaseAdminOrThrow();
    const { id } = await params;

    const { data: dish } = await supabase
      .from("app_dishes")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (!dish) {
      return NextResponse.json(
        { success: false, error: "Dish not found" },
        { status: 404 }
      );
    }

    const cookProfile = await getCookProfileByUser(session.sub);
    if (!cookProfile || String(dish.cook_profile_id) !== String(cookProfile.id)) {
      return NextResponse.json(
        { success: false, error: "You can only update your own dishes" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const payload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (body.name !== undefined) payload.name = body.name;
    if (body.description !== undefined) payload.description = body.description;
    if (body.price !== undefined) payload.price = Number(body.price);
    if (body.cuisine !== undefined) payload.cuisine = body.cuisine;
    if (body.category !== undefined) payload.category = body.category;
    if (body.image !== undefined) payload.image = body.image;
    if (body.prepTimeMin !== undefined) payload.prep_time_min = Number(body.prepTimeMin);
    if (body.isVegetarian !== undefined) payload.is_vegetarian = Boolean(body.isVegetarian);
    if (body.isVegan !== undefined) payload.is_vegan = Boolean(body.isVegan);
    if (body.spiceLevel !== undefined) payload.spice_level = Number(body.spiceLevel);
    if (body.servingSize !== undefined) payload.serving_size = body.servingSize;
    if (body.isAvailable !== undefined) payload.is_available = Boolean(body.isAvailable);

    const { data: updatedDish } = await supabase
      .from("app_dishes")
      .update(payload)
      .eq("id", id)
      .select("*")
      .single();

    return NextResponse.json({ success: true, data: updatedDish });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    console.error("Update dish error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update dish" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSession();
    const supabase = getSupabaseAdminOrThrow();
    const { id } = await params;

    const { data: dish } = await supabase
      .from("app_dishes")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (!dish) {
      return NextResponse.json(
        { success: false, error: "Dish not found" },
        { status: 404 }
      );
    }

    const cookProfile = await getCookProfileByUser(session.sub);
    if (!cookProfile || String(dish.cook_profile_id) !== String(cookProfile.id)) {
      return NextResponse.json(
        { success: false, error: "You can only delete your own dishes" },
        { status: 403 }
      );
    }

    await supabase.from("app_dishes").delete().eq("id", id);

    return NextResponse.json({
      success: true,
      data: { message: "Dish deleted successfully" },
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    console.error("Delete dish error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete dish" },
      { status: 500 }
    );
  }
}
