import { LeadAnalysisDashboard } from "@/components/LeadAnalysisDashboard";
import { Suspense } from "react";

export default async function AnalysisPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const leadId = typeof sp.leadId === "string" ? sp.leadId : undefined;

  return (
    <div className="container mx-auto py-12">
      <header className="px-6 mb-12 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl mb-4">
          GTM AI{" "}
          <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
            Analysis
          </span>
        </h1>
        <p className="text-xl text-slate-400 max-w-3xl mx-auto">
          We&apos;ve analyzed your company website with our GTM AI model.
          Review your health score, complete GTM plan, and derived insights below.
        </p>
      </header>

      <Suspense fallback={<div className="p-12 text-center text-slate-400">Loading analysis engine...</div>}>
        <LeadAnalysisDashboard leadId={leadId} />
      </Suspense>
    </div>
  );
}
