"use client";

import React from "react";
import { Star } from "lucide-react";

type StarRatingSize = "sm" | "md" | "lg";

interface StarRatingProps {
  /** Current rating value (0-5, supports halves like 3.5) */
  value: number;
  /** Maximum number of stars */
  max?: number;
  /** If true, user can click to set a rating */
  interactive?: boolean;
  /** Callback when user selects a rating (interactive mode) */
  onChange?: (value: number) => void;
  size?: StarRatingSize;
  className?: string;
}

const sizeMap: Record<StarRatingSize, number> = {
  sm: 14,
  md: 18,
  lg: 24,
};

const gapClasses: Record<StarRatingSize, string> = {
  sm: "gap-0.5",
  md: "gap-0.5",
  lg: "gap-1",
};

export function StarRating({
  value,
  max = 5,
  interactive = false,
  onChange,
  size = "md",
  className = "",
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = React.useState<number | null>(null);

  const displayValue = hoverValue ?? value;
  const iconSize = sizeMap[size];

  const handleClick = (starIndex: number) => {
    if (!interactive || !onChange) return;
    onChange(starIndex);
  };

  const stars = Array.from({ length: max }, (_, i) => {
    const starNumber = i + 1;
    const fill = Math.min(1, Math.max(0, displayValue - i));

    return (
      <span
        key={i}
        className={`relative inline-flex ${interactive ? "cursor-pointer" : ""}`}
        onClick={() => handleClick(starNumber)}
        onMouseEnter={() => interactive && setHoverValue(starNumber)}
        onMouseLeave={() => interactive && setHoverValue(null)}
        role={interactive ? "button" : undefined}
        tabIndex={interactive ? 0 : undefined}
        aria-label={interactive ? `Rate ${starNumber} star${starNumber > 1 ? "s" : ""}` : undefined}
        onKeyDown={(e) => {
          if (interactive && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            handleClick(starNumber);
          }
        }}
      >
        {/* Background (empty) star */}
        <Star
          size={iconSize}
          className="text-stone-200"
          fill="currentColor"
          strokeWidth={0}
        />

        {/* Filled overlay */}
        {fill > 0 && (
          <span
            className="absolute inset-0 overflow-hidden"
            style={{ width: `${fill * 100}%` }}
          >
            <Star
              size={iconSize}
              className="text-amber-400"
              fill="currentColor"
              strokeWidth={0}
            />
          </span>
        )}
      </span>
    );
  });

  return (
    <div
      className={`inline-flex items-center ${gapClasses[size]} ${className}`}
      role={interactive ? "radiogroup" : "img"}
      aria-label={interactive ? "Star rating" : `Rating: ${value} out of ${max}`}
    >
      {stars}
    </div>
  );
}

export type { StarRatingProps };
