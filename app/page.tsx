"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { IntakeForm } from "@/components/IntakeForm";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Zap,
  Shield,
  Brain,
  TrendingUp,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Database,
  Cpu,
  GitBranch,
  Network,
  PlayCircle,
  Bot,
  Target,
  Rocket,
  BarChart2,
  RefreshCw,
  Users,
  Layers,
  MessageSquare,
  Phone,
  CreditCard,
  Lock,
  Mail,
  ArrowUpRight,
  Activity,
  Check,
  CheckSquare,
  Star,
  Volume2,
  Compass,
  LayoutDashboard,
  Bell,
  Clock,
  Terminal,
  Send,
  UserCheck,
} from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import ErrorBoundary from "@/components/ErrorBoundary";
import { IntakeForm } from "@/components/IntakeForm";
import { PLANS, CONVERSION_RATES, CURRENCY_SYMBOLS } from "@/lib/pricing";

// ─── Floating Orb (Vibrant Cosmic Accents) ───────────────────────────────────
const FloatingOrb = React.memo(function FloatingOrb({ className, delay = 0, color }: { className?: string; delay?: number; color: string }) {
  return (
    <motion.div
      className={`absolute rounded-full blur-3xl opacity-35 pointer-events-none ${className}`}
      style={{ background: color }}
      animate={{
        y: [0, -40, 0],
        x: [0, 20, 0],
        scale: [1, 1.15, 1],
        opacity: [0.25, 0.45, 0.25],
      }}
      transition={{
        duration: 10,
        repeat: Infinity,
        delay,
        ease: "easeInOut",
      }}
    />
  );
});

// ─── SVG LOGOS for Integrations Marquee ──────────────────────────────────────
const SVG_LOGOS = [
  {
    name: "Salesforce",
    svg: (
      <svg className="w-6 h-6 mr-2 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" />
      </svg>
    ),
  },
  {
    name: "HubSpot",
    svg: (
      <svg className="w-6 h-6 mr-2 text-orange-500" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2a10 10 0 1010 10A10 10 0 0012 2zm1 14a3 3 0 113-3 3 3 0 01-3 3zm0-8a1 1 0 111-1 1 1 0 01-1 1z" />
      </svg>
    ),
  },
  {
    name: "Slack",
    svg: (
      <svg className="w-6 h-6 mr-2 text-violet-500" viewBox="0 0 24 24" fill="currentColor">
        <path d="M5.042 15.165a2.528 2.528 0 01-2.52 2.523 2.528 2.528 0 01-2.522-2.523 2.528 2.528 0 012.522-2.52h2.52v2.52zm1.261 0a2.528 2.528 0 012.52-2.52h5.043a2.528 2.528 0 012.522 2.52v5.042a2.528 2.528 0 01-2.522 2.52H8.824a2.528 2.528 0 01-2.52-2.52v-5.042z" />
      </svg>
    ),
  },
  {
    name: "Gong",
    svg: (
      <svg className="w-6 h-6 mr-2 text-purple-600 dark:text-purple-400" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" fill="none">
        <path d="M12 3v18M8 6v12M4 9v6M16 6v12M20 9v6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: "Outreach",
    svg: (
      <svg className="w-6 h-6 mr-2 text-pink-500" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" fill="none">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v12M6 12h12" />
      </svg>
    ),
  },
  {
    name: "ZoomInfo",
    svg: (
      <svg className="w-6 h-6 mr-2 text-cyan-500" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    ),
  },
];

export default function HomePage() {
  const router = useRouter();
  const [abVariant] = useState<"A" | "B">("A");
  const [isClient, setIsClient] = useState(false);





  // Pricing States
  const [isAnnual, setIsAnnual] = useState(true);
  const [currency, setCurrency] = useState<"USD" | "EUR" | "GBP" | "CAD" | "INR">("USD");

  useEffect(() => {
    setIsClient(true);
  }, []);



  // Currency Formatter helper
  const formatCurrency = (amount: number, currencyCode: string) => {
    const localeMap: Record<string, string> = {
      USD: "en-US",
      EUR: "de-DE",
      GBP: "en-GB",
      CAD: "en-CA",
      INR: "en-IN",
    };
    const convertedAmount = amount * CONVERSION_RATES[currencyCode];
    return new Intl.NumberFormat(localeMap[currencyCode] || "en-US", {
      style: "currency",
      currency: currencyCode,
      maximumFractionDigits: 0,
    }).format(convertedAmount);
  };





  return (
    <main className="min-h-screen text-white bg-[#060612] relative overflow-hidden font-sans">
      
      {/* ─── DYNAMIC COLORFUL BACKGROUND ORBS ──────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-10%,rgba(108,59,255,0.18),transparent_60%)]" />
        
        <FloatingOrb className="w-[500px] h-[500px] top-[10%] -left-[10%] opacity-20" color="radial-gradient(circle, #7c3aed 0%, transparent 70%)" delay={0} />
        <FloatingOrb className="w-[450px] h-[450px] top-[30%] -right-[10%] opacity-25" color="radial-gradient(circle, #06b6d4 0%, transparent 70%)" delay={2} />
        <FloatingOrb className="w-[400px] h-[400px] bottom-[20%] left-[25%] opacity-20" color="radial-gradient(circle, #ec4899 0%, transparent 70%)" delay={4} />
      </div>

      {/* ─── HERO SECTION ──────────────────────────────────────────────────────── */}
      <section id="hero" className="relative z-10 pt-28 pb-16 flex flex-col items-center justify-center text-center px-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-violet-500/30 bg-gradient-to-r from-violet-600/10 to-indigo-600/10 text-violet-300 text-xs font-bold uppercase tracking-wider mb-6 backdrop-blur-md shadow-[0_0_15px_rgba(124,58,237,0.15)]"
        >
          <Sparkles className="h-4.5 w-4.5 text-violet-400 animate-spin" />
          The Next-Generation Revenue Intelligence OS
          <ChevronRight className="h-3 w-3 text-slate-500" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-5xl sm:text-7xl font-extrabold tracking-tight leading-[1.05] mb-8 bg-gradient-to-r from-white via-[#C8B8FF] to-cyan-300 bg-clip-text text-transparent"
        >
          Close more deals.
          <br />
          <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-violet-500 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(20,184,166,0.2)]">
            Let the agents do it.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-3xl text-slate-350 text-base sm:text-lg leading-relaxed mb-10"
        >
          DealFlow AI deploys collaborative agents with persistent memory directly integrated with your CRM. Reclaim 60% of your sales rep’s calendar by automating updates, call dialers, and outreach sequences.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-wrap justify-center gap-4 mb-6"
        >
          <Link
            href="/portal"
            onClick={() => trackEvent("cta_landing_portal", { surface: "hero" })}
            className="group relative inline-flex items-center gap-2 px-8 py-4.5 rounded-2xl bg-gradient-to-r from-teal-600 via-cyan-500 to-teal-500 hover:from-teal-500 hover:to-cyan-400 text-white font-bold text-sm transition-all duration-300 shadow-xl shadow-teal-500/20 hover:-translate-y-0.5"
          >
            Launch Portals
            <ArrowRight className="h-4.5 w-4.5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a
              href="#gtm-assessment"
              className="group inline-flex items-center gap-2 px-8 py-4.5 rounded-2xl bg-[#0d0d21] border border-teal-500/30 hover:border-teal-500/60 text-slate-100 font-bold text-sm transition-all duration-300 hover:-translate-y-0.5 shadow-lg shadow-teal-500/5"
            >
              Go to Market Assessment
              <Target className="h-4.5 w-4.5 text-teal-400 group-hover:animate-bounce" />
            </a>
          <a
            href="#pricing"
            className="inline-flex items-center gap-2 px-8 py-4.5 rounded-2xl bg-transparent border border-white/10 hover:bg-white/5 text-slate-300 font-bold text-sm transition-all duration-300 hover:-translate-y-0.5"
          >
            View Pricing plans
          </a>
        </motion.div>
        <span className="text-xs text-slate-500 tracking-wide">
          Fully compliant with SOC-2 & GDPR · 14-day trial period · Instant results
        </span>
      </section>

      {/* --- GTM ASSESSMENT INTAKE FORM --- */}
      <section id="gtm-assessment" className="relative z-10 py-20 px-6 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <span className="eyebrow-teal mb-3 flex items-center justify-center gap-2">
            <Target className="h-4 w-4" /> GTM Assessment
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Start Your Go-to-Market Assessment
          </h2>
          <p className="text-slate-400 text-sm mt-2 max-w-2xl mx-auto">
            Complete the questionnaire to configure the AI model and generate tailored, real-time go-to-market pipelines.
          </p>
        </div>

        <div className="w-full flex justify-center bg-slate-950/20 backdrop-blur-sm rounded-3xl border border-white/5 p-4 sm:p-6 shadow-2xl">
          <IntakeForm />
        </div>
      </section>

      {/* ─── WHY REVENUE LEADERS CHOOSE US (BENTO GRID) ────────────────────────── */}
      <section className="relative z-10 py-24 border-y border-white/5 bg-[#08081a]/50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(20,184,166,0.02),transparent)] pointer-events-none" />
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-16">
            <span className="eyebrow-violet mb-3">Enterprise Value</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Why revenue teams choose DealFlow AI
            </h2>
            <p className="text-slate-400 text-sm mt-2 max-w-lg mx-auto">
              We isolate and automate the administrative load so your sellers can concentrate on building client relations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Box 1: CRM Updates (2/3 width) */}
            <div className="md:col-span-8 group relative p-8 rounded-3xl border border-white/5 bg-gradient-to-br from-teal-950/20 via-black/40 to-transparent hover:border-teal-500/30 bento-glow transition-all duration-500 flex flex-col justify-between min-h-[250px]">
              <div className="df-specular" />
              <div>
                <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-teal-500/10 text-teal-400 mb-4 border border-teal-500/20">
                  <Database className="h-5.5 w-5.5" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Eliminate CRM Drudgery</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Our Memory OS automatically transcribes sales calls, pulls key deal parameters, and updates Salesforce or HubSpot logs. Save up to 6 hours per week per representative.
                </p>
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                <span className="text-[10px] font-mono text-teal-400 bg-teal-500/10 border border-teal-500/20 px-3 py-1 rounded-full">
                  ✓ Salesforce Synced
                </span>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-full">
                  ✓ HubSpot Synced
                </span>
              </div>
            </div>

            {/* Box 2: Deal Alerts (1/3 width) */}
            <div className="md:col-span-4 group relative p-8 rounded-3xl border border-white/5 bg-gradient-to-br from-amber-950/20 via-black/40 to-transparent hover:border-amber-500/30 bento-glow transition-all duration-500 flex flex-col justify-between min-h-[250px]">
              <div className="df-specular" />
              <div>
                <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-amber-500/10 text-amber-400 mb-4 border border-amber-500/20">
                  <TrendingUp className="h-5.5 w-5.5" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Rescue Stalled Deals</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Proactive triggers alert agents the moment a pipeline opportunity stalls or decision-maker response latency spikes.
                </p>
              </div>
              <div className="mt-6 flex justify-between items-center text-[10px] font-mono text-slate-500">
                <span>Active Triggers:</span>
                <span className="text-amber-400 font-bold animate-pulse">● OUTREACH QUEUED</span>
              </div>
            </div>

            {/* Box 3: Agent Orchestration (1/3 width) */}
            <div className="md:col-span-4 group relative p-8 rounded-3xl border border-white/5 bg-gradient-to-br from-violet-950/20 via-black/40 to-transparent hover:border-violet-500/30 bento-glow transition-all duration-500 flex flex-col justify-between min-h-[250px]">
              <div className="df-specular" />
              <div>
                <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-violet-500/10 text-violet-400 mb-4 border border-violet-500/20">
                  <Cpu className="h-5.5 w-5.5" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Fleet of Specialized Agents</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Orchestrate collaborative agents for outreach campaigns, calendar booking management, and pre-meeting dossiers.
                </p>
              </div>
              <div className="mt-6">
                <span className="text-[10px] font-mono text-violet-300 bg-violet-500/10 border border-violet-500/20 px-3 py-1 rounded-full">
                  Average Win Rate: +22%
                </span>
              </div>
            </div>

            {/* Box 4: Security Compliance (2/3 width) */}
            <div className="md:col-span-8 group relative p-8 rounded-3xl border border-white/5 bg-gradient-to-br from-rose-950/20 via-black/40 to-transparent hover:border-rose-500/30 bento-glow transition-all duration-500 flex flex-col justify-between min-h-[250px]">
              <div className="df-specular" />
              <div>
                <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-rose-500/10 text-rose-400 mb-4 border border-rose-500/20">
                  <Shield className="h-5.5 w-5.5" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">GDPR & Compliance Firewall</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Enterprise-grade security settings. Every document access is audited, and client data flows are isolated and SOC-2 compliant. Strict role-based layouts prevent unauthorized interactions.
                </p>
              </div>
              <div className="mt-6 flex justify-between items-center flex-wrap gap-4 text-[10px] font-mono">
                <div className="flex gap-2">
                  <span className="bg-slate-900 border border-white/10 px-2.5 py-1 rounded text-slate-400">SOC 2 Type II</span>
                  <span className="bg-slate-900 border border-white/10 px-2.5 py-1 rounded text-slate-400">GDPR Compliant</span>
                </div>
                <span className="text-rose-400 flex items-center gap-1">🔒 Full Session Isolation</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── GO TO MARKET (GTM ASSESSMENT) SECTION ────────────────────────────── */}
      <section id="gtm-assessment" className="relative z-10 py-24 px-6 max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="eyebrow-teal">
              <Target className="h-3.5 w-3.5" />
              Go to Market (GTM Assessment)
            </span>
            <h2 className="text-4xl font-extrabold text-white">
              GTM Strategy Alignment Engine
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Conduct a comprehensive assessment of your current go-to-market strategy, identify performance gaps, and receive AI-generated recommendations to optimize your outreach, content, and channel mix for maximum conversion.
            </p>

            <div className="space-y-4">
              <a
                href="#gtm-assessment"
                className="w-full bg-gradient-to-r from-teal-600 via-cyan-500 to-teal-500 hover:from-teal-500 text-white font-bold text-xs py-3.5 px-6 rounded-xl shadow-lg shadow-teal-500/25 transition-all flex items-center justify-center gap-2"
              >
                <Zap className="h-4 w-4 text-yellow-400" />
                Start GTM Assessment
              </a>
            </div>
          </div>

          {/* GTM Metrics Preview Panel */}
          <div className="relative rounded-3xl border border-white/10 overflow-hidden bg-slate-950/80 p-5 shadow-2xl min-h-[300px] flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/5">
              <BarChart2 className="h-4.5 w-4.5 text-teal-400" />
              <span className="text-[10px] font-mono text-slate-500">gtm-performance-dashboard.log</span>
            </div>

            <div className="flex-1 flex flex-col justify-center">
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="p-3 bg-teal-500/10 border border-teal-500/20 text-center rounded-xl">
                    <span className="text-[8px] text-slate-500 block uppercase">Pipeline Velocity</span>
                    <strong className="text-teal-400 text-xs font-mono">+42%</strong>
                  </div>
                  <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 text-center rounded-xl">
                    <span className="text-[8px] text-slate-500 block uppercase">Lead Quality</span>
                    <strong className="text-cyan-400 text-xs font-mono">+35%</strong>
                  </div>
                  <div className="p-3 bg-violet-500/10 border border-violet-500/20 text-center rounded-xl">
                    <span className="text-[8px] text-slate-500 block uppercase">CAC Reduction</span>
                    <strong className="text-violet-400 text-xs font-mono">-22%</strong>
                  </div>
                </div>
                <div className="bg-slate-900 border border-white/5 p-4 rounded-xl space-y-2 max-h-[220px] overflow-y-auto">
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">GTM Optimization Insights</p>
                  <ul className="text-[10px] text-slate-300 space-y-2 list-disc pl-4">
                    <li>LinkedIn outreach sequence performance improved by 38% after A/B testing value prop positioning</li>
                    <li>Cold email personalization using company-specific ICP attributes increased open rates by 27%</li>
                    <li>Content marketing focus shifted to mid-funnel technical guides, boosting MQL to SQL conversions</li>
                    <li>Re-engagement campaigns targeting dormant leads with personalized demos showed 19% lift</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PRICING SECTION ───────────────────────────────────────────────────── */}
      <section id="pricing" className="relative z-10 py-24 border-t border-white/5 flex flex-col justify-center">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-12">
            <span className="eyebrow-amber mb-3">Pricing Options</span>
            <h2 className="text-4xl font-extrabold text-white">Simple, transparent pricing</h2>
            <p className="text-slate-400 text-sm mt-2">Start free for 14 days. No credit card required.</p>

            {/* billing toggler and currency */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-8">
              <div className="flex items-center justify-center gap-3">
                <span className={`text-xs font-semibold ${!isAnnual ? "text-teal-400 font-bold" : "text-slate-500"}`}>Monthly</span>
                <button
                  onClick={() => setIsAnnual(!isAnnual)}
                  className="relative w-12 h-6 bg-slate-900 border border-white/10 rounded-full transition-colors flex items-center p-0.5 cursor-pointer"
                  aria-label="Toggle annual pricing"
                >
                  <motion.div
                    className="w-4.5 h-4.5 bg-gradient-to-tr from-teal-500 to-cyan-400 rounded-full"
                    animate={{ x: isAnnual ? 24 : 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  />
                </button>
                <span className={`text-xs font-semibold ${isAnnual ? "text-teal-400 font-bold" : "text-slate-500"} flex items-center gap-1`}>
                  Annually
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-bold">
                    Save 20%
                  </span>
                </span>
              </div>

              <div className="flex items-center justify-center gap-2">
                <span className="text-xs text-slate-500 font-semibold">Currency:</span>
                <div className="flex bg-slate-900 border border-white/10 rounded-full p-0.5">
                  {(["USD", "EUR", "GBP", "CAD", "INR"] as const).map((curr) => (
                    <button
                      key={curr}
                      onClick={() => setCurrency(curr)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all duration-200 ${
                        currency === curr
                          ? "bg-gradient-to-r from-teal-500 to-cyan-400 text-white"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {curr}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto items-stretch">
            {PLANS.map((plan) => {
              const isPopular = plan.popular;
              const isEnterprise = plan.price === null;
              const priceVal = isEnterprise
                ? "Custom"
                : formatCurrency(isAnnual ? plan.price!.annual : plan.price!.monthly, currency);

              return (
                <div
                  key={plan.name}
                  className={`relative p-8 rounded-3xl border transition-all duration-300 flex flex-col justify-between ${
                    isPopular
                      ? "border-violet-500/40 bg-gradient-to-b from-violet-950/20 to-[#070716] shadow-xl shadow-violet-500/10 hover:-translate-y-1 hover:border-violet-500/60"
                      : "border-white/5 bg-slate-900/40 hover:border-white/10 hover:bg-slate-900/60"
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <span className="px-3.5 py-1 rounded-full bg-gradient-to-r from-violet-600 to-purple-500 text-white text-[9px] font-bold uppercase tracking-wider shadow-lg">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="space-y-6">
                    <div>
                      <div className={`${isPopular ? "text-violet-400" : "text-slate-400"} text-[10px] font-bold uppercase tracking-widest mb-1`}>
                        {plan.name}
                      </div>
                      <div className="text-3xl font-bold text-white font-mono">
                        {priceVal}{!isEnterprise && "/mo"}
                      </div>
                      <div className="text-[9px] text-slate-500 mt-1">
                        {isEnterprise ? "Custom parameters" : isAnnual ? "Billed annually" : "Billed monthly"}
                      </div>
                    </div>

                    <p className="text-slate-400 text-xs leading-relaxed min-h-[36px]">
                      {plan.description}
                    </p>

                    <div className={`border-t ${isPopular ? "border-violet-500/10" : "border-white/5"} my-4`} />

                    <ul className="space-y-3">
                      {plan.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <CheckCircle2 className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isPopular ? "text-violet-400" : "text-teal-500"}`} />
                          <span className={`text-xs ${f.included ? "text-slate-300" : "text-slate-600 line-through"}`}>
                            {f.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-8 space-y-3">
                    <Link
                      href={isEnterprise ? "/book-demo" : "/portal/customer/login?signup=true"}
                      className={`w-full h-11 flex items-center justify-center rounded-xl font-bold text-xs transition-all ${
                        isPopular
                          ? "bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-500/20"
                          : "border border-white/10 bg-white/5 hover:bg-white/10 text-white"
                      }`}
                    >
                      {plan.cta}
                    </Link>
                    <span className="text-[9px] text-slate-500 text-center block">
                      No credit card required · Cancel anytime
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── FINAL CALL-TO-ACTION ─────────────────────────────────────────────── */}
      <section className="relative z-10 py-24 border-t border-white/5 bg-[#05050e]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(108,59,255,0.06),transparent)] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto px-6 text-center space-y-8">
          <span className="eyebrow-teal">
            <Target className="h-3.5 w-3.5 text-teal-400" /> Start Automating
          </span>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight">
            Ready to accelerate GTM operations
            <br />
            <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-violet-400 bg-clip-text text-transparent">
              at autonomous speeds?
            </span>
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto leading-relaxed">
            Onboard in under 2 minutes. Sync your SDR campaigns, dialers, and CRM pipelines with a dedicated fleet of revenue agents today.
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <Link
              href="/portal/customer/login?signup=true"
              className="group inline-flex items-center gap-2 px-8 py-4.5 rounded-2xl bg-gradient-to-r from-teal-600 via-cyan-500 to-teal-500 hover:from-teal-500 hover:to-cyan-400 text-white font-bold text-sm transition-all duration-300 shadow-xl shadow-teal-500/20 hover:-translate-y-0.5"
            >
              Get Started Free
              <ArrowRight className="h-4.5 w-4.5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/book-demo"
              className="inline-flex items-center gap-2 px-8 py-4.5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-sm transition-all duration-300 hover:-translate-y-0.5"
            >
              Talk with Sales
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}
