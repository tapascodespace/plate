import React from "react";

type SpinnerSize = "sm" | "md" | "lg";
type SpinnerColor = "primary" | "white" | "stone";

interface SpinnerProps {
  size?: SpinnerSize;
  color?: SpinnerColor;
  className?: string;
}

const sizeClasses: Record<SpinnerSize, string> = {
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-2",
  lg: "h-10 w-10 border-3",
};

const colorClasses: Record<SpinnerColor, string> = {
  primary: "border-orange-500/30 border-t-orange-500",
  white: "border-white/30 border-t-white",
  stone: "border-stone-400/30 border-t-stone-400",
};

export function Spinner({
  size = "md",
  color = "primary",
  className = "",
}: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={`inline-block animate-spin rounded-full ${sizeClasses[size]} ${colorClasses[color]} ${className}`}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}
