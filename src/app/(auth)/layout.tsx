import Link from "next/link";
import { UtensilsCrossed } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-orange-50 via-stone-50 to-amber-50 relative overflow-hidden">
      {/* Decorative background shapes */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-orange-200/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-amber-200/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-100/20 rounded-full blur-3xl" />
        {/* Subtle dot pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.03]">
          <pattern
            id="dots"
            x="0"
            y="0"
            width="32"
            height="32"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="1" cy="1" r="1" fill="currentColor" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>
      </div>

      {/* Logo header */}
      <div className="relative z-10 pt-8 pb-4 flex justify-center">
        <Link
          href="/"
          className="flex items-center gap-2.5 group"
        >
          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center group-hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20">
            <UtensilsCrossed className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold text-stone-900 tracking-tight">
            Plate
          </span>
        </Link>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        {children}
      </div>

      {/* Footer note */}
      <div className="relative z-10 pb-6 text-center">
        <p className="text-xs text-stone-400">
          &copy; {new Date().getFullYear()} Plate. All rights reserved.
        </p>
      </div>
    </div>
  );
}
