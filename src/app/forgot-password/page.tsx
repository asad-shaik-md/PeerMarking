"use client";

import Link from "next/link";
import { useState } from "react";
import { forgotPassword } from "@/lib/auth/actions";

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setError(null);

    const result = await forgotPassword(formData);

    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    } else if (result?.success) {
      setSuccess(true);
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[50vw] h-[50vw] bg-primary/5 rounded-full blur-[100px] opacity-60"></div>
        <div className="absolute top-[20%] -right-[10%] w-[40vw] h-[40vw] bg-blue-500/5 rounded-full blur-[100px] opacity-40"></div>
        <div className="absolute -bottom-[10%] left-[20%] w-[45vw] h-[45vw] bg-purple-500/5 rounded-full blur-[100px] opacity-40"></div>
      </div>

      <main className="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-[1200px] mx-auto z-10">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 mb-8 md:mb-10">
          <div className="bg-primary/20 p-2.5 rounded-[12px] backdrop-blur-sm">
            <span className="material-symbols-outlined text-primary text-3xl">school</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">PeerMarking</h1>
        </Link>

        {/* Card */}
        <div className="w-full max-w-[480px] bg-surface-dark p-8 md:p-10 rounded-[12px] shadow-xl shadow-glow border border-white/5 relative overflow-hidden">
          {success ? (
            // Success state
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
                <span className="material-symbols-outlined text-primary text-3xl">mark_email_read</span>
              </div>
              <h2 className="text-2xl font-bold mb-3 text-white">Check your email</h2>
              <p className="text-text-muted text-sm leading-relaxed mb-6">
                We&apos;ve sent a password reset link to your email address. Click the link to reset
                your password.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
              >
                <span className="material-symbols-outlined text-lg">arrow_back</span>
                Back to Login
              </Link>
            </div>
          ) : (
            // Form state
            <>
              <div className="mb-8">
                <div className="flex items-center gap-2 text-primary font-medium mb-4">
                  <span className="material-symbols-outlined">lock_reset</span>
                  <span className="text-sm uppercase tracking-wide">Account Recovery</span>
                </div>
                <h2 className="text-3xl font-bold mb-3 text-white">Forgot Password?</h2>
                <p className="text-text-muted text-sm leading-relaxed">
                  Enter the email address associated with your account and we&apos;ll send you a link
                  to reset your password.
                </p>
              </div>

              <form action={handleSubmit} className="flex flex-col gap-6">
                {error && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <label
                    className="text-xs font-bold uppercase tracking-wider text-text-muted ml-1"
                    htmlFor="email"
                  >
                    Email Address
                  </label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                      mail
                    </span>
                    <input
                      className="w-full pl-11 pr-4 py-3.5 bg-black/20 border border-white/10 rounded-[10px] text-white placeholder-slate-400 focus:ring-2 focus:ring-primary/50 focus:border-primary focus:bg-black/30 transition-all outline-none"
                      id="email"
                      name="email"
                      placeholder="student@acca.global"
                      type="email"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="group w-full bg-primary hover:bg-primary-dark text-background-dark font-bold py-3.5 px-6 rounded-[10px] shadow-glow hover:shadow-primary/40 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  <span className="group-hover:mr-1 transition-all">
                    {isLoading ? "Sending..." : "Send Reset Link"}
                  </span>
                  <span className="material-symbols-outlined text-xl opacity-80 group-hover:translate-x-1 transition-transform">
                    send
                  </span>
                </button>
              </form>

              <div className="mt-8 pt-6 border-t border-white/5 text-center">
                <Link
                  className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors group p-2 rounded-lg hover:bg-white/5"
                  href="/login"
                >
                  <span className="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform">
                    arrow_back
                  </span>
                  Back to Login
                </Link>
              </div>
            </>
          )}
        </div>

        <div className="mt-10 text-center">
          <p className="text-xs text-slate-600">
            © 2024 PeerMarking Community. <br className="md:hidden" /> A safe space for ACCA growth.
          </p>
        </div>
      </main>
    </div>
  );
}
