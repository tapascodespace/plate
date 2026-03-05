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

    let externalAuthUserId: string | null = null;
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
        user_metadata: {
          full_name: name,
        },
      });

      if (error) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 400 }
        );
      }

      externalAuthUserId = data.user?.id ?? null;

      if (supabaseClient) {
        await supabaseClient.auth.signInWithPassword({ email, password });
      }
    } else if (supabaseUrl && supabaseAnonKey) {
      const { data, error } = await supabaseClient!.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });

      if (error) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 400 }
        );
      }

      externalAuthUserId = data.user?.id ?? null;
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "A user with this email already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
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

    if (supabaseAdmin) {
      const { error: profileSyncError } = await supabaseAdmin.from("app_profiles").upsert(
        {
          id: user.id,
          full_name: user.name,
          email: user.email,
          onboarding_completed: false,
        },
        { onConflict: "id" }
      );

      if (profileSyncError) {
        console.warn("Register app_profiles sync warning:", profileSyncError.message);
      }

      if (user.role === "COOK") {
        const { error: cookProfileSyncError } = await supabaseAdmin.from("app_cook_profiles").upsert(
          {
            user_id: user.id,
            specialties: Array.isArray(specialties)
              ? specialties.join(", ")
              : specialties ?? null,
            neighborhood: neighborhood ?? null,
          },
          { onConflict: "user_id" }
        );

        if (cookProfileSyncError) {
          console.warn("Register app_cook_profiles sync warning:", cookProfileSyncError.message);
        }
      }
    }

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
