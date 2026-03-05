import { format, formatDistanceToNow } from "date-fns";

/**
 * Merge class names, filtering out falsy values.
 * Lightweight alternative to clsx — uses template-literal–friendly API.
 *
 * @example cn("base", condition && "extra", undefined, "always")
 */
export function cn(
  ...inputs: (string | boolean | null | undefined)[]
): string {
  return inputs.filter(Boolean).join(" ");
}

/**
 * Format a number as a currency string (defaults to GBP).
 */
export function formatPrice(
  amount: number,
  currency: string = "GBP",
  locale: string = "en-GB"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a Date (or ISO string) into a human-readable string.
 *
 * @param date   - Date object or ISO string
 * @param style  - "short" → "4 Mar 2026", "long" → "4 March 2026, 14:30",
 *                 "relative" → "3 hours ago"
 */
export function formatDate(
  date: Date | string,
  style: "short" | "long" | "relative" = "short"
): string {
  const d = typeof date === "string" ? new Date(date) : date;

  switch (style) {
    case "short":
      return format(d, "d MMM yyyy");
    case "long":
      return format(d, "d MMMM yyyy, HH:mm");
    case "relative":
      return formatDistanceToNow(d, { addSuffix: true });
  }
}

/**
 * Generate a unique order number in the format PLT-XXXXXX
 * (6 uppercase alphanumeric characters).
 */
export function generateOrderNumber(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous 0/O, 1/I
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `PLT-${code}`;
}

/**
 * Extract initials from a full name (max 2 characters).
 *
 * @example getInitials("Tapas Banerjee") → "TB"
 */
export function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

/**
 * Calculate the distance in kilometres between two lat/lng points
 * using the Haversine formula.
 */
export function getDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c * 100) / 100; // 2 decimal places
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * Truncate text to a maximum length, appending an ellipsis if truncated.
 */
export function truncate(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "\u2026";
}
