"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  ArrowRight,
  ChefHat,
  ShoppingBag,
  MapPin,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type Role = "CUSTOMER" | "COOK";

const SPECIALTY_OPTIONS = [
  "Indian",
  "Italian",
  "Mexican",
  "Chinese",
  "Japanese",
  "Thai",
  "Mediterranean",
  "Southern",
  "Vegan",
  "Baking",
  "BBQ",
  "Korean",
  "Ethiopian",
  "French",
  "Caribbean",
];

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<Role>("CUSTOMER");
  const [neighborhood, setNeighborhood] = useState("");
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [specialtyInput, setSpecialtyInput] = useState("");
  const [showSpecialtyDropdown, setShowSpecialtyDropdown] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function addSpecialty(value: string) {
    const trimmed = value.trim();
    if (trimmed && !specialties.includes(trimmed)) {
      setSpecialties((prev) => [...prev, trimmed]);
    }
    setSpecialtyInput("");
    setShowSpecialtyDropdown(false);
  }

  function removeSpecialty(value: string) {
    setSpecialties((prev) => prev.filter((s) => s !== value));
  }

  const filteredOptions = SPECIALTY_OPTIONS.filter(
    (opt) =>
      !specialties.includes(opt) &&
      opt.toLowerCase().includes(specialtyInput.toLowerCase())
  );

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (role === "COOK" && !neighborhood.trim()) {
      setError("Please enter your neighborhood.");
      return;
    }

    setLoading(true);

    try {
      const body: Record<string, unknown> = {
        name,
        email,
        password,
        role,
      };

      if (role === "COOK") {
        body.neighborhood = neighborhood;
        body.specialties = specialties;
      }

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed. Please try again.");
        setLoading(false);
        return;
      }

      router.push("/onboarding");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-lg animate-slide-up">
      <div className="bg-white rounded-2xl shadow-xl shadow-stone-200/50 border border-stone-200/60 p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-stone-900 mb-2">
            Join Plate
          </h1>
          <p className="text-stone-500 text-sm">
            Start discovering (or cooking!) amazing local meals
          </p>
        </div>

        {/* Role toggle */}
        <div className="mb-6">
          <div className="bg-stone-100 rounded-xl p-1 flex gap-1">
            <button
              type="button"
              onClick={() => setRole("CUSTOMER")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                role === "CUSTOMER"
                  ? "bg-white text-orange-700 shadow-sm"
                  : "text-stone-500 hover:text-stone-700"
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              I want to order food
            </button>
            <button
              type="button"
              onClick={() => setRole("COOK")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                role === "COOK"
                  ? "bg-white text-orange-700 shadow-sm"
                  : "text-stone-500 hover:text-stone-700"
              }`}
            >
              <ChefHat className="w-4 h-4" />
              I want to cook &amp; sell
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-3.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 animate-fade-in">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-stone-700 mb-1.5"
            >
              Full name
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <Input
                id="name"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="pl-10"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-stone-700 mb-1.5"
            >
              Email address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-10"
              />
            </div>
          </div>

          {/* Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-stone-700 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-stone-700 mb-1.5"
              >
                Confirm password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Cook-specific fields */}
          {role === "COOK" && (
            <div className="space-y-5 pt-2 border-t border-stone-100 animate-fade-in">
              <div className="flex items-center gap-2 pt-3">
                <ChefHat className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-semibold text-stone-700">
                  Cook Profile Details
                </span>
              </div>

              {/* Neighborhood */}
              <div>
                <label
                  htmlFor="neighborhood"
                  className="block text-sm font-medium text-stone-700 mb-1.5"
                >
                  Neighborhood
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <Input
                    id="neighborhood"
                    type="text"
                    placeholder="e.g. Brooklyn Heights, Mission District"
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Specialties multi-select */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">
                  Specialties
                </label>

                {/* Selected tags */}
                {specialties.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {specialties.map((s) => (
                      <span
                        key={s}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 text-sm rounded-full font-medium"
                      >
                        {s}
                        <button
                          type="button"
                          onClick={() => removeSpecialty(s)}
                          className="hover:text-orange-950 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Input with dropdown */}
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Type to search cuisines..."
                    value={specialtyInput}
                    onChange={(e) => {
                      setSpecialtyInput(e.target.value);
                      setShowSpecialtyDropdown(true);
                    }}
                    onFocus={() => setShowSpecialtyDropdown(true)}
                    onBlur={() =>
                      setTimeout(() => setShowSpecialtyDropdown(false), 200)
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (specialtyInput.trim()) {
                          addSpecialty(specialtyInput);
                        }
                      }
                    }}
                  />
                  {showSpecialtyDropdown && filteredOptions.length > 0 && (
                    <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-stone-200 rounded-xl shadow-lg max-h-40 overflow-y-auto">
                      {filteredOptions.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onMouseDown={() => addSpecialty(opt)}
                          className="w-full text-left px-4 py-2.5 text-sm text-stone-700 hover:bg-orange-50 hover:text-orange-700 transition-colors first:rounded-t-xl last:rounded-b-xl"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <p className="mt-1.5 text-xs text-stone-400">
                  Select from the list or type your own and press Enter
                </p>
              </div>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Creating account...
              </span>
            ) : (
              <>
                Create Account
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center gap-3">
          <div className="flex-1 h-px bg-stone-200" />
          <span className="text-xs text-stone-400 uppercase tracking-wider">
            or
          </span>
          <div className="flex-1 h-px bg-stone-200" />
        </div>

        {/* Login link */}
        <p className="text-center text-sm text-stone-600">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-orange-600 hover:text-orange-700 font-semibold"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
