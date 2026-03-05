import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import prisma from "@/lib/db";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { SessionUser, JwtPayload } from "@/types";

const AUTH_SECRET = process.env.AUTH_SECRET!;
const TOKEN_COOKIE = "plate_token";
const TOKEN_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds

// ─── Password helpers ──────────────────────────────────────────────────────────

const SALT_ROUNDS = 12;

/**
 * Hash a plain-text password with bcrypt.
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare a plain-text password against a bcrypt hash.
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ─── JWT helpers ───────────────────────────────────────────────────────────────

/**
 * Sign a JWT containing the user's essential fields.
 */
export function signToken(user: SessionUser): string {
  return jwt.sign(
    {
      sub: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    AUTH_SECRET,
    { expiresIn: TOKEN_MAX_AGE }
  );
}

/**
 * Verify and decode a JWT. Returns null if the token is invalid or expired.
 */
export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, AUTH_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

async function getSupabaseSessionPayload(): Promise<JwtPayload | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return null;
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      return null;
    }

    const supabaseUser = data.user;
    const email = supabaseUser.email;

    let appUser = await prisma.user.findUnique({
      where: { id: supabaseUser.id },
    });

    if (!appUser && email) {
      appUser = await prisma.user.findUnique({
        where: { email },
      });
    }

    if (!appUser) {
      if (!email) return null;

      appUser = await prisma.user.create({
        data: {
          id: supabaseUser.id,
          name:
            (supabaseUser.user_metadata?.full_name as string | undefined) ??
            email.split("@")[0],
          email,
          passwordHash: "__SUPABASE_MANAGED__",
          role: "CUSTOMER",
        },
      });
    }

    const now = Math.floor(Date.now() / 1000);
    return {
      sub: appUser.id,
      name: appUser.name,
      email: appUser.email,
      role: appUser.role,
      iat: now,
      exp: now + TOKEN_MAX_AGE,
    };
  } catch {
    return null;
  }
}

// ─── Cookie helpers ────────────────────────────────────────────────────────────

/**
 * Write the auth token into an HTTP-only cookie.
 * Call this from a Server Action or Route Handler after login/signup.
 */
export async function setAuthCookie(user: SessionUser): Promise<void> {
  const token = signToken(user);
  const cookieStore = await cookies();

  cookieStore.set(TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: TOKEN_MAX_AGE,
  });
}

/**
 * Delete the auth cookie (logout).
 */
export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(TOKEN_COOKIE);
}

// ─── Session helpers ───────────────────────────────────────────────────────────

/**
 * Read the session from the auth cookie.
 * Safe to call in Server Components, Server Actions and Route Handlers.
 *
 * @returns The decoded JWT payload, or null if not authenticated.
 */
export async function getSession(): Promise<JwtPayload | null> {
  const supabaseSession = await getSupabaseSessionPayload();
  if (supabaseSession) return supabaseSession;

  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_COOKIE)?.value;

  if (!token) return null;

  return verifyToken(token);
}

/**
 * Get the full User record for the currently authenticated user.
 * Returns null if not authenticated or the user no longer exists.
 */
export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    include: { cookProfile: true },
  });

  if (!user) return null;

  return user;
}

/**
 * Require an authenticated session. Throws if the user is not logged in.
 * Useful at the top of protected Server Actions.
 */
export async function requireSession(): Promise<JwtPayload> {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}
