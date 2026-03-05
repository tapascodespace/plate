import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { generateOrderNumber } from "@/lib/utils";

function getSupabaseAdminOrThrow() {
  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    throw new Error("Supabase service role key is required for order APIs");
  }
  return supabase;
}

type AnyRow = Record<string, any>;

async function getProfilesMap(userIds: string[]) {
  const supabase = getSupabaseAdminOrThrow();
  if (userIds.length === 0) return new Map<string, AnyRow>();

  const { data } = await supabase
    .from("app_profiles")
    .select("id, full_name, avatar_url")
    .in("id", userIds);

  return new Map((data ?? []).map((row) => [String(row.id), row]));
}

export async function getCookProfileByUser(userId: string) {
  const supabase = getSupabaseAdminOrThrow();
  const { data } = await supabase
    .from("app_cook_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  return data;
}

async function hydrateOrders(orderRows: AnyRow[]) {
  const supabase = getSupabaseAdminOrThrow();
  if (orderRows.length === 0) return [];

  const orderIds = orderRows.map((order) => String(order.id));
  const cookProfileIds = [...new Set(orderRows.map((order) => String(order.cook_profile_id)))];

  const { data: items } = await supabase
    .from("app_order_items")
    .select("*")
    .in("order_id", orderIds);

  const dishIds = [...new Set((items ?? []).map((item) => String(item.dish_id)))];
  const { data: dishes } = await supabase
    .from("app_dishes")
    .select("id, name, image")
    .in("id", dishIds);

  const { data: cookProfiles } = await supabase
    .from("app_cook_profiles")
    .select("id, user_id")
    .in("id", cookProfileIds);

  const customerIds = [...new Set(orderRows.map((order) => String(order.customer_id)))];
  const cookUserIds = [...new Set((cookProfiles ?? []).map((profile) => String(profile.user_id)))];
  const profileMap = await getProfilesMap([...new Set([...customerIds, ...cookUserIds])]);

  const { data: reviews } = await supabase
    .from("app_reviews")
    .select("id, order_id, rating, comment")
    .in("order_id", orderIds);

  const dishesMap = new Map((dishes ?? []).map((dish) => [String(dish.id), dish]));
  const cookProfileMap = new Map((cookProfiles ?? []).map((profile) => [String(profile.id), profile]));
  const reviewMap = new Map((reviews ?? []).map((review) => [String(review.order_id), review]));

  const itemsByOrder = new Map<string, AnyRow[]>();
  for (const item of items ?? []) {
    const orderId = String(item.order_id);
    const list = itemsByOrder.get(orderId) ?? [];
    list.push(item);
    itemsByOrder.set(orderId, list);
  }

  return orderRows.map((order) => {
    const orderId = String(order.id);
    const cookProfile = cookProfileMap.get(String(order.cook_profile_id));
    const cookUser = cookProfile ? profileMap.get(String(cookProfile.user_id)) : null;

    return {
      id: orderId,
      orderNumber: String(order.order_number),
      customerId: String(order.customer_id),
      cookProfileId: String(order.cook_profile_id),
      status: String(order.status),
      subtotal: Number(order.subtotal),
      deliveryFee: Number(order.delivery_fee),
      total: Number(order.total),
      deliveryAddress: order.delivery_address,
      deliveryNotes: order.delivery_notes,
      createdAt: order.created_at,
      updatedAt: order.updated_at,
      items: (itemsByOrder.get(orderId) ?? []).map((item) => ({
        id: String(item.id),
        quantity: Number(item.quantity),
        price: Number(item.price),
        notes: item.notes,
        dish: (() => {
          const dish = dishesMap.get(String(item.dish_id));
          return {
            id: String(item.dish_id),
            name: String(dish?.name ?? "Dish"),
            image: dish?.image ?? null,
          };
        })(),
      })),
      cookProfile: {
        id: String(order.cook_profile_id),
        user: {
          id: String(cookProfile?.user_id ?? ""),
          name: String(cookUser?.full_name ?? "Cook"),
          avatar: cookUser?.avatar_url ?? null,
        },
      },
      customer: (() => {
        const customer = profileMap.get(String(order.customer_id));
        return {
          id: String(order.customer_id),
          name: String(customer?.full_name ?? "Customer"),
          avatar: customer?.avatar_url ?? null,
        };
      })(),
      review: reviewMap.has(orderId)
        ? {
            id: String(reviewMap.get(orderId)?.id),
            rating: Number(reviewMap.get(orderId)?.rating),
            comment: reviewMap.get(orderId)?.comment ?? null,
          }
        : null,
    };
  });
}

export async function listOrdersForUser(userId: string, role: string) {
  const supabase = getSupabaseAdminOrThrow();

  let orderRows: AnyRow[] = [];

  if (role === "COOK") {
    const cookProfile = await getCookProfileByUser(userId);
    if (!cookProfile) return [];

    const { data } = await supabase
      .from("app_orders")
      .select("*")
      .eq("cook_profile_id", cookProfile.id)
      .order("created_at", { ascending: false });

    orderRows = data ?? [];
  } else {
    const { data } = await supabase
      .from("app_orders")
      .select("*")
      .eq("customer_id", userId)
      .order("created_at", { ascending: false });

    orderRows = data ?? [];
  }

  return hydrateOrders(orderRows);
}

export async function createOrderForUser(
  userId: string,
  payload: {
    items: { dishId: string; quantity?: number; notes?: string }[];
    deliveryAddress?: string;
    specialInstructions?: string;
  }
) {
  const supabase = getSupabaseAdminOrThrow();

  const dishIds = payload.items.map((item) => item.dishId);
  const { data: dishes } = await supabase
    .from("app_dishes")
    .select("*")
    .in("id", dishIds)
    .eq("is_available", true);

  if (!dishes || dishes.length !== dishIds.length) {
    throw new Error("One or more dishes are unavailable");
  }

  const cookProfileIds = [...new Set(dishes.map((dish) => String(dish.cook_profile_id)))];
  if (cookProfileIds.length !== 1) {
    throw new Error("All items must be from the same cook");
  }

  const dishesMap = new Map(dishes.map((dish) => [String(dish.id), dish]));
  let subtotal = 0;

  const orderItems = payload.items.map((item) => {
    const dish = dishesMap.get(item.dishId);
    if (!dish) throw new Error("Dish not found while creating order");

    const quantity = Math.max(1, Number(item.quantity ?? 1));
    const price = Number(dish.price);
    subtotal += price * quantity;

    return {
      dish_id: item.dishId,
      quantity,
      price,
      notes: item.notes ?? null,
    };
  });

  const deliveryFee = subtotal > 0 ? 3.99 : 0;
  const total = Math.round((subtotal + deliveryFee) * 100) / 100;

  const { data: insertedOrder, error } = await supabase
    .from("app_orders")
    .insert({
      order_number: generateOrderNumber(),
      customer_id: userId,
      cook_profile_id: cookProfileIds[0],
      status: "PENDING",
      subtotal,
      delivery_fee: deliveryFee,
      total,
      delivery_address: payload.deliveryAddress ?? null,
      delivery_notes: payload.specialInstructions ?? null,
    })
    .select("*")
    .single();

  if (error || !insertedOrder) {
    throw new Error("Failed to create order");
  }

  const { error: itemsError } = await supabase.from("app_order_items").insert(
    orderItems.map((item) => ({
      order_id: insertedOrder.id,
      ...item,
    }))
  );

  if (itemsError) {
    throw new Error("Failed to create order items");
  }

  const [hydrated] = await hydrateOrders([insertedOrder]);
  return hydrated;
}

export async function getOrderById(orderId: string) {
  const supabase = getSupabaseAdminOrThrow();
  const { data: order } = await supabase
    .from("app_orders")
    .select("*")
    .eq("id", orderId)
    .maybeSingle();

  if (!order) return null;
  const [hydrated] = await hydrateOrders([order]);
  return hydrated;
}

export async function updateOrderStatus(orderId: string, status: string) {
  const supabase = getSupabaseAdminOrThrow();

  const timestampPatch: Record<string, any> = {};
  if (status === "CONFIRMED") timestampPatch.confirmed_at = new Date().toISOString();
  if (status === "PREPARING") timestampPatch.prepared_at = new Date().toISOString();
  if (status === "DELIVERED") timestampPatch.delivered_at = new Date().toISOString();
  if (status === "CANCELLED") timestampPatch.cancelled_at = new Date().toISOString();

  const { data: order, error } = await supabase
    .from("app_orders")
    .update({ status, ...timestampPatch, updated_at: new Date().toISOString() })
    .eq("id", orderId)
    .select("*")
    .single();

  if (error || !order) {
    throw new Error("Failed to update order");
  }

  const [hydrated] = await hydrateOrders([order]);
  return hydrated;
}

export async function listCookOrders(userId: string, limit: number) {
  const supabase = getSupabaseAdminOrThrow();
  const cookProfile = await getCookProfileByUser(userId);
  if (!cookProfile) return null;

  const { data } = await supabase
    .from("app_orders")
    .select("*")
    .eq("cook_profile_id", cookProfile.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  const hydrated = await hydrateOrders(data ?? []);

  return hydrated.map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    customerName: order.customer.name,
    items: order.items.map((item: any) => ({
      name: item.dish.name,
      qty: item.quantity,
      price: item.price,
    })),
    total: order.total,
    status: String(order.status).toLowerCase(),
    createdAt: order.createdAt,
  }));
}

export async function getCookStats(userId: string) {
  const supabase = getSupabaseAdminOrThrow();
  const cookProfile = await getCookProfileByUser(userId);
  if (!cookProfile) return null;

  const { data: orders } = await supabase
    .from("app_orders")
    .select("*")
    .eq("cook_profile_id", cookProfile.id);

  const orderRows = orders ?? [];
  const totalOrders = orderRows.length;
  const pendingOrders = orderRows.filter((o) => ["PENDING", "CONFIRMED", "PREPARING"].includes(String(o.status))).length;
  const revenue = orderRows
    .filter((o) => String(o.status) === "DELIVERED")
    .reduce((sum, o) => sum + Number(o.total), 0);

  const recentOrders = await listCookOrders(userId, 10);

  return {
    totalOrders,
    pendingOrders,
    revenue,
    rating: Number(cookProfile.rating ?? 0),
    recentOrders: recentOrders ?? [],
  };
}

export async function submitReviewForOrder(params: {
  orderId: string;
  userId: string;
  rating: number;
  comment?: string | null;
}) {
  const supabase = getSupabaseAdminOrThrow();
  const order = await getOrderById(params.orderId);

  if (!order) throw new Error("Order not found");
  if (order.customerId !== params.userId) {
    throw new Error("Only the customer can review this order");
  }
  if (order.status !== "DELIVERED") {
    throw new Error("Can only review delivered orders");
  }
  if (order.review) {
    throw new Error("This order has already been reviewed");
  }

  const { data: createdReview, error } = await supabase
    .from("app_reviews")
    .insert({
      order_id: params.orderId,
      user_id: params.userId,
      rating: params.rating,
      comment: params.comment ?? null,
    })
    .select("*")
    .single();

  if (error || !createdReview) {
    throw new Error("Failed to create review");
  }

  const { data: cookProfile } = await supabase
    .from("app_cook_profiles")
    .select("*")
    .eq("id", order.cookProfileId)
    .maybeSingle();

  if (cookProfile) {
    const totalReviews = Number(cookProfile.total_reviews ?? 0);
    const oldRating = Number(cookProfile.rating ?? 0);
    const newTotalReviews = totalReviews + 1;
    const newRating =
      Math.round(((oldRating * totalReviews + params.rating) / newTotalReviews) * 10) /
      10;

    await supabase
      .from("app_cook_profiles")
      .update({ rating: newRating, total_reviews: newTotalReviews })
      .eq("id", order.cookProfileId);
  }

  return {
    id: String(createdReview.id),
    orderId: String(createdReview.order_id),
    userId: String(createdReview.user_id),
    rating: Number(createdReview.rating),
    comment: createdReview.comment,
    createdAt: createdReview.created_at,
  };
}
