"use client";

import { useState, useId } from "react";
import {
  Mail,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  KeyRound,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { GlassPanel, ExtrudedButton, SunkenInput } from "@/components/immersive";
import { cn } from "@/lib/utils";

type PageState = "idle" | "loading" | "success" | "error";

function validateEmail(email: string): string | null {
  if (!email.trim()) return "Email address is required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Please enter a valid email address";
  return null;
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [pageState, setPageState] = useState<PageState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const emailId = useId();
  const emailError = validateEmail(email);
  const isValid = !emailError;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!isValid) return;

    setPageState("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await response.json();

      if (data.success) {
        setPageState("success");
      } else {
        setErrorMessage(data.error || "Something went wrong. Please try again.");
        setPageState("error");
      }
    } catch {
      setErrorMessage("Network error. Please check your connection and try again.");
      setPageState("error");
    }
  };

  return (
    <main
      className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-background px-4 py-12"
      aria-label="Forgot password"
    >
      {/* ── Ambient background ── */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute top-1/4 left-1/4 h-[500px] w-[500px] rounded-full bg-violet-600/8 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] rounded-full bg-teal-500/8 blur-[100px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        {/* ── Back link ── */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-teal-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/50 rounded transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to login
        </Link>

        <GlassPanel
          tilt={false}
          glow="none"
          className="overflow-hidden rounded-3xl border border-white/10 shadow-[0_40px_80px_rgba(0,0,0,0.5)]"
        >
          {/* ── Gradient header strip ── */}
          <div className="relative bg-gradient-to-r from-teal-500/15 via-violet-500/8 to-transparent border-b border-white/5 px-8 py-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-2 w-2 rounded-full bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.8)]" />
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-slate-500 font-bold">
                DEALFLOW<span className="text-teal-400">.AI</span>
              </span>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal-500/10 border border-teal-500/20">
                <KeyRound className="h-6 w-6 text-teal-400" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-white">Reset your password</h1>
                <p className="text-sm text-slate-400 mt-0.5 leading-relaxed">
                  Enter your email and we&apos;ll send you a secure reset link
                </p>
              </div>
            </div>
          </div>

          {/* ── Content area ── */}
          <div className="px-8 pb-8 pt-6">
            <AnimatePresence mode="wait">
              {/* ── Success state ── */}
              {pageState === "success" && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="text-center py-6 space-y-5"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 15 }}
                    className="mx-auto w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center"
                  >
                    <CheckCircle2 className="h-10 w-10 text-emerald-400" />
                  </motion.div>

                  <div className="space-y-2">
                    <h2 className="text-xl font-extrabold text-white">Check your inbox</h2>
                    <p className="text-sm text-slate-400 leading-relaxed max-w-xs mx-auto">
                      If an account with <span className="font-semibold text-slate-300">{email}</span> exists, we&apos;ve sent a reset link — valid for 15 minutes.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-800/40 border border-white/5 text-left space-y-2">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">What to do next</p>
                    {[
                      "Check your spam or junk folder",
                      "Click the link within 15 minutes",
                      "Create a new secure password",
                    ].map((tip) => (
                      <div key={tip} className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-teal-500 shrink-0" />
                        <p className="text-xs text-slate-400">{tip}</p>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setPageState("idle");
                      setEmail("");
                      setTouched(false);
                    }}
                    className="text-sm text-teal-400 hover:text-teal-300 font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/50 rounded transition-colors"
                  >
                    Send to a different email
                  </button>
                </motion.div>
              )}

              {/* ── Form state (idle / loading / error) ── */}
              {pageState !== "success" && (
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* API Error banner */}
                  <AnimatePresence>
                    {pageState === "error" && errorMessage && (
                      <motion.div
                        role="alert"
                        aria-live="assertive"
                        initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                        animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
                        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                        className="overflow-hidden rounded-xl border border-red-500/25 bg-red-500/8 px-4 py-3 flex items-start gap-3"
                      >
                        <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                        <p className="text-sm text-red-300 font-medium">{errorMessage}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <form onSubmit={handleSubmit} noValidate className="space-y-5">
                    {/* Email field */}
                    <div className="space-y-1.5">
                      <label
                        htmlFor={emailId}
                        className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400"
                      >
                        <Mail className="h-3 w-3 text-teal-500" />
                        Email Address
                      </label>
                      <SunkenInput
                        id={emailId}
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (pageState === "error") setPageState("idle");
                        }}
                        onBlur={() => setTouched(true)}
                        placeholder="you@company.com"
                        required
                        autoFocus
                        autoComplete="email"
                        disabled={pageState === "loading"}
                        aria-invalid={touched && !!emailError}
                        aria-describedby={touched && emailError ? `${emailId}-error` : undefined}
                        className={cn(
                          "transition-colors duration-200",
                          touched && emailError
                            ? "border-red-500/50 focus-visible:ring-red-400/50"
                            : touched && !emailError
                            ? "border-emerald-500/40"
                            : ""
                        )}
                      />
                      <AnimatePresence>
                        {touched && emailError && (
                          <motion.p
                            id={`${emailId}-error`}
                            role="alert"
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.2 }}
                            className="flex items-center gap-1 text-xs text-red-400 font-medium"
                          >
                            <AlertCircle className="h-3 w-3 shrink-0" />
                            {emailError}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Submit button */}
                    <ExtrudedButton
                      type="submit"
                      size="lg"
                      disabled={pageState === "loading" || !email.trim()}
                      className="w-full"
                    >
                      {pageState === "loading" ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Sending reset link…</span>
                        </>
                      ) : (
                        <>
                          <Mail className="h-4 w-4" />
                          <span>Send Reset Link</span>
                        </>
                      )}
                    </ExtrudedButton>
                  </form>

                  {/* Security note */}
                  <div className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-600">
                    <Shield className="h-3.5 w-3.5" />
                    <span>For security, we never confirm if an email is registered</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </GlassPanel>

        {/* Bottom sign-in link */}
        <p className="text-center mt-6 text-sm text-slate-500">
          Remembered your password?{" "}
          <Link
            href="/"
            className="font-semibold text-teal-400 hover:text-teal-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/50 rounded transition-colors"
          >
            Sign in
          </Link>
        </p>
      </motion.div>
    </main>
  );
}
