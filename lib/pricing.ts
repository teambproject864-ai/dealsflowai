// lib/pricing.ts

export interface PricingPlan {
  name: string;
  price: { monthly: number; annual: number } | null; // null represents "Custom" pricing
  description: string;
  features: { text: string; included: boolean }[];
  cta: string;
  popular?: boolean;
  color: string;
  glow: string;
}

export const PLANS: PricingPlan[] = [
  {
    name: "Starter",
    price: { monthly: 499, annual: 399 },
    description: "Perfect for small teams and startups scaling initial pipeline.",
    features: [
      { text: "6-step intelligent intake form", included: true },
      { text: "AI GTM analysis reports", included: true },
      { text: "Basic booking pipeline flow", included: true },
      { text: "Up to 50 active leads/month", included: true },
      { text: "Email support (24h SLA)", included: true },
      { text: "ROI attribution calculator", included: false },
      { text: "Smart email sequence generator", included: false },
      { text: "ALMA adaptive learning models", included: false },
    ],
    cta: "Get Started",
    color: "border-slate-200 dark:border-white/15 hover:border-slate-300 dark:hover:border-white/20 bg-slate-50 dark:bg-slate-900",
    glow: "shadow-slate-200/50 dark:shadow-white/5"
  },
  {
    name: "Growth",
    price: { monthly: 1299, annual: 999 },
    description: "Ideal for growing sales organizations needing automated memory systems.",
    features: [
      { text: "6-step intelligent intake form", included: true },
      { text: "AI GTM analysis reports", included: true },
      { text: "Advanced booking pipeline flow", included: true },
      { text: "Up to 500 active leads/month", included: true },
      { text: "Priority support (4h SLA)", included: true },
      { text: "ROI attribution calculator", included: true },
      { text: "Smart email sequence generator", included: true },
      { text: "ALMA adaptive learning models", included: true },
    ],
    cta: "Start 14-Day Free Trial",
    popular: true,
    color: "border-teal-300 dark:border-teal-500/30 bg-teal-50 dark:bg-slate-900 hover:border-teal-500",
    glow: "shadow-teal-500/10 dark:shadow-teal-500/5"
  },
  {
    name: "Enterprise",
    price: null,
    description: "For large companies requiring custom controls, SOC 2 audit in progress, and SLAs.",
    features: [
      { text: "Everything included in Growth", included: true },
      { text: "Unlimited active lead volume", included: true },
      { text: "Dedicated account strategist", included: true },
      { text: "Custom webhook & CRM integrations", included: true },
      { text: "Compliance Auditing & Log Export (SOC 2 audit in progress)", included: true },
      { text: "99.9% availability SLA guarantee", included: true },
      { text: "On-premise secure deployment option", included: true },
      { text: "Custom system fine-tuning (ALMA)", included: true },
    ],
    cta: "Contact Sales",
    color: "border-violet-300 dark:border-violet-500/30 bg-violet-50 dark:bg-slate-900 hover:border-violet-500",
    glow: "shadow-violet-500/10 dark:shadow-violet-500/5"
  }
];

export const CONVERSION_RATES: Record<string, number> = {
  USD: 1.0,
  EUR: 0.93,
  GBP: 0.79,
  CAD: 1.38,
  INR: 83.5,
};

export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  CAD: "C$",
  INR: "₹",
};
