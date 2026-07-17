"use client";

import Link from "next/link";
import { Twitter, Linkedin, Github, Mail } from "lucide-react";
import { IconDealflowLogo } from "./gtm/GtmIcons";

export function Footer() {
  const navigation = {
    product: [
      { name: "Solutions", href: "/solutions" },
      { name: "Features", href: "/features" },
      { name: "Pricing", href: "/pricing" },
      { name: "RAG Analysis", href: "/rag" },
    ],
    company: [
      { name: "Book a Demo", href: "/book-demo" },
      { name: "Support", href: "/support" },
      { name: "Docs", href: "/docs" },
    ],
    legal: [
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
      { name: "Security", href: "/security" },
      { name: "Do Not Sell My Info", href: "/account/privacy" },
      { name: "Privacy Preferences", href: "/account/privacy" },
    ],
  };

  const socialLinks = [
    { name: "Email", icon: Mail, href: "mailto:hello@dealsflow.ai" },
  ];

  return (
    <footer className="w-full bg-[#060612]">
      {/* Gradient top divider */}
      <div className="divider-gradient" />
      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* Main grid */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-4">
          {/* Brand column */}
          <div className="lg:col-span-1">
            <Link
              href="/"
              className="flex items-center gap-2 mb-6 group"
              aria-label="DealFlow AI homepage"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500/20 to-violet-500/15 border border-teal-500/20 shadow-[0_0_20px_rgba(20,184,166,0.25)] transition-transform group-hover:scale-110 group-hover:shadow-[0_0_35px_rgba(20,184,166,0.4)] animate-glow-pulse">
                <IconDealflowLogo className="h-6 w-6" aria-hidden />
              </div>
              <span className="font-display text-lg font-semibold tracking-tight text-white">
                DEALFLOW<span className="gradient-text-teal">.AI</span>
              </span>
            </Link>
            <p className="text-sm text-slate-300 leading-relaxed mb-6 max-w-xs">
              The AI Operating System for Revenue Teams. Pipeline intelligence, autonomous agents, and GTM clarity &mdash; unified.
            </p>
            {/* Social links */}
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-teal-500/20 bg-teal-500/10 text-teal-400 hover:text-white hover:bg-teal-500/20 hover:border-teal-500/40 hover:shadow-[0_0_15px_rgba(20,184,166,0.3)] transition-all"
                  aria-label={social.name}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation columns */}
          <div className="grid grid-cols-2 gap-8 lg:col-span-3">
            <div>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
                Product
              </h3>
              <ul className="space-y-3">
                {navigation.product.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-sm text-slate-400 hover:text-teal-300 transition-colors duration-200"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
                Company
              </h3>
              <ul className="space-y-3">
                {navigation.company.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-sm text-slate-400 hover:text-violet-300 transition-colors duration-200"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
                Legal
              </h3>
              <ul className="space-y-3">
                {navigation.legal.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-sm text-slate-400 hover:text-rose-300 transition-colors duration-200"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-400">
            &copy; {new Date().getFullYear()} DealFlow AI, Inc. All rights reserved.
          </p>
          <p className="text-xs text-slate-400 flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[9px] font-bold border border-emerald-500/20">SOC 2 Type II (Audit in Progress)</span>
            Built with ❤️ for revenue teams
          </p>
        </div>
      </div>
    </footer>
  );
}