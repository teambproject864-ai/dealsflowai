"use client";

import { useMemo, useState, useCallback, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { SPRING_SOFT } from "@/lib/immersive3d/motion";
import { getStored, setStored } from "@/lib/experience/storage";

export interface FacetOption {
  id: string;
  label: string;
  group: string;
}

interface FacetedSearchProps<T> {
  open: boolean;
  onClose: () => void;
  items: T[];
  searchKeys: (keyof T)[];
  facetOptions: FacetOption[];
  getFacetValue: (item: T, facetId: string) => string;
  renderItem: (item: T, index: number) => ReactNode;
}

export function FacetedSearch<T extends Record<string, unknown>>({
  open,
  onClose,
  items,
  searchKeys,
  facetOptions,
  getFacetValue,
  renderItem,
}: FacetedSearchProps<T>) {
  const [query, setQuery] = useState("");
  const [activeFacets, setActiveFacets] = useState<string[]>([]);
  const [logic, setLogic] = useState<"AND" | "OR">("AND");
  const history = getStored<string[]>("search_history", []);

  const filtered = useMemo(() => {
    let list = items;
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter((item) =>
        searchKeys.some((k) => String(item[k] ?? "").toLowerCase().includes(q))
      );
    }
    if (activeFacets.length) {
      list = list.filter((item) => {
        const matches = activeFacets.map((f) =>
          facetOptions.find((o) => o.id === f)
            ? getFacetValue(item, f) === f
            : false
        );
        return logic === "AND" ? matches.every(Boolean) : matches.some(Boolean);
      });
    }
    return list;
  }, [items, query, activeFacets, logic, searchKeys, facetOptions, getFacetValue]);

  const toggleFacet = (id: string) => {
    setActiveFacets((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]));
  };

  const onSearch = useCallback(() => {
    if (!query.trim()) return;
    const next = [query, ...history.filter((h) => h !== query)].slice(0, 8);
    setStored("search_history", next);
  }, [query, history]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50 z-[95]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={SPRING_SOFT}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md z-[96] df-glass border-l border-white/10 flex flex-col"
            role="search"
            aria-label="Faceted search"
          >
            <div className="p-4 border-b border-white/10 flex gap-2">
              <Search className="h-5 w-5 text-cyan-400 shrink-0 mt-2" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onSearch()}
                placeholder="Search…"
                className="flex-1 bg-transparent text-white placeholder:text-slate-500 outline-none"
                aria-label="Search query"
              />
              <button type="button" onClick={onClose} aria-label="Close search">
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>

            <div className="p-4 flex flex-wrap gap-2 items-center">
              <SlidersHorizontal className="h-4 w-4 text-[#C8B8FF]" />
              <button
                type="button"
                onClick={() => setLogic((l) => (l === "AND" ? "OR" : "AND"))}
                className="df-glass text-[10px] px-2 py-1 rounded-full text-cyan-300"
              >
                {logic}
              </button>
              {facetOptions.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => toggleFacet(o.id)}
                  className={`text-xs px-3 py-1 rounded-full border transition-all ${
                    activeFacets.includes(o.id)
                      ? "df-facet-active border-transparent text-white"
                      : "df-glass text-[#C8B8FF] border-white/10"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>

            <p className="px-4 text-xs text-[#8B9BB8] font-mono">
              <FlipCount value={filtered.length} /> results
            </p>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              <AnimatePresence mode="popLayout">
                {filtered.map((item, i) => (
                  <motion.div
                    key={i}
                    layout
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: i * 0.03, ...SPRING_SOFT }}
                  >
                    {renderItem(item, i)}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function FlipCount({ value }: { value: number }) {
  return (
    <motion.span
      key={value}
      initial={{ y: 12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="inline-block text-white font-bold tabular-nums"
    >
      {value}
    </motion.span>
  );
}
