/**
 * Synthetic seed datasets for GTM, Sales, and Marketing 3D modules.
 *
 * These are used as fallback data when Firestore collections are empty,
 * ensuring the 3D scenes always render a rich, demo-ready view on first load.
 * Once real data exists in Firestore the live onSnapshot listener takes over.
 */

// ─── GTM Launch Roadmap ───────────────────────────────────────────────────────

export interface GtmMilestone {
  id: string;
  title: string;
  status: "completed" | "in-progress" | "upcoming";
  dueDate: string;
  owner: string;
  dependencies: string[]; // ids of blocking milestones
  territory: string;
  completionPct: number;
  position: [number, number, number]; // 3D canvas position
}

export const seedGtmMilestones: GtmMilestone[] = [
  {
    id: "m1",
    title: "ICP Definition",
    status: "completed",
    dueDate: "2026-01-15",
    owner: "Product",
    dependencies: [],
    territory: "North America",
    completionPct: 100,
    position: [-5, 3, 0],
  },
  {
    id: "m2",
    title: "Positioning & Messaging",
    status: "completed",
    dueDate: "2026-02-01",
    owner: "Marketing",
    dependencies: ["m1"],
    territory: "North America",
    completionPct: 100,
    position: [-2, 3, 0],
  },
  {
    id: "m3",
    title: "Sales Enablement Kit",
    status: "in-progress",
    dueDate: "2026-03-01",
    owner: "Sales",
    dependencies: ["m2"],
    territory: "EMEA",
    completionPct: 65,
    position: [1, 3, 0],
  },
  {
    id: "m4",
    title: "Beta Customer Launch",
    status: "in-progress",
    dueDate: "2026-04-01",
    owner: "CS",
    dependencies: ["m3"],
    territory: "APAC",
    completionPct: 40,
    position: [4, 3, 0],
  },
  {
    id: "m5",
    title: "Paid Channel Activation",
    status: "upcoming",
    dueDate: "2026-05-01",
    owner: "Growth",
    dependencies: ["m4"],
    territory: "LATAM",
    completionPct: 0,
    position: [7, 3, 0],
  },
  {
    id: "m6",
    title: "General Availability",
    status: "upcoming",
    dueDate: "2026-07-01",
    owner: "All",
    dependencies: ["m5"],
    territory: "Global",
    completionPct: 0,
    position: [10, 3, 0],
  },
];

// ─── Sales Pipeline ───────────────────────────────────────────────────────────

export interface SalesLead {
  id: string;
  companyName: string;
  contactName: string;
  stage: "prospect" | "qualified" | "proposal" | "negotiation" | "closed-won" | "closed-lost";
  dealValue: number;
  salesRep: string;
  probability: number;
  closingDate: string;
  industry: string;
}

export const seedSalesLeads: SalesLead[] = [
  { id: "l1", companyName: "Apex Dynamics", contactName: "Sara Kim", stage: "prospect", dealValue: 45000, salesRep: "Alex R.", probability: 15, closingDate: "2026-08-30", industry: "SaaS" },
  { id: "l2", companyName: "NovaTech Solutions", contactName: "James Wu", stage: "qualified", dealValue: 120000, salesRep: "Maria L.", probability: 35, closingDate: "2026-07-15", industry: "FinTech" },
  { id: "l3", companyName: "Vertex AI Corp", contactName: "Dana Scott", stage: "proposal", dealValue: 220000, salesRep: "Alex R.", probability: 55, closingDate: "2026-06-20", industry: "Enterprise AI" },
  { id: "l4", companyName: "Luminary Inc.", contactName: "Tom Hayes", stage: "negotiation", dealValue: 88000, salesRep: "Chris T.", probability: 75, closingDate: "2026-06-01", industry: "Marketing Automation" },
  { id: "l5", companyName: "ClearPath Systems", contactName: "Anya Patel", stage: "closed-won", dealValue: 175000, salesRep: "Maria L.", probability: 100, closingDate: "2026-05-10", industry: "Logistics" },
  { id: "l6", companyName: "BluePeak Analytics", contactName: "Raj Mehta", stage: "qualified", dealValue: 62000, salesRep: "Chris T.", probability: 40, closingDate: "2026-07-30", industry: "Analytics" },
  { id: "l7", companyName: "Forge Digital", contactName: "Eva Chen", stage: "proposal", dealValue: 310000, salesRep: "Alex R.", probability: 60, closingDate: "2026-06-25", industry: "Enterprise SaaS" },
  { id: "l8", companyName: "Solaris Ventures", contactName: "Mike Ross", stage: "prospect", dealValue: 28000, salesRep: "Maria L.", probability: 10, closingDate: "2026-09-15", industry: "VC" },
];

export const pipelineStages = ["prospect", "qualified", "proposal", "negotiation", "closed-won"] as const;

// ─── Marketing Campaigns ──────────────────────────────────────────────────────

export interface MarketingCampaign {
  id: string;
  name: string;
  channel: "email" | "linkedin" | "paid" | "organic" | "events";
  region: string;
  lat: number;
  lng: number;
  reach: number;
  clicks: number;
  conversions: number;
  spend: number;
  cpl: number; // cost per lead
  status: "active" | "paused" | "completed";
}

export const seedMarketingCampaigns: MarketingCampaign[] = [
  { id: "c1", name: "NA Email Nurture Q2", channel: "email", region: "North America", lat: 40, lng: -100, reach: 14200, clicks: 2130, conversions: 312, spend: 4800, cpl: 15.4, status: "active" },
  { id: "c2", name: "EMEA LinkedIn Outbound", channel: "linkedin", region: "Europe", lat: 51, lng: 10, reach: 8400, clicks: 960, conversions: 145, spend: 6200, cpl: 42.8, status: "active" },
  { id: "c3", name: "APAC Paid Search", channel: "paid", region: "Asia-Pacific", lat: 25, lng: 115, reach: 22100, clicks: 3870, conversions: 430, spend: 11400, cpl: 26.5, status: "active" },
  { id: "c4", name: "LATAM Organic SEO", channel: "organic", region: "Latin America", lat: -15, lng: -60, reach: 5900, clicks: 710, conversions: 88, spend: 0, cpl: 0, status: "active" },
  { id: "c5", name: "NA SaaStr Conference", channel: "events", region: "North America", lat: 37.7, lng: -122.4, reach: 3200, clicks: 890, conversions: 204, spend: 28000, cpl: 137.3, status: "completed" },
  { id: "c6", name: "UK LinkedIn Retargeting", channel: "linkedin", region: "United Kingdom", lat: 51.5, lng: -0.1, reach: 4100, clicks: 520, conversions: 67, spend: 3900, cpl: 58.2, status: "active" },
  { id: "c7", name: "India Paid Social", channel: "paid", region: "India", lat: 20, lng: 78, reach: 18700, clicks: 2940, conversions: 389, spend: 7200, cpl: 18.5, status: "active" },
  { id: "c8", name: "ANZ Email Campaign", channel: "email", region: "Australia", lat: -27, lng: 133, reach: 3600, clicks: 540, conversions: 71, spend: 1800, cpl: 25.4, status: "paused" },
];
