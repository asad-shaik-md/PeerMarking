"use client";

import Link from "next/link";
import { useState } from "react";
import { signUp } from "@/lib/auth/actions";
import { UserRole } from "@/types/auth";

export default function SignupPage() {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    if (!selectedRole) {
      setError("Please select a role");
      return;
    }

    setIsLoading(true);
    setError(null);

    formData.append("role", selectedRole);
    const result = await signUp(formData);

    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    }
  }

  // If no role is selected, show role selection screen
  if (!selectedRole) {
    return (
      <div className="min-h-screen flex flex-col">
        {/* Navigation */}
        <nav className="w-full max-w-[1200px] mx-auto px-6 md:px-10 py-6 flex items-center justify-between z-20">
          <Link href="/" className="flex items-center gap-3">
            <div className="bg-primary/20 p-2 rounded-xl">
              <span className="material-symbols-outlined text-primary text-3xl">school</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight">PeerMarking</h1>
          </Link>
          <div>
            <span className="text-slate-400 text-sm mr-2">Already have an account?</span>
            <Link
              className="text-sm font-bold text-white hover:text-primary transition-colors"
              href="/login"
            >
              Log In
            </Link>
          </div>
        </nav>

        <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-10 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>

          <div className="z-10 w-full max-w-[1000px] flex flex-col items-center gap-8 md:gap-12">
            <div className="text-center space-y-3 max-w-2xl">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
                Join the Community
              </h2>
              <p className="text-text-muted text-lg">
                Select your role to get started with PeerMarking.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
              {/* Student Role Card */}
              <button
                onClick={() => setSelectedRole("student")}
                className="group relative bg-surface-dark rounded-2xl p-8 border border-white/5 hover:border-primary/50 transition-all duration-300 shadow-none hover:shadow-glow flex flex-col h-full text-left"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="material-symbols-outlined text-3xl text-blue-500">
                    menu_book
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">ACCA Student</h3>
                <p className="text-text-muted mb-8 text-sm leading-relaxed">
                  I am studying for my ACCA exams. I want to submit practice answers, receive
                  feedback, and improve my pass rates.
                </p>
                <div className="space-y-3 mb-8 flex-grow">
                  <div className="flex items-start gap-3 text-sm text-slate-300">
                    <span className="material-symbols-outlined text-primary text-lg shrink-0">
                      check_circle
                    </span>
                    <span>Upload practice answers for review</span>
                  </div>
                  <div className="flex items-start gap-3 text-sm text-slate-300">
                    <span className="material-symbols-outlined text-primary text-lg shrink-0">
                      check_circle
                    </span>
                    <span>Get detailed marking from seniors</span>
                  </div>
                  <div className="flex items-start gap-3 text-sm text-slate-300">
                    <span className="material-symbols-outlined text-primary text-lg shrink-0">
                      check_circle
                    </span>
                    <span>Track progress dashboard</span>
                  </div>
                </div>
                <div className="w-full py-4 px-6 rounded-xl bg-white/5 border border-transparent group-hover:border-primary/50 group-hover:bg-surface-dark text-white font-bold transition-all duration-200 flex items-center justify-center gap-2">
                  Sign up as Student
                  <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </div>
              </button>

              {/* Marker Role Card */}
              <button
                onClick={() => setSelectedRole("marker")}
                className="group relative bg-surface-dark rounded-2xl p-8 border border-white/5 hover:border-primary/50 transition-all duration-300 shadow-none hover:shadow-glow flex flex-col h-full text-left transform md:scale-105 md:-translate-y-2 z-10 ring-1 ring-primary/20"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute -top-3 -right-3 bg-primary text-background-dark text-xs font-bold px-3 py-1 rounded-full shadow-lg transform rotate-3">
                  POPULAR
                </div>
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="material-symbols-outlined text-3xl text-primary">
                    history_edu
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">ACCA Senior (Marker)</h3>
                <p className="text-text-muted mb-8 text-sm leading-relaxed">
                  I have passed my papers. I want to review junior students&apos; work, provide
                  guidance, and build my professional reputation.
                </p>
                <div className="space-y-3 mb-8 flex-grow">
                  <div className="flex items-start gap-3 text-sm text-slate-300">
                    <span className="material-symbols-outlined text-primary text-lg shrink-0">
                      check_circle
                    </span>
                    <span>Mark papers and give feedback</span>
                  </div>
                  <div className="flex items-start gap-3 text-sm text-slate-300">
                    <span className="material-symbols-outlined text-primary text-lg shrink-0">
                      check_circle
                    </span>
                    <span>Earn badges and reputation points</span>
                  </div>
                  <div className="flex items-start gap-3 text-sm text-slate-300">
                    <span className="material-symbols-outlined text-primary text-lg shrink-0">
                      check_circle
                    </span>
                    <span>Mentor the next generation</span>
                  </div>
                </div>
                <div className="w-full py-4 px-6 rounded-xl bg-primary hover:bg-primary-dark text-background-dark font-bold transition-all duration-200 flex items-center justify-center gap-2 shadow-glow hover:shadow-primary/40">
                  Sign up as Senior
                  <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </div>
              </button>
            </div>

            <footer className="text-center mt-4">
              <p className="text-xs text-slate-500">
                By joining, you agree to our{" "}
                <a className="underline hover:text-primary" href="#">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a className="underline hover:text-primary" href="#">
                  Privacy Policy
                </a>
                .
              </p>
            </footer>
          </div>
        </main>
      </div>
    );
  }

  // Show signup form after role is selected
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

      {/* Signup Card */}
      <div className="relative z-10 w-full max-w-[420px] bg-surface-dark rounded-2xl shadow-xl shadow-black/20 border border-white/5 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>

        <div className="p-8 sm:p-10">
          <div className="mb-6">
            <button
              onClick={() => setSelectedRole(null)}
              className="flex items-center gap-1 text-sm text-slate-400 hover:text-white transition-colors mb-4"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              Change role
            </button>
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`material-symbols-outlined text-2xl ${selectedRole === "marker" ? "text-primary" : "text-blue-500"}`}
              >
                {selectedRole === "marker" ? "history_edu" : "menu_book"}
              </span>
              <span className="text-sm font-medium text-slate-400">
                Signing up as {selectedRole === "marker" ? "ACCA Senior (Marker)" : "ACCA Student"}
              </span>
            </div>
            <h2 className="text-xl font-bold text-white">Create your account</h2>
          </div>

          <form action={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300" htmlFor="fullName">
                Full Name
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                  person
                </span>
                <input
                  className="block w-full rounded-xl border-white/10 bg-background-dark/50 pl-10 pr-4 py-3 text-sm text-white placeholder-slate-400 focus:border-primary focus:ring-1 focus:ring-primary shadow-sm transition-all"
                  id="fullName"
                  name="fullName"
                  placeholder="Enter your full name"
                  type="text"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                  mail
                </span>
                <input
                  className="block w-full rounded-xl border-white/10 bg-background-dark/50 pl-10 pr-4 py-3 text-sm text-white placeholder-slate-400 focus:border-primary focus:ring-1 focus:ring-primary shadow-sm transition-all"
                  id="email"
                  name="email"
                  placeholder="you@example.com"
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
                  className="block w-full rounded-xl border-white/10 bg-background-dark/50 pl-10 pr-4 py-3 text-sm text-white placeholder-slate-400 focus:border-primary focus:ring-1 focus:ring-primary shadow-sm transition-all"
                  id="password"
                  name="password"
                  placeholder="Create a password (min. 6 characters)"
                  type="password"
                  minLength={6}
                  required
                />
              </div>
            </div>

            <div className="flex items-start gap-2 pt-2">
              <input
                className="h-4 w-4 rounded border-white/20 text-primary bg-white/5 focus:ring-primary mt-0.5"
                id="terms"
                name="terms"
                type="checkbox"
                required
              />
              <label className="text-sm text-slate-400 select-none" htmlFor="terms">
                I agree to the{" "}
                <a className="text-primary hover:underline" href="#">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a className="text-primary hover:underline" href="#">
                  Privacy Policy
                </a>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-glow text-sm font-bold text-background-dark bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-sm text-slate-400">Already have an account? </span>
            <Link
              className="text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
              href="/login"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center text-xs text-slate-500 z-10">
        © 2024 PeerMarking. Empowering ACCA Students.
      </div>
    </div>
  );
}
