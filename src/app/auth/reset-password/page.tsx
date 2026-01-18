"use client";

import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { updatePassword } from "@/lib/auth/actions";
import { createClient } from "@/lib/supabase/client";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);

  // Check if we have a valid session from the reset link
  useEffect(() => {
    async function checkSession() {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      // Check for error in URL (from Supabase redirect)
      const errorParam = searchParams.get("error");
      const errorDescription = searchParams.get("error_description");
      
      if (errorParam) {
        setError(errorDescription || "Invalid or expired reset link");
        setIsValidSession(false);
        return;
      }
      
      if (session) {
        setIsValidSession(true);
      } else {
        setIsValidSession(false);
        setError("Invalid or expired reset link. Please request a new one.");
      }
    }
    checkSession();
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!password || !confirmPassword) {
      setError("Please enter and confirm your new password");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    const result = await updatePassword(password);

    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    } else {
      setSuccess(true);
      setIsLoading(false);
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    }
  }

  if (isValidSession === null) {
    return (
      <div className="text-center text-slate-400">
        <span className="material-symbols-outlined animate-spin text-4xl">progress_activity</span>
        <p className="mt-4">Verifying reset link...</p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-4xl text-primary">password</span>
        </div>
        <h2 className="text-2xl font-bold text-white">Set New Password</h2>
        <p className="mt-2 text-sm text-text-muted">
          Enter your new password below
        </p>
      </div>

      {success ? (
        <div className="text-center">
          <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm mb-6 flex items-start gap-3">
            <span className="material-symbols-outlined text-lg shrink-0">check_circle</span>
            <span>Password updated successfully! Redirecting to sign in...</span>
          </div>
        </div>
      ) : !isValidSession ? (
        <div className="text-center">
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-6 flex items-start gap-3">
            <span className="material-symbols-outlined text-lg shrink-0">error</span>
            <span>{error}</span>
          </div>
          <Link
            href="/auth/forgot-password"
            className="text-primary hover:text-primary/80 font-medium transition-colors"
          >
            Request a new reset link
          </Link>
        </div>
      ) : (
        <>
          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-6 flex items-start gap-3">
              <span className="material-symbols-outlined text-lg shrink-0">error</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                New Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 px-6 rounded-xl text-base font-semibold text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[22px]">progress_activity</span>
                  Updating...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[22px]">check</span>
                  Update Password
                </>
              )}
            </button>
          </form>
        </>
      )}
    </>
  );
}

export default function ResetPasswordPage() {
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

      {/* Card */}
      <div className="relative z-10 w-full max-w-[400px] bg-surface-dark rounded-2xl shadow-xl shadow-black/20 border border-white/5 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>

        <div className="p-8 sm:p-10">
          <Suspense fallback={<div className="text-center text-slate-400">Loading...</div>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>

      <div className="mt-8 text-center text-xs text-slate-500 z-10">
        © 2024 Marklynx. Empowering ACCA Students.
      </div>
    </div>
  );
}
