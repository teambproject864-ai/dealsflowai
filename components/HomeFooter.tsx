"use client";

import React from "react";
import Link from "next/link";
import { Twitter } from "lucide-react";

const HomeFooter = React.memo(function HomeFooter() {
  return (
    <footer className="border-t border-white/6 bg-[#060612] py-8">
      <div className="mx-auto max-w-7xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-slate-500 text-sm">
          © 2026 DealFlow AI. All rights reserved.
        </p>
        <div className="flex items-center gap-6">
          <Link href="/pricing" className="text-slate-400 text-sm hover:text-white transition-colors">
            Pricing
          </Link>
          <Link href="/support" className="text-slate-400 text-sm hover:text-white transition-colors">
            Support
          </Link>
          <a
            href="https://twitter.com/dealflowai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-white transition-colors"
          >
            <Twitter className="w-4 h-4" />
          </a>
        </div>
      </div>
    </footer>
  );
});

export default HomeFooter;
