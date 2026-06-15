"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const saved = localStorage.getItem("df_theme");
    if (saved) {
      setTheme(saved as "light" | "dark");
      applyTheme(saved as "light" | "dark");
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setTheme(prefersDark ? "dark" : "light");
      applyTheme(prefersDark ? "dark" : "light");
    }
  }, []);

  function applyTheme(newTheme: "light" | "dark") {
    if (newTheme === "dark") {
      document.documentElement.classList.remove("light");
      document.documentElement.classList.add("dark");
      document.documentElement.dataset.theme = "dark";
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
      document.documentElement.dataset.theme = "light";
    }
    localStorage.setItem("df_theme", newTheme);
  }

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    applyTheme(nextTheme);
  }

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-[#060612]"
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
    >
      {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}
