import Link from "next/link";
import { UtensilsCrossed, Heart, Instagram, Twitter, Facebook } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Branding */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center">
                <UtensilsCrossed className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                Plate
              </span>
            </Link>
            <p className="text-stone-400 text-sm leading-relaxed">
              Connecting you with talented home cooks in your neighborhood.
              Real food, real people, real delicious.
            </p>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              Explore
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/explore"
                  className="text-sm text-stone-400 hover:text-orange-400 transition-colors"
                >
                  Find Meals
                </Link>
              </li>
              <li>
                <Link
                  href="/orders"
                  className="text-sm text-stone-400 hover:text-orange-400 transition-colors"
                >
                  My Orders
                </Link>
              </li>
              <li>
                <Link
                  href="/cook/dashboard"
                  className="text-sm text-stone-400 hover:text-orange-400 transition-colors"
                >
                  Cook Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              Account
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/login"
                  className="text-sm text-stone-400 hover:text-orange-400 transition-colors"
                >
                  Log In
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="text-sm text-stone-400 hover:text-orange-400 transition-colors"
                >
                  Sign Up
                </Link>
              </li>
              <li>
                <Link
                  href="/building"
                  className="text-sm text-stone-400 hover:text-orange-400 transition-colors"
                >
                  Building
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              Follow Us
            </h4>
            <div className="flex items-center gap-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-stone-800 flex items-center justify-center text-stone-400 hover:bg-orange-500 hover:text-white transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-stone-800 flex items-center justify-center text-stone-400 hover:bg-orange-500 hover:text-white transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-stone-800 flex items-center justify-center text-stone-400 hover:bg-orange-500 hover:text-white transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-stone-800 mt-10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-stone-500">
            &copy; {new Date().getFullYear()} Plate. All rights reserved.
          </p>
          <p className="text-sm text-stone-500 flex items-center gap-1">
            Made with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> for home cooks everywhere
          </p>
        </div>
      </div>
    </footer>
  );
}
