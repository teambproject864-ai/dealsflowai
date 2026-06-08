"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect, useCallback } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Calendar, User, Shield, Users, Menu, X, ChevronDown, ChevronRight } from "lucide-react";

import { ExtrudedButton } from "@/components/immersive/ExtrudedButton";
import {
  IconDealflowLogo,
  IconGlobeMarkets,
  IconShieldCompliance,
  IconRevenueAcceleration,
} from "@/components/gtm/GtmIcons";

import { NotificationCenter } from "./header/NotificationCenter";
import { FavoritesDropdown } from "./header/FavoritesDropdown";
import { ThemeLanguageControls } from "./header/ThemeLanguageControls";
import { AccountMenu } from "./header/AccountMenu";
import { MobileCommandDrawer } from "./header/MobileCommandDrawer";
import { HeaderSearch } from "./header/HeaderSearch";

interface NavLink {
  name: string;
  href: string;
  icon?: React.ElementType;
  subOptions?: { name: string; href: string; description?: string }[];
}

function NavDropdown({ 
  link, 
  isOpen, 
  onToggle, 
  pathname, 
  onClose 
}: { 
  link: NavLink; 
  isOpen: boolean; 
  onToggle: () => void; 
  pathname: string; 
  onClose: () => void; 
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
      buttonRef.current?.focus();
    }
  }, [onClose]);

  const isActive = pathname.startsWith(link.href);

  const animationProps = shouldReduceMotion
    ? { initial: false, animate: false, exit: false }
    : {
        initial: { opacity: 0, y: 8, scale: 0.98 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: 8, scale: 0.98 },
        transition: { duration: 0.18, ease: "easeOut" },
      };

  return (
    <div ref={containerRef} className="relative" onKeyDown={handleKeyDown}>
      <button
        ref={buttonRef}
        onClick={onToggle}
        onMouseEnter={() => !isOpen && onToggle()}
        className={`group relative inline-flex items-center gap-1 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
          isActive
            ? "text-teal-400 bg-teal-400/5"
            : "text-slate-400 hover:text-teal-300 hover:bg-white/5"
        } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {link.name}
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-teal-400" : "text-slate-500 group-hover:text-slate-400"
          }`}
          aria-hidden="true"
        />
        {isActive && !isOpen && (
          <motion.div
            layoutId="nav-underline"
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-gradient-to-r from-teal-500 via-teal-400 to-amber-400"
          />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            {...animationProps}
            className="absolute left-0 top-full mt-2 w-80 rounded-2xl border border-white/10 bg-[#060612]/98 backdrop-blur-3xl shadow-2xl shadow-black/30 overflow-hidden z-[100]"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby={`nav-dropdown-${link.name}`}
          >
            <div className="px-3 py-4 space-y-1">
              <Link
                href={link.href}
                onClick={onClose}
                className="flex items-center justify-between px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50"
                role="menuitem"
              >
                <span className="flex items-center gap-2">
                  <span>Overview</span>
                  <span className="text-[9px] text-slate-600 border border-slate-800 bg-slate-900 px-1.5 py-0.5 rounded-full">
                    {link.name}
                  </span>
                </span>
                <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
              </Link>

              <div className="border-t border-white/10 mx-2 my-1" />

              {link.subOptions?.map((option) => (
                <Link
                  key={option.href}
                  href={option.href}
                  onClick={onClose}
                  className="block px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50"
                  role="menuitem"
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-slate-300 group-hover:text-white transition-colors">
                      {option.name}
                    </span>
                    {option.description && (
                      <span className="text-[10px] text-slate-500 group-hover:text-slate-400 mt-1">
                        {option.description}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const navLinks: NavLink[] = [
    {
      name: "Solutions",
      href: "/solutions",
      icon: IconRevenueAcceleration,
      subOptions: [
        { name: "GTM Playbooks", href: "/solutions/gtm", description: "Go-to-market strategy automation" },
        { name: "Sales Acceleration", href: "/solutions/sales", description: "AI-powered sales workflows" },
        { name: "Marketing Optimization", href: "/solutions/marketing", description: "Intelligent marketing automation" },
      ],
    },
    {
      name: "Features",
      href: "/features",
      icon: IconShieldCompliance,
      subOptions: [
        { name: "AI Revenue Agents", href: "/ai-revenue-agents", description: "Autonomous sales agents" },
        { name: "RAG Analysis", href: "/rag", description: "Intelligent document analysis" },
        { name: "Meeting Intelligence", href: "/meeting-agent/live", description: "Real-time meeting insights" },
      ],
    },
    {
      name: "Resources",
      href: "/pricing",
      icon: IconGlobeMarkets,
      subOptions: [
        { name: "Pricing", href: "/pricing", description: "Simple, transparent pricing" },
        { name: "Support", href: "/support", description: "Get help when you need it" },
        { name: "Documentation", href: "/docs/gaps", description: "API and usage docs" },
      ],
    },
  ];

  const portalLinks = [
    {
      name: "Admin Portal",
      href: "/portal/admin/login",
      icon: Shield,
      description: "For system administrators",
      color: "text-orange-400",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500/20",
    },
    {
      name: "Agent Portal",
      href: "/portal/agent/login",
      icon: User,
      description: "For AI Revenue Agents",
      color: "text-teal-400",
      bgColor: "bg-teal-500/10",
      borderColor: "border-teal-500/20",
    },
    {
      name: "Customer Portal",
      href: "/portal/customer/login",
      icon: Users,
      description: "For DealFlow customers",
      color: "text-violet-400",
      bgColor: "bg-violet-500/10",
      borderColor: "border-violet-500/20",
    },
  ];

  const handleGetStarted = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log("Get Started button clicked!");
  };

  const handleBookMeeting = (e: React.MouseEvent) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent("open-voice-call"));
  };

  // Scroll handler for header transformation
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 8);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdowns on path change
  useEffect(() => {
    setOpenDropdown(null);
  }, [pathname]);

  const headerClasses = isScrolled
    ? "sticky top-0 z-50 w-full border-b border-white/10 bg-[#060612]/90 df-glass backdrop-blur-xl"
    : "sticky top-0 z-50 w-full border-b border-white/5 bg-[#060612]/70 df-glass backdrop-blur-lg";

  return (
    <header className={headerClasses}>
      <div
        className={`container mx-auto flex h-full items-center justify-between px-4 sm:px-6 lg:px-8 gap-4 transition-all duration-300 ${
          isScrolled ? "h-14" : "h-16"
        }`}
      >
        {/* Left Side: Logo & Main Navigation Links */}
        <div className="flex items-center gap-6 xl:gap-8 flex-shrink-0">
          <Link
            href="/"
            className="flex items-center gap-2 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50 rounded-xl"
            aria-label="Go to DealFlow.AI homepage"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 backdrop-blur-md border border-white/10 shadow-[0_0_15px_rgba(20,184,166,0.15)] transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_25px_rgba(20,184,166,0.25)]">
              <IconDealflowLogo className="h-6 w-6" aria-hidden />
            </div>
            <span className="font-display text-lg font-semibold tracking-tight text-white hidden sm:inline-block">
              DealFlow<span className="text-teal-400">.AI</span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
            {navLinks.map((link) => {
              if (link.subOptions) {
                return (
                  <NavDropdown
                    key={link.name}
                    link={link}
                    isOpen={openDropdown === link.name}
                    onToggle={() => setOpenDropdown(openDropdown === link.name ? null : link.name)}
                    pathname={pathname}
                    onClose={() => setOpenDropdown(null)}
                  />
                );
              }

              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? "text-teal-400 bg-teal-400/5"
                      : "text-slate-400 hover:text-teal-300 hover:bg-white/5"
                  } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {link.name}
                  {isActive && (
                    <motion.div
                      layoutId="nav-underline"
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-gradient-to-r from-teal-500 via-teal-400 to-amber-400"
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Center: Persistent Search Bar with Autocomplete */}
        <div className="hidden md:flex flex-1 max-w-md justify-center">
          <HeaderSearch />
        </div>

        {/* Right Side: Quick Access Icons, Actions, Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {/* Favorites Star (Tablet & Desktop) */}
          <div className="hidden sm:block">
            <FavoritesDropdown />
          </div>

          {/* Notifications Center (Tablet & Desktop) */}
          <div className="hidden sm:block">
            <NotificationCenter />
          </div>

          {/* Theme & Language (Desktop Only) */}
          <div className="hidden lg:block">
            <ThemeLanguageControls />
          </div>

          {/* Streamlined Account management menu (Tablet & Desktop) */}
          <div className="hidden sm:block">
            <AccountMenu />
          </div>

          {/* Action CTAs (Desktop Only) */}
          <div className="hidden xl:flex items-center gap-2.5 pl-2 border-l border-white/10">
            <ExtrudedButton
              variant="outline"
              className="border-teal-500/30 bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 font-semibold px-4 py-2 h-9 flex items-center gap-2 shadow-[0_0_15px_rgba(20,184,166,0.1)] text-xs rounded-xl"
              onClick={handleBookMeeting}
            >
              <Calendar className="h-4 w-4" />
              Book Meeting
            </ExtrudedButton>

            <ExtrudedButton
              className="bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white font-semibold px-5 py-2 h-9 shadow-lg shadow-teal-600/25 transition-all hover:shadow-teal-500/35 text-xs rounded-xl"
              onClick={handleGetStarted}
            >
              Get Started
            </ExtrudedButton>
          </div>

          {/* Mobile hamburger triggers full command drawer */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className="lg:hidden p-2.5 rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50"
            aria-label="Open main menu"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-drawer"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Slide-out Mobile Command Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <MobileCommandDrawer
            isOpen={isMenuOpen}
            onClose={() => setIsMenuOpen(false)}
            navLinks={navLinks}
            portalLinks={portalLinks}
            handleBookMeeting={handleBookMeeting}
            handleGetStarted={handleGetStarted}
          />
        )}
      </AnimatePresence>
    </header>
  );
}
