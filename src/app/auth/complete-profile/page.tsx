"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { UserRole } from "@/types/auth";

export default function CompleteProfilePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRole>("student");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadUserData() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // No user, redirect to login
        router.push("/login");
        return;
      }

      // If user already has a role, redirect to dashboard
      if (user.user_metadata?.role) {
        const userRole = user.user_metadata.role;
        router.push(userRole === "marker" ? "/marker/dashboard" : "/student/dashboard");
        return;
      }

      // Pre-fill name from Google profile
      const googleName = user.user_metadata?.full_name || user.user_metadata?.name || "";
      setName(googleName);
      setEmail(user.email || "");
      setIsInitializing(false);
    }

    loadUserData();
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          full_name: name.trim(),
          role: role,
        },
      });

      if (updateError) {
        setError(updateError.message);
        setIsLoading(false);
        return;
      }

      // Redirect to appropriate dashboard
      router.push(role === "marker" ? "/marker/dashboard" : "/student/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  }

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-400">
          <span className="material-symbols-outlined animate-spin text-2xl">progress_activity</span>
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 min-h-screen">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[100px]"></div>
        <div className="absolute top-[40%] -right-[5%] w-[30%] h-[50%] bg-primary/5 rounded-full blur-[120px]"></div>
      </div>

      {/* Logo */}
      <Link href="/" className="relative z-10 mb-8 flex items-center gap-3 hover:opacity-80 transition-opacity">
        <div className="bg-primary/20 p-2.5 rounded-xl shadow-glow">
          <img src="/logo.png" alt="Marklynx" className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          <span className="text-primary">Mark</span>lynx
        </h1>
      </Link>

      {/* Profile Card */}
      <div className="relative z-10 w-full max-w-[420px] bg-surface-dark rounded-2xl shadow-xl shadow-black/20 border border-white/5 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>

        <div className="p-8 sm:p-10">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-4xl text-primary">person_add</span>
            </div>
            <h2 className="text-2xl font-bold text-white">Complete Your Profile</h2>
            <p className="mt-2 text-sm text-text-muted">
              Just a few more details to get started
            </p>
            {email && (
              <p className="mt-2 text-xs text-slate-500">
                Signing in as {email}
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-3">
                <span className="material-symbols-outlined text-lg shrink-0">error</span>
                <span>{error}</span>
              </div>
            )}

            {/* Name Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300" htmlFor="name">
                Your Name
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                  person
                </span>
                <input
                  className="block w-full rounded-xl border border-white/10 bg-background-dark/50 pl-10 pr-4 py-3 text-sm text-white placeholder-slate-400 focus:border-primary focus:ring-1 focus:ring-primary shadow-sm transition-all"
                  id="name"
                  name="name"
                  placeholder="Enter your full name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Role Toggle */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-300">
                I am joining as
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("student")}
                  className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                    role === "student"
                      ? "bg-blue-500/10 border-blue-500/50 ring-1 ring-blue-500/30"
                      : "bg-white/5 border-white/10 hover:border-white/20"
                  }`}
                >
                  <span className={`material-symbols-outlined text-2xl ${role === "student" ? "text-blue-500" : "text-slate-400"}`}>
                    menu_book
                  </span>
                  <span className={`text-sm font-medium ${role === "student" ? "text-white" : "text-slate-400"}`}>
                    Student
                  </span>
                  {role === "student" && (
                    <span className="absolute top-2 right-2 material-symbols-outlined text-blue-500 text-sm">check_circle</span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setRole("marker")}
                  className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                    role === "marker"
                      ? "bg-primary/10 border-primary/50 ring-1 ring-primary/30"
                      : "bg-white/5 border-white/10 hover:border-white/20"
                  }`}
                >
                  <span className={`material-symbols-outlined text-2xl ${role === "marker" ? "text-primary" : "text-slate-400"}`}>
                    history_edu
                  </span>
                  <span className={`text-sm font-medium ${role === "marker" ? "text-white" : "text-slate-400"}`}>
                    Marker
                  </span>
                  {role === "marker" && (
                    <span className="absolute top-2 right-2 material-symbols-outlined text-primary text-sm">check_circle</span>
                  )}
                </button>
              </div>
              <p className="text-xs text-slate-500 text-center">
                {role === "student" 
                  ? "Submit practice answers and receive feedback from seniors" 
                  : "Review student submissions and help them improve"}
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center gap-2 py-4 px-6 border border-transparent rounded-xl shadow-glow text-base font-bold text-background-dark bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
                  Creating account...
                </>
              ) : (
                <>
                  Get Started
                  <span className="material-symbols-outlined text-xl">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          {/* Terms */}
          <p className="mt-6 text-xs text-center text-slate-500">
            By continuing, you agree to our{" "}
            <a className="text-primary hover:underline" href="#">
              Terms of Service
            </a>{" "}
            and{" "}
            <a className="text-primary hover:underline" href="#">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>

      <div className="mt-8 text-center text-xs text-slate-500 z-10">
        © 2024 Marklynx. Empowering ACCA Students.
      </div>
    </div>
  );
}
