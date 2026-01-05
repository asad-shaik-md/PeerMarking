import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Check if user has a role already (existing user)
      const existingRole = data.user.user_metadata?.role;
      
      if (!existingRole) {
        // New user - redirect to complete profile
        const forwardedHost = request.headers.get("x-forwarded-host");
        const isLocalEnv = process.env.NODE_ENV === "development";
        const completeProfileUrl = "/auth/complete-profile";

        if (isLocalEnv) {
          return NextResponse.redirect(`${origin}${completeProfileUrl}`);
        } else if (forwardedHost) {
          return NextResponse.redirect(`https://${forwardedHost}${completeProfileUrl}`);
        } else {
          return NextResponse.redirect(`${origin}${completeProfileUrl}`);
        }
      }

      // Existing user - redirect to dashboard
      let redirectPath = next;
      if (next === "/" || next === "/login" || next === "/signup") {
        redirectPath = existingRole === "marker" ? "/marker/dashboard" : "/student/dashboard";
      }

      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${redirectPath}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${redirectPath}`);
      } else {
        return NextResponse.redirect(`${origin}${redirectPath}`);
      }
    }
  }

  // Return to login page with error
  return NextResponse.redirect(`${origin}/login?error=Could not authenticate user`);
}
