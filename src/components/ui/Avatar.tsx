import React from "react";

type AvatarSize = "sm" | "md" | "lg" | "xl";

interface AvatarProps {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: AvatarSize;
  online?: boolean;
  className?: string;
}

const sizeClasses: Record<AvatarSize, string> = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-lg",
  xl: "h-20 w-20 text-2xl",
};

const indicatorSizes: Record<AvatarSize, string> = {
  sm: "h-2.5 w-2.5 border",
  md: "h-3 w-3 border-2",
  lg: "h-3.5 w-3.5 border-2",
  xl: "h-4 w-4 border-2",
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function Avatar({
  src,
  alt = "",
  name = "",
  size = "md",
  online,
  className = "",
}: AvatarProps) {
  const [imageError, setImageError] = React.useState(false);
  const showImage = src && !imageError;
  const initials = name ? getInitials(name) : "?";

  return (
    <div className={`relative inline-flex shrink-0 ${className}`}>
      {showImage ? (
        <img
          src={src}
          alt={alt || name}
          onError={() => setImageError(true)}
          className={`rounded-full object-cover ${sizeClasses[size]}`}
        />
      ) : (
        <div
          aria-label={alt || name || "Avatar"}
          className={`inline-flex items-center justify-center rounded-full bg-orange-100 font-semibold text-orange-600 ${sizeClasses[size]}`}
        >
          {initials}
        </div>
      )}

      {online !== undefined && (
        <span
          aria-label={online ? "Online" : "Offline"}
          className={`absolute bottom-0 right-0 rounded-full border-white ${
            online ? "bg-green-500" : "bg-stone-300"
          } ${indicatorSizes[size]}`}
        />
      )}
    </div>
  );
}

export type { AvatarProps };
