"use client";

import React, { useState, useEffect, useRef, lazy, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import {
  ArrowRight,
  Zap,
  Shield,
  Brain,
  TrendingUp,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Target,
  Database,
  Cpu,
  GitBranch,
  Network,
  PlayCircle,
  Bot,
} from "lucide-react";
import { trackEvent } from "@/lib/analytics";
const IntakeForm = lazy(() => import("@/components/IntakeForm").then((m) => ({ default: m.IntakeForm })));
import ErrorBoundary from "@/components/ErrorBoundary";

// ─── Floating Orb ────────────────────────────────────────────────────────────
const FloatingOrb = React.memo(function FloatingOrb({ className, delay = 0 }: { className?: string; delay?: number }) {
  return (
    <motion.div
      className={`absolute rounded-full blur-3xl opacity-20 pointer-events-none ${className}`}
      animate={{
        y: [0, -30, 0],
        scale: [1, 1.1, 1],
        opacity: [0.15, 0.25, 0.15],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        delay,
        ease: "easeInOut",
      }}
    />
  );
});

// ─── Holographic GTM Interactive Component ───────────────────────────────────
const HolographicGTM = React.memo(function HolographicGTM() {
  const [activeSection, setActiveSection] = useState<number>(0);
  const sections = [
    {
      title: "ICP Definition",
      description: "Identify your ideal customer profile with precision targeting parameters",
      icon: Target,
      color: "text-violet-400",
    },
    {
      title: "Pipeline Analysis",
      description: "Deep dive into your sales funnel with real-time metrics and trends",
      icon: TrendingUp,
      color: "text-violet-400",
    },
    {
      title: "Agent Assignment",
      description: "Orchestrate specialized AI agents with defined roles and permissions",
      icon: Cpu,
      color: "text-violet-400",
    },
    {
      title: "Execution Engine",
      description: "Deploy autonomous workflows for outreach, follow-ups, and qualification",
      icon: Zap,
      color: "text-violet-400",
    },
  ];

  return (
    <div className="relative group">
      <div className="absolute inset-0 rounded-3xl border border-violet-500/20 bg-[radial-gradient(circle_at_center,rgba(108,59,255,0.05),transparent)]" />
      <div className="absolute inset-1 rounded-[22px] border border-slate-200/5 dark:border-white/5" />

      {/* Animated scan lines */}
      <div className="absolute inset-0 rounded-3xl overflow-hidden">
        <motion.div
          className="w-full h-1 bg-gradient-to-r from-transparent via-violet-500/30 to-transparent"
          animate={{ y: [0, 300] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <div className="relative z-10 p-8">
        <div className="mb-8 flex items-center justify-center">
          <div className="relative w-48 h-48">
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-violet-500/30"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, ease: "linear", repeat: Infinity }}
            />
            <motion.div
              className="absolute inset-4 rounded-full border border-violet-500/40"
              animate={{ rotate: -360 }}
              transition={{ duration: 15, ease: "linear", repeat: Infinity }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Network className="w-16 h-16 text-violet-500 dark:text-violet-400 drop-shadow-[0_0_15px_rgba(108,59,255,0.6)]" />
            </div>
          </div>
        </div>

        {/* Section navigation */}
        <div className="grid grid-cols-2 gap-3">
          {sections.map((section, i) => (
            <button
              key={i}
              onClick={() => setActiveSection(i)}
              className={`group/btn relative flex items-start gap-3 p-4 rounded-xl border transition-all duration-300 text-left ${
                activeSection === i
                  ? "border-violet-500/50 bg-violet-500/10"
                  : "border-slate-200/80 dark:border-white/8 bg-slate-50 dark:bg-white/3 hover:border-violet-500/15 hover:bg-slate-100 dark:hover:bg-white/5"
              }`}
            >
              <section.icon
                className={`w-5 h-5 mt-0.5 ${section.color} ${
                  activeSection === i ? "drop-shadow-[0_0_8px_currentColor]" : ""
                }`}
              />
              <div>
                <div className="font-semibold text-slate-800 dark:text-white text-sm mb-1">{section.title}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{section.description}</div>
              </div>
              {activeSection === i && (
                <motion.div
                  layoutId="active-holo-indicator"
                  className="absolute -right-2 -top-2 w-2 h-2 rounded-full bg-violet-400"
                />
              )}
            </button>
          ))}
        </div>

        {/* Active section details */}
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-6 pt-6 border-t border-slate-200 dark:border-white/5"
        >
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <PlayCircle className="w-4 h-4 text-violet-500" />
            <span>Live {sections[activeSection].title} Engine</span>
          </div>
          <div className="mt-3 h-20 bg-slate-100 dark:bg-black/20 rounded-lg border border-slate-200 dark:border-white/5 flex items-center justify-center overflow-hidden">
            <motion.div
              className="flex gap-2"
              animate={{ x: [0, -150] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            >
              {[
                "Analyzing ICP fit",
                "Scoring leads",
                "Prioritizing outreach",
                "Drafting follow-ups",
                "Updating CRM",
                "Consolidating memory",
              ].map((text, i) => (
                <span key={i} className="text-xs font-mono text-slate-600 dark:text-slate-400 px-3 py-1 rounded bg-violet-500/10 border border-violet-500/20">
                  {text}
                </span>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
});

// ─── Feature Card ─────────────────────────────────────────────────────────────
const FeatureCard = React.memo(function FeatureCard({ icon: Icon, title, description, gradient, delay = 0 }: {
  icon: any;
  title: string;
  description: string;
  gradient: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className="group relative p-6 rounded-2xl border border-slate-200 dark:border-white/8 bg-slate-50 dark:bg-gradient-to-b dark:from-white/5 dark:to-white/[0.01] hover:bg-slate-100/80 dark:hover:from-white/10 dark:hover:to-white/5 hover:border-violet-500/30 transition-all duration-500 overflow-hidden cursor-default shadow-sm hover:shadow-violet-500/5 hover:-translate-y-1"
    >
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl ${gradient} blur-2xl scale-75`} />
      
      <div className="relative z-10">
        <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 ${gradient} bg-opacity-20`}>
          <Icon className="w-6 h-6 text-slate-800 dark:text-white" />
        </div>
        <h3 className="text-base font-semibold text-slate-800 dark:text-white mb-2">{title}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{description}</p>
      </div>
    </motion.div>
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

// ─── Main Landing Page ────────────────────────────────────────────────────────
export default function HomePage() {
  const router = useRouter();
  const heroRef = useRef<HTMLDivElement>(null);
  const intakeSectionRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const [abVariant] = useState<"A" | "B">("A");
  const [formCompleted, setFormCompleted] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Annual pricing toggle
  const [isAnnual, setIsAnnual] = useState(true);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      const params = new URLSearchParams(window.location.search);
      const leadId = params.get("leadId");
      if (leadId) router.replace(`/analysis?leadId=${leadId}`);
    }
  }, [router, isClient]);

  useEffect(() => {
    if (!isClient || !formCompleted) return;
    let maxScrollY = 0;
    const calculateMaxScroll = () => {
      if (intakeSectionRef.current) {
        const rect = intakeSectionRef.current.getBoundingClientRect();
        maxScrollY = window.scrollY + rect.bottom - window.innerHeight;
        maxScrollY = Math.max(maxScrollY, 0);
      }
    };
    calculateMaxScroll();

    const preventScrollBeyond = (e: WheelEvent | TouchEvent) => {
      const currentScrollY = window.scrollY;
      let scrollingDown = false;

      if (e.type === "wheel") scrollingDown = (e as WheelEvent).deltaY > 0;
      else if (e.type === "touchmove") {
        const touch = (e as TouchEvent).touches[0];
        const prevTouch = (e as TouchEvent).changedTouches[0];
        scrollingDown = touch.clientY < prevTouch.clientY;
      }
      if (scrollingDown && currentScrollY >= maxScrollY) {
        e.preventDefault();
        e.stopPropagation();
        window.scrollTo(0, maxScrollY);
      }
    };

    const preventKeyDownBeyond = (e: KeyboardEvent) => {
      const currentScrollY = window.scrollY;
      const isDownKey = ["ArrowDown", "PageDown", "Space"].includes(e.key);
      if (isDownKey && currentScrollY >= maxScrollY) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    window.addEventListener("wheel", preventScrollBeyond, { passive: false });
    window.addEventListener("touchmove", preventScrollBeyond, { passive: false });
    window.addEventListener("keydown", preventKeyDownBeyond, { passive: false });
    window.addEventListener("resize", calculateMaxScroll);

    return () => {
      window.removeEventListener("wheel", preventScrollBeyond);
      window.removeEventListener("touchmove", preventScrollBeyond);
      window.removeEventListener("keydown", preventKeyDownBeyond);
      window.removeEventListener("resize", calculateMaxScroll);
    };
  }, [isClient, formCompleted]);

  // Features list with codenames removed and led by buyer outcomes
  const otherFeatures = React.useMemo(() => [
    { icon: Database, title: "Gets smarter with every deal you close", description: "Adaptive learning system that enables continuous agent improvement based on closed-won outcomes and notes.", gradient: "bg-gradient-to-br from-teal-600/20 to-cyan-800/20" },
    { icon: Cpu, title: "A fleet of specialized agents, each with a defined role", description: "Orchestrate collaborative agents for outreach, pipeline triage, calendar booking, and meeting prep.", gradient: "bg-gradient-to-br from-blue-600/20 to-indigo-800/20" },
    { icon: Shield, title: "Autonomous agent collaboration and compliance", description: "Built-in security firewall that monitors, audits, and controls every action to ensure compliance.", gradient: "bg-gradient-to-br from-rose-600/20 to-red-800/20" },
    { icon: TrendingUp, title: "Real-time pipeline analysis that identifies stall points", description: "Diagnose drop-offs immediately and surface the highest-impact recommendations to rescue deals.", gradient: "bg-gradient-to-br from-amber-600/20 to-orange-800/20" },
    { icon: GitBranch, title: "Advanced multi-agent orchestration framework", description: "Orchestrate multiple agents with defined roles, permissions, and memory scopes that collaborate autonomously.", gradient: "bg-gradient-to-br from-emerald-600/20 to-green-800/20" },
  ], []);

  return (
    <main className="snap-container min-h-screen text-slate-800 dark:text-white bg-background">
      
      {/* ── HERO SECTION WITH HOLOGRAPHIC GTM ────────────────────────────────────── */}
      <section id="hero" ref={heroRef} className="snap-section relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        
        {/* Ambient background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(108,59,255,0.08),transparent)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_80%_50%,rgba(108,59,255,0.05),transparent)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_20%_70%,rgba(0,212,255,0.04),transparent)]" />
          
          <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02]" style={{ backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`, backgroundSize: "80px 80px" }} />
          
          <FloatingOrb className="w-96 h-96 bg-violet-500 top-1/4 -left-20" delay={0} />
          <FloatingOrb className="w-80 h-80 bg-violet-600 top-1/3 right-0" delay={2} />
          <FloatingOrb className="w-64 h-64 bg-cyan-500 bottom-1/4 left-1/3" delay={4} />
        </div>

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 mx-auto max-w-7xl px-6 py-20"
        >
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Hero text */}
            <div className="text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-600 dark:text-violet-300 text-sm font-semibold backdrop-blur-sm"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500" />
                </span>
                DealFlow AI GTM Engine
                <ChevronRight className="w-4 h-4" />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] mb-8 text-slate-900 dark:text-white"
              >
                Close more deals.
                <br />
                <span className="bg-gradient-to-r from-violet-600 via-purple-500 to-indigo-400 bg-clip-text text-transparent" style={{ WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  Let the agents do it.
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="max-w-xl mx-auto lg:mx-0 text-lg sm:text-xl text-slate-600 dark:text-slate-400 leading-relaxed mb-10"
              >
                {"CRM hygiene, stalled deals, and manual follow-ups eat up to 60% of your sales reps' time. DealFlow AI deploys autonomous revenue agents with persistent memory to handle the busywork so your team can focus on closing."}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="flex flex-col items-center lg:items-start gap-4"
              >
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                  <Link
                    href="/#how-it-works"
                    onClick={() => trackEvent("cta_start_analysis", { surface: "hero_v3", abVariant })}
                    className="group inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-base transition-all duration-300 shadow-lg shadow-violet-500/25 hover:-translate-y-0.5"
                  >
                    Start Pipeline Analysis
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    href="/book-demo"
                    onClick={() => trackEvent("cta_book_demo", { surface: "hero_v3", abVariant })}
                    className="group inline-flex items-center gap-2 px-8 py-4 rounded-xl border border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-800 dark:text-white font-semibold text-base transition-all duration-300 hover:-translate-y-0.5"
                  >
                    Book a Demo
                  </Link>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  No credit card required · 14-day free trial · Results in 2 minutes
                </p>
              </motion.div>
            </div>

            {/* Right: Holographic GTM Component */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: 30 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative"
            >
              <div className="absolute -inset-8 bg-gradient-to-br from-violet-500/10 via-purple-500/5 to-cyan-500/10 rounded-[2.5rem] blur-3xl" />
              <HolographicGTM />
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ── WHY TEAMS CHOOSE DEALFLOW AI (OUTCOMES SECTION) ──────────────────────────────── */}
      <section className="snap-section relative border-y border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01] flex flex-col justify-center">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-xl font-bold text-center text-slate-900 dark:text-white mb-10">
              Why revenue leaders choose DealFlow AI
            </h3>
            <div className="grid md:grid-cols-2 gap-8 sm:gap-10">
              {[
                {
                  title: "Eliminate CRM Drudgery",
                  desc: "Agents update Salesforce and HubSpot automatically based on real meeting context and email threads, reclaiming 6+ hours per rep weekly.",
                },
                {
                  title: "Resuscitate Stalled Pipeline",
                  desc: "Get proactive alerts and autonomous re-engagement outreach sequences the moment a key decision maker goes quiet.",
                },
                {
                  title: "Standardize Winning Playbooks",
                  desc: "Instantly propagate your top rep's strategies to your entire fleet of agents for consistent, high-yield outbound and follow-up.",
                },
                {
                  title: "Enterprise-Grade Security",
                  desc: "Built on a secure firewall with persistent memory that keeps your proprietary deal data isolated, private, and SOC-2 compliant.",
                },
              ].map((item, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="h-7 w-7 rounded-xl bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-800 dark:text-white">{item.title}</h4>
                    <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── GTM ASSESSMENT INTAKE FORM SECTION ───────────────────────────────────────── */}
      <section id="how-it-works" ref={intakeSectionRef} className="snap-section relative py-20 border-b border-slate-200 dark:border-white/5 scroll-mt-16 flex flex-col justify-center">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: Form Details & Blurred Report Sample */}
            <div className="lg:col-span-5 space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">
                GTM Assessment
              </span>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                Get Your GTM Readout
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                Answer 6 questions — get a full GTM readout with specific recommendations for your pipeline in under 2 minutes.
              </p>
              
              {/* Blurred Sample Report Card */}
              <div className="relative rounded-2xl border border-slate-200 dark:border-white/10 p-5 bg-white dark:bg-white/3 overflow-hidden shadow-md">
                {/* Blur backdrop overlay */}
                <div className="absolute inset-0 bg-white/20 dark:bg-slate-950/40 backdrop-blur-[3px] z-10 flex flex-col items-center justify-center p-4">
                  <div className="bg-slate-900/90 text-white text-xs px-3.5 py-1.5 rounded-xl border border-white/10 font-bold shadow-lg z-20 flex items-center gap-1">
                    <svg className="h-3.5 w-3.5 text-violet-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    <span>Sample Report Preview</span>
                  </div>
                </div>
                {/* Mock report elements */}
                <div className="space-y-3 opacity-60">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-white/5">
                    <span className="text-[10px] font-bold text-slate-400">PIPELINE READOUT</span>
                    <span className="h-1.5 w-8 rounded bg-violet-400" />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2 rounded bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                      <span className="text-[8px] text-slate-400 block">Win Rate</span>
                      <span className="text-xs font-bold text-emerald-500 font-mono">+18.4%</span>
                    </div>
                    <div className="p-2 rounded bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                      <span className="text-[8px] text-slate-400 block">Stalled Opportunities</span>
                      <span className="text-xs font-bold text-red-500 font-mono">14</span>
                    </div>
                    <div className="p-2 rounded bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                      <span className="text-[8px] text-slate-400 block">ICP Alignment</span>
                      <span className="text-xs font-bold text-violet-500 font-mono">92.6%</span>
                    </div>
                  </div>
                  <div className="h-8 rounded bg-slate-100 dark:bg-white/5 flex items-center justify-between px-3 text-[9px] text-slate-500">
                    <span>Recommendations: Standardize win playbook ...</span>
                    <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Column: Intake Form */}
            <div className="lg:col-span-7">
              <div className="rounded-3xl border border-slate-200 dark:border-white/10 p-6 bg-white dark:bg-white/3 shadow-xl">
                <ErrorBoundary>
                  <Suspense fallback={
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                      <div className="w-10 h-10 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
                      <p className="text-sm text-slate-500 dark:text-slate-400">Loading form...</p>
                    </div>
                  }>
                    <IntakeForm />
                  </Suspense>
                </ErrorBoundary>
                <div className="text-center mt-4 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1.5 select-none">
                  {/* Lock icon */}
                  <svg className="h-3.5 w-3.5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>Your data is never sold or shared</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── PLATFORM SECTION ───────────────────────────────────────────────────── */}
      <section id="features" className="snap-section relative py-28 overflow-hidden flex flex-col justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_50%,rgba(108,59,255,0.03),transparent)] pointer-events-none" />
        
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-600 dark:text-violet-300 text-xs font-semibold uppercase tracking-wider mb-6"
            >
              <Bot className="w-3.5 h-3.5" />
              Platform Architecture
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-5"
            >
              Everything your revenue team needs,
              <br />
              <span className="text-slate-500 dark:text-slate-400">unified in one intelligent OS</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="max-w-2xl mx-auto text-slate-600 dark:text-slate-400 text-lg"
            >
              From memory architecture to autonomous agent orchestration — DealFlow AI is a full-stack intelligence platform built for modern GTM teams.
            </motion.p>
          </div>

          <div className="space-y-4 max-w-6xl mx-auto">
            {/* Memory OS Wide Flagship Hero Card */}
            <div className="p-8 rounded-3xl border border-slate-200 dark:border-white/8 bg-slate-50 dark:bg-gradient-to-b dark:from-white/5 dark:to-white/[0.01] hover:border-violet-500/30 transition-all duration-500 shadow-md">
              <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-violet-100 dark:bg-violet-600/20 text-violet-600 dark:text-violet-400 flex-shrink-0">
                  <Brain className="w-8 h-8" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 text-[10px] font-bold uppercase tracking-wider mb-2 select-none">
                    Flagship Core
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
                    Agents that remember every deal, forever
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-4xl">
                    Unified memory management system that retains deal context, buyer signals, and pipeline state across every interaction. Every meeting note, email thread, and deal constraint is cataloged and instantly retrievable.
                  </p>
                </div>
              </div>
            </div>

            {/* Rest of the Features */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {otherFeatures.map((feature, i) => (
                <FeatureCard key={i} {...feature} delay={i * 0.08} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── INTEGRATIONS & TESTIMONIALS SECTION GROUP ─────────────────────────── */}
      <div className="snap-section flex flex-col justify-center py-20 border-t border-slate-200 dark:border-white/5 bg-[#070715]/10">
        
        {/* ── INTEGRATIONS MARQUEE STRIP ───────────────────────────────────────── */}
        <section className="relative overflow-hidden mb-12">
          <div className="mx-auto max-w-7xl px-6 text-center">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-6"
            >
              Integrates with your existing revenue stack
            </motion.p>
            
            <div className="relative w-full overflow-hidden py-4">
              <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-background to-transparent z-10" />
              <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-background to-transparent z-10" />
              <motion.div
                className="flex gap-8 items-center whitespace-nowrap min-w-full"
                animate={{ x: [0, -400] }}
                transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
              >
                {[...SVG_LOGOS, ...SVG_LOGOS, ...SVG_LOGOS].map((logo, idx) => (
                  <div
                    key={idx}
                    className="inline-flex items-center px-6 py-3 rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/3 text-slate-800 dark:text-slate-400 text-sm font-semibold hover:border-violet-500/50 hover:scale-105 transition-all cursor-pointer shadow-sm"
                  >
                    {logo.svg}
                    <span>{logo.name}</span>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS SECTION ────────────────────────────────────────────────── */}
        <section className="relative bg-transparent">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">What Revenue Leaders Say</h2>
              <p className="text-slate-500 dark:text-slate-400 mt-2">Hear from the VP Sales and RevOps leaders using DealFlow AI.</p>
            </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              {
                quote: "DealFlow AI cut our manual follow-up time to zero. Our reps are now solely focused on high-value conversations.",
                author: "Sarah Jenkins",
                role: "VP Sales",
                company: "TechScale Inc.",
                initials: "SJ",
              },
              {
                quote: "We finally solved our CRM hygiene issue. The memory OS automatically populates deal logs with high fidelity.",
                author: "Marcus Chen",
                role: "Head of RevOps",
                company: "cloudFlow",
                initials: "MC",
              },
              {
                quote: "Our win rates increased by 22% within the first month. The agents flag stalled deals before they drop off.",
                author: "Elena Rostova",
                role: "Chief Revenue Officer",
                company: "EnterpriseOS",
                initials: "ER",
              },
            ].map((t, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/3 hover:border-violet-500/30 transition-all flex flex-col justify-between shadow-sm"
              >
                <p className="text-slate-600 dark:text-slate-300 italic text-sm leading-relaxed">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3 mt-6">
                  <div className="h-9 w-9 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 font-bold text-xs flex items-center justify-center">
                    {t.initials}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white">{t.author}</h4>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      {t.role}, {t.company}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>

      {/* ── PRICING ─────────────────────────────────────────────────────────────── */}
      <section className="snap-section relative py-28 border-t border-slate-200 dark:border-white/5 flex flex-col justify-center" id="pricing">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_80%,rgba(108,59,255,0.03),transparent)] pointer-events-none" />

        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-600 dark:text-violet-300 text-xs font-semibold uppercase tracking-wider mb-6"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Pricing
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4"
            >
              Simple, transparent pricing
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-slate-500 dark:text-slate-400 text-lg"
            >
              Start free for 14 days. No credit card required.
            </motion.p>

            {/* Annual billing toggle */}
            <div className="flex items-center justify-center gap-3 mt-6">
              <span className={`text-sm ${!isAnnual ? "text-slate-800 dark:text-white font-bold" : "text-slate-400"}`}>Monthly</span>
              <button
                onClick={() => setIsAnnual(!isAnnual)}
                className="relative w-12 h-6 bg-violet-600 rounded-full transition-colors flex items-center p-1"
                aria-label="Toggle annual billing"
              >
                <div
                  className={`w-4 h-4 bg-white rounded-full transition-transform shadow-md ${
                    isAnnual ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
              <span className={`text-sm ${isAnnual ? "text-slate-800 dark:text-white font-bold" : "text-slate-400"} flex items-center gap-1.5`}>
                Annually
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                  Save 20% annually
                </span>
              </span>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Starter Plan */}
            <div className="relative p-8 rounded-3xl border border-slate-200 dark:border-white/8 bg-white dark:bg-gradient-to-b dark:from-white/5 dark:to-[#08081a] flex flex-col justify-between hover:border-slate-300 dark:hover:border-white/15 transition-all">
              <div>
                <div className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-2">Starter</div>
                <div className="text-3xl font-bold text-slate-800 dark:text-white">{isAnnual ? "$399/mo" : "$499/mo"}</div>
                <div className="text-[10px] text-slate-400 mt-1">{isAnnual ? "Billed annually" : "Billed monthly"}</div>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-4 leading-relaxed">
                  For teams just starting to bring AI into their sales motion
                </p>
                <ul className="space-y-3 mt-6">
                  {["Up to 5 AI Revenue Agents", "Memory OS — 30-day context", "GTM Pipeline Analysis", "Standard Integrations"].map((f, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 mt-0.5 text-slate-400 flex-shrink-0" />
                      <span className="text-slate-600 dark:text-slate-300 text-xs">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-8">
                <Link
                  href="/book-demo"
                  className="w-full h-11 flex items-center justify-center rounded-xl border border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-800 dark:text-white font-bold text-xs"
                >
                  Start free trial
                </Link>
                <span className="text-[10px] text-slate-400 text-center block mt-3 select-none">
                  No credit card required · Cancel anytime
                </span>
              </div>
            </div>

            {/* Growth Plan */}
            <div className="relative p-8 rounded-3xl border border-violet-500/60 bg-slate-50 dark:bg-gradient-to-b dark:from-[#0b1c1e] dark:to-[#070716] flex flex-col justify-between shadow-lg shadow-violet-500/5 hover:-translate-y-1 transition-all">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="px-3 py-1 rounded-full bg-violet-600 text-white text-[10px] font-bold uppercase tracking-wider">
                  Most Popular
                </span>
              </div>
              <div>
                <div className="text-violet-600 dark:text-violet-400 text-xs font-semibold uppercase tracking-widest mb-2">Growth</div>
                <div className="text-3xl font-bold text-slate-800 dark:text-white">{isAnnual ? "$999/mo" : "$1,299/mo"}</div>
                <div className="text-[10px] text-slate-400 mt-1">{isAnnual ? "Billed annually" : "Billed monthly"}</div>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-4 leading-relaxed">
                  For teams scaling a multi-rep GTM motion with advanced agent orchestration
                </p>
                <ul className="space-y-3 mt-6">
                  {["Up to 25 AI Revenue Agents", "Full Memory OS — unlimited context", "Continuous agent learning", "Multi-Agent Framework", "All integrations + webhook support"].map((f, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 mt-0.5 text-violet-600 dark:text-violet-400 flex-shrink-0" />
                      <span className="text-slate-600 dark:text-slate-300 text-xs font-semibold">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-8">
                <Link
                  href="/book-demo"
                  className="w-full h-11 flex items-center justify-center rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shadow-md shadow-violet-500/20"
                >
                  Start free trial
                </Link>
                <span className="text-[10px] text-slate-400 text-center block mt-3 select-none">
                  No credit card required · Cancel anytime
                </span>
              </div>
            </div>

            {/* Enterprise Plan */}
            <div className="relative p-8 rounded-3xl border border-slate-200 dark:border-white/8 bg-white dark:bg-gradient-to-b dark:from-white/5 dark:to-[#08081a] flex flex-col justify-between hover:border-slate-300 dark:hover:border-white/15 transition-all">
              <div>
                <div className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-2">Enterprise</div>
                <div className="text-3xl font-bold text-slate-800 dark:text-white">Custom</div>
                <div className="text-[10px] text-slate-400 mt-1">Bespoke contract</div>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-4 leading-relaxed">
                  For large orgs needing bespoke AI infrastructure, compliance, and dedicated support
                </p>
                <ul className="space-y-3 mt-6">
                  {["Unlimited AI Revenue Agents", "Custom memory architecture", "On-premise / VPC deployment", "SOC 2 Type II compliance", "Custom integrations & SLA support"].map((f, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 mt-0.5 text-slate-400 flex-shrink-0" />
                      <span className="text-slate-600 dark:text-slate-300 text-xs">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-8">
                <Link
                  href="/book-demo"
                  className="w-full h-11 flex items-center justify-center rounded-xl border border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-800 dark:text-white font-bold text-xs"
                >
                  Contact Sales
                </Link>
                <span className="text-[10px] text-slate-400 text-center block mt-3 select-none">
                  No credit card required · Cancel anytime
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Trust Row */}
          <div className="text-center mt-12 text-xs text-slate-400 select-none">
            14-day free trial · No credit card · Cancel anytime · SOC 2 certified
          </div>
        </div>
      </section>

      {/* ── CTA SECTION ─────────────────────────────────────────────────────────── */}
      <section className="snap-section relative py-28 border-t border-slate-200 dark:border-white/5 overflow-hidden flex flex-col justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_50%,rgba(108,59,255,0.06),transparent)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_40%_at_50%_50%,rgba(108,59,255,0.04),transparent)] pointer-events-none" />

        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-600 dark:text-violet-300 text-xs font-semibold uppercase tracking-wider">
              <Target className="w-3.5 h-3.5" />
              Start Today
            </div>
            <h2 className="text-5xl sm:text-6xl font-bold text-slate-900 dark:text-white leading-tight">
              Ready to close deals
              <br />
              <span className="bg-gradient-to-r from-violet-600 to-indigo-500 bg-clip-text text-transparent" style={{ WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                at AI speed?
              </span>
            </h2>
            <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
              Deploy autonomous revenue agents with persistent memory to handle lead qualification, outbound, and meeting logistics.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/#how-it-works"
                onClick={() => trackEvent("cta_start_analysis", { surface: "bottom_cta_v3", abVariant })}
                className="group inline-flex items-center gap-2 px-10 py-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-lg transition-all duration-300 shadow-xl shadow-violet-500/30 hover:-translate-y-0.5"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/book-demo"
                onClick={() => trackEvent("cta_talk_sales", { surface: "bottom_cta_v3", abVariant })}
                className="inline-flex items-center gap-2 px-10 py-4 rounded-xl border border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-800 dark:text-white font-bold text-lg transition-all duration-300 hover:-translate-y-0.5"
              >
                Talk to Sales
              </Link>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              14-day free trial · No credit card · Cancel anytime
            </p>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
