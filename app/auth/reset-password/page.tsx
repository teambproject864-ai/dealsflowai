"use client";

import { useState, useEffect, useId, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  ArrowLeft,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { GlassPanel, ExtrudedButton, SunkenInput } from "@/components/immersive";
import { cn } from "@/lib/utils";

// ─── JWT Decoder (client-side, no verification) ───────────────────────────────
function decodeJwt(token: string): Record<string, unknown> | null {
  if (typeof window === "undefined") return null;
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

// ─── Password helpers ─────────────────────────────────────────────────────────
function getPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  if (!password) return { score: 0, label: "", color: "" };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  const capped = Math.min(score, 4) as 0 | 1 | 2 | 3 | 4;
  const map: { label: string; color: string }[] = [
    { label: "Too weak", color: "bg-red-500" },
    { label: "Weak", color: "bg-orange-500" },
    { label: "Fair", color: "bg-amber-400" },
    { label: "Good", color: "bg-teal-400" },
    { label: "Strong", color: "bg-emerald-500" },
  ];
  return { score: capped, ...map[capped] };
}

type PageState = "loading" | "invalid-token" | "not-admin" | "form" | "submitting" | "success" | "error";

// ─── Inner content (needs searchParams — must be inside Suspense) ─────────────
function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams ? searchParams.get("token") : null;

  const [pageState, setPageState] = useState<PageState>("loading");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [touched, setTouched] = useState({ password: false, confirm: false });
  const [errorMessage, setErrorMessage] = useState("");

  const passwordId = useId();
  const confirmId = useId();

  const strength = getPasswordStrength(password);

  const passwordError =
    !password ? "Password is required" :
    password.length < 8 ? "Password must be at least 8 characters" :
    null;

  const confirmError =
    !confirmPassword ? "Please confirm your password" :
    password !== confirmPassword ? "Passwords do not match" :
    null;

  const isFormValid = !passwordError && !confirmError;

  // ── Validate token on mount ──
  useEffect(() => {
    if (!token) {
      setPageState("invalid-token");
      return;
    }
    const decoded = decodeJwt(token);
    if (!decoded || decoded.type !== "password-reset") {
      setPageState("invalid-token");
      return;
    }
    if (decoded.role !== "admin") {
      setPageState("not-admin");
      return;
    }
    setPageState("form");
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ password: true, confirm: true });
    if (!isFormValid) return;

    setPageState("submitting");
    setErrorMessage("");

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
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

  // ── Loading skeleton ──
  if (pageState === "loading") {
    return (
      <div className="flex flex-col items-center gap-3 py-12">
        <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
        <p className="text-sm text-slate-400 font-mono">Validating secure link…</p>
      </div>
    );
  }

  // ── Invalid token ──
  if (pageState === "invalid-token") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="text-center py-8 space-y-5"
      >
        <div className="mx-auto w-18 h-18 w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <AlertCircle className="h-9 w-9 text-red-400" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-white mb-2">Invalid Reset Link</h2>
          <p className="text-sm text-slate-400 max-w-xs mx-auto leading-relaxed">
            This password reset link is invalid or has expired. Reset links are valid for 15 minutes.
          </p>
        </div>
        <Link href="/auth/forgot-password">
          <ExtrudedButton size="lg" className="w-full">
            <ArrowRight className="h-4 w-4" />
            Request a New Link
          </ExtrudedButton>
        </Link>
      </motion.div>
    );
  }

  // ── Non-admin restriction ──
  if (pageState === "not-admin") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="text-center py-8 space-y-5"
      >
        <div className="mx-auto w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
          <ShieldCheck className="h-9 w-9 text-amber-400" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-white mb-2">Review Pending</h2>
          <p className="text-sm text-slate-400 max-w-xs mx-auto leading-relaxed">
            For security, direct password resets for customer and agent accounts require administrator approval. Your request has been submitted.
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-slate-800/40 border border-white/5 text-left space-y-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">What happens next</p>
          {[
            "Your request is queued for admin review",
            "An admin will approve and send a new link",
            "You'll receive a fresh reset email",
          ].map((tip) => (
            <div key={tip} className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
              <p className="text-xs text-slate-400">{tip}</p>
            </div>
          ))}
        </div>
        <Link href="/">
          <ExtrudedButton variant="outline" size="lg" className="w-full">
            Back to Login
          </ExtrudedButton>
        </Link>
      </motion.div>
    );
  }

  // ── Success ──
  if (pageState === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="text-center py-8 space-y-5"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 15 }}
          className="mx-auto w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center"
        >
          <CheckCircle2 className="h-10 w-10 text-emerald-400" />
        </motion.div>
        <div>
          <h2 className="text-xl font-extrabold text-white mb-2">Password Updated!</h2>
          <p className="text-sm text-slate-400 max-w-xs mx-auto leading-relaxed">
            Your password has been reset successfully. You can now sign in with your new password.
          </p>
        </div>
        <Link href="/">
          <ExtrudedButton size="lg" className="w-full">
            Go to Sign In
          </ExtrudedButton>
        </Link>
      </motion.div>
    );
  }

  // ── Form (pageState === "form" | "submitting" | "error") ──
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
    >
      {/* API error banner */}
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
        {/* New password */}
        <div className="space-y-1.5">
          <label
            htmlFor={passwordId}
            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400"
          >
            <Lock className="h-3 w-3 text-teal-500" />
            New Password
          </label>
          <div className="relative">
            <SunkenInput
              id={passwordId}
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (pageState === "error") setPageState("form");
              }}
              onBlur={() => setTouched((p) => ({ ...p, password: true }))}
              placeholder="Min. 8 characters"
              required
              autoComplete="new-password"
              disabled={pageState === "submitting"}
              aria-invalid={touched.password && !!passwordError}
              aria-describedby={
                touched.password && passwordError
                  ? `${passwordId}-error`
                  : `${passwordId}-strength`
              }
              className={cn(
                "pr-11 transition-colors duration-200",
                touched.password && passwordError
                  ? "border-red-500/50 focus-visible:ring-red-400/50"
                  : touched.password && !passwordError
                  ? "border-emerald-500/40"
                  : ""
              )}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-500 hover:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/50 transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {/* Validation error */}
          <AnimatePresence>
            {touched.password && passwordError && (
              <motion.p
                id={`${passwordId}-error`}
                role="alert"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-1 text-xs text-red-400 font-medium"
              >
                <XCircle className="h-3 w-3 shrink-0" />
                {passwordError}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Strength meter */}
          <AnimatePresence>
            {password && (
              <motion.div
                id={`${passwordId}-strength`}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
                aria-label={`Password strength: ${strength.label}`}
              >
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1" aria-hidden>
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={cn(
                          "h-1.5 flex-1 rounded-full transition-all duration-300",
                          i <= strength.score ? strength.color : "bg-slate-700"
                        )}
                      />
                    ))}
                  </div>
                  {strength.label && (
                    <p
                      className={cn(
                        "text-xs font-medium",
                        strength.score <= 1
                          ? "text-red-400"
                          : strength.score === 2
                          ? "text-amber-400"
                          : "text-teal-400"
                      )}
                    >
                      {strength.label}
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Confirm password */}
        <div className="space-y-1.5">
          <label
            htmlFor={confirmId}
            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400"
          >
            <Lock className="h-3 w-3 text-teal-500" />
            Confirm Password
          </label>
          <div className="relative">
            <SunkenInput
              id={confirmId}
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onBlur={() => setTouched((p) => ({ ...p, confirm: true }))}
              placeholder="Repeat your new password"
              required
              autoComplete="new-password"
              disabled={pageState === "submitting"}
              aria-invalid={touched.confirm && !!confirmError}
              aria-describedby={touched.confirm && confirmError ? `${confirmId}-error` : undefined}
              className={cn(
                "pr-11 transition-colors duration-200",
                touched.confirm && confirmError
                  ? "border-red-500/50 focus-visible:ring-red-400/50"
                  : touched.confirm && !confirmError && confirmPassword
                  ? "border-emerald-500/40"
                  : ""
              )}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-500 hover:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/50 transition-colors"
              aria-label={showConfirm ? "Hide password" : "Show password"}
            >
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {/* Match indicator */}
          <AnimatePresence>
            {touched.confirm && (
              <motion.p
                id={`${confirmId}-error`}
                role={confirmError ? "alert" : "status"}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  "flex items-center gap-1 text-xs font-medium",
                  confirmError ? "text-red-400" : "text-emerald-400"
                )}
              >
                {confirmError ? (
                  <><XCircle className="h-3 w-3 shrink-0" />{confirmError}</>
                ) : confirmPassword ? (
                  <><CheckCircle2 className="h-3 w-3 shrink-0" />Passwords match</>
                ) : null}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Submit */}
        <div className="pt-2">
          <ExtrudedButton
            type="submit"
            size="lg"
            disabled={pageState === "submitting" || (touched.password && touched.confirm && !isFormValid)}
            className="w-full"
          >
            {pageState === "submitting" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Resetting password…</span>
              </>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4" />
                <span>Set New Password</span>
              </>
            )}
          </ExtrudedButton>
        </div>
      </form>
    </motion.div>
  );
}

// ─── Page wrapper ─────────────────────────────────────────────────────────────
export default function ResetPasswordPage() {
  return (
    <main
      className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-background px-4 py-12"
      aria-label="Reset password"
    >
      {/* ── Ambient background ── */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute top-1/4 left-1/3 h-[500px] w-[500px] rounded-full bg-teal-500/8 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/3 h-[400px] w-[400px] rounded-full bg-violet-600/8 blur-[100px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Back link */}
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
          {/* Gradient header strip */}
          <div className="relative bg-gradient-to-r from-violet-500/15 via-teal-500/8 to-transparent border-b border-white/5 px-8 py-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-2 w-2 rounded-full bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.8)]" />
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-slate-500 font-bold">
                DEALFLOW<span className="text-teal-400">.AI</span>
              </span>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-500/10 border border-violet-500/20">
                <Lock className="h-6 w-6 text-violet-400" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-white">Set a new password</h1>
                <p className="text-sm text-slate-400 mt-0.5 leading-relaxed">
                  Choose a strong password to secure your account
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-8 pb-8 pt-6">
            <Suspense
              fallback={
                <div className="flex flex-col items-center gap-3 py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
                  <p className="text-sm text-slate-400 font-mono">Loading secure interface…</p>
                </div>
              }
            >
              <ResetPasswordContent />
            </Suspense>
          </div>
        </GlassPanel>

        {/* Footer link */}
        <p className="text-center mt-6 text-sm text-slate-500">
          Need a new reset link?{" "}
          <Link
            href="/auth/forgot-password"
            className="font-semibold text-teal-400 hover:text-teal-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/50 rounded transition-colors"
          >
            Request one here
          </Link>
        </p>
      </motion.div>
    </main>
  );
}
