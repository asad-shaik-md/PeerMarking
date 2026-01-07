"use client";

import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signInWithGoogle, signInWithEmail } from "@/lib/auth/actions";

function LoginForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Check for error in URL params (e.g., from OAuth redirect)
  useEffect(() => {
    const urlError = searchParams.get("error");
    if (urlError) {
      setError(urlError);
    }
  }, [searchParams]);

  async function handleGoogleSignIn() {
    setIsGoogleLoading(true);
    setError(null);
    setSuccess(null);

    const result = await signInWithGoogle();

    if (result?.error) {
      setError(result.error);
      setIsGoogleLoading(false);
    } else if (result?.url) {
      window.location.href = result.url;
    }
  }

  async function handleEmailSignIn(e: React.FormEvent) {
    e.preventDefault();
    setIsEmailLoading(true);
    setError(null);
    setSuccess(null);

    if (!email || !password) {
      setError("Please enter your email and password");
      setIsEmailLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setIsEmailLoading(false);
      return;
    }

    const result = await signInWithEmail(email, password);

    if (result?.error) {
      setError(result.error);
      setIsEmailLoading(false);
    } else if (result?.confirmEmail) {
      setSuccess("Check your email to confirm your account, then sign in again.");
      setIsEmailLoading(false);
    } else if (result?.redirect) {
      router.push(result.redirect);
    }
  }

  return (
    <>
      <div className="mb-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-4xl text-primary">school</span>
        </div>
        <h2 className="text-2xl font-bold text-white">Welcome to PeerMarking</h2>
        <p className="mt-2 text-sm text-text-muted">
          Sign in or create an account to get started
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-6 flex items-start gap-3">
          <span className="material-symbols-outlined text-lg shrink-0">error</span>
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm mb-6 flex items-start gap-3">
          <span className="material-symbols-outlined text-lg shrink-0">check_circle</span>
          <span>{success}</span>
        </div>
      )}

      {/* Email/Password Form */}
      <form onSubmit={handleEmailSignIn} className="space-y-4 mb-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
            disabled={isEmailLoading}
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
            disabled={isEmailLoading}
          />
        </div>
        <button
          type="submit"
          disabled={isEmailLoading}
          className="w-full py-4 px-6 rounded-xl text-base font-semibold text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isEmailLoading ? (
            <>
              <span className="material-symbols-outlined animate-spin text-[22px]">progress_activity</span>
              Signing in...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[22px]">login</span>
              Sign In with Email
            </>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-surface-dark text-slate-500">or continue with</span>
        </div>
      </div>

      {/* Google Sign In Button */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
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

      {/* Info text */}
      <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10">
        <div className="flex items-start gap-3 text-sm text-slate-400">
          <span className="material-symbols-outlined text-primary text-lg shrink-0 mt-0.5">info</span>
          <span>
            New users will be asked to select their role (Student or Marker) after signing in.
          </span>
        </div>
      </div>

      {/* Security note */}
      <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500">
        <span className="material-symbols-outlined text-sm">lock</span>
        <span>Secure authentication powered by Supabase</span>
      </div>
    </>
  );
}

export default function LoginPage() {
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

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-[400px] bg-surface-dark rounded-2xl shadow-xl shadow-black/20 border border-white/5 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>

        <div className="p-8 sm:p-10">
          <Suspense fallback={<div className="text-center text-slate-400">Loading...</div>}>
            <LoginForm />
          </Suspense>
        </div>
      </div>

      <div className="mt-8 text-center text-xs text-slate-500 z-10">
        © 2024 PeerMarking. Empowering ACCA Students.
      </div>
    </div>
  );
}
