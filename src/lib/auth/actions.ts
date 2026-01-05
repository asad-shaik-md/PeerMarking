"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { UserRole } from "@/types/auth";

export async function signInWithGoogle(role?: UserRole) {
  const supabase = await createClient();
  
  // Store role in a cookie for the callback to read (more reliable than URL params)
  if (role) {
    const cookieStore = await cookies();
    cookieStore.set("oauth_signup_role", role, {
      path: "/",
      maxAge: 60 * 10, // 10 minutes
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
  }
  
  const redirectUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`;
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: redirectUrl,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.url) {
    // Return the URL for client-side navigation (ensures cookie is set before redirect)
    return { url: data.url };
  }

  return { error: "Failed to initiate Google sign-in" };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getUserRole(): Promise<UserRole | null> {
  const user = await getUser();
  if (!user) return null;
  return (user.user_metadata?.role as UserRole) || "student";
}
