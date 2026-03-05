import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import prisma from "@/lib/db";
import { hashPassword, setAuthCookie } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, role, neighborhood, specialties } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    const validRoles = ["CUSTOMER", "COOK"] as const;
    const userRole = validRoles.includes(role) ? role : "CUSTOMER";

    // ── Step 1: Check Prisma FIRST to prevent orphaned Supabase users ──────────
    const existingPrismaUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingPrismaUser) {
      return NextResponse.json(
        { success: false, error: "An account with this email already exists. Please sign in." },
        { status: 409 }
      );
    }

    // ── Step 2: Create / locate Supabase auth user ─────────────────────────────
    let externalAuthUserId: string | null = null;
    let supabaseUserCreated = false;
    const supabaseCookiesToSet: {
      name: string;
      value: string;
      options: CookieOptions;
    }[] = [];

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabaseAdmin = createSupabaseAdminClient();
    const supabaseClient =
      supabaseUrl && supabaseAnonKey
        ? createServerClient(supabaseUrl, supabaseAnonKey, {
            cookies: {
              getAll() {
                return request.cookies.getAll();
              },
              setAll(cookiesToSet) {
                for (const cookie of cookiesToSet) {
                  supabaseCookiesToSet.push(cookie);
                }
              },
            },
          })
        : null;

    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: name },
      });

      if (error) {
        // If Supabase says the user already exists, it means a previous registration
        // attempt partially failed (Supabase succeeded but Prisma didn't).
        // Recover by finding that existing Supabase user and continuing with
        // Prisma creation below.
        if (
          error.message.toLowerCase().includes("already registered") ||
          error.message.toLowerCase().includes("already been registered") ||
          error.message.toLowerCase().includes("user already exists")
        ) {
          // Recovery path: Supabase auth user exists but Prisma record is missing.
          // Find the orphaned Supabase user so we can link the new Prisma record.
          const { data: listData } = await supabaseAdmin.auth.admin.listUsers({
            page: 1,
            perPage: 1000,
          });
          const orphanedUser = listData?.users?.find((u) => u.email === email);
          if (orphanedUser) {
            externalAuthUserId = orphanedUser.id;
            // Don't mark as newly created — no cleanup needed if Prisma fails
          } else {
            return NextResponse.json(
              { success: false, error: "An account with this email already exists. Please sign in." },
              { status: 409 }
            );
          }
        } else {
          return NextResponse.json(
            { success: false, error: error.message },
            { status: 400 }
          );
        }
      } else {
        externalAuthUserId = data.user?.id ?? null;
        supabaseUserCreated = true;
      }

      // Sign the user in via the SSR client so session cookies are set
      if (supabaseClient && externalAuthUserId) {
        await supabaseClient.auth.signInWithPassword({ email, password });
      }
    } else if (supabaseUrl && supabaseAnonKey && supabaseClient) {
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
      });

      if (error) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 400 }
        );
      }

      externalAuthUserId = data.user?.id ?? null;
      supabaseUserCreated = true;
    }

    // ── Step 3: Create Prisma user (with rollback on failure) ──────────────────
    const hashedPassword = await hashPassword(password);

    let user;
    try {
      user = await prisma.user.create({
        data: {
          ...(externalAuthUserId ? { id: externalAuthUserId } : {}),
          name,
          email,
          passwordHash: hashedPassword,
          role: userRole,
          ...(userRole === "COOK"
            ? {
                cookProfile: {
                  create: {
                    neighborhood: neighborhood ?? null,
                    specialties: Array.isArray(specialties)
                      ? specialties.join(", ")
                      : null,
                  },
                },
              }
            : {}),
        },
        include: {
          cookProfile: userRole === "COOK",
        },
      });
    } catch (prismaError) {
      // Rollback: delete the newly created Supabase user so the next attempt works
      if (supabaseAdmin && supabaseUserCreated && externalAuthUserId) {
        await supabaseAdmin.auth.admin.deleteUser(externalAuthUserId).catch((e) =>
          console.error("Supabase rollback failed:", e)
        );
      }
      console.error("Prisma user creation error:", prismaError);
      return NextResponse.json(
        { success: false, error: "Failed to create account. Please try again." },
        { status: 500 }
      );
    }

    // ── Step 4: Issue session cookie ────────────────────────────────────────────
    await setAuthCookie({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as "CUSTOMER" | "COOK" | "ADMIN",
    });

    const response = NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          onboardingCompleted: user.onboardingCompleted,
          cookProfile: user.cookProfile ?? null,
        },
      },
      { status: 201 }
    );

    for (const cookie of supabaseCookiesToSet) {
      response.cookies.set(cookie.name, cookie.value, cookie.options);
    }

    return response;
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to register user" },
      { status: 500 }
    );
  }
}
