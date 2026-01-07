"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function signInWithEmail(email: string, password: string) {
  const supabase = await createClient();

  // First, try to sign in
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (!signInError && signInData.user) {
    // Successfully signed in - check if user has a role
    const existingRole = signInData.user.user_metadata?.role;
    
    if (!existingRole) {
      // User exists but no role - redirect to complete profile
      return { redirect: "/auth/complete-profile" };
    }
    
    // Existing user with role - redirect to dashboard
    const redirectPath = existingRole === "marker" ? "/marker/dashboard" : "/student/dashboard";
    return { redirect: redirectPath };
  }

  // If sign in failed with "Invalid login credentials", the user might not exist
  if (signInError?.message === "Invalid login credentials") {
    // Try to sign up
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    });

    if (signUpError) {
      return { error: signUpError.message };
    }

    if (signUpData.user) {
      // Check if email confirmation is required
      if (signUpData.user.identities?.length === 0) {
        // User already exists but wrong password was entered
        return { error: "Invalid email or password" };
      }
      
      if (signUpData.session) {
        // Auto-confirmed (e.g., in development) - redirect to complete profile
        return { redirect: "/auth/complete-profile" };
      } else {
        // Email confirmation required
        return { confirmEmail: true };
      }
    }
  }

  // Other error
  return { error: signInError?.message || "Failed to sign in" };
}

export async function signInWithGoogle() {
  const supabase = await createClient();
  
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

export type UserRole = "student" | "marker";

export async function getUserRole(): Promise<UserRole | null> {
  const user = await getUser();
  if (!user) return null;
  return (user.user_metadata?.role as UserRole) || null;
}
