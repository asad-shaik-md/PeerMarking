import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make your application
  // vulnerable to malicious users.

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Define protected routes
  const protectedRoutes = ["/student", "/marker"];
  const authRoutes = ["/login", "/signup", "/forgot-password"];

  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // If user is not authenticated and trying to access protected routes
  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // If user is authenticated and trying to access auth routes, redirect to appropriate dashboard
  if (user && isAuthRoute) {
    // Get user role from user metadata
    const role = user.user_metadata?.role as string | undefined;
    const url = request.nextUrl.clone();

    if (role === "marker") {
      url.pathname = "/marker/dashboard";
    } else {
      url.pathname = "/student/dashboard";
    }

    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
