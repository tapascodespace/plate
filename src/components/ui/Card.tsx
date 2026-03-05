import React from "react";

type CardPadding = "none" | "sm" | "md" | "lg";

interface CardProps {
  children: React.ReactNode;
  image?: string;
  imageAlt?: string;
  padding?: CardPadding;
  clickable?: boolean;
  onClick?: () => void;
  className?: string;
}

const paddingClasses: Record<CardPadding, string> = {
  none: "p-0",
  sm: "p-3",
  md: "p-4",
  lg: "p-6",
};

export function Card({
  children,
  image,
  imageAlt = "",
  padding = "md",
  clickable = false,
  onClick,
  className = "",
}: CardProps) {
  const baseClasses =
    "overflow-hidden rounded-xl border border-stone-200 bg-white";

  const interactiveClasses = clickable
    ? "cursor-pointer transition-shadow duration-200 hover:shadow-lg hover:shadow-stone-200/50 active:shadow-md"
    : "";

  const Component = clickable ? "button" : "div";

  return (
    <Component
      onClick={clickable ? onClick : undefined}
      className={`${baseClasses} ${interactiveClasses} ${clickable ? "w-full text-left" : ""} ${className}`}
    >
      {image && (
        <div className="aspect-[16/10] w-full overflow-hidden">
          <img
            src={image}
            alt={imageAlt}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        </div>
      )}
      <div className={paddingClasses[padding]}>{children}</div>
    </Component>
  );
}

/* Sub-components for structured card content */

export function CardHeader({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`mb-2 ${className}`}>{children}</div>;
}

export function CardTitle({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h3 className={`text-lg font-semibold text-stone-900 ${className}`}>
      {children}
    </h3>
  );
}

export function CardDescription({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={`text-sm text-stone-500 ${className}`}>{children}</p>
  );
}

export function CardFooter({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`mt-3 flex items-center justify-between border-t border-stone-100 pt-3 ${className}`}
    >
      {children}
    </div>
  );
}

export type { CardProps };
