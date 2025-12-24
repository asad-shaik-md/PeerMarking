"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { UserRole } from "@/types/auth";

export async function signUp(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("fullName") as string;
  const role = formData.get("role") as UserRole;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: role,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  // Check if this is a fake signup (email already exists)
  // Supabase returns a user with identities = [] when email already exists
  if (data.user && data.user.identities && data.user.identities.length === 0) {
    return { error: "An account with this email already exists. Please log in instead." };
  }

  // Redirect based on role after signup
  if (role === "marker") {
    redirect("/marker/dashboard");
  } else {
    redirect("/student/dashboard");
  }
}

export async function signIn(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  // Get user role and redirect accordingly
  const role = data.user.user_metadata?.role as string | undefined;

  if (role === "marker") {
    redirect("/marker/dashboard");
  } else {
    redirect("/student/dashboard");
  }
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function forgotPassword(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/reset-password`,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
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
