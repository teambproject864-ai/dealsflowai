"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
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

  // Portal Simulator active tab
  const [simPortal, setSimPortal] = useState<"customer" | "agent" | "admin">("customer");

  // Portal Simulator Customer Tab States
  const [custBusinessModel, setCustBusinessModel] = useState<"b2b" | "b2c" | "d2c">("b2b");
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<{ sender: string; text: string }>>([
    { sender: "Agent (Vijay)", text: "Hi! I noticed your conversion rate dropped last week. I prepared a new campaign segment." },
    { sender: "You", text: "Thanks, let's deploy it. How many credits will it require?" },
    { sender: "Agent (Vijay)", text: "Around 50 credits to execute the outreach. I've loaded it into your workspace." },
  ]);

  // Portal Simulator Agent Tab States
  const [agentTactic, setAgentTactic] = useState("Cold Email");
  const [agentDialerNum, setAgentDialerNum] = useState("");
  const [callState, setCallState] = useState<"idle" | "ringing" | "connected">("idle");
  const [callTimer, setCallTimer] = useState(0);

  // Portal Simulator Admin Tab States
  const [adminComplianceLogs, setAdminComplianceLogs] = useState<string[]>([
    "GDPR Access Audit: Admin ashok accessed Client Stark Industries metadata",
    "Task Allocation: System auto-assigned requirement Req-942 to Agent Praneeth",
    "Security Check: Key verification approved for new outreach channel integration",
  ]);

  // FAPO Simulator States
  const [originalPrompt, setOriginalPrompt] = useState("Write a cold email to sell my marketing tool.");
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationStep, setOptimizationStep] = useState("");
  const [optimizedResult, setOptimizedResult] = useState<string | null>(null);

  // Pricing States
  const [isAnnual, setIsAnnual] = useState(true);
  const [currency, setCurrency] = useState<"USD" | "EUR" | "GBP" | "CAD" | "INR">("USD");

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Softphone dialer timer effect
  useEffect(() => {
    let t: NodeJS.Timeout;
    if (callState === "connected") {
      t = setInterval(() => setCallTimer((prev) => prev + 1), 1000);
    } else {
      setCallTimer(0);
    }
    return () => clearInterval(t);
  }, [callState]);

  // Simulation: Add admin logs periodically
  useEffect(() => {
    if (simPortal !== "admin") return;
    const actions = [
      "GDPR Access Audit: Document 'Stark-Q4-ICP.pdf' downloaded by Agent Ashok",
      "API Credentials Alert: Smartlead API Key rotated successfully",
      "Security Check: Strict GDPR compliance firewall active - 0 threats found",
      "Client Management: Business Model updated to 'B2C' for customer-demo",
      "Task Audit: Overdue task 'Follow up Stark CEO' flagged for Agent Ashok",
    ];
    let i = 0;
    const t = setInterval(() => {
      setAdminComplianceLogs((prev) => [actions[i], ...prev.slice(0, 3)]);
      i = (i + 1) % actions.length;
    }, 4500);
    return () => clearInterval(t);
  }, [simPortal]);

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

  // Run mock FAPO Optimization
  const handleFapoOptimize = () => {
    if (isOptimizing) return;
    setIsOptimizing(true);
    setOptimizedResult(null);
    setOptimizationStep("Analyzing prompt structure & tone...");
    
    setTimeout(() => {
      setOptimizationStep("Injecting target company ICP attributes...");
      setTimeout(() => {
        setOptimizationStep("Synthesizing multi-model prompt variants...");
        setTimeout(() => {
          setOptimizationStep("Evaluating against 12 historical success criteria...");
          setTimeout(() => {
            setOptimizedResult(
              `Subject: Solving conversion bottlenecks for Stark Industries?\n\nHi Tony,\n\nI noticed Stark Industries is experiencing operational latency in manual outbound pipelines. Many aerospace leaders waste up to 60% of their sales reps' time on CRM admin.\n\nWe deployed specialized AI revenue agents that handle lead qualification and book meetings autonomously. \n\nAre you open to a 10-minute preview next Tuesday to see how we could help Stark Industries save 6+ hours weekly?`
            );
            setIsOptimizing(false);
          }, 800);
        }, 800);
      }, 800);
    }, 800);
  };

  // Simulated Chat submit
  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setChatMessages((prev) => [...prev, { sender: "You", text: userMsg }]);
    setChatInput("");
    
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        { sender: "Agent (Vijay)", text: "Understood! I am spinning up the lead scoring engine now. View progress on your GTM tab." },
      ]);
    }, 1200);
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
            href="#fapo"
            className="group inline-flex items-center gap-2 px-8 py-4.5 rounded-2xl bg-[#0d0d21] border border-violet-500/30 hover:border-violet-500/60 text-slate-100 font-bold text-sm transition-all duration-300 hover:-translate-y-0.5 shadow-lg shadow-violet-500/5"
          >
            FAPO Prompt Simulator
            <Rocket className="h-4.5 w-4.5 text-violet-400 group-hover:animate-bounce" />
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

      {/* ─── INTERACTIVE PORTAL SIMULATOR ──────────────────────────────────────── */}
      <section id="demo" className="relative z-10 py-16 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <span className="eyebrow-teal mb-3">Live Simulation</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Explore the multi-portal experience
          </h2>
          <p className="text-slate-400 text-sm mt-2 max-w-2xl mx-auto">
            Interact with our mock portals to see how customers, agents, and admins stay synchronized in real-time.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-3 gap-3 p-1.5 bg-[#0a0a1f]/80 border border-white/5 rounded-2xl mb-8 max-w-2xl mx-auto backdrop-blur-lg">
          {(["customer", "agent", "admin"] as const).map((portal) => (
            <button
              key={portal}
              onClick={() => setSimPortal(portal)}
              className={`py-3.5 rounded-xl text-xs font-bold capitalize transition-all duration-300 ${
                simPortal === portal
                  ? "bg-gradient-to-r from-teal-500/25 to-violet-500/25 border border-teal-500/40 text-teal-300 shadow-[0_0_15px_rgba(20,184,166,0.1)]"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              }`}
            >
              {portal} Hub
            </button>
          ))}
        </div>

        {/* Mock Portal Viewport */}
        <div className="relative rounded-3xl border border-white/10 overflow-hidden df-glass shadow-2xl p-6 min-h-[500px]">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-teal-500/5 pointer-events-none" />
          
          {/* Header element bar inside portal */}
          <div className="flex justify-between items-center pb-4 border-b border-white/10 mb-6">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500" />
              </span>
              <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">
                {simPortal === "customer" ? "Customer Dashboard v2.4" : simPortal === "agent" ? "Agent Workspace v3.5" : "Admin Security Console"}
              </span>
            </div>
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-500/40" />
            </div>
          </div>

          <AnimatePresence mode="wait">
            {/* 1. CUSTOMER PORTAL */}
            {simPortal === "customer" && (
              <motion.div
                key="customer-sim"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35 }}
                className="space-y-6"
              >
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-900/60 border border-white/5 rounded-2xl">
                    <p className="text-[10px] text-teal-400 font-bold uppercase tracking-wider">Available Credits</p>
                    <h4 className="text-2xl font-extrabold text-white mt-1">750 Units</h4>
                  </div>
                  <div className="p-4 bg-slate-900/60 border border-white/5 rounded-2xl">
                    <p className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">Active Campaigns</p>
                    <h4 className="text-2xl font-extrabold text-white mt-1">12 Profiles</h4>
                  </div>
                  <div className="p-4 bg-slate-900/60 border border-white/5 rounded-2xl flex justify-between items-center">
                    <div>
                      <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Operating Model</p>
                      <h4 className="text-lg font-extrabold text-white mt-1 capitalize">{custBusinessModel} Flow</h4>
                    </div>
                    <select
                      value={custBusinessModel}
                      onChange={(e) => setCustBusinessModel(e.target.value as any)}
                      className="bg-slate-950 border border-white/10 rounded-xl px-2 py-1 text-[10px] text-slate-350"
                    >
                      <option value="b2b">B2B SaaS</option>
                      <option value="b2c">B2C Retail</option>
                      <option value="d2c">D2C Brand</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Chat widget mockup */}
                  <div className="p-4 bg-slate-900/40 border border-white/5 rounded-2xl flex flex-col justify-between h-[220px]">
                    <div className="space-y-3 overflow-y-auto max-h-[140px] pr-2 text-xs">
                      {chatMessages.map((msg, idx) => (
                        <div key={idx} className={`flex flex-col ${msg.sender === "You" ? "items-end" : "items-start"}`}>
                          <span className="text-[9px] text-slate-500 mb-0.5">{msg.sender}</span>
                          <div className={`p-2.5 rounded-xl max-w-[80%] ${msg.sender === "You" ? "bg-teal-600/20 text-teal-200 border border-teal-500/30" : "bg-slate-800 text-slate-200"}`}>
                            {msg.text}
                          </div>
                        </div>
                      ))}
                    </div>
                    <form onSubmit={handleChatSubmit} className="flex gap-2 border-t border-white/5 pt-3 mt-2">
                      <input
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Type message to your agent..."
                        className="bg-slate-950 border border-white/10 rounded-xl px-3 py-1.5 text-xs flex-1 focus:outline-none"
                      />
                      <button type="submit" className="p-2 bg-teal-600 rounded-xl hover:bg-teal-500 transition-colors">
                        <Send className="h-3.5 w-3.5" />
                      </button>
                    </form>
                  </div>

                  {/* Campaign configuration details */}
                  <div className="p-4 bg-slate-900/40 border border-white/5 rounded-2xl space-y-4">
                    <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <Target className="h-4 w-4 text-violet-400" /> Tailored campaign attributes
                    </h4>
                    <div className="space-y-2 text-xs leading-normal">
                      <p className="text-slate-400">
                        {custBusinessModel === "b2b"
                          ? "Generating cold outreach sequences focused on VP Revenue and Sales leaders. Optimized for enterprise volume conversions."
                          : custBusinessModel === "b2c"
                          ? "Executing promotional loyalty reminders. Integrated with Shopify cart databases for automated abandoned checkout retrieval."
                          : "Custom direct-to-consumer email flows focused on founder brand storytelling and priority product discounts."}
                      </p>
                      <div className="flex gap-2 mt-4">
                        <span className="px-2.5 py-0.5 rounded-md bg-teal-500/10 border border-teal-500/20 text-teal-400 text-[10px] font-bold">
                          ✓ Salesforce Synced
                        </span>
                        <span className="px-2.5 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-bold">
                          ✓ Model Active
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 2. AGENT PORTAL */}
            {simPortal === "agent" && (
              <motion.div
                key="agent-sim"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35 }}
                className="space-y-6"
              >
                {/* Active Campaign Selection & Dialer */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left list of clients */}
                  <div className="p-4 bg-slate-900/60 border border-white/5 rounded-2xl space-y-2">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">Campaign Queue</p>
                    <div className="p-2.5 bg-violet-600/10 border border-violet-500/30 rounded-xl text-xs flex justify-between items-center">
                      <div>
                        <p className="font-bold text-white">Stark Industries</p>
                        <p className="text-[9px] text-slate-400 mt-0.5">ICP: Aero/Defense leaders</p>
                      </div>
                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[9px] font-bold">Active</span>
                    </div>
                    <div className="p-2.5 hover:bg-white/5 rounded-xl text-xs flex justify-between items-center border border-transparent cursor-pointer">
                      <div>
                        <p className="font-bold text-slate-300">Cyberdyne Systems</p>
                        <p className="text-[9px] text-slate-500 mt-0.5">ICP: Robotics/AI buyers</p>
                      </div>
                    </div>
                  </div>

                  {/* Dialer widget */}
                  <div className="p-4 bg-slate-900/60 border border-white/5 rounded-2xl space-y-3 flex flex-col justify-between">
                    <div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">AI Softphone Dialer</p>
                      <div className="bg-slate-950 p-2.5 rounded-xl border border-white/5 text-right font-mono text-xs text-slate-200 h-9 flex items-center justify-end">
                        {agentDialerNum || "Dial Number"}
                      </div>
                    </div>

                    <div className="flex gap-2 justify-center">
                      {callState === "idle" ? (
                        <>
                          <button
                            onClick={() => setAgentDialerNum((prev) => prev + "9")}
                            className="h-8 w-8 rounded-full border border-white/10 hover:bg-white/10 text-xs flex items-center justify-center font-bold"
                          >
                            9
                          </button>
                          <button
                            onClick={() => {
                              setAgentDialerNum("+1 (555) 304-Stark");
                              setCallState("ringing");
                              setTimeout(() => setCallState("connected"), 2000);
                            }}
                            className="px-4 py-2 bg-emerald-600 rounded-xl hover:bg-emerald-500 text-xs font-bold flex items-center gap-1.5"
                          >
                            <Phone className="h-3 w-3" /> Call Stark
                          </button>
                        </>
                      ) : (
                        <div className="flex flex-col items-center gap-2 w-full">
                          <p className="text-[10px] text-yellow-400 font-bold animate-pulse">
                            {callState === "ringing" ? "Ringing Stark..." : `Connected: ${Math.floor(callTimer / 60)}:${(callTimer % 60).toString().padStart(2, "0")}`}
                          </p>
                          <button
                            onClick={() => setCallState("idle")}
                            className="px-4 py-1.5 bg-rose-600 rounded-xl text-xs font-bold"
                          >
                            End Call
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Workload Metric */}
                  <div className="p-4 bg-slate-900/60 border border-white/5 rounded-2xl flex flex-col justify-between">
                    <div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">My Performance</p>
                      <h4 className="text-2xl font-extrabold text-white">92.6%</h4>
                      <p className="text-[10px] text-slate-400 mt-1">Average workflow conversion rate</p>
                    </div>
                    <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden mt-3">
                      <div className="bg-gradient-to-r from-teal-400 to-violet-500 h-full w-[92.6%]" />
                    </div>
                  </div>
                </div>

                {/* Draft generator mockup */}
                <div className="p-4 bg-slate-900/40 border border-white/5 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-slate-200">Outreach Email Drafting Module</h4>
                    <select
                      value={agentTactic}
                      onChange={(e) => setAgentTactic(e.target.value)}
                      className="bg-slate-950 border border-white/10 rounded-xl px-2.5 py-1 text-[10px] text-slate-350"
                    >
                      <option value="Cold Email">Cold Email Hook</option>
                      <option value="LinkedIn Message">LinkedIn Pitch</option>
                    </select>
                  </div>
                  <pre className="font-mono text-[10px] text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-white/5 overflow-x-auto whitespace-pre-wrap leading-relaxed h-[120px]">
                    {agentTactic === "Cold Email"
                      ? `Subject: CRM Hygiene Automation for Stark Industries?\n\nHi Tony,\n\nI noticed Stark Industries is scaling target aerospace acquisitions but experiencing bottleneck delays in CRM logging.\n\nOur specialized AI revenue agents update Salesforce automatically based on your real calling activity, saving 6+ hours weekly...`
                      : `Hi Tony, noticed Stark Industries is scaling target aerospace acquisitions. We help defense leaders automate CRM sync & follow-up sequences. Let's connect!`}
                  </pre>
                </div>
              </motion.div>
            )}

            {/* 3. ADMIN PORTAL */}
            {simPortal === "admin" && (
              <motion.div
                key="admin-sim"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35 }}
                className="space-y-6"
              >
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-900/60 border border-white/5 rounded-2xl flex items-center gap-3">
                    <div className="p-2.5 bg-orange-500/10 rounded-xl text-orange-400">
                      <Shield className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">MFA Status</p>
                      <h4 className="text-base font-bold text-white mt-0.5">Strict Enforced</h4>
                    </div>
                  </div>
                  <div className="p-4 bg-slate-900/60 border border-white/5 rounded-2xl flex items-center gap-3">
                    <div className="p-2.5 bg-teal-500/10 rounded-xl text-teal-400">
                      <Activity className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">API Request Health</p>
                      <h4 className="text-base font-bold text-white mt-0.5">100% Operational</h4>
                    </div>
                  </div>
                  <div className="p-4 bg-slate-900/60 border border-white/5 rounded-2xl flex items-center gap-3">
                    <div className="p-2.5 bg-violet-500/10 rounded-xl text-violet-400">
                      <Users className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Online Agent Count</p>
                      <h4 className="text-base font-bold text-white mt-0.5">14 SDR Agents</h4>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Task Completion visual SVG */}
                  <div className="p-4 bg-slate-900/40 border border-white/5 rounded-2xl space-y-4">
                    <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                      <BarChart2 className="h-4 w-4 text-teal-400" /> Global Task Analytics
                    </h4>
                    <div className="flex items-end justify-between h-[120px] px-4 pt-2">
                      <div className="flex flex-col items-center gap-1.5 w-8">
                        <div className="bg-teal-500/40 border border-teal-400/40 w-full h-[60px] rounded-t-md hover:bg-teal-500 transition-colors" />
                        <span className="text-[9px] text-slate-500">Todo</span>
                      </div>
                      <div className="flex flex-col items-center gap-1.5 w-8">
                        <div className="bg-yellow-500/40 border border-yellow-400/40 w-full h-[90px] rounded-t-md hover:bg-yellow-500 transition-colors animate-pulse" />
                        <span className="text-[9px] text-slate-500">Progress</span>
                      </div>
                      <div className="flex flex-col items-center gap-1.5 w-8">
                        <div className="bg-violet-500/50 border border-violet-400/40 w-full h-[120px] rounded-t-md hover:bg-violet-500 transition-colors" />
                        <span className="text-[9px] text-slate-500">Done</span>
                      </div>
                    </div>
                  </div>

                  {/* Audit Trail stream list */}
                  <div className="p-4 bg-slate-900/40 border border-white/5 rounded-2xl flex flex-col justify-between h-[178px]">
                    <div className="flex justify-between items-center pb-2 border-b border-white/5">
                      <h4 className="text-xs font-bold text-slate-200">Compliance & Access Trail</h4>
                      <span className="text-[9px] border border-white/10 text-orange-400 px-2 py-0.5 rounded font-bold">GDPR Enabled</span>
                    </div>
                    <div className="space-y-2 overflow-y-auto max-h-[110px] text-[10px] mt-2 pr-2">
                      {adminComplianceLogs.map((log, idx) => (
                        <div key={idx} className="p-2 bg-black/40 rounded-lg border border-white/5 text-slate-300 leading-relaxed font-mono truncate">
                          {log}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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

      {/* ─── FAPO SIMULATOR SECTION ────────────────────────────────────────────── */}
      <section id="fapo" className="relative z-10 py-24 px-6 max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="eyebrow-amber">
              <Rocket className="h-3.5 w-3.5" />
              FAPO Engine Simulator
            </span>
            <h2 className="text-4xl font-extrabold text-white">
              Fully Autonomous Prompt Optimization
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Don&apos;t spend hours trying to fine-tune sales templates manually. Our FAPO algorithms run recursive generation, evaluation, and comparison cycles to output outreach copy that converts 15-30% higher.
            </p>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-bold" htmlFor="original-prompt-input">
                  Your Core Outreach Concept
                </label>
                <input
                  id="original-prompt-input"
                  value={originalPrompt}
                  onChange={(e) => setOriginalPrompt(e.target.value)}
                  placeholder="e.g. Write an email selling software..."
                  className="w-full bg-slate-950 border border-white/15 focus:border-violet-500 rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
                />
              </div>

              <button
                onClick={handleFapoOptimize}
                disabled={isOptimizing}
                className="w-full bg-gradient-to-r from-violet-600 via-indigo-500 to-violet-500 hover:from-violet-500 text-white font-bold text-xs py-3.5 px-6 rounded-xl shadow-lg shadow-violet-500/25 transition-all flex items-center justify-center gap-2"
              >
                {isOptimizing ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin text-teal-400" />
                    Optimizing Prompts...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 text-yellow-400" />
                    Simulate FAPO Optimization
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Console / Output Window */}
          <div className="relative rounded-3xl border border-white/10 overflow-hidden bg-slate-950/80 p-5 shadow-2xl min-h-[300px] flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/5">
              <Terminal className="h-4.5 w-4.5 text-violet-400" />
              <span className="text-[10px] font-mono text-slate-500">fapo-execution-stream.log</span>
            </div>

            <div className="flex-1 flex flex-col justify-center">
              {isOptimizing && (
                <div className="space-y-3 font-mono text-[10px] text-teal-400 bg-black/40 p-4 rounded-xl border border-teal-500/10">
                  <p className="animate-pulse">→ Running FAPO iteration cycle...</p>
                  <p className="text-slate-300">{optimizationStep}</p>
                </div>
              )}

              {!isOptimizing && !optimizedResult && (
                <div className="text-center py-12 text-slate-500 space-y-2">
                  <Brain className="h-10 w-10 text-slate-700 mx-auto" />
                  <p className="text-xs">Enter a concept and launch optimization above to start the simulator.</p>
                </div>
              )}

              {!isOptimizing && optimizedResult && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="bg-slate-900 border border-white/5 p-4 rounded-xl space-y-2 max-h-[220px] overflow-y-auto">
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Optimized Sequence</p>
                    <pre className="font-mono text-[10px] text-slate-200 whitespace-pre-wrap leading-relaxed">
                      {optimizedResult}
                    </pre>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-center rounded-xl">
                      <span className="text-[8px] text-slate-500 block uppercase">Win Rate Prob</span>
                      <strong className="text-emerald-400 text-xs font-mono">+28.4%</strong>
                    </div>
                    <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/20 text-center rounded-xl">
                      <span className="text-[8px] text-slate-500 block uppercase">Tokens Saved</span>
                      <strong className="text-cyan-400 text-xs font-mono">-14%</strong>
                    </div>
                    <div className="p-2.5 bg-violet-500/10 border border-violet-500/20 text-center rounded-xl">
                      <span className="text-[8px] text-slate-500 block uppercase">ICP Fit Rating</span>
                      <strong className="text-violet-400 text-xs font-mono">98%</strong>
                    </div>
                  </div>
                </div>
              )}
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
