"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function Breadcrumbs() {
  const pathname = usePathname();

  // Hide on homepage
  if (pathname === "/") return null;

  // Split paths
  const paths = pathname.split("/").filter((x) => x);
  
  // Build crumb items
  const crumbs = paths.map((path, index) => {
    const href = "/" + paths.slice(0, index + 1).join("/");
    const label = path
      .replace(/-/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize words
    return { href, label };
  });

  // Crumb list starting with Home
  const allCrumbs = [{ href: "/", label: "Home" }, ...crumbs];
  const lastIndex = allCrumbs.length - 1;
  const parentCrumb = allCrumbs[lastIndex - 1] || { href: "/", label: "Home" };

  return (
    <nav 
      aria-label="Breadcrumb" 
      className="w-full border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01] px-4 sm:px-6 lg:px-8 py-2.5"
    >
      <div className="container mx-auto">
        {/* Desktop Breadcrumbs */}
        <ol className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          {allCrumbs.map((crumb, idx) => {
            const isLast = idx === lastIndex;
            return (
              <li key={crumb.href} className="flex items-center gap-1.5">
                {idx > 0 && <span className="text-[10px] text-slate-400 select-none">›</span>}
                {isLast ? (
                  <span 
                    aria-current="page" 
                    className="text-slate-400 dark:text-slate-500 font-medium select-none"
                  >
                    {crumb.label}
                  </span>
                ) : (
                  <Link 
                    href={crumb.href} 
                    className="hover:text-violet-600 dark:hover:text-teal-400 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-violet-500 rounded"
                  >
                    {crumb.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>

        {/* Mobile Breadcrumbs (collapsed to show only immediate parent with a ← back arrow) */}
        <div className="flex sm:hidden items-center">
          <Link 
            href={parentCrumb.href} 
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-teal-400 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-violet-500 rounded"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to {parentCrumb.label}</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
