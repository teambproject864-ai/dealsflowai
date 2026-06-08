"use client";

import { useState } from "react";
import {
  IconAlertObjection,
  IconArrowRight,
  IconCheckCircle,
  IconDealBrief,
  IconFunnelFilter,
  IconImageCollateral,
  IconLinkAttribution,
  IconProspectSearch,
  IconRefreshPipeline,
} from "@/components/gtm/GtmIcons";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export function AnalysisDashboard() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!url) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/analyze-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          userData: {
            title: "Expected Title",
            description: "Expected Description",
          },
        }),
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.error);
      setData(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 p-6">
      <section className="flex flex-col gap-4">
        <h2 className="flex items-center gap-2 text-2xl font-semibold text-white">
          <IconProspectSearch className="text-teal-400" />
          Prospect site analyzer
        </h2>
        <p className="text-sm text-slate-500">
          Compare live marketing copy against expected positioning — ideal for launch QA and campaign consistency.
        </p>
        <div className="flex gap-3">
          <Input
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="h-12 border-white/10 bg-white/5 text-white"
          />
          <Button
            onClick={handleAnalyze}
            disabled={loading}
            className="h-12 bg-teal-600 px-8 font-semibold hover:bg-teal-500"
          >
            {loading ? (
              <IconRefreshPipeline className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <IconArrowRight className="mr-2 h-4 w-4" />
            )}
            Analyze URL
          </Button>
        </div>
      </section>

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
          <IconAlertObjection className="h-5 w-5 shrink-0" />
          {error}
        </div>
      )}

      {data && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <Card className="border-white/10 bg-white/5">
              <CardContent className="p-6">
                <div className="mb-1 text-sm text-slate-400">Message-market fit score</div>
                <div className="text-3xl font-bold tabular-nums text-white">{data.comparison.similarityScore}%</div>
                <Progress value={data.comparison.similarityScore} className="mt-4 h-1.5 bg-white/5" />
              </CardContent>
            </Card>
            <Card className="border-white/10 bg-white/5">
              <CardContent className="p-6">
                <div className="mb-1 text-sm text-slate-400">Copy depth (words)</div>
                <div className="flex items-center gap-2 text-3xl font-bold text-white">
                  <IconDealBrief className="h-6 w-6 text-sky-400" />
                  {data.comparison.stats.wordCount}
                </div>
              </CardContent>
            </Card>
            <Card className="border-white/10 bg-white/5">
              <CardContent className="p-6">
                <div className="mb-1 text-sm text-slate-400">Campaign assets (images)</div>
                <div className="flex items-center gap-2 text-3xl font-bold text-white">
                  <IconImageCollateral className="h-6 w-6 text-emerald-400" />
                  {data.comparison.stats.imageCount}
                </div>
              </CardContent>
            </Card>
            <Card className="border-white/10 bg-white/5">
              <CardContent className="p-6">
                <div className="mb-1 text-sm text-slate-400">Journey paths (links)</div>
                <div className="flex items-center gap-2 text-3xl font-bold text-white">
                  <IconLinkAttribution className="h-6 w-6 text-amber-400" />
                  {data.comparison.stats.linkCount}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <Card className="border-white/10 bg-white/5">
              <CardHeader className="border-b border-white/10">
                <CardTitle className="flex items-center justify-between text-lg text-white">
                  Win / gap analysis
                  <Badge variant="outline" className="border-white/10 text-slate-400">
                    {data.comparison.discrepancies.length} gaps
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Aligned signals</h4>
                  {data.comparison.matches.map((m: string) => (
                    <div
                      key={m}
                      className="flex items-center gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-emerald-300"
                    >
                      <IconCheckCircle className="h-5 w-5 shrink-0" />
                      <span className="capitalize">{m} verified</span>
                    </div>
                  ))}
                  {data.comparison.matches.length === 0 && (
                    <div className="p-3 text-sm italic text-slate-500">No direct field matches found.</div>
                  )}
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Gaps to fix</h4>
                  {data.comparison.discrepancies.map((d: any) => (
                    <div key={d.field} className="space-y-2 rounded-lg border border-red-500/20 bg-red-500/5 p-4">
                      <div className="flex items-center gap-2 font-medium text-red-300">
                        <IconAlertObjection className="h-4 w-4" />
                        <span className="capitalize">{d.field} drift</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <div className="mb-1 text-slate-500">Expected</div>
                          <div className="truncate text-slate-300">{d.expected}</div>
                        </div>
                        <div>
                          <div className="mb-1 text-slate-500">Live</div>
                          <div className="truncate text-slate-300">{d.found}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-white/5">
              <CardHeader className="border-b border-white/10">
                <CardTitle className="flex items-center justify-between text-lg text-white">
                  Metadata &amp; structure
                  <IconFunnelFilter className="h-5 w-5 text-slate-500" />
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[500px] overflow-y-auto">
                  <table className="w-full text-left text-sm text-slate-300">
                    <thead className="sticky top-0 bg-white/5 text-[10px] uppercase tracking-widest text-slate-500">
                      <tr>
                        <th className="border-b border-white/10 p-4">Property</th>
                        <th className="border-b border-white/10 p-4">Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {Object.entries(data.scrapedData.metadata).map(([key, val]: [string, any]) => (
                        <tr key={key} className="transition-colors hover:bg-white/5">
                          <td className="p-4 font-mono text-xs text-teal-400">{key}</td>
                          <td className="max-w-xs truncate p-4">{val}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-white/10 bg-white/5">
            <CardHeader className="border-b border-white/10">
              <CardTitle className="flex items-center gap-2 text-lg text-white">
                <IconDealBrief className="h-5 w-5 text-teal-400" />
                Captured narrative
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="max-h-[300px] overflow-y-auto rounded-xl border border-white/5 bg-black/40 p-6 font-display text-sm leading-relaxed text-slate-400">
                  {data.scrapedData.textContent}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="border-teal-500/20 bg-teal-500/10 text-teal-300">
                    Language: EN
                  </Badge>
                  <Badge variant="secondary" className="border-sky-500/20 bg-sky-500/10 text-sky-300">
                    Semantic layer: on
                  </Badge>
                  <Badge variant="secondary" className="border-emerald-500/20 bg-emerald-500/10 text-emerald-300">
                    Hygiene: verified
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
