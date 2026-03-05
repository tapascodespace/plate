import type {
  User,
  CookProfile,
  Dish,
  Order,
  OrderItem,
  Review,
  Address,
} from "@prisma/client";

// ─── Re-exports ────────────────────────────────────────────────────────────────
export type { User, CookProfile, Dish, Order, OrderItem, Review, Address };

// ─── Order status constants ────────────────────────────────────────────────────
export const ORDER_STATUS = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  PREPARING: "PREPARING",
  READY: "READY",
  OUT_FOR_DELIVERY: "OUT_FOR_DELIVERY",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

// ─── User role constants ───────────────────────────────────────────────────────
export const USER_ROLE = {
  CUSTOMER: "CUSTOMER",
  COOK: "COOK",
  ADMIN: "ADMIN",
} as const;

export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];

// ─── Cart ──────────────────────────────────────────────────────────────────────
export interface CartItem {
  dishId: string;
  name: string;
  price: number;
  quantity: number;
  cookProfileId: string;
  image?: string;
}

// ─── Session / Auth ────────────────────────────────────────────────────────────
export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface JwtPayload {
  sub: string;
  name: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

// ─── Extended Prisma types (with relations) ────────────────────────────────────
export type CookProfileWithUser = CookProfile & {
  user: Pick<User, "id" | "name" | "email" | "avatar">;
};

export type CookProfileWithDishes = CookProfile & {
  user: Pick<User, "id" | "name" | "avatar">;
  dishes: Dish[];
};

export type DishWithCook = Dish & {
  cookProfile: CookProfile & {
    user: Pick<User, "id" | "name" | "avatar">;
  };
};

export type OrderWithItems = Order & {
  items: (OrderItem & { dish: Pick<Dish, "id" | "name" | "image"> })[];
};

export type OrderFull = Order & {
  items: (OrderItem & { dish: Pick<Dish, "id" | "name" | "image"> })[];
  customer: Pick<User, "id" | "name" | "email" | "phone" | "avatar">;
  cookProfile: CookProfile & {
    user: Pick<User, "id" | "name" | "avatar">;
  };
  review: Review | null;
};

export type ReviewWithUser = Review & {
  user: Pick<User, "id" | "name" | "avatar">;
};

// ─── API helpers ───────────────────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// ─── Geo ───────────────────────────────────────────────────────────────────────
export interface LatLng {
  latitude: number;
  longitude: number;
}
