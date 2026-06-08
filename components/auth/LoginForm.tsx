"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { UserRole } from "@/lib/auth";
import { Loader2, Eye, EyeOff, ArrowRight, ShieldCheck } from "lucide-react";
import { BiometricAuthPanel } from "@/components/experience/BiometricAuthPanel";
import { GlassPanel, ExtrudedButton, SunkenInput } from "@/components/immersive";

interface LoginFormProps {
  role: UserRole;
  allowRegistration?: boolean; // Only customers should register
}

export default function LoginForm({ role, allowRegistration = false }: LoginFormProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMfa, setShowMfa] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    mfaCode: "",
  });
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || `/portal/${role}`;

  // Reset error when switching between login/register
  useEffect(() => {
    setError(null);
  }, [isLogin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const payload = isLogin 
        ? { email: formData.email, password: formData.password, role, mfaCode: formData.mfaCode }
        : { email: formData.email, password: formData.password, name: formData.name, role };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        // Success! Redirect to portal or intended redirect URL
        router.push(redirectUrl);
        router.refresh();
      } else if (data.requireMfa) {
        setShowMfa(true);
      } else {
        setError(data.error || "An error occurred");
      }
    } catch (err) {
      console.error("Auth error:", err);
      setError("Network error, please try again");
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <GlassPanel depth="front" tilt={true} glow="primary" className="w-full max-w-md mx-auto p-8 border border-white/15">
      {isLogin && (
        <div className="mb-8 flex justify-center">
          <BiometricAuthPanel onSuccess={() => router.push(redirectUrl)} />
        </div>
      )}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white immersive-holo-text bg-gradient-to-r from-teal-300 to-violet-300 bg-clip-text text-transparent">
          {isLogin ? "Welcome Back" : "Create Account"}
        </h1>
        <p className="text-slate-300 mt-2 text-sm">
          {isLogin 
            ? `Sign in to your ${role} account` 
            : `Sign up as a new customer`
          }
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {!isLogin && (
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Full Name</label>
            <SunkenInput
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter your full name"
              disabled={isSubmitting}
              required
            />
          </div>
        )}

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Email</label>
          <SunkenInput
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="you@example.com"
            disabled={isSubmitting}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Password</label>
          <div className="relative">
            <SunkenInput
              type={isPasswordVisible ? "text" : "password"}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder={isLogin ? "••••••••" : "Minimum 8 characters"}
              disabled={isSubmitting}
              required
              className="pr-12"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
            >
              {isPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {showMfa && role === "admin" && (
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-orange-400" />
              Two-Factor Authentication Code
            </label>
            <SunkenInput
              type="text"
              value={formData.mfaCode}
              onChange={(e) => setFormData({ ...formData, mfaCode: e.target.value })}
              placeholder="Enter 6-digit code"
              disabled={isSubmitting}
              maxLength={6}
              className="border-orange-500/30 focus-visible:ring-orange-500 focus-visible:border-orange-500 tracking-widest text-center"
            />
          </div>
        )}

        {/* MFA Info for Admin */}
        {role === "admin" && !showMfa && (
          <div className="flex items-start gap-2 p-3 bg-orange-500/5 border border-orange-500/20 rounded-lg">
            <ShieldCheck className="h-5 w-5 text-orange-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300">
              <span className="font-semibold text-orange-300">Security Note:</span> Admin accounts require two-factor authentication (2FA) for access (demo mode accepts any 6-digit code).
            </div>
          </div>
        )}

        <ExtrudedButton
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
          ) : (
            <ArrowRight className="h-5 w-5 mr-2" />
          )}
          {isLogin ? "Sign In" : "Sign Up"}
        </ExtrudedButton>
      </form>

      {allowRegistration && (
        <div className="mt-8 text-center text-sm text-slate-400">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-teal-400 hover:text-teal-300 font-semibold transition-colors"
          >
            {isLogin ? "Sign up" : "Sign in"}
          </button>
        </div>
      )}

      {role === "admin" && (
        <div className="mt-6 p-4 bg-slate-950/40 border border-white/5 rounded-xl text-center">
          <p className="text-xs text-slate-500 mb-1">Demo Credentials</p>
          <p className="text-xs text-slate-300 font-mono">admin@dealflow.ai / AdminDF</p>
          <p className="text-xs text-slate-400 mt-1">Enter any 6-digit code for MFA</p>
        </div>
      )}
      
      {role === "customer" && (
        <div className="mt-6 p-4 bg-slate-950/40 border border-white/5 rounded-xl text-center">
          <p className="text-xs text-slate-500 mb-1">Demo Credentials</p>
          <p className="text-xs text-slate-300 font-mono">demo@customer.com / CustomerDemo123!</p>
        </div>
      )}
      
      {role === "agent" && (
        <div className="mt-6 p-4 bg-slate-950/40 border border-white/5 rounded-xl text-center">
          <p className="text-xs text-slate-500 mb-1">Demo Credentials</p>
          <p className="text-xs text-slate-300 font-mono">praneeth@dealflow.ai / Praneeth123!</p>
        </div>
      )}
    </GlassPanel>
  );
}

