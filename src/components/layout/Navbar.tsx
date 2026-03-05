"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  UtensilsCrossed,
  ShoppingBag,
  Menu,
  X,
  User,
  LogOut,
  ChefHat,
  LayoutDashboard,
  Building2,
} from "lucide-react";
import { useCartStore } from "@/lib/store";

interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: "CUSTOMER" | "COOK";
}

export default function Navbar() {
  const [session, setSession] = useState<SessionUser | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const itemCount = useCartStore((s) => s.getItemCount());

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) setSession(data.user);
      })
      .catch(() => {});
  }, []);

  // Close user menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setSession(null);
    setUserMenuOpen(false);
    router.push("/");
    router.refresh();
  }

  const navLinks = [
    { href: "/explore", label: "Explore" },
    { href: "/orders", label: "Orders" },
    { href: "/building", label: "Building" },
    { href: "/cook/dashboard", label: "Cook" },
  ];

  const quickActions = session
    ? [
        { href: "/explore", label: "Explore", icon: UtensilsCrossed },
        { href: "/cart", label: "Cart", icon: ShoppingBag },
        {
          href: session.role === "COOK" ? "/cook/orders" : "/orders",
          label: session.role === "COOK" ? "Cook Orders" : "Orders",
          icon: LayoutDashboard,
        },
        {
          href: session.role === "COOK" ? "/cook/dashboard" : "/building",
          label: session.role === "COOK" ? "Cook Dashboard" : "Building",
          icon: session.role === "COOK" ? ChefHat : Building2,
        },
      ]
    : [
        { href: "/login", label: "Log In", icon: User },
        { href: "/register", label: "Sign Up", icon: LayoutDashboard },
        { href: "/explore", label: "Explore", icon: UtensilsCrossed },
        { href: "/cart", label: "Cart", icon: ShoppingBag },
      ];

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-stone-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 group"
          >
            <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center group-hover:bg-orange-600 transition-colors">
              <UtensilsCrossed className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-stone-900 tracking-tight">
              Plate
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-stone-600 hover:text-orange-600 font-medium transition-colors text-sm"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Cart */}
            <Link
              href="/cart"
              className="relative p-2 rounded-lg text-stone-600 hover:text-orange-600 hover:bg-orange-50 transition-colors"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-orange-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </Link>

            {/* User menu / Auth links */}
            {session ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="flex items-center gap-2 p-2 rounded-lg text-stone-600 hover:text-orange-600 hover:bg-orange-50 transition-colors"
                >
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-orange-700">
                      {session.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden sm:block text-sm font-medium max-w-[120px] truncate">
                    {session.name}
                  </span>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-stone-200 py-2 animate-fade-in">
                    <div className="px-4 py-2 border-b border-stone-100">
                      <p className="text-sm font-medium text-stone-900 truncate">
                        {session.name}
                      </p>
                      <p className="text-xs text-stone-500 truncate">
                        {session.email}
                      </p>
                    </div>
                    <Link
                      href={session.role === "COOK" ? "/cook/profile" : "/building"}
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 hover:bg-orange-50 hover:text-orange-700 transition-colors"
                    >
                      {session.role === "COOK" ? (
                        <User className="w-4 h-4" />
                      ) : (
                        <Building2 className="w-4 h-4" />
                      )}
                      {session.role === "COOK" ? "Profile" : "My Building"}
                    </Link>
                    {session.role === "COOK" ? (
                      <Link
                        href="/cook/dashboard"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 hover:bg-orange-50 hover:text-orange-700 transition-colors"
                      >
                        <ChefHat className="w-4 h-4" />
                        Cook Dashboard
                      </Link>
                    ) : (
                      <Link
                        href="/orders"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 hover:bg-orange-50 hover:text-orange-700 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        My Orders
                      </Link>
                    )}
                    <div className="border-t border-stone-100 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-stone-700 hover:text-orange-600 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden p-2 rounded-lg text-stone-600 hover:text-orange-600 hover:bg-orange-50 transition-colors"
            >
              {mobileOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="border-t border-stone-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {quickActions.map((action) => {
              const Icon = action.icon;
              const isActive = pathname === action.href || pathname.startsWith(`${action.href}/`);

              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? "border-orange-200 bg-orange-50 text-orange-700"
                      : "border-stone-200 text-stone-600 hover:bg-stone-50 hover:text-orange-600"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {action.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-stone-200 bg-white animate-slide-up">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 rounded-lg text-stone-700 hover:bg-orange-50 hover:text-orange-700 font-medium transition-colors"
              >
                {link.label}
              </Link>
            ))}
            {session && (
              <>
                <div className="border-t border-stone-100 my-2" />
                <Link
                  href={session.role === "COOK" ? "/cook/profile" : "/building"}
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 rounded-lg text-stone-700 hover:bg-orange-50 hover:text-orange-700 font-medium transition-colors"
                >
                  {session.role === "COOK" ? "Profile" : "My Building"}
                </Link>
              </>
            )}
            {!session && (
              <>
                <div className="border-t border-stone-100 my-2" />
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 rounded-lg text-stone-700 hover:bg-orange-50 hover:text-orange-700 font-medium transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 rounded-lg text-white bg-orange-500 hover:bg-orange-600 font-medium text-center transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
