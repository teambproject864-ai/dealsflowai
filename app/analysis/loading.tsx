export default function AnalysisLoading() {
  return (
    <div className="container mx-auto py-12">
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-teal-500/20 border-t-teal-500 animate-spin" />
          <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-transparent border-b-cyan-400/40 animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }} />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold text-slate-200">Loading GTM Analysis</h2>
          <p className="text-slate-400 text-sm">Preparing your revenue intelligence dashboard…</p>
        </div>
      </div>
    </div>
  );
}
