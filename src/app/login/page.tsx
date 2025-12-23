"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "@/lib/auth/actions";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setError(null);

    const result = await signIn(formData);

    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    }
  }

  return (
    <div className="relative flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 min-h-screen">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[100px]"></div>
        <div className="absolute top-[40%] -right-[5%] w-[30%] h-[50%] bg-primary/5 rounded-full blur-[120px]"></div>
      </div>

      {/* Logo */}
      <div className="relative z-10 mb-8 flex items-center gap-3">
        <div className="bg-primary/20 p-2.5 rounded-xl shadow-glow">
          <span className="material-symbols-outlined text-primary text-3xl">school</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">PeerMarking</h1>
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-[420px] bg-surface-dark rounded-2xl shadow-xl shadow-black/20 border border-white/5 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>

        <div className="p-8 sm:p-10">
          <div className="mb-8 text-center">
            <h2 className="text-xl font-bold text-white">Welcome Back</h2>
            <p className="mt-2 text-sm text-text-muted">Please sign in to your account</p>
          </div>

          <form action={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300" htmlFor="email">
                Email or Username
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                  mail
                </span>
                <input
                  className="block w-full rounded-xl border-white/10 bg-background-dark/50 pl-10 pr-4 py-3 text-sm text-white placeholder-slate-400 focus:border-primary focus:ring-1 focus:ring-primary shadow-sm transition-all"
                  id="email"
                  name="email"
                  placeholder="Enter your email"
                  type="email"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                  lock
                </span>
                <input
                  className="block w-full rounded-xl border-white/10 bg-background-dark/50 pl-10 pr-10 py-3 text-sm text-white placeholder-slate-400 focus:border-primary focus:ring-1 focus:ring-primary shadow-sm transition-all"
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? "visibility" : "visibility_off"}
                  </span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  className="h-4 w-4 rounded border-white/20 text-primary bg-white/5 focus:ring-primary"
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                />
                <label
                  className="ml-2 block text-sm text-slate-400 select-none"
                  htmlFor="remember-me"
                >
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <Link
                  className="font-medium text-primary hover:text-primary-dark transition-colors"
                  href="/forgot-password"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-glow text-sm font-bold text-background-dark bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-surface-dark text-slate-400">Don&apos;t have an account?</span>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <Link
                className="text-sm font-semibold text-white hover:text-primary transition-colors flex items-center gap-1 group"
                href="/signup"
              >
                Create an account
                <span className="material-symbols-outlined text-base group-hover:translate-x-0.5 transition-transform">
                  arrow_forward
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center text-xs text-slate-500 z-10">
        © 2024 PeerMarking. Empowering ACCA Students.
      </div>
    </div>
  );
}
