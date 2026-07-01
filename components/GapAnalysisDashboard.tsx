"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Data ─────────────────────────────────────────────────────────────────────

type Severity = "Critical" | "High" | "Medium" | "Low";
type Domain = "Technical" | "GTM / Sales / Marketing" | "User Experience" | "Compliance & Security";
type Status = "Not Started" | "In Progress" | "Planned";

interface GapItem {
  id: string;
  domain: Domain;
  title: string;
  description: string;
  severity: Severity;
  businessImpact: number; // 1-10
  effort: "Low" | "Medium" | "High";
  status: Status;
  recommendation: string;
}

const GAP_ITEMS: GapItem[] = [
  // ─── Technical ──────────────────────────────────────────────────────────
  {
    id: "T1",
    domain: "Technical",
    title: "Firestore Sharding for Large Datasets",
    description: "Single collection design will hit Firestore write limits (~1 write/sec per document) as lead volume scales beyond 100k/month.",
    severity: "High",
    businessImpact: 8,
    effort: "High",
    status: "Not Started",
    recommendation: "Implement collection-group sharding with sub-collections per userId, and use Firestore bundle caching for read-heavy dashboards.",
  },
  {
    id: "T2",
    domain: "Technical",
    title: "3D LOD Management for Complex Scenes",
    description: "Current PerformanceMonitor only toggles DPR and BakeShadows. Complex scenes (Globe, 5000+ particles) lack Level-of-Detail polygon reduction.",
    severity: "High",
    businessImpact: 7,
    effort: "Medium",
    status: "Planned",
    recommendation: "Implement @react-three/drei <Detailed> LOD with low/mid/high geometry variants per component. Add frustum culling for off-screen nodes.",
  },
  {
    id: "T3",
    domain: "Technical",
    title: "Cross-Browser WebGL Compatibility",
    description: "Three.js shadows and certain GLSL shaders fail on Safari/iOS 15 and older Android WebView. No fallback UI exists.",
    severity: "High",
    businessImpact: 6,
    effort: "Medium",
    status: "Not Started",
    recommendation: "Add WebGL capability detection; render a 2D fallback dashboard for non-WebGL browsers. Test via BrowserStack matrix.",
  },
  {
    id: "T4",
    domain: "Technical",
    title: "End-to-End Encryption for Sensitive Fields",
    description: "PII fields (contactEmail, contactPhone) are stored in Firestore in plaintext. AES/XChaCha20 functions exist in security.ts but are not wired to the data pipeline.",
    severity: "Critical",
    businessImpact: 10,
    effort: "Medium",
    status: "Planned",
    recommendation: "Encrypt PII fields at the API layer before writing to Firestore; decrypt only in server-side analysis routes. Store encryption key in Secret Manager.",
  },
  {
    id: "T5",
    domain: "Technical",
    title: "Firebase Indexes for Query Performance",
    description: "No firestore.indexes.json defined. Composite queries on (userId + createdAt) will cause Firestore to reject or slow-scan without explicit indexes.",
    severity: "Medium",
    businessImpact: 6,
    effort: "Low",
    status: "Not Started",
    recommendation: "Define firestore.indexes.json with composite indexes on leads(userId, createdAt DESC) and all three 3D collections.",
  },
  {
    id: "T6",
    domain: "Technical",
    title: "API Rate Limiting",
    description: "rate-limiter-flexible is a dependency but no middleware applies it to /api/leads/save, /api/analyze, or /api/consent. Unprotected endpoints are vulnerable to DoS.",
    severity: "Critical",
    businessImpact: 9,
    effort: "Low",
    status: "Not Started",
    recommendation: "Wrap all /api routes with a RateLimiterMemory or Redis-backed middleware (max 20 req/min per IP). Return 429 with Retry-After header.",
  },

  // ─── GTM / Sales / Marketing ─────────────────────────────────────────────
  {
    id: "G1",
    domain: "GTM / Sales / Marketing",
    title: "CRM Integration (Salesforce / HubSpot)",
    description: "Lead data submitted through the intake form is isolated in Firestore with no bi-directional sync to external CRM systems.",
    severity: "High",
    businessImpact: 9,
    effort: "High",
    status: "Not Started",
    recommendation: "Build webhook-based CRM sync: on lead creation, POST to CRM API (HubSpot Contacts or Salesforce Leads endpoint). Handle conflict resolution with updatedAt timestamps.",
  },
  {
    id: "G2",
    domain: "GTM / Sales / Marketing",
    title: "Role-Based Access Control for 3D Dashboards",
    description: "All authenticated users see the same 3D views regardless of their role. Sales reps should not see marketing campaign spend; marketing managers shouldn't see individual deal values.",
    severity: "High",
    businessImpact: 7,
    effort: "Medium",
    status: "Not Started",
    recommendation: "Add a `role` field to the Firebase Auth custom claims (admin, sales_rep, marketer, viewer). Gate Firestore queries and UI panels by role.",
  },
  {
    id: "G3",
    domain: "GTM / Sales / Marketing",
    title: "Automated Milestone / Campaign Alerting",
    description: "No automated alerts exist for overdue GTM milestones, deals stalled in a pipeline stage > N days, or marketing campaigns with CTR below threshold.",
    severity: "Medium",
    businessImpact: 8,
    effort: "Medium",
    status: "Not Started",
    recommendation: "Cloud Functions scheduled trigger (daily): query overdue documents and send email/Slack alerts via the existing notifications.ts pipeline.",
  },
  {
    id: "G4",
    domain: "GTM / Sales / Marketing",
    title: "Customizable Reporting & Export",
    description: "No way to export pipeline data, campaign metrics, or GTM progress as PDF/CSV. Users cannot build custom reports.",
    severity: "Medium",
    businessImpact: 7,
    effort: "Medium",
    status: "Not Started",
    recommendation: "Add a /api/reports/export endpoint that queries Firestore, formats as CSV/JSON, and streams the response.",
  },
  {
    id: "G5",
    domain: "GTM / Sales / Marketing",
    title: "Marketing Automation Platform Integration",
    description: "No integration with Mailchimp, Apollo.io, or Instantly.ai despite them being listed as known tools in the intake form options.",
    severity: "Medium",
    businessImpact: 7,
    effort: "High",
    status: "Not Started",
    recommendation: "After consent collection, sync opted-in leads to the user's chosen marketing automation tool via their respective APIs.",
  },

  // ─── User Experience ──────────────────────────────────────────────────────
  {
    id: "U1",
    domain: "User Experience",
    title: "3D Interface Onboarding Tutorial",
    description: "New users land on a 3D scene with no guidance on controls (orbit, click-to-drill-down, hotspot interaction).",
    severity: "High",
    businessImpact: 8,
    effort: "Low",
    status: "Not Started",
    recommendation: "Add a first-visit tooltip tour (using a library like driver.js or a custom Framer Motion overlay) highlighting orbit controls, node clicking, and the metrics panel.",
  },
  {
    id: "U2",
    domain: "User Experience",
    title: "Accessibility: Screen Reader Support for 3D",
    description: "Three.js Canvas is entirely inaccessible to screen readers. No ARIA labels, no keyboard-navigable alternative representation of 3D data.",
    severity: "High",
    businessImpact: 6,
    effort: "High",
    status: "Not Started",
    recommendation: "Render a visually-hidden but screen-reader-accessible HTML table alongside each Canvas that mirrors the same data. Add aria-live regions for real-time update announcements.",
  },
  {
    id: "U3",
    domain: "User Experience",
    title: "Keyboard Navigation in 3D Views",
    description: "OrbitControls only responds to mouse/touch. Keyboard users cannot navigate the 3D space or select nodes.",
    severity: "Medium",
    businessImpact: 5,
    effort: "Medium",
    status: "Not Started",
    recommendation: "Add keyboard event listeners that translate arrow/WASD keys to camera rotation deltas, and Tab/Enter to cycle through and select interactive nodes.",
  },
  {
    id: "U4",
    domain: "User Experience",
    title: "Mobile Responsive 3D Controls",
    description: "OrbitControls works on mobile but touch targets for Html overlays are tiny and panels overflow the viewport on screens < 400px.",
    severity: "Medium",
    businessImpact: 6,
    effort: "Medium",
    status: "Planned",
    recommendation: "Redesign Html overlays to use CSS clamp() widths, increase minimum touch target sizes to 44px², and add a bottom sheet panel pattern for mobile.",
  },
  {
    id: "U5",
    domain: "User Experience",
    title: "A/B Testing Framework for 3D Layouts",
    description: "No framework exists to test alternative 3D layouts, colour schemes, or interaction models to optimise engagement.",
    severity: "Low",
    businessImpact: 5,
    effort: "Medium",
    status: "Not Started",
    recommendation: "Integrate PostHog or GrowthBook feature flags. Wrap layout variants in flag-gated components to run controlled experiments.",
  },
  {
    id: "U6",
    domain: "User Experience",
    title: "User Feedback Collection",
    description: "No mechanism for users to rate the 3D experience, report bugs, or request features from within the app.",
    severity: "Low",
    businessImpact: 4,
    effort: "Low",
    status: "Not Started",
    recommendation: "Add a floating feedback widget (NPS micro-survey + open text) that writes responses to a Firestore feedback collection.",
  },

  // ─── Compliance & Security ────────────────────────────────────────────────
  {
    id: "C1",
    domain: "Compliance & Security",
    title: "GDPR Data Subject Request Workflow",
    description: "Right-to-erasure endpoint exists but there is no self-service portal for data subjects to request access, rectification, or deletion without contacting support.",
    severity: "Critical",
    businessImpact: 9,
    effort: "Medium",
    status: "Planned",
    recommendation: "Build a /account/privacy page where signed-in users can download their data (access), request corrections (rectification), and trigger account deletion (erasure).",
  },
  {
    id: "C2",
    domain: "Compliance & Security",
    title: "CCPA Opt-Out Mechanism",
    description: "No 'Do Not Sell My Personal Information' link or opt-out flow as required by CCPA for California residents.",
    severity: "Critical",
    businessImpact: 8,
    effort: "Low",
    status: "Not Started",
    recommendation: "Add CCPA opt-out flag to user_consent collection. Render a footer link that sets doNotSell: true for the authenticated user, blocking data sharing with third parties.",
  },
  {
    id: "C3",
    domain: "Compliance & Security",
    title: "Audit Log Completeness",
    description: "Audit log is written on lead creation and GDPR erasure, but not on analysis runs, consent changes, failed auth attempts, or 3D data reads.",
    severity: "High",
    businessImpact: 7,
    effort: "Medium",
    status: "Planned",
    recommendation: "Extend audit logging middleware to cover all state-modifying API routes and high-sensitivity read operations. Add a Cloud Function to alert on anomalous audit patterns.",
  },
  {
    id: "C4",
    domain: "Compliance & Security",
    title: "Penetration Testing Gap",
    description: "No documented penetration testing has been conducted on Firebase infrastructure, Next.js API routes, or the 3D frontend.",
    severity: "High",
    businessImpact: 8,
    effort: "High",
    status: "Not Started",
    recommendation: "Commission an external pentest focusing on: Firebase Rules bypass, API injection vectors, XSS in Html overlays, and OWASP Top 10 for Next.js. Run annually.",
  },
  {
    id: "C5",
    domain: "Compliance & Security",
    title: "Firebase App Check",
    description: "Firebase App Check is not configured. Any party with the API key can call Firestore and Storage APIs directly, bypassing application-level rate limiting.",
    severity: "High",
    businessImpact: 8,
    effort: "Low",
    status: "Not Started",
    recommendation: "Enable Firebase App Check with reCAPTCHA Enterprise for web. Register the app in Firebase Console and add the AppCheck provider to firebase-client.ts.",
  },
  {
    id: "C6",
    domain: "Compliance & Security",
    title: "Secret Management",
    description: "API keys (Hugging Face, Pinecone, etc.) are loaded from .env files. No rotation policy, no access audit, no secret versioning.",
    severity: "High",
    businessImpact: 7,
    effort: "Medium",
    status: "Not Started",
    recommendation: "Migrate all secrets to Google Cloud Secret Manager with automatic 90-day rotation. Update service account IAM to grant least-privilege access only.",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SEVERITY_CONFIG: Record<Severity, { color: string; bg: string; border: string; priority: number }> = {
  Critical: { color: "text-red-400",    bg: "bg-red-500/10",    border: "border-red-500/30",    priority: 4 },
  High:     { color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/30", priority: 3 },
  Medium:   { color: "text-amber-400",  bg: "bg-amber-500/10",  border: "border-amber-500/30",  priority: 2 },
  Low:      { color: "text-slate-400",  bg: "bg-slate-500/10",  border: "border-slate-500/30",  priority: 1 },
};

const DOMAIN_CONFIG: Record<Domain, { color: string; icon: string }> = {
  "Technical":                   { color: "text-indigo-400", icon: "⚙️" },
  "GTM / Sales / Marketing":     { color: "text-teal-400",   icon: "📈" },
  "User Experience":             { color: "text-violet-400", icon: "🎯" },
  "Compliance & Security":       { color: "text-red-400",    icon: "🔒" },
};

const ALL_DOMAINS: Domain[] = [
  "Technical",
  "GTM / Sales / Marketing",
  "User Experience",
  "Compliance & Security",
];
const ALL_SEVERITIES: Severity[] = ["Critical", "High", "Medium", "Low"];

// ─── Priority Score = severity × impact ──────────────────────────────────────

function priorityScore(item: GapItem) {
  return SEVERITY_CONFIG[item.severity].priority * item.businessImpact;
}

// ─── Gap Card ─────────────────────────────────────────────────────────────────

function GapCard({ item, index }: { item: GapItem; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const sev = SEVERITY_CONFIG[item.severity];
  const dom = DOMAIN_CONFIG[item.domain];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className={`rounded-xl border ${sev.border} ${sev.bg} overflow-hidden cursor-pointer hover:border-white/20 transition-colors`}
      onClick={() => setExpanded((e) => !e)}
    >
      <div className="flex items-start gap-4 p-4">
        {/* ID badge */}
        <span className="shrink-0 rounded-md border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-xs text-slate-500">
          {item.id}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className={`text-xs font-bold uppercase tracking-wider ${sev.color}`}>
              {item.severity}
            </span>
            <span className="text-slate-600">·</span>
            <span className={`text-xs ${dom.color}`}>
              {dom.icon} {item.domain}
            </span>
            <span className="ml-auto text-[10px] text-slate-500">
              Impact: {item.businessImpact}/10 · Effort: {item.effort}
            </span>
          </div>
          <h3 className="text-sm font-semibold text-white">{item.title}</h3>
          <p className="mt-1 text-xs text-slate-400 leading-relaxed line-clamp-2">
            {item.description}
          </p>
        </div>

        <span className={`shrink-0 text-slate-500 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}>
          ▾
        </span>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/5 px-4 py-3 space-y-3">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">
                  Full Description
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{item.description}</p>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">
                  Recommendation
                </div>
                <p className="text-xs text-teal-300 leading-relaxed">{item.recommendation}</p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                    item.status === "Not Started"
                      ? "border-slate-600 text-slate-400 bg-slate-500/10"
                      : item.status === "In Progress"
                      ? "border-amber-500/30 text-amber-400 bg-amber-500/10"
                      : "border-indigo-500/30 text-indigo-400 bg-indigo-500/10"
                  }`}
                >
                  {item.status}
                </span>
                <span className="text-[10px] text-slate-600">
                  Priority score: {priorityScore(item)}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Severity Impact Matrix ───────────────────────────────────────────────────

function SeverityImpactMatrix({ items }: { items: GapItem[] }) {
  const cells: Record<string, GapItem[]> = {};
  for (const sev of ALL_SEVERITIES) {
    for (let i = 1; i <= 3; i++) {
      const key = `${sev}-${i}`;
      cells[key] = [];
    }
  }
  items.forEach((item) => {
    const impactBucket = item.businessImpact >= 8 ? 3 : item.businessImpact >= 5 ? 2 : 1;
    const key = `${item.severity}-${impactBucket}`;
    if (cells[key]) cells[key].push(item);
  });

  const impactLabels = ["Low Impact (1–4)", "Medium Impact (5–7)", "High Impact (8–10)"];

  return (
    <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/[0.02]">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-white/5">
            <th className="p-3 text-left text-slate-500 font-normal">Severity \ Impact</th>
            {impactLabels.map((l) => (
              <th key={l} className="p-3 text-center text-slate-400 font-semibold">{l}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ALL_SEVERITIES.map((sev) => {
            const cfg = SEVERITY_CONFIG[sev];
            return (
              <tr key={sev} className="border-b border-white/5 last:border-0">
                <td className={`p-3 font-bold ${cfg.color}`}>{sev}</td>
                {[1, 2, 3].map((bucket) => {
                  const key = `${sev}-${bucket}`;
                  const cell = cells[key] ?? [];
                  return (
                    <td key={bucket} className="p-3 text-center">
                      {cell.length > 0 ? (
                        <div className={`inline-flex flex-wrap gap-1 justify-center`}>
                          {cell.map((i) => (
                            <span
                              key={i.id}
                              className={`rounded px-1.5 py-0.5 font-mono text-[10px] ${cfg.bg} ${cfg.color} border ${cfg.border}`}
                              title={i.title}
                            >
                              {i.id}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-700">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export function GapAnalysisDashboard() {
  const [filterDomain, setFilterDomain] = useState<Domain | "All">("All");
  const [filterSeverity, setFilterSeverity] = useState<Severity | "All">("All");
  const [activeTab, setActiveTab] = useState<"list" | "matrix">("list");

  const filtered = GAP_ITEMS
    .filter((i) => filterDomain === "All" || i.domain === filterDomain)
    .filter((i) => filterSeverity === "All" || i.severity === filterSeverity)
    .sort((a, b) => priorityScore(b) - priorityScore(a));

  const counts = ALL_SEVERITIES.reduce((acc, s) => {
    acc[s] = GAP_ITEMS.filter((i) => i.severity === s).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-8">
      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {ALL_SEVERITIES.map((sev) => {
          const cfg = SEVERITY_CONFIG[sev];
          return (
            <button
              key={sev}
              onClick={() => setFilterSeverity(filterSeverity === sev ? "All" : sev)}
              className={`rounded-xl border p-4 text-left transition-all hover:scale-105 ${
                filterSeverity === sev ? `${cfg.border} ${cfg.bg}` : "border-white/10 bg-white/[0.02]"
              }`}
            >
              <div className={`text-2xl font-black ${cfg.color}`}>{counts[sev]}</div>
              <div className="text-xs text-slate-400">{sev} gaps</div>
            </button>
          );
        })}
      </div>

      {/* Tab switcher */}
      <div className="flex items-center gap-2">
        {(["list", "matrix"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-lg px-4 py-2 text-xs font-semibold transition-colors capitalize ${
              activeTab === tab
                ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                : "text-slate-400 hover:text-white border border-transparent"
            }`}
          >
            {tab === "list" ? "📋 Priority List" : "📊 Impact Matrix"}
          </button>
        ))}
      </div>

      {activeTab === "list" ? (
        <>
          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterDomain("All")}
              className={`rounded-full px-3 py-1 text-xs transition-colors ${
                filterDomain === "All"
                  ? "bg-white/10 text-white"
                  : "text-slate-500 hover:text-white"
              }`}
            >
              All Domains
            </button>
            {ALL_DOMAINS.map((d) => (
              <button
                key={d}
                onClick={() => setFilterDomain(filterDomain === d ? "All" : d)}
                className={`rounded-full px-3 py-1 text-xs transition-colors ${
                  filterDomain === d
                    ? `${DOMAIN_CONFIG[d].color} bg-white/10`
                    : "text-slate-500 hover:text-white"
                }`}
              >
                {DOMAIN_CONFIG[d].icon} {d}
              </button>
            ))}
          </div>

          <p className="text-xs text-slate-500">
            Showing {filtered.length} of {GAP_ITEMS.length} gaps · sorted by priority score (severity × impact)
          </p>

          {/* Gap cards */}
          <div className="space-y-3">
            {filtered.map((item, i) => (
              <GapCard key={item.id} item={item} index={i} />
            ))}
          </div>
        </>
      ) : (
        <SeverityImpactMatrix items={GAP_ITEMS} />
      )}
    </div>
  );
}
