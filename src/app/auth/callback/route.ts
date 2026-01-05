import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";
  
  // Check for role in cookie (set during signup flow)
  const cookieStore = await cookies();
  const roleCookie = cookieStore.get("oauth_signup_role");
  const role = roleCookie?.value as "student" | "marker" | undefined;
  
  // Clear the cookie after reading
  if (roleCookie) {
    cookieStore.delete("oauth_signup_role");
  }

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Check if user has a role already (existing user)
      const existingRole = data.user.user_metadata?.role;
      
      // If role is provided via cookie (from signup flow), set it for new users
      if (role && (role === "student" || role === "marker") && !existingRole) {
        // This is a new signup via Google - set the role
        await supabase.auth.updateUser({
          data: {
            role: role,
            full_name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || data.user.email?.split("@")[0],
          },
        });
      } else if (!existingRole && !role) {
        // This is a login attempt but user doesn't exist (no role)
        // Sign them out and redirect to login with error
        await supabase.auth.signOut();
        return NextResponse.redirect(`${origin}/login?error=No account found. Please sign up first.`);
      }

      // Get role (either existing or newly set)
      const userRole = role || existingRole;
      let redirectPath = next;

      if (next === "/" || next === "/login") {
        redirectPath = userRole === "marker" ? "/marker/dashboard" : "/student/dashboard";
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
