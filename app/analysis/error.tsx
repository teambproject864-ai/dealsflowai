"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function AnalysisError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[AnalysisPage] Error:", error);
  }, [error]);

  return (
    <div className="container mx-auto py-12">
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
        <div className="h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center">
          <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-slate-200">Analysis Unavailable</h2>
          <p className="text-slate-400 text-sm max-w-md">
            {error.message === "No lead data found."
              ? "No company data was found. Please submit the GTM assessment form first."
              : "Something went wrong loading the analysis. Please try again."}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={reset}
            className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium transition-colors"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
