"use client";

import React, { useState } from "react";
import { BarChart3, TrendingUp, Shield, Target, Zap } from "lucide-react";
import type { GTMInput, GTMOutput } from "@/lib/gtm-llm/types";
import { GTMInputSchema } from "@/lib/gtm-llm/types";

export default function GTMAnalysisPage() {
  const [input, setInput] = useState<Partial<GTMInput>>({
    product: "",
    industry: "SaaS",
    budget: 100000,
    timelineMonths: 6,
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GTMOutput | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const fullInput: GTMInput = {
        product: input.product || "Product Name",
        industry: input.industry || "SaaS",
        budget: input.budget || 100000,
        timelineMonths: input.timelineMonths || 6,
        marketResearch: {
          marketSize: 1000000,
          marketGrowthRate: 20,
          targetAudience: ["Enterprise", "SMB"],
          marketTrends: ["AI integration", "Remote work"],
          marketChallenges: ["High CAC", "Market saturation"],
        },
        customerSegments: {
          segments: [
            {
              id: "1",
              size: 5000,
              needs: ["Analytics", "Automation"],
              painPoints: ["Manual processes"],
              valuePropositionFit: 85,
            },
          ],
        },
        competitiveLandscape: {
          competitors: [
            {
              name: "Competitor A",
              marketShare: 30,
              strengths: ["Strong brand"],
              weaknesses: ["High price"],
            },
          ],
        },
        salesChannelMetrics: {
          channels: [
            {
              name: "LinkedIn Ads",
              traffic: 10000,
              conversionRate: 5,
              cac: 500,
              ltv: 5000,
            },
          ],
        },
      };

      const response = await fetch("/api/gtm-analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(fullInput),
      });

      const data = await response.json();
      if (data.success) {
        setResult(data.data);
      }
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060612] text-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            GTM Strategy Analysis
          </h1>
          <p className="text-slate-400 text-lg">
            Powered by our specialized Go-To-Market AI
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className="bg-[#070718] border border-white/10 rounded-3xl p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Zap className="text-teal-400" />
              Configure Your Analysis
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-300">
                  Product Name
                </label>
                <input
                  type="text"
                  value={input.product}
                  onChange={(e) => setInput({ ...input, product: e.target.value })}
                  className="w-full bg-[#0A0A18] border border-white/15 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-400 transition-all"
                  placeholder="Enter product name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-300">
                  Industry
                </label>
                <select
                  value={input.industry}
                  onChange={(e) => setInput({ ...input, industry: e.target.value })}
                  className="w-full bg-[#0A0A18] border border-white/15 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-400 transition-all"
                >
                  <option value="SaaS">SaaS</option>
                  <option value="E-commerce">E-commerce</option>
                  <option value="Healthcare">Healthcare Tech</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-300">
                    Budget ($)
                  </label>
                  <input
                    type="number"
                    value={input.budget}
                    onChange={(e) =>
                      setInput({ ...input, budget: Number(e.target.value) })
                    }
                    className="w-full bg-[#0A0A18] border border-white/15 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-400 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-300">
                    Timeline (Months)
                  </label>
                  <input
                    type="number"
                    value={input.timelineMonths}
                    onChange={(e) =>
                      setInput({ ...input, timelineMonths: Number(e.target.value) })
                    }
                    className="w-full bg-[#0A0A18] border border-white/15 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-400 transition-all"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-teal-600 to-cyan-500 hover:from-teal-500 hover:to-cyan-400 text-white font-bold py-4 rounded-xl transition-all duration-300 shadow-lg shadow-teal-600/30 disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Target className="w-5 h-5" />
                )}
                {loading ? "Analyzing..." : "Analyze GTM Strategy"}
              </button>
            </form>
          </div>

          {/* Results Dashboard */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <BarChart3 className="text-violet-400" />
              Analysis Results
            </h2>

            {result ? (
              <div className="space-y-4">
                <div className="bg-[#070718] border border-white/10 rounded-2xl p-5">
                  <h3 className="text-lg font-bold text-teal-300 mb-3">
                    Strategy Recommendations
                  </h3>
                  <p className="text-slate-300">
                    Target Segments: {result.strategyRecommendations.targetSegments.join(", ")}
                  </p>
                </div>

                <div className="bg-[#070718] border border-white/10 rounded-2xl p-5">
                  <h3 className="text-lg font-bold text-violet-300 mb-3">
                    Market Penetration Forecast
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/5 rounded-xl p-3 text-center">
                      <div className="text-2xl font-bold text-white">
                        {result.penetrationForecast.month1}%
                      </div>
                      <div className="text-xs text-slate-400">Month 1</div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3 text-center">
                      <div className="text-2xl font-bold text-white">
                        {result.penetrationForecast.month12}%
                      </div>
                      <div className="text-xs text-slate-400">Month 12</div>
                    </div>
                  </div>
                </div>

                <div className="bg-[#070718] border border-white/10 rounded-2xl p-5">
                  <h3 className="text-lg font-bold text-amber-300 mb-3">
                    CAC Optimization
                  </h3>
                  <ul className="space-y-2">
                    {result.cacOptimization.opportunities.map((opp, i) => (
                      <li
                        key={i}
                        className="text-sm text-slate-300 flex justify-between"
                      >
                        <span>{opp.channel}</span>
                        <span className="text-green-400">
                          -{opp.potentialReductionPercent}%
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-[#070718] border border-white/10 rounded-2xl p-5">
                  <h3 className="text-lg font-bold text-white mb-3">
                    Overall Confidence
                  </h3>
                  <div className="flex items-center gap-3">
                    <div className="h-3 flex-1 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-teal-600 to-cyan-400"
                        style={{ width: `${result.overallConfidence}%` }}
                      ></div>
                    </div>
                    <span className="text-xl font-bold text-teal-300">
                      {result.overallConfidence}%
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[#070718] border border-white/10 rounded-2xl p-8 text-center">
                <Shield className="mx-auto h-16 w-16 text-slate-500 mb-4 opacity-50" />
                <h3 className="text-lg font-semibold text-slate-400 mb-2">
                  No Analysis Yet
                </h3>
                <p className="text-slate-500 text-sm">
                  Fill in the form and run an analysis to see results here
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
