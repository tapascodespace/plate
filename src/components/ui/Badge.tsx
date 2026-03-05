import React from "react";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info";
type BadgeSize = "sm" | "md";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  removable?: boolean;
  onRemove?: () => void;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-stone-100 text-stone-700",
  success: "bg-green-50 text-green-700",
  warning: "bg-amber-50 text-amber-700",
  danger: "bg-red-50 text-red-700",
  info: "bg-blue-50 text-blue-700",
};

const removeButtonColors: Record<BadgeVariant, string> = {
  default: "hover:bg-stone-200 text-stone-500",
  success: "hover:bg-green-100 text-green-500",
  warning: "hover:bg-amber-100 text-amber-500",
  danger: "hover:bg-red-100 text-red-500",
  info: "hover:bg-blue-100 text-blue-500",
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-sm",
};

export function Badge({
  children,
  variant = "default",
  size = "sm",
  removable = false,
  onRemove,
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {children}

      {removable && (
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove"
          className={`-mr-0.5 ml-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full transition-colors ${removeButtonColors[variant]}`}
        >
          <svg
            className="h-3 w-3"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
          >
            <path d="M3 3l6 6M9 3l-6 6" />
          </svg>
        </button>
      )}
    </span>
  );
}

export type { BadgeProps };
