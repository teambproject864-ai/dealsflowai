"use client";

import { useState, useEffect, useRef } from "react";
import { Globe, Sun, Moon, Check } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "ja", label: "日本語" },
];

export function ThemeLanguageControls() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [lang, setLang] = useState("en");
  const [isLangOpen, setIsLangOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Initialize theme and lang from local storage / html attribute
  useEffect(() => {
    const savedTheme = localStorage.getItem("df_theme") as "dark" | "light" | null;
    const initialTheme = savedTheme || "dark";
    setTheme(initialTheme);
    document.documentElement.setAttribute("data-theme", initialTheme);
    if (initialTheme === "light") {
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
    }

    const savedLang = localStorage.getItem("df_lang") || "en";
    setLang(savedLang);
    document.documentElement.setAttribute("data-lang", savedLang);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("df_theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    
    if (newTheme === "light") {
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
    }

    // Trigger theme update custom event for visual canvas / interactive elements
    window.dispatchEvent(new CustomEvent("df-theme-changed", { detail: newTheme }));
  };

  const handleLangSelect = (code: string) => {
    setLang(code);
    localStorage.setItem("df_lang", code);
    document.documentElement.setAttribute("data-lang", code);
    setIsLangOpen(false);
  };

  return (
    <div ref={dropdownRef} className="flex items-center gap-2 z-40">
      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className="p-2 rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all"
        aria-label="Toggle system color theme"
      >
        <AnimatePresence mode="wait">
          {theme === "dark" ? (
            <motion.div
              key="dark"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Moon className="h-4.5 w-4.5 text-teal-400" />
            </motion.div>
          ) : (
            <motion.div
              key="light"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Sun className="h-4.5 w-4.5 text-amber-500" />
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      {/* Language Trigger Button */}
      <div className="relative">
        <button
          onClick={() => setIsLangOpen(!isLangOpen)}
          className={`p-2 rounded-xl border flex items-center gap-1 transition-all ${
            isLangOpen
              ? "border-teal-500/30 bg-teal-500/10 text-teal-300 shadow-[0_0_15px_rgba(20,184,166,0.2)]"
              : "border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 hover:border-white/20"
          }`}
          aria-label="Select locale language"
        >
          <Globe className="h-4.5 w-4.5" />
          <span className="text-[10px] font-bold uppercase font-mono leading-none tracking-tight">
            {lang}
          </span>
        </button>

        {/* Language Selection Dropdown */}
        <AnimatePresence>
          {isLangOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-40 rounded-2xl border border-white/10 bg-[#090918]/95 backdrop-blur-2xl shadow-2xl overflow-hidden p-1 space-y-0.5"
            >
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => handleLangSelect(l.code)}
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-colors hover:bg-white/5 ${
                    lang === l.code ? "text-teal-400 font-bold bg-teal-500/5" : "text-slate-300"
                  }`}
                >
                  <span>{l.label}</span>
                  {lang === l.code && <Check className="h-3.5 w-3.5 text-teal-400" />}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
