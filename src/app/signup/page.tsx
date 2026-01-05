"use client";

import Link from "next/link";
import { useState } from "react";
import { signInWithGoogle } from "@/lib/auth/actions";
import { UserRole } from "@/types/auth";

export default function SignupPage() {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  async function handleGoogleSignUp() {
    if (!selectedRole) {
      setError("Please select a role first");
      return;
    }

    setIsGoogleLoading(true);
    setError(null);

    const result = await signInWithGoogle(selectedRole);

    if (result?.error) {
      setError(result.error);
      setIsGoogleLoading(false);
    } else if (result?.url) {
      window.location.href = result.url;
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

  // Show Google signup after role is selected
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
          <span className="material-symbols-outlined text-primary text-3xl">school</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">PeerMarking</h1>
      </Link>

      {/* Signup Card */}
      <div className="relative z-10 w-full max-w-[400px] bg-surface-dark rounded-2xl shadow-xl shadow-black/20 border border-white/5 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>

        <div className="p-8 sm:p-10">
          {/* Back button and role indicator */}
          <div className="mb-6">
            <button
              onClick={() => setSelectedRole(null)}
              className="flex items-center gap-1 text-sm text-slate-400 hover:text-white transition-colors mb-4"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              Change role
            </button>
          </div>

          {/* Header */}
          <div className="mb-8 text-center">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${selectedRole === "marker" ? "bg-primary/10" : "bg-blue-500/10"}`}>
              <span className={`material-symbols-outlined text-4xl ${selectedRole === "marker" ? "text-primary" : "text-blue-500"}`}>
                {selectedRole === "marker" ? "history_edu" : "menu_book"}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white">Create your account</h2>
            <p className="mt-2 text-sm text-text-muted">
              Signing up as {selectedRole === "marker" ? "ACCA Senior (Marker)" : "ACCA Student"}
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-6 flex items-start gap-3">
              <span className="material-symbols-outlined text-lg shrink-0">error</span>
              <span>{error}</span>
            </div>
          )}

          {/* Google Sign Up Button */}
          <button
            type="button"
            onClick={handleGoogleSignUp}
            disabled={isGoogleLoading}
            className="w-full flex items-center justify-center gap-3 py-4 px-6 border border-white/10 rounded-xl text-base font-semibold text-white bg-white/5 hover:bg-white/10 hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {isGoogleLoading ? (
              <span className="material-symbols-outlined animate-spin text-[22px]">progress_activity</span>
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            {isGoogleLoading ? "Connecting..." : "Continue with Google"}
          </button>

          {/* Terms */}
          <p className="mt-6 text-xs text-center text-slate-500">
            By signing up, you agree to our{" "}
            <a className="text-primary hover:underline" href="#">
              Terms of Service
            </a>{" "}
            and{" "}
            <a className="text-primary hover:underline" href="#">
              Privacy Policy
            </a>
          </p>

          {/* Security note */}
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
            <span className="material-symbols-outlined text-sm">lock</span>
            <span>Secure authentication powered by Google</span>
          </div>

          {/* Sign in link */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <p className="text-center text-sm text-slate-400">
              Already have an account?{" "}
              <Link
                className="font-semibold text-primary hover:text-primary-dark transition-colors"
                href="/login"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center text-xs text-slate-500 z-10">
        © 2024 PeerMarking. Empowering ACCA Students.
      </div>
    </div>
  );
}
