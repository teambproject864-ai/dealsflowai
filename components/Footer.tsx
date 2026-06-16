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
    ],
  };

  const socialLinks = [
    { name: "Twitter", icon: Twitter, href: "https://twitter.com/dealflowai" },
    { name: "LinkedIn", icon: Linkedin, href: "https://linkedin.com/company/dealflowai" },
    { name: "GitHub", icon: Github, href: "https://github.com/dealflowai" },
    { name: "Email", icon: Mail, href: "mailto:hello@dealflow.ai" },
  ];

  return (
    <footer className="w-full border-t border-white/10 bg-[#060612]">
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
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 border border-white/10 shadow-[0_0_15px_rgba(20,184,166,0.2)] transition-transform group-hover:scale-110">
                <IconDealflowLogo className="h-6 w-6" aria-hidden />
              </div>
              <span className="font-display text-lg font-semibold tracking-tight text-white">
                DEALFLOW<span className="text-teal-400">.AI</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed mb-6 max-w-xs">
              The AI Operating System for Revenue Teams. Pipeline intelligence, autonomous agents, and GTM clarity — unified.
            </p>
            {/* Social links */}
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all"
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
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">
                Product
              </h3>
              <ul className="space-y-3">
                {navigation.product.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-sm text-slate-400 hover:text-teal-400 transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">
                Company
              </h3>
              <ul className="space-y-3">
                {navigation.company.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-sm text-slate-400 hover:text-teal-400 transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">
                Legal
              </h3>
              <ul className="space-y-3">
                {navigation.legal.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-sm text-slate-400 hover:text-teal-400 transition-colors"
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
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} DealFlow AI, Inc. All rights reserved.
          </p>
          <p className="text-xs text-slate-600">
            SOC 2 Type II Certified · Built with ❤️ for revenue teams
          </p>
        </div>
      </div>
    </footer>
  );
}