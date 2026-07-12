"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { IntakeForm } from "@/components/IntakeForm";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Shield,
  TrendingUp,
  CheckCircle2,
  ChevronRight,
  Database,
  Cpu,
  Target,
  Sparkles,
} from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { PLANS, CONVERSION_RATES } from "@/lib/pricing";

export default function HomePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isAnnual, setIsAnnual] = useState(true);
  const [currency, setCurrency] = useState<"USD" | "EUR" | "GBP" | "CAD" | "INR">("USD");

  useEffect(() => {
    setMounted(true);
  }, []);

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

  if (!mounted) {
    return <div className="min-h-screen bg-[#090a0f] text-[#f4f3f0]" />;
  }

  return (
    <main className="min-h-screen bg-[#090a0f] text-[#f4f3f0] font-sans selection:bg-[#d4a017] selection:text-[#090a0f]">
      
      {/* Editorial Decorative Top Stripe */}
      <div className="h-1 bg-gradient-to-r from-[#8a704c] via-[#d4a017] to-[#8a704c]" />

      {/* --- HERO SECTION (Asymmetric Editorial Style) --- */}
      <section className="relative max-w-7xl mx-auto px-6 pt-24 pb-20 border-b border-[#24252a]/60">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          <div className="lg:col-span-8 space-y-8 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#8a704c]/40 bg-[#8a704c]/5 text-[#d4a017] text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" />
              Pipeline Orchestration OS
            </div>

            <h1 className="font-display text-5xl sm:text-7xl font-light tracking-tight leading-[1.08] text-white">
              Close more deals.
              <br />
              <span className="font-normal italic text-[#d4a017]">
                Let the agents do it.
              </span>
            </h1>

            <p className="max-w-xl text-[#9f9f93] text-base sm:text-lg leading-relaxed font-light">
              DealFlow AI deploys collaborative agents with persistent memory directly integrated with your CRM. Reclaim 60% of your sales rep's calendar by automating updates, call dialers, and outreach sequences.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/portal"
                onClick={() => trackEvent("cta_landing_portal", { surface: "hero" })}
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#d4a017] hover:bg-[#c29014] text-[#090a0f] font-semibold text-sm rounded-md transition-all duration-300 transform hover:-translate-y-0.5"
              >
                Launch Portals
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#gtm-assessment"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#16181f] hover:bg-[#20232d] border border-[#24252a] text-[#f4f3f0] font-semibold text-sm rounded-md transition-all duration-300"
              >
                Go to Market Assessment
                <Target className="h-4 w-4 text-[#d4a017]" />
              </a>
            </div>
          </div>

          {/* Quick Metrics Editorial Panel */}
          <div className="lg:col-span-4 border border-[#24252a]/80 bg-[#111219]/60 p-8 rounded-lg space-y-6">
            <div className="text-xs uppercase tracking-widest text-[#8a704c] font-semibold border-b border-[#24252a]/60 pb-3">
              Platform Metrics
            </div>
            <div className="space-y-4">
              <div>
                <div className="text-3xl font-display font-light text-white">$12.4M</div>
                <div className="text-xs text-[#9f9f93] mt-1">Pipeline Generated</div>
              </div>
              <div className="border-t border-[#24252a]/40 pt-4">
                <div className="text-3xl font-display font-light text-white">62%</div>
                <div className="text-xs text-[#9f9f93] mt-1">Meeting Prep Saved</div>
              </div>
              <div className="border-t border-[#24252a]/40 pt-4">
                <div className="text-3xl font-display font-light text-white">14.8x</div>
                <div className="text-xs text-[#9f9f93] mt-1">Average ROI</div>
              </div>
            </div>
            <div className="text-[10px] text-[#8a704c] font-light leading-relaxed">
              * SOC-2 Type II audit completed successfully.
            </div>
          </div>

        </div>
      </section>

      {/* --- GTM ASSESSMENT INTAKE FORM (Refined Editorial Frame) --- */}
      <section id="gtm-assessment" className="max-w-6xl mx-auto px-6 py-20 border-b border-[#24252a]/60">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          <div className="lg:col-span-4 space-y-4 text-left">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#d4a017] uppercase tracking-wider">
              <Target className="h-3.5 w-3.5" /> GTM Assessment
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-light text-white leading-tight">
              Assess your Go-to-Market potential.
            </h2>
            <p className="text-[#9f9f93] text-sm leading-relaxed font-light">
              Complete the questionnaire to configure the AI model and generate tailored, real-time go-to-market pipelines.
            </p>
          </div>

          <div className="lg:col-span-8 bg-[#111219]/40 border border-[#24252a] rounded-lg p-6 shadow-xl">
            <IntakeForm />
          </div>

        </div>
      </section>

      {/* --- ENTERPRISE VALUE SECTION (Enhanced) --- */}
      <section className="max-w-7xl mx-auto px-6 py-24 border-b border-[#24252a]/60">
        <div className="mb-16">
          <div className="text-xs uppercase tracking-widest text-[#8a704c] font-semibold mb-3">
            Enterprise Value
          </div>
          <h2 className="font-display text-4xl font-light text-white leading-tight">
            Why revenue teams choose DealFlow AI.
          </h2>
          <p className="text-[#9f9f93] text-sm mt-4 max-w-2xl font-light">
            From accelerating pipeline velocity to ensuring compliance, DealFlow AI delivers measurable business value across every stage of the revenue cycle.
          </p>
        </div>

        {/* Value Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            {
              icon: Database,
              title: "Eliminate CRM Drudgery",
              description: "Automatically transcribe calls, update logs, and sync deal data between systems.",
              metric: "-6 hours/rep/week",
              tags: ["Salesforce", "HubSpot"],
            },
            {
              icon: TrendingUp,
              title: "Rescue Stalled Deals",
              description: "Proactive alerts trigger outreach when opportunities stall or response latency spikes.",
              metric: "+24% show rate",
              tags: ["Outreach", "Sequencing"],
            },
            {
              icon: Cpu,
              title: "Agent Fleet Orchestration",
              description: "Collaborative agents handle outreach, booking, and pre-meeting prep at scale.",
              metric: "+22% win rate",
              tags: ["AI Agents", "Automation"],
            },
            {
              icon: Target,
              title: "GTM Strategy Acceleration",
              description: "AI-powered assessments generate tailored launch strategies in minutes, not weeks.",
              metric: "-95% strategy time",
              tags: ["GTM", "Strategy"],
            },
          ].map((pillar, index) => (
            <div
              key={index}
              className="border border-[#24252a]/80 bg-[#111219]/30 rounded-lg p-6 flex flex-col space-y-6 min-h-[280px] hover:border-[#8a704c]/40 transition-all duration-300"
            >
              <div className="inline-flex items-center justify-center w-10 h-10 bg-[#8a704c]/10 text-[#d4a017] rounded-md border border-[#8a704c]/20">
                <pillar.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-xl font-light text-white mb-2">
                  {pillar.title}
                </h3>
                <p className="text-sm text-[#9f9f93] leading-relaxed font-light">
                  {pillar.description}
                </p>
              </div>
              <div className="mt-auto">
                <div className="text-lg font-display text-[#d4a017] font-light mb-3">
                  {pillar.metric}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {pillar.tags.map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className="text-[10px] uppercase font-semibold text-[#8a704c] bg-[#8a704c]/10 px-2.5 py-0.5 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Enterprise Value Metrics Table */}
        <div className="border border-[#24252a]/80 bg-[#111219]/20 rounded-lg overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-[#24252a]/80">
                <tr className="bg-[#111219]/50">
                  <th className="px-6 py-4 text-xs uppercase tracking-wider text-[#8a704c] font-semibold">
                    Metric
                  </th>
                  <th className="px-6 py-4 text-xs uppercase tracking-wider text-[#8a704c] font-semibold">
                    Manual
                  </th>
                  <th className="px-6 py-4 text-xs uppercase tracking-wider text-[#8a704c] font-semibold">
                    DealFlow AI
                  </th>
                  <th className="px-6 py-4 text-xs uppercase tracking-wider text-[#8a704c] font-semibold">
                    Impact
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#24252a]/60">
                {[
                  {
                    metric: "Lead-to-Strategy Latency",
                    manual: "30-45 minutes",
                    dealflow: "< 60 seconds",
                    impact: "97.8% reduction",
                  },
                  {
                    metric: "Demo Show Rate",
                    manual: "60-65%",
                    dealflow: "85-90%",
                    impact: "+24 percentage points",
                  },
                  {
                    metric: "Cost per Qualified Lead",
                    manual: "~$120",
                    dealflow: "~$5",
                    impact: "95.8% reduction",
                  },
                  {
                    metric: "GTM Strategy Time",
                    manual: "2-3 weeks",
                    dealflow: "15 minutes",
                    impact: "95% reduction",
                  },
                  {
                    metric: "Regulatory Violations",
                    manual: "Variable risk",
                    dealflow: "0 (guaranteed)",
                    impact: "Full compliance",
                  },
                ].map((row, index) => (
                  <tr key={index} className="hover:bg-[#111219]/40 transition-colors">
                    <td className="px-6 py-4 text-sm font-light text-white">
                      {row.metric}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#9f9f93] font-light">
                      {row.manual}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#d4a017] font-light">
                      {row.dealflow}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#8a704c] font-semibold">
                      {row.impact}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Compliance Banner */}
        <div className="border border-[#24252a]/80 bg-[#111219]/30 p-6 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-[#d4a017]" />
            <div>
              <h4 className="text-sm font-semibold text-white">GDPR & Compliance Firewall</h4>
              <p className="text-xs text-[#9f9f93] font-light mt-0.5">Every document access is audited, and client data flows are isolated and SOC-2 compliant.</p>
            </div>
          </div>
          <div className="flex gap-2">
            <span className="text-[9px] uppercase tracking-wider border border-[#24252a] px-2.5 py-1 rounded text-[#9f9f93] bg-[#090a0f]">SOC 2 Type II</span>
            <span className="text-[9px] uppercase tracking-wider border border-[#24252a] px-2.5 py-1 rounded text-[#9f9f93] bg-[#090a0f]">GDPR Compliant</span>
            <span className="text-[9px] uppercase tracking-wider border border-[#24252a] px-2.5 py-1 rounded text-[#9f9f93] bg-[#090a0f]">TCPA Ready</span>
          </div>
        </div>
      </section>

      {/* --- PRICING SECTION (Elegant Grid) --- */}
      <section id="pricing" className="max-w-7xl mx-auto px-6 py-24 border-b border-[#24252a]/60">
        <div className="text-center mb-16 space-y-4">
          <span className="text-xs uppercase tracking-widest text-[#8a704c] font-semibold">Pricing Structure</span>
          <h2 className="font-display text-4xl font-light text-white">Simple, transparent pricing</h2>
          <p className="text-[#9f9f93] text-sm font-light">Start free for 14 days. Cancel anytime.</p>

          {/* Pricing Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
            <div className="flex items-center gap-3">
              <span className={`text-xs ${!isAnnual ? "text-[#d4a017] font-semibold" : "text-[#9f9f93]"}`}>Monthly</span>
              <button
                onClick={() => setIsAnnual(!isAnnual)}
                className="relative w-11 h-6 bg-[#16181f] border border-[#24252a] rounded-full transition-colors flex items-center p-0.5 cursor-pointer"
                aria-label="Toggle annual pricing"
              >
                <div
                  className={`w-4 h-4 bg-[#d4a017] rounded-full transition-transform duration-300 ${
                    isAnnual ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
              <span className={`text-xs ${isAnnual ? "text-[#d4a017] font-semibold" : "text-[#9f9f93]"} flex items-center gap-1`}>
                Annually
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[9px] font-bold">
                  Save 20%
                </span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-[#9f9f93]">Currency:</span>
              <div className="flex bg-[#16181f] border border-[#24252a] rounded-full p-0.5">
                {(["USD", "EUR", "GBP", "CAD", "INR"] as const).map((curr) => (
                  <button
                    key={curr}
                    onClick={() => setCurrency(curr)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all duration-200 ${
                      currency === curr
                        ? "bg-[#d4a017] text-[#090a0f]"
                        : "text-[#9f9f93] hover:text-[#f4f3f0]"
                    }`}
                  >
                    {curr}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto items-stretch">
          {PLANS.map((plan) => {
            const isPopular = plan.popular;
            const isEnterprise = plan.price === null;
            const priceVal = isEnterprise
              ? "Custom"
              : formatCurrency(isAnnual ? plan.price!.annual : plan.price!.monthly, currency);

            return (
              <div
                key={plan.name}
                className={`relative p-8 rounded-lg border flex flex-col justify-between transition-all duration-300 ${
                  isPopular
                    ? "border-[#d4a017] bg-[#111219]/60 shadow-lg shadow-[#d4a017]/5"
                    : "border-[#24252a] bg-[#111219]/25 hover:border-[#383a45]"
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 rounded-full bg-[#d4a017] text-[#090a0f] text-[9px] font-bold uppercase tracking-wider">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="space-y-6">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-[#8a704c] mb-1">
                      {plan.name}
                    </div>
                    <div className="text-3xl font-display font-light text-white">
                      {priceVal}{!isEnterprise && "/mo"}
                    </div>
                    <div className="text-[9px] text-[#9f9f93] mt-1">
                      {isEnterprise ? "Custom parameters" : isAnnual ? "Billed annually" : "Billed monthly"}
                    </div>
                  </div>

                  <p className="text-[#9f9f93] text-xs leading-relaxed min-h-[36px] font-light">
                    {plan.description}
                  </p>

                  <div className="border-t border-[#24252a] my-4" />

                  <ul className="space-y-3">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <CheckCircle2 className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isPopular ? "text-[#d4a017]" : "text-[#8a704c]"}`} />
                        <span className={`text-xs font-light ${f.included ? "text-slate-300" : "text-slate-600 line-through"}`}>
                          {f.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 space-y-3">
                  <Link
                    href={isEnterprise ? "/book-demo" : "/portal/customer/login?signup=true"}
                    className={`w-full h-11 flex items-center justify-center rounded font-semibold text-xs transition-all ${
                      isPopular
                        ? "bg-[#d4a017] hover:bg-[#c29014] text-[#090a0f]"
                        : "border border-[#24252a] bg-[#16181f] hover:bg-[#20232d] text-white"
                    }`}
                  >
                    {plan.cta}
                  </Link>
                  <span className="text-[9px] text-[#9f9f93] text-center block font-light">
                    No credit card required · Cancel anytime
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* --- FINAL CALL-TO-ACTION (Editorial Style) --- */}
      <section className="max-w-4xl mx-auto px-6 py-28 text-center space-y-8">
        <span className="text-xs uppercase tracking-widest text-[#8a704c] font-semibold">Start Automating</span>
        <h2 className="font-display text-4xl sm:text-5xl font-light text-white leading-tight">
          Ready to accelerate GTM operations
          <br />
          <span className="italic text-[#d4a017]">at autonomous speeds?</span>
        </h2>
        <p className="text-[#9f9f93] text-sm max-w-xl mx-auto leading-relaxed font-light">
          Onboard in under 2 minutes. Sync your SDR campaigns, dialers, and CRM pipelines with a dedicated fleet of revenue agents today.
        </p>

        <div className="flex flex-wrap justify-center gap-4 pt-2">
          <Link
            href="/portal/customer/login?signup=true"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#d4a017] hover:bg-[#c29014] text-[#090a0f] font-semibold text-sm rounded transition-all duration-300 transform hover:-translate-y-0.5"
          >
            Get Started Free
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/book-demo"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#16181f] hover:bg-[#20232d] border border-[#24252a] text-white font-semibold text-sm rounded transition-all"
          >
            Talk with Sales
          </Link>
        </div>
      </section>

    </main>
  );
}
