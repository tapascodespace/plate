import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { clearAuthCookie } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json({
      success: true,
      data: { message: "Logged out successfully" },
    });

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (supabaseUrl && supabaseAnonKey) {
        const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
          cookies: {
            getAll() {
              return request.cookies.getAll();
            },
            setAll(cookiesToSet) {
              for (const cookie of cookiesToSet) {
                response.cookies.set(cookie.name, cookie.value, cookie.options);
              }
            },
          },
        });

        await supabase.auth.signOut();
      }
    } catch {
      // Ignore Supabase sign-out issues and always clear app cookie
    }

    await clearAuthCookie();

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to log out" },
      { status: 500 }
    );
  }
}
