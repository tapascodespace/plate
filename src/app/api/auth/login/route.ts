import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import prisma from "@/lib/db";
import { hashPassword, verifyPassword, setAuthCookie } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabaseCookiesToSet: {
      name: string;
      value: string;
      options: CookieOptions;
    }[] = [];

    let user = await prisma.user.findUnique({
      where: { email },
      include: {
        cookProfile: true,
      },
    });

    if (supabaseUrl && supabaseAnonKey) {
      const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
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
      });

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data.user) {
        return NextResponse.json(
          { success: false, error: "Invalid email or password" },
          { status: 401 }
        );
      }

      if (!user) {
        user = await prisma.user.create({
          data: {
            id: data.user.id,
            name:
              (data.user.user_metadata?.full_name as string | undefined) ??
              email.split("@")[0],
            email,
            passwordHash: await hashPassword(password),
            role: "CUSTOMER",
          },
          include: {
            cookProfile: true,
          },
        });
      }
    } else {
      if (!user) {
        return NextResponse.json(
          { success: false, error: "Invalid email or password" },
          { status: 401 }
        );
      }

      const isValid = await verifyPassword(password, user.passwordHash);
      if (!isValid) {
        return NextResponse.json(
          { success: false, error: "Invalid email or password" },
          { status: 401 }
        );
      }
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const supabaseAdmin = createSupabaseAdminClient();
    if (supabaseAdmin) {
      const { error: profileSyncError } = await supabaseAdmin.from("app_profiles").upsert(
        {
          id: user.id,
          full_name: user.name,
          email: user.email,
        },
        { onConflict: "id" }
      );

      if (profileSyncError) {
        console.warn("Login app_profiles sync warning:", profileSyncError.message);
      }

      if (user.role === "COOK") {
        const { error: cookProfileSyncError } = await supabaseAdmin.from("app_cook_profiles").upsert(
          {
            user_id: user.id,
          },
          { onConflict: "user_id" }
        );

        if (cookProfileSyncError) {
          console.warn("Login app_cook_profiles sync warning:", cookProfileSyncError.message);
        }
      }
    }

    await setAuthCookie({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as "CUSTOMER" | "COOK" | "ADMIN",
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        onboardingCompleted: user.onboardingCompleted,
        cookProfile: user.cookProfile ?? null,
      },
    });

    for (const cookie of supabaseCookiesToSet) {
      response.cookies.set(cookie.name, cookie.value, cookie.options);
    }

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to log in" },
      { status: 500 }
    );
  }
}
