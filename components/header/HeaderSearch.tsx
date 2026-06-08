"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, History, Sparkles, FileText, ArrowRight, CornerDownLeft } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { APP_FEATURES, Feature } from "@/lib/features";

interface SearchResult {
  id: string;
  name: string;
  description: string;
  category: string;
  href: string;
  type: "page" | "feature";
}

const STATIC_PAGES = [
  { id: "home", name: "Home", description: "DealFlow.AI Landing & Overview", category: "Navigation", href: "/", type: "page" as const },
  { id: "solutions", name: "Solutions Workspace", description: "Explore autonomous agent playbooks & GTM roadmap tool", category: "Navigation", href: "/solutions", type: "page" as const },
  { id: "features", name: "Capabilities & Tech Stack", description: "Memory OS, MEM Palace, ALMA, & Core Platform Features", category: "Navigation", href: "/features", type: "page" as const },
  { id: "rag", name: "RAG Analysis", description: "Company website scraper and vector database generation", category: "Navigation", href: "/rag", type: "page" as const },
];

export function HeaderSearch() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load recent searches
  useEffect(() => {
    const saved = localStorage.getItem("df_recent_searches");
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        setRecentSearches([]);
      }
    }
  }, []);

  // Keyboard shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Perform filtering
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const lowerQuery = query.toLowerCase();
    
    // Search Static Pages
    const matchedPages: SearchResult[] = STATIC_PAGES.filter(
      p => p.name.toLowerCase().includes(lowerQuery) || p.description.toLowerCase().includes(lowerQuery)
    );

    // Search App Features
    const matchedFeatures: SearchResult[] = APP_FEATURES.filter(
      f => f.name.toLowerCase().includes(lowerQuery) || f.description.toLowerCase().includes(lowerQuery)
    ).map(f => ({
      id: f.id,
      name: f.name,
      description: f.description,
      category: f.category,
      href: `/features#${f.id}`,
      type: "feature" as const
    }));

    setResults([...matchedPages, ...matchedFeatures].slice(0, 8));
    setSelectedIndex(0);
  }, [query]);

  const saveRecentSearch = (searchVal: string) => {
    const cleanVal = searchVal.trim();
    if (!cleanVal) return;
    const updated = [cleanVal, ...recentSearches.filter(s => s !== cleanVal)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("df_recent_searches", JSON.stringify(updated));
  };

  const handleSelect = (item: SearchResult) => {
    saveRecentSearch(item.name);
    setIsOpen(false);
    setQuery("");
    router.push(item.href);
  };

  const handleRecentClick = (searchVal: string) => {
    setQuery(searchVal);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(results.length, 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + results.length) % Math.max(results.length, 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results[selectedIndex]) {
        handleSelect(results[selectedIndex]);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-sm z-50">
      {/* Search Input bar */}
      <div 
        onClick={() => {
          setIsOpen(true);
          setTimeout(() => inputRef.current?.focus(), 100);
        }}
        className="relative flex items-center w-full h-10 px-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer group"
      >
        <Search className="h-4 w-4 text-slate-400 group-hover:text-teal-400 transition-colors mr-2" />
        <span className="text-sm text-slate-400 select-none flex-grow">Search system...</span>
        <kbd className="hidden sm:inline-flex items-center gap-1 h-5 select-none rounded border border-white/20 bg-white/5 px-1.5 font-mono text-[10px] font-medium text-slate-400 opacity-100">
          <span className="text-[12px]">⌘</span>K
        </kbd>
      </div>

      {/* Autocomplete Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-full mt-2 rounded-2xl border border-white/10 bg-[#090918]/95 backdrop-blur-2xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-center border-b border-white/10 px-4 py-3">
              <Search className="h-5 w-5 text-teal-400 mr-2" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type to find pages, features, systems..."
                className="w-full bg-transparent text-white placeholder-slate-500 border-none outline-none focus:ring-0 text-sm"
              />
            </div>

            <div className="max-h-[350px] overflow-y-auto p-2 space-y-4">
              {/* Recent Searches */}
              {!query && recentSearches.length > 0 && (
                <div className="space-y-1">
                  <h4 className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <History className="h-3 w-3" /> Recent Searches
                  </h4>
                  <div className="flex flex-wrap gap-1.5 p-2">
                    {recentSearches.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleRecentClick(s)}
                        className="px-2.5 py-1 text-xs rounded-full border border-white/5 bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* No results */}
              {query && results.length === 0 && (
                <div className="p-4 text-center text-slate-500 text-sm">
                  No matching platform capabilities found.
                </div>
              )}

              {/* Autocomplete List */}
              {results.length > 0 && (
                <div className="space-y-1">
                  <h4 className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Sparkles className="h-3 w-3 text-teal-400" /> Matches
                  </h4>
                  <div className="space-y-1">
                    {results.map((item, idx) => {
                      const isSelected = idx === selectedIndex;
                      return (
                        <div
                          key={item.id}
                          onClick={() => handleSelect(item)}
                          onMouseEnter={() => setSelectedIndex(idx)}
                          className={`flex items-center justify-between p-2.5 rounded-xl transition-all cursor-pointer ${
                            isSelected
                              ? "bg-teal-500/10 border border-teal-500/20 text-white"
                              : "border border-transparent text-slate-300 hover:bg-white/5"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-1.5 rounded-lg ${isSelected ? "bg-teal-500/20 text-teal-300" : "bg-white/5 text-slate-400"}`}>
                              {item.type === "page" ? <FileText className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                            </div>
                            <div>
                              <div className="font-medium text-xs leading-none flex items-center gap-1.5">
                                {item.name}
                                <span className={`text-[9px] px-1 rounded uppercase tracking-wider ${
                                  item.type === "page" ? "bg-blue-500/10 text-blue-300 border border-blue-500/20" : "bg-teal-500/10 text-teal-300 border border-teal-500/20"
                                }`}>
                                  {item.type}
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                                {item.description}
                              </div>
                            </div>
                          </div>
                          {isSelected && (
                            <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono">
                              <CornerDownLeft className="h-3 w-3" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tips when empty */}
              {!query && (
                <div className="p-2 text-center text-[10px] text-slate-500 border-t border-white/5 mt-2 pt-2">
                  Tip: Navigate with <kbd className="px-1 rounded bg-white/5 font-mono">↑</kbd> <kbd className="px-1 rounded bg-white/5 font-mono">↓</kbd> and press <kbd className="px-1 rounded bg-white/5 font-mono">Enter</kbd>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
