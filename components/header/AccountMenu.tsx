"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, LogOut, Settings, Shield, UserCheck, Users, LogIn } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export function AccountMenu() {
  const router = useRouter();
  const { user, isLoading, refetchUser } = useCurrentUser();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const firstFocusableRef = useRef<HTMLAnchorElement | HTMLButtonElement>(null);

  // Handle clicks outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          setIsOpen(false);
          triggerRef.current?.focus();
          break;
        case "ArrowDown":
          e.preventDefault();
          const focusableElements =
            dropdownRef.current?.querySelectorAll<
              HTMLAnchorElement | HTMLButtonElement
            >('a, button, [role="menuitem"]');
          if (focusableElements?.length) {
            (focusableElements[0] as HTMLElement).focus();
          }
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Focus first element when menu opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => firstFocusableRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      refetchUser();
      setIsOpen(false);
      router.push("/");
    } catch (e) {
      console.error("Logout failed", e);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const portalLinks = [
    { name: "Admin Portal", href: "/portal/admin/login", icon: Shield, color: "text-orange-400" },
    { name: "Agent Portal", href: "/portal/agent/login", icon: UserCheck, color: "text-teal-400" },
    { name: "Customer Portal", href: "/portal/customer/login", icon: Users, color: "text-violet-400" },
  ];

  return (
    <div ref={dropdownRef} className="relative z-40">
      {/* Account Avatar Trigger */}
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center h-9 w-9 rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all overflow-hidden"
        aria-label="User account menu"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {user ? (
          <div className="flex h-full w-full items-center justify-center bg-teal-500/20 text-teal-300 font-bold text-xs">
            {getInitials(user.name)}
          </div>
        ) : (
          <User className="h-4.5 w-4.5" />
        )}
      </button>

      {/* Account Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-72 rounded-2xl border border-white/10 bg-[#090918]/95 backdrop-blur-2xl shadow-2xl overflow-hidden p-3 space-y-3"
            role="menu"
            aria-orientation="vertical"
          >
            {user ? (
              // Authenticated User Menu
              <>
                <div className="flex items-center gap-3 border-b border-white/5 pb-3 px-1">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/20 text-teal-300 font-bold text-sm">
                    {getInitials(user.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-xs text-white truncate leading-none mb-1">
                      {user.name}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate leading-none">
                      {user.email}
                    </div>
                    <span className="inline-flex mt-1 text-[8px] font-bold uppercase tracking-wider px-1 rounded bg-teal-500/15 text-teal-400">
                      {user.role}
                    </span>
                  </div>
                </div>

                <div className="space-y-0.5">
                  <Link
                    ref={firstFocusableRef}
                    href="/portal"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2.5 p-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                    role="menuitem"
                  >
                    <User className="h-4 w-4 text-slate-400" />
                    <span>Portal Home</span>
                  </Link>
                  <Link
                    href={`/portal/${user.role === "admin" ? "admin" : user.role === "agent" ? "agent" : "customer"}`}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2.5 p-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                    role="menuitem"
                  >
                    <Settings className="h-4 w-4 text-slate-400" />
                    <span>Dashboard Panel</span>
                  </Link>
                </div>

                <div className="border-t border-white/5 pt-2">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 p-2 rounded-xl text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors text-left"
                    role="menuitem"
                  >
                    <LogOut className="h-4 w-4 text-red-400" />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : (
              // Guest Menu with Portal Logins
              <>
                <div className="px-1 py-1 space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-2">
                    Access Portal
                  </div>
                  {portalLinks.map((link, index) => (
                    <Link
                      key={link.href}
                      ref={index === 0 ? firstFocusableRef : undefined}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 p-2.5 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10 text-slate-300 hover:text-white transition-all"
                      role="menuitem"
                    >
                      <div className={`p-1.5 rounded-lg bg-white/5 ${link.color}`}>
                        <link.icon className="h-4 w-4" />
                      </div>
                      <span className="font-semibold text-xs leading-none">{link.name}</span>
                    </Link>
                  ))}
                </div>

                <div className="border-t border-white/5 pt-2">
                  <Link
                    href="/portal/customer/login"
                    onClick={() => setIsOpen(false)}
                    className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs bg-teal-600 hover:bg-teal-500 text-white font-semibold transition-colors"
                    role="menuitem"
                  >
                    <LogIn className="h-4 w-4" />
                    <span>Sign In</span>
                  </Link>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}