"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { intakeSchema, type IntakeFormData } from "@/lib/types";
import { saveLeadContext } from "@/lib/lead-context";
import { saveLeadOffline } from "@/lib/offlineStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Upload, File, X } from "lucide-react";
import { IconArrowLeft, IconArrowRight } from "@/components/gtm/GtmIcons";
import { useFirebaseAuth } from "@/lib/firebase-auth";

const countries = [
  "United States", "Canada", "United Kingdom", "Germany", "France",
  "Australia", "India", "Singapore", "Japan", "Netherlands", "Other"
];

const customerTestimonialOptions = ["Yes", "No", "In Progress"];

const certificationOptions = [
  "ISO 27001", "ISO 9001", "SOC 2", "GDPR", "HIPAA",
  "PCI DSS", "CSA STAR", "FedRAMP", "Cyber Essentials", "Other", "None"
];

const channelOptions = [
  "LinkedIn", "YouTube", "X (Twitter)", "Facebook", "Instagram",
  "TikTok", "Reddit", "Industry Communities", "Blogs", "Podcasts",
  "Webinars", "Other"
];

const contentTypeOptions = [
  "Thought Leadership", "Educational Content", "Product Updates",
  "Industry Insights", "Customer Success Stories", "Research Reports",
  "Videos", "Webinars", "Podcasts", "Other"
];

const publishingFrequencyOptions = [
  "Daily", "Multiple Times Per Week", "Weekly", "Bi-Weekly",
  "Monthly", "Occasionally", "Rarely"
];

const riskReductionOptions = [
  "Performance-Based Pricing", "Milestone-Based Billing", "Free Trial",
  "Pilot Program", "Satisfaction Guarantee", "Money-Back Guarantee",
  "Flexible Contract Terms", "None", "Other"
];

const timeToValueOptions = [
  "Immediate", "Within Days", "Within Weeks",
  "Within 1–3 Months", "More Than 3 Months"
];

const ctaOptions = [
  "Book a Meeting", "Request a Demo", "Schedule a Consultation",
  "Start a Free Trial", "Request Pricing", "Download a Resource",
  "Join a Webinar", "Contact Sales", "Other"
];

const outreachAssetOptions = [
  "Case Study", "One-Pager", "Product Overview", "Video Walkthrough",
  "Research Report", "Whitepaper", "ROI Calculator", "Benchmark Report",
  "Webinar Recording", "Other"
];

const targetIndustryOptions = [
  "SaaS", "E-commerce", "Healthcare", "Finance", "Real Estate",
  "Education", "Professional Services", "Manufacturing", "Retail",
  "Logistics", "Cyber Security", "AI/ML", "Other"
];

const targetCompanySizeOptions = [
  "Solopreneur", "Small Business (1–50 Employees)", "Medium Business (51–250 Employees)",
  "Mid-Market (251–1,000 Employees)", "Enterprise (1,001–10,000 Employees)",
  "Large Enterprise (10,000+ Employees)"
];

const targetRevenueOptions = [
  "Under $1M", "$1M–$10M", "$10M–$50M", "$50M–$250M", "$250M–$1B", "$1B+"
];

const targetGeographicOptions = [
  "North America", "Europe", "Asia Pacific", "Latin America", "Middle East & Africa"
];

const preferredLanguageOptions = [
  "English", "Spanish", "French", "German", "Mandarin", "Japanese", "Portuguese", "Other"
];

const buyingRoleOptions = [
  "Founder", "CEO", "COO", "CTO", "CIO", "CISO", "VP", "Director",
  "Manager", "Procurement", "Finance", "Operations", "HR", "Marketing",
  "Sales", "Product", "IT", "Other"
];

const budgetDepartmentOptions = [
  "Finance", "IT", "Operations", "Marketing", "Sales", "Product",
  "Engineering", "HR", "Procurement", "Other"
];

const targetSeniorityOptions = [
  "C-Level", "VP", "Director", "Head", "Manager", "Individual Contributor"
];

const buyingSignalOptions = [
  "Funding Announcements", "Leadership Changes", "Hiring Growth",
  "Market Expansion", "New Product Launches", "Technology Adoption",
  "Regulatory Changes", "Mergers & Acquisitions", "Cost Reduction Initiatives",
  "Digital Transformation Projects", "Other"
];

const crmSystemOptions = [
  "Salesforce", "HubSpot", "Microsoft Dynamics", "Zoho CRM",
  "Pipedrive", "Freshsales", "Other"
];

const outreachToolOptions = [
  "Apollo", "Clay", "Outreach", "Salesloft", "Lemlist",
  "Instantly", "Reply.io", "Smartlead", "Other"
];

const marketingAutomationOptions = [
  "HubSpot", "Marketo", "Pardot", "ActiveCampaign", "Mailchimp", "Klaviyo", "Other", "None"
];

const empty: IntakeFormData = {
  // Step 1: Contact Information
  name: "",
  emailPersonal: "",
  emailAdditional: "",
  jobTitle: "",
  companyName: "",
  websiteUrl: "",
  website: "",
  linkedinPage: "",
  headquartersCountry: "United States",
  headquartersCity: "",

  // Step 2: Company & Offer Overview
  companyDescription: "",
  productsServices: "",
  primaryOutcome: "",
  keyChallenges: "",
  uniqueValueProp: "",

  // Step 3: Social Proof & Credibility
  successStories: "",
  uploadedDocuments: [],
  customerTestimonials: "No",
  credibilityFactors: "",
  certifications: [],
  certificationsOther: "",

  // Step 4: Brand Presence & Market Positioning
  brandChannels: [],
  brandChannelsOther: "",
  contentTypes: [],
  contentTypesOther: "",
  publishingFrequency: "Weekly",

  // Step 5: Offer Structure & Sales Motion
  riskReductions: [],
  riskReductionsOther: "",
  timeToValue: "Within Weeks",
  primaryCta: "Book a Meeting",
  primaryCtaOther: "",
  outreachAssets: [],
  outreachAssetsOther: "",

  // Step 6: Ideal Customer Profile (ICP)
  icpDescription: "",
  targetIndustries: [],
  targetIndustriesOther: "",
  targetCompanySizes: [],
  targetRevenues: [],
  targetGeographics: [],
  preferredLanguages: [],

  // Step 7: Decision Makers & Buying Committee
  buyingRoles: [],
  buyingRolesOther: "",
  budgetDepartments: [],
  targetSeniorities: [],

  // Step 8: Buying Signals & Market Intelligence
  buyingSignals: [],
  buyingSignalsOther: "",
  prospectTechnologies: "",

  // Step 9: Sales & Marketing Technology Stack
  crmSystems: [],
  crmSystemsOther: "",
  outreachTools: [],
  outreachToolsOther: "",
  marketingAutomationTools: [],
  marketingAutomationToolsOther: "",

  // Step 10: Messaging & Campaign Strategy
  commonObjections: "",
  overcomeObjections: "",
  messagingThemes: "",
  doNotTarget: "",
  additionalNotes: "",
};

const stepTitles = [
  "Contact Information",
  "Company & Offer Overview",
  "Social Proof & Credibility",
  "Brand Presence & Positioning",
  "Offer Structure & Sales Motion",
  "Ideal Customer Profile (ICP)",
  "Decision Makers & Buying Committee",
  "Buying Signals & Intelligence",
  "Sales & Marketing Tech Stack",
  "Messaging & Campaign Strategy",
];

export function IntakeForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(0);
  const [data, setData] = useState<IntakeFormData>(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  function toggleArrayItem(key: keyof IntakeFormData, item: string) {
    setData((prev) => {
      const currentArray = (prev[key] as string[]) || [];
      return {
        ...prev,
        [key]: currentArray.includes(item)
          ? currentArray.filter((i) => i !== item)
          : [...currentArray, item],
      };
    });
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files).map((f) => f.name);
      setData((prev) => ({
        ...prev,
        uploadedDocuments: [...(prev.uploadedDocuments || []), ...filesArray],
      }));
    }
  }

  function removeUploadedDocument(index: number) {
    setData((prev) => ({
      ...prev,
      uploadedDocuments: (prev.uploadedDocuments || []).filter((_, i) => i !== index),
    }));
  }

  function validateStep(): boolean {
    const e: Record<string, string> = {};

    if (step === 0) {
      if (!data.name.trim()) e.name = "Full name is required";
      if (!data.emailPersonal.trim()) e.emailPersonal = "Business email address is required";
      if (!data.jobTitle.trim()) e.jobTitle = "Job title is required";
      if (!data.companyName.trim()) e.companyName = "Company name is required";
      if (!data.websiteUrl.trim()) e.websiteUrl = "Company website URL is required";
      if (!data.headquartersCountry.trim()) e.headquartersCountry = "Headquarters country is required";
      if (!data.headquartersCity.trim()) e.headquartersCity = "Headquarters city is required";
    }
    if (step === 1) {
      if (!data.companyDescription.trim()) e.companyDescription = "Required";
      if (!data.productsServices.trim()) e.productsServices = "Required";
      if (!data.primaryOutcome.trim()) e.primaryOutcome = "Required";
      if (!data.keyChallenges.trim()) e.keyChallenges = "Required";
      if (!data.uniqueValueProp.trim()) e.uniqueValueProp = "Required";
    }
    if (step === 2) {
      if (!data.successStories.trim()) e.successStories = "Required";
      if (!data.customerTestimonials) e.customerTestimonials = "Required";
      if (!data.credibilityFactors.trim()) e.credibilityFactors = "Required";
    }
    if (step === 3) {
      if (!data.publishingFrequency) e.publishingFrequency = "Required";
    }
    if (step === 4) {
      if (!data.timeToValue) e.timeToValue = "Required";
      if (!data.primaryCta) e.primaryCta = "Required";
    }
    if (step === 5) {
      if (!data.icpDescription.trim()) e.icpDescription = "Required";
      if (data.targetIndustries.length === 0) e.targetIndustries = "Select at least one industry";
      if (data.targetCompanySizes.length === 0) e.targetCompanySizes = "Select at least one company size";
      if (data.targetRevenues.length === 0) e.targetRevenues = "Select at least one revenue range";
      if (data.targetGeographics.length === 0) e.targetGeographics = "Select at least one geographic market";
      if (data.preferredLanguages.length === 0) e.preferredLanguages = "Select at least one language";
    }
    if (step === 6) {
      if (data.buyingRoles.length === 0) e.buyingRoles = "Select at least one role";
      if (data.budgetDepartments.length === 0) e.budgetDepartments = "Select at least one department";
      if (data.targetSeniorities.length === 0) e.targetSeniorities = "Select at least one seniority level";
    }
    if (step === 7) {
      if (data.buyingSignals.length === 0) e.buyingSignals = "Select at least one buying signal";
      if (!data.prospectTechnologies.trim()) e.prospectTechnologies = "Required";
    }
    if (step === 9) {
      if (!data.commonObjections.trim()) e.commonObjections = "Required";
      if (!data.overcomeObjections.trim()) e.overcomeObjections = "Required";
      if (!data.messagingThemes.trim()) e.messagingThemes = "Required";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validateStep()) return;

    // Map website to websiteUrl for backward compatibility
    const submissionData = {
      ...data,
      website: data.websiteUrl,
      // For old components:
      brandTrust: data.credibilityFactors,
      contentAndPosting: `Frequency: ${data.publishingFrequency}. Content types: ${data.contentTypes?.join(", ") || "None"}`,
      offerPromise: data.primaryOutcome,
      painPoint: data.keyChallenges,
      timeToGetStarted: data.timeToValue,
      irresistibleOffer: data.uniqueValueProp,
      targetCompanySize: data.targetCompanySizes[0] || "SMB",
      targetRegions: data.targetGeographics,
      targetDecisionMakers: `Roles: ${data.buyingRoles?.join(", ") || ""}. Seniority: ${data.targetSeniorities?.join(", ") || ""}`,
      keyBuyingTriggers: data.buyingSignals,
      currentOutreachTools: data.outreachTools || [],
      primaryCampaignCta: data.primaryCta,
      assetsAvailable: data.outreachAssets || [],
      coldEmailSequence: data.messagingThemes,
      giftCardOffer: "Maybe",
    };

    const full = intakeSchema.safeParse(submissionData);
    if (!full.success) {
      const flat = full.error.flatten().fieldErrors;
      const e: Record<string, string> = {};
      Object.entries(flat).forEach(([k, v]) => {
        if (v?.[0]) e[k] = v[0];
      });
      setErrors(e);
      return;
    }

    setSubmitting(true);
    try {
      const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;
      if (!isOnline) {
        throw new Error("offline");
      }

      const res = await fetch("/api/leads/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(full.data),
      });
      const result = await res.json();
      if (result.success && result.leadId) {
        saveLeadContext(full.data, null);
        await saveLeadOffline(result.leadId, full.data, null, true);
        router.push(`/analysis?leadId=${result.leadId}`);
      } else {
        alert(result.error || "Failed to save lead");
      }
    } catch (error) {
      console.warn("API save failed, caching lead offline:", error);
      const tempLeadId = "offline-" + Math.random().toString(36).substring(2, 11);
      saveLeadContext(full.data, null);
      await saveLeadOffline(tempLeadId, full.data, null, false);
      router.push(`/analysis?leadId=${tempLeadId}`);
    } finally {
      setSubmitting(false);
    }
  }

  function next() {
    if (!validateStep()) return;
    setStep((s) => Math.min(s + 1, 9));
  }

  function back() {
    setStep((s) => Math.max(s - 1, 0));
    setErrors({});
  }

  return (
    <div className="mx-auto max-w-xl rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8 backdrop-blur-xl shadow-[0_20px_80px_rgba(0,0,0,0.45)] relative overflow-hidden [perspective:1200px]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_20%_10%,rgba(139,92,246,0.16),transparent)]" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-teal-500/10 blur-3xl" />

      <div className="mb-8 flex items-center justify-between gap-4 relative z-10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-teal-300/90">
            Step {step + 1} of {stepTitles.length}
          </p>
          <h2 className="text-lg font-bold text-white tracking-tight">{stepTitles[step]}</h2>
        </div>
        <div className="flex gap-1">
          {stepTitles.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 w-3.5 rounded-full transition-colors ${
                i <= step ? "bg-teal-500 shadow-[0_0_8px_#14b8a6]" : "bg-white/10"
              }`}
            />
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.2 }}
          className="space-y-5 relative z-10 min-h-[360px]"
        >
          {/* Step 0: Contact Information */}
          {step === 0 && (
            <>
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 border-b border-white/5 pb-2">Primary Contact</h3>
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={data.name}
                  onChange={(e) => setData({ ...data, name: e.target.value })}
                  placeholder="John Doe"
                  className="bg-black/20 border-white/10 text-white placeholder-slate-500"
                />
                {errors.name && <p className="text-xs text-red-400">{errors.name}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="emailPersonal">Business Email Address</Label>
                <Input
                  id="emailPersonal"
                  type="email"
                  value={data.emailPersonal}
                  onChange={(e) => setData({ ...data, emailPersonal: e.target.value })}
                  placeholder="john@company.com"
                  className="bg-black/20 border-white/10 text-white placeholder-slate-500"
                />
                {errors.emailPersonal && <p className="text-xs text-red-400">{errors.emailPersonal}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="emailAdditional">Additional Email Address (Optional)</Label>
                <Input
                  id="emailAdditional"
                  type="email"
                  value={data.emailAdditional}
                  onChange={(e) => setData({ ...data, emailAdditional: e.target.value })}
                  placeholder="optional@company.com"
                  className="bg-black/20 border-white/10 text-white placeholder-slate-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jobTitle">Job Title</Label>
                <Input
                  id="jobTitle"
                  value={data.jobTitle}
                  onChange={(e) => setData({ ...data, jobTitle: e.target.value })}
                  placeholder="VP of Growth"
                  className="bg-black/20 border-white/10 text-white placeholder-slate-500"
                />
                {errors.jobTitle && <p className="text-xs text-red-400">{errors.jobTitle}</p>}
              </div>

              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 border-b border-white/5 pb-2 pt-4">Company Details</h3>
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={data.companyName}
                  onChange={(e) => setData({ ...data, companyName: e.target.value })}
                  placeholder="Acme Corp"
                  className="bg-black/20 border-white/10 text-white placeholder-slate-500"
                />
                {errors.companyName && <p className="text-xs text-red-400">{errors.companyName}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="websiteUrl">Company Website (URL)</Label>
                <Input
                  id="websiteUrl"
                  value={data.websiteUrl}
                  onChange={(e) => setData({ ...data, websiteUrl: e.target.value })}
                  placeholder="https://acme.com"
                  className="bg-black/20 border-white/10 text-white placeholder-slate-500"
                />
                {errors.websiteUrl && <p className="text-xs text-red-400">{errors.websiteUrl}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkedinPage">LinkedIn Company Page</Label>
                <Input
                  id="linkedinPage"
                  value={data.linkedinPage}
                  onChange={(e) => setData({ ...data, linkedinPage: e.target.value })}
                  placeholder="https://linkedin.com/company/acme"
                  className="bg-black/20 border-white/10 text-white placeholder-slate-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="headquartersCountry">HQ Country</Label>
                  <Select
                    value={data.headquartersCountry}
                    onValueChange={(v) => setData({ ...data, headquartersCountry: v })}
                  >
                    <SelectTrigger className="bg-black/20 border-white/10 text-white"><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent className="bg-slate-900 border-white/10 text-white">
                      {countries.map((c) => (
                        <SelectItem key={c} value={c} className="hover:bg-teal-500/20">{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.headquartersCountry && <p className="text-xs text-red-400">{errors.headquartersCountry}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="headquartersCity">HQ City</Label>
                  <Input
                    id="headquartersCity"
                    value={data.headquartersCity}
                    onChange={(e) => setData({ ...data, headquartersCity: e.target.value })}
                    placeholder="San Francisco"
                    className="bg-black/20 border-white/10 text-white placeholder-slate-500"
                  />
                  {errors.headquartersCity && <p className="text-xs text-red-400">{errors.headquartersCity}</p>}
                </div>
              </div>
            </>
          )}

          {/* Step 1: Company & Offer Overview */}
          {step === 1 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="companyDescription">Describe Your Company</Label>
                <Textarea
                  id="companyDescription"
                  value={data.companyDescription}
                  onChange={(e) => setData({ ...data, companyDescription: e.target.value })}
                  placeholder="What does your company do and who do you serve?"
                  className="bg-black/20 border-white/10 text-white placeholder-slate-500 min-h-[70px]"
                />
                {errors.companyDescription && <p className="text-xs text-red-400">{errors.companyDescription}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="productsServices">What products or services do you offer?</Label>
                <Textarea
                  id="productsServices"
                  value={data.productsServices}
                  onChange={(e) => setData({ ...data, productsServices: e.target.value })}
                  placeholder="List your core products, services, or packages."
                  className="bg-black/20 border-white/10 text-white placeholder-slate-500 min-h-[70px]"
                />
                {errors.productsServices && <p className="text-xs text-red-400">{errors.productsServices}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="primaryOutcome">What is the primary outcome or transformation your solution delivers?</Label>
                <Textarea
                  id="primaryOutcome"
                  value={data.primaryOutcome}
                  onChange={(e) => setData({ ...data, primaryOutcome: e.target.value })}
                  placeholder="What key result or benefit do customers experience after using your solution?"
                  className="bg-black/20 border-white/10 text-white placeholder-slate-500 min-h-[70px]"
                />
                {errors.primaryOutcome && <p className="text-xs text-red-400">{errors.primaryOutcome}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="keyChallenges">What key business challenges does your solution solve?</Label>
                <Textarea
                  id="keyChallenges"
                  value={data.keyChallenges}
                  onChange={(e) => setData({ ...data, keyChallenges: e.target.value })}
                  placeholder="Which bottlenecks, pain points, or inefficiencies do you eliminate?"
                  className="bg-black/20 border-white/10 text-white placeholder-slate-500 min-h-[70px]"
                />
                {errors.keyChallenges && <p className="text-xs text-red-400">{errors.keyChallenges}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="uniqueValueProp">Do you have a unique value proposition or competitive advantage?</Label>
                <Textarea
                  id="uniqueValueProp"
                  value={data.uniqueValueProp}
                  onChange={(e) => setData({ ...data, uniqueValueProp: e.target.value })}
                  placeholder="What makes your company unique or better than the competition?"
                  className="bg-black/20 border-white/10 text-white placeholder-slate-500 min-h-[70px]"
                />
                {errors.uniqueValueProp && <p className="text-xs text-red-400">{errors.uniqueValueProp}</p>}
              </div>
            </>
          )}

          {/* Step 2: Social Proof & Credibility */}
          {step === 2 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="successStories">Can you share at least three customer success stories or case studies with measurable outcomes?</Label>
                <Textarea
                  id="successStories"
                  value={data.successStories}
                  onChange={(e) => setData({ ...data, successStories: e.target.value })}
                  placeholder="Case 1: X company grew by 40%... Case 2: Y company saved 20 hours... Case 3: Z company..."
                  className="bg-black/20 border-white/10 text-white placeholder-slate-500 min-h-[80px]"
                />
                {errors.successStories && <p className="text-xs text-red-400">{errors.successStories}</p>}
              </div>

              <div className="space-y-2">
                <Label>Upload Case Studies, Testimonials, or Supporting Documents</Label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-white/10 hover:border-teal-500/50 bg-black/20 rounded-xl p-4 text-center cursor-pointer transition-all hover:bg-white/[0.02]"
                >
                  <Upload className="mx-auto h-8 w-8 text-teal-400 mb-2" />
                  <p className="text-sm font-semibold text-white">Drag & drop files here or click to browse</p>
                  <p className="text-xs text-slate-500 mt-1">Supports PDF, DOCX, PNG, MP4 up to 50MB</p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    multiple
                    className="hidden"
                  />
                </div>
                {data.uploadedDocuments && data.uploadedDocuments.length > 0 && (
                  <div className="space-y-1.5 mt-2 max-h-[100px] overflow-y-auto">
                    {data.uploadedDocuments.map((doc, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-white/5 border border-white/5 rounded-lg px-3 py-1.5 text-xs text-slate-300">
                        <div className="flex items-center gap-2 truncate">
                          <File className="h-3.5 w-3.5 text-teal-400 flex-shrink-0" />
                          <span className="truncate">{doc}</span>
                        </div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); removeUploadedDocument(idx); }}
                          className="text-slate-500 hover:text-red-400 p-0.5 transition-colors"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerTestimonials">Do you have customer testimonials, reviews, or video success stories?</Label>
                <Select
                  value={data.customerTestimonials}
                  onValueChange={(v) => setData({ ...data, customerTestimonials: v })}
                >
                  <SelectTrigger className="bg-black/20 border-white/10 text-white"><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/10 text-white">
                    {customerTestimonialOptions.map((opt) => (
                      <SelectItem key={opt} value={opt} className="hover:bg-teal-500/20">{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.customerTestimonials && <p className="text-xs text-red-400">{errors.customerTestimonials}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="credibilityFactors">What makes your organization credible to prospective customers?</Label>
                <Textarea
                  id="credibilityFactors"
                  value={data.credibilityFactors}
                  onChange={(e) => setData({ ...data, credibilityFactors: e.target.value })}
                  placeholder="Awards, partnership details, research papers, certifications, industry experience..."
                  className="bg-black/20 border-white/10 text-white placeholder-slate-500 min-h-[70px]"
                />
                {errors.credibilityFactors && <p className="text-xs text-red-400">{errors.credibilityFactors}</p>}
              </div>

              <div className="space-y-3">
                <Label>Which certifications, compliance frameworks, or industry standards do you maintain?</Label>
                <div className="grid grid-cols-2 gap-2.5 max-h-[140px] overflow-y-auto pr-1">
                  {certificationOptions.map((cert) => (
                    <div key={cert} className="flex items-center space-x-2 rounded-lg border border-white/5 bg-white/5 px-3 py-2.5">
                      <Checkbox
                        id={`cert-${cert}`}
                        checked={(data.certifications || []).includes(cert)}
                        onCheckedChange={() => toggleArrayItem("certifications", cert)}
                      />
                      <label htmlFor={`cert-${cert}`} className="text-xs font-semibold text-slate-300 leading-none cursor-pointer">
                        {cert}
                      </label>
                    </div>
                  ))}
                </div>
                {(data.certifications || []).includes("Other") && (
                  <Input
                    placeholder="Specify other certification..."
                    value={data.certificationsOther}
                    onChange={(e) => setData({ ...data, certificationsOther: e.target.value })}
                    className="bg-black/20 border-white/10 text-white mt-1.5 placeholder-slate-500"
                  />
                )}
              </div>
            </>
          )}

          {/* Step 3: Brand Presence & Positioning */}
          {step === 3 && (
            <>
              <div className="space-y-3">
                <Label>Which channels is your brand actively present on?</Label>
                <div className="grid grid-cols-2 gap-2.5 max-h-[170px] overflow-y-auto pr-1">
                  {channelOptions.map((ch) => (
                    <div key={ch} className="flex items-center space-x-2 rounded-lg border border-white/5 bg-white/5 px-3 py-2.5">
                      <Checkbox
                        id={`ch-${ch}`}
                        checked={(data.brandChannels || []).includes(ch)}
                        onCheckedChange={() => toggleArrayItem("brandChannels", ch)}
                      />
                      <label htmlFor={`ch-${ch}`} className="text-xs font-semibold text-slate-300 leading-none cursor-pointer">
                        {ch}
                      </label>
                    </div>
                  ))}
                </div>
                {(data.brandChannels || []).includes("Other") && (
                  <Input
                    placeholder="Specify other channel..."
                    value={data.brandChannelsOther}
                    onChange={(e) => setData({ ...data, brandChannelsOther: e.target.value })}
                    className="bg-black/20 border-white/10 text-white mt-1.5 placeholder-slate-500"
                  />
                )}
              </div>

              <div className="space-y-3">
                <Label>What type of content do you regularly publish?</Label>
                <div className="grid grid-cols-2 gap-2.5 max-h-[170px] overflow-y-auto pr-1">
                  {contentTypeOptions.map((ct) => (
                    <div key={ct} className="flex items-center space-x-2 rounded-lg border border-white/5 bg-white/5 px-3 py-2.5">
                      <Checkbox
                        id={`ct-${ct}`}
                        checked={(data.contentTypes || []).includes(ct)}
                        onCheckedChange={() => toggleArrayItem("contentTypes", ct)}
                      />
                      <label htmlFor={`ct-${ct}`} className="text-xs font-semibold text-slate-300 leading-none cursor-pointer">
                        {ct}
                      </label>
                    </div>
                  ))}
                </div>
                {(data.contentTypes || []).includes("Other") && (
                  <Input
                    placeholder="Specify other content type..."
                    value={data.contentTypesOther}
                    onChange={(e) => setData({ ...data, contentTypesOther: e.target.value })}
                    className="bg-black/20 border-white/10 text-white mt-1.5 placeholder-slate-500"
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="publishingFrequency">How frequently do you publish content?</Label>
                <Select
                  value={data.publishingFrequency}
                  onValueChange={(v) => setData({ ...data, publishingFrequency: v })}
                >
                  <SelectTrigger className="bg-black/20 border-white/10 text-white"><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/10 text-white">
                    {publishingFrequencyOptions.map((opt) => (
                      <SelectItem key={opt} value={opt} className="hover:bg-teal-500/20">{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.publishingFrequency && <p className="text-xs text-red-400">{errors.publishingFrequency}</p>}
              </div>
            </>
          )}

          {/* Step 4: Offer Structure & Sales Motion */}
          {step === 4 && (
            <>
              <div className="space-y-3">
                <Label>Do you offer any risk-reduction or guarantee mechanisms?</Label>
                <div className="grid grid-cols-2 gap-2.5 max-h-[170px] overflow-y-auto pr-1">
                  {riskReductionOptions.map((rr) => (
                    <div key={rr} className="flex items-center space-x-2 rounded-lg border border-white/5 bg-white/5 px-3 py-2.5">
                      <Checkbox
                        id={`rr-${rr}`}
                        checked={(data.riskReductions || []).includes(rr)}
                        onCheckedChange={() => toggleArrayItem("riskReductions", rr)}
                      />
                      <label htmlFor={`rr-${rr}`} className="text-xs font-semibold text-slate-300 leading-none cursor-pointer">
                        {rr}
                      </label>
                    </div>
                  ))}
                </div>
                {(data.riskReductions || []).includes("Other") && (
                  <Input
                    placeholder="Specify other risk-reduction mechanism..."
                    value={data.riskReductionsOther}
                    onChange={(e) => setData({ ...data, riskReductionsOther: e.target.value })}
                    className="bg-black/20 border-white/10 text-white mt-1.5 placeholder-slate-500"
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeToValue">How quickly can a customer begin realizing value from your solution?</Label>
                <Select
                  value={data.timeToValue}
                  onValueChange={(v) => setData({ ...data, timeToValue: v })}
                >
                  <SelectTrigger className="bg-black/20 border-white/10 text-white"><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/10 text-white">
                    {timeToValueOptions.map((opt) => (
                      <SelectItem key={opt} value={opt} className="hover:bg-teal-500/20">{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.timeToValue && <p className="text-xs text-red-400">{errors.timeToValue}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="primaryCta">What is your primary Call-to-Action (CTA)?</Label>
                <Select
                  value={data.primaryCta}
                  onValueChange={(v) => setData({ ...data, primaryCta: v })}
                >
                  <SelectTrigger className="bg-black/20 border-white/10 text-white"><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/10 text-white">
                    {ctaOptions.map((opt) => (
                      <SelectItem key={opt} value={opt} className="hover:bg-teal-500/20">{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.primaryCta && <p className="text-xs text-red-400">{errors.primaryCta}</p>}
                {data.primaryCta === "Other" && (
                  <Input
                    placeholder="Specify other CTA..."
                    value={data.primaryCtaOther}
                    onChange={(e) => setData({ ...data, primaryCtaOther: e.target.value })}
                    className="bg-black/20 border-white/10 text-white mt-2 placeholder-slate-500"
                  />
                )}
              </div>

              <div className="space-y-3">
                <Label>What assets can be shared during initial outreach?</Label>
                <div className="grid grid-cols-2 gap-2.5 max-h-[170px] overflow-y-auto pr-1">
                  {outreachAssetOptions.map((oa) => (
                    <div key={oa} className="flex items-center space-x-2 rounded-lg border border-white/5 bg-white/5 px-3 py-2.5">
                      <Checkbox
                        id={`oa-${oa}`}
                        checked={(data.outreachAssets || []).includes(oa)}
                        onCheckedChange={() => toggleArrayItem("outreachAssets", oa)}
                      />
                      <label htmlFor={`oa-${oa}`} className="text-xs font-semibold text-slate-300 leading-none cursor-pointer">
                        {oa}
                      </label>
                    </div>
                  ))}
                </div>
                {(data.outreachAssets || []).includes("Other") && (
                  <Input
                    placeholder="Specify other outreach asset..."
                    value={data.outreachAssetsOther}
                    onChange={(e) => setData({ ...data, outreachAssetsOther: e.target.value })}
                    className="bg-black/20 border-white/10 text-white mt-1.5 placeholder-slate-500"
                  />
                )}
              </div>
            </>
          )}

          {/* Step 5: Ideal Customer Profile (ICP) */}
          {step === 5 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="icpDescription">Describe your Ideal Customer Profile (ICP)</Label>
                <Textarea
                  id="icpDescription"
                  value={data.icpDescription}
                  onChange={(e) => setData({ ...data, icpDescription: e.target.value })}
                  placeholder="Describe your ideal company size, industry, pain points, etc."
                  className="bg-black/20 border-white/10 text-white placeholder-slate-500 min-h-[60px]"
                />
                {errors.icpDescription && <p className="text-xs text-red-400">{errors.icpDescription}</p>}
              </div>

              <div className="space-y-3">
                <Label>Target Industries</Label>
                <div className="grid grid-cols-2 gap-2.5 max-h-[110px] overflow-y-auto pr-1">
                  {targetIndustryOptions.map((ti) => (
                    <div key={ti} className="flex items-center space-x-2 rounded-lg border border-white/5 bg-white/5 px-3 py-2">
                      <Checkbox
                        id={`ti-${ti}`}
                        checked={(data.targetIndustries || []).includes(ti)}
                        onCheckedChange={() => toggleArrayItem("targetIndustries", ti)}
                      />
                      <label htmlFor={`ti-${ti}`} className="text-xs font-semibold text-slate-300 leading-none cursor-pointer">
                        {ti}
                      </label>
                    </div>
                  ))}
                </div>
                {(data.targetIndustries || []).includes("Other") && (
                  <Input
                    placeholder="Specify other industry..."
                    value={data.targetIndustriesOther}
                    onChange={(e) => setData({ ...data, targetIndustriesOther: e.target.value })}
                    className="bg-black/20 border-white/10 text-white mt-1 placeholder-slate-500"
                  />
                )}
                {errors.targetIndustries && <p className="text-xs text-red-400">{errors.targetIndustries}</p>}
              </div>

              <div className="space-y-3">
                <Label>Target Company Size</Label>
                <div className="grid grid-cols-2 gap-2.5 max-h-[110px] overflow-y-auto pr-1">
                  {targetCompanySizeOptions.map((sz) => (
                    <div key={sz} className="flex items-center space-x-2 rounded-lg border border-white/5 bg-white/5 px-3 py-2">
                      <Checkbox
                        id={`sz-${sz}`}
                        checked={(data.targetCompanySizes || []).includes(sz)}
                        onCheckedChange={() => toggleArrayItem("targetCompanySizes", sz)}
                      />
                      <label htmlFor={`sz-${sz}`} className="text-xs font-semibold text-slate-300 leading-none cursor-pointer">
                        {sz}
                      </label>
                    </div>
                  ))}
                </div>
                {errors.targetCompanySizes && <p className="text-xs text-red-400">{errors.targetCompanySizes}</p>}
              </div>

              <div className="space-y-3">
                <Label>Target Company Revenue Range</Label>
                <div className="grid grid-cols-2 gap-2.5 max-h-[110px] overflow-y-auto pr-1">
                  {targetRevenueOptions.map((rv) => (
                    <div key={rv} className="flex items-center space-x-2 rounded-lg border border-white/5 bg-white/5 px-3 py-2">
                      <Checkbox
                        id={`rv-${rv}`}
                        checked={(data.targetRevenues || []).includes(rv)}
                        onCheckedChange={() => toggleArrayItem("targetRevenues", rv)}
                      />
                      <label htmlFor={`rv-${rv}`} className="text-xs font-semibold text-slate-300 leading-none cursor-pointer">
                        {rv}
                      </label>
                    </div>
                  ))}
                </div>
                {errors.targetRevenues && <p className="text-xs text-red-400">{errors.targetRevenues}</p>}
              </div>

              <div className="space-y-3">
                <Label>Target Geographic Markets</Label>
                <div className="grid grid-cols-2 gap-2.5 max-h-[110px] overflow-y-auto pr-1">
                  {targetGeographicOptions.map((geo) => (
                    <div key={geo} className="flex items-center space-x-2 rounded-lg border border-white/5 bg-white/5 px-3 py-2">
                      <Checkbox
                        id={`geo-${geo}`}
                        checked={(data.targetGeographics || []).includes(geo)}
                        onCheckedChange={() => toggleArrayItem("targetGeographics", geo)}
                      />
                      <label htmlFor={`geo-${geo}`} className="text-xs font-semibold text-slate-300 leading-none cursor-pointer">
                        {geo}
                      </label>
                    </div>
                  ))}
                </div>
                {errors.targetGeographics && <p className="text-xs text-red-400">{errors.targetGeographics}</p>}
              </div>

              <div className="space-y-3">
                <Label>Preferred Languages</Label>
                <div className="grid grid-cols-2 gap-2.5 max-h-[110px] overflow-y-auto pr-1">
                  {preferredLanguageOptions.map((lang) => (
                    <div key={lang} className="flex items-center space-x-2 rounded-lg border border-white/5 bg-white/5 px-3 py-2">
                      <Checkbox
                        id={`lang-${lang}`}
                        checked={(data.preferredLanguages || []).includes(lang)}
                        onCheckedChange={() => toggleArrayItem("preferredLanguages", lang)}
                      />
                      <label htmlFor={`lang-${lang}`} className="text-xs font-semibold text-slate-300 leading-none cursor-pointer">
                        {lang}
                      </label>
                    </div>
                  ))}
                </div>
                {errors.preferredLanguages && <p className="text-xs text-red-400">{errors.preferredLanguages}</p>}
              </div>
            </>
          )}

          {/* Step 6: Decision Makers & Buying Committee */}
          {step === 6 && (
            <>
              <div className="space-y-3">
                <Label>Which roles are involved in the buying process?</Label>
                <div className="grid grid-cols-2 gap-2.5 max-h-[170px] overflow-y-auto pr-1">
                  {buyingRoleOptions.map((role) => (
                    <div key={role} className="flex items-center space-x-2 rounded-lg border border-white/5 bg-white/5 px-3 py-2.5">
                      <Checkbox
                        id={`role-${role}`}
                        checked={(data.buyingRoles || []).includes(role)}
                        onCheckedChange={() => toggleArrayItem("buyingRoles", role)}
                      />
                      <label htmlFor={`role-${role}`} className="text-xs font-semibold text-slate-300 leading-none cursor-pointer">
                        {role}
                      </label>
                    </div>
                  ))}
                </div>
                {(data.buyingRoles || []).includes("Other") && (
                  <Input
                    placeholder="Specify other buying roles..."
                    value={data.buyingRolesOther}
                    onChange={(e) => setData({ ...data, buyingRolesOther: e.target.value })}
                    className="bg-black/20 border-white/10 text-white mt-1.5 placeholder-slate-500"
                  />
                )}
                {errors.buyingRoles && <p className="text-xs text-red-400">{errors.buyingRoles}</p>}
              </div>

              <div className="space-y-3">
                <Label>What departments typically own the budget or decision-making authority?</Label>
                <div className="grid grid-cols-2 gap-2.5 max-h-[170px] overflow-y-auto pr-1">
                  {budgetDepartmentOptions.map((dept) => (
                    <div key={dept} className="flex items-center space-x-2 rounded-lg border border-white/5 bg-white/5 px-3 py-2.5">
                      <Checkbox
                        id={`dept-${dept}`}
                        checked={(data.budgetDepartments || []).includes(dept)}
                        onCheckedChange={() => toggleArrayItem("budgetDepartments", dept)}
                      />
                      <label htmlFor={`dept-${dept}`} className="text-xs font-semibold text-slate-300 leading-none cursor-pointer">
                        {dept}
                      </label>
                    </div>
                  ))}
                </div>
                {errors.budgetDepartments && <p className="text-xs text-red-400">{errors.budgetDepartments}</p>}
              </div>

              <div className="space-y-3">
                <Label>What seniority levels are targeted?</Label>
                <div className="grid grid-cols-2 gap-2.5 max-h-[170px] overflow-y-auto pr-1">
                  {targetSeniorityOptions.map((sen) => (
                    <div key={sen} className="flex items-center space-x-2 rounded-lg border border-white/5 bg-white/5 px-3 py-2.5">
                      <Checkbox
                        id={`sen-${sen}`}
                        checked={(data.targetSeniorities || []).includes(sen)}
                        onCheckedChange={() => toggleArrayItem("targetSeniorities", sen)}
                      />
                      <label htmlFor={`sen-${sen}`} className="text-xs font-semibold text-slate-300 leading-none cursor-pointer">
                        {sen}
                      </label>
                    </div>
                  ))}
                </div>
                {errors.targetSeniorities && <p className="text-xs text-red-400">{errors.targetSeniorities}</p>}
              </div>
            </>
          )}

          {/* Step 7: Buying Signals & Market Intelligence */}
          {step === 7 && (
            <>
              <div className="space-y-3">
                <Label>Which buying signals or trigger events indicate a potential opportunity?</Label>
                <div className="grid grid-cols-2 gap-2.5 max-h-[200px] overflow-y-auto pr-1">
                  {buyingSignalOptions.map((sig) => (
                    <div key={sig} className="flex items-center space-x-2 rounded-lg border border-white/5 bg-white/5 px-3 py-2.5">
                      <Checkbox
                        id={`sig-${sig}`}
                        checked={(data.buyingSignals || []).includes(sig)}
                        onCheckedChange={() => toggleArrayItem("buyingSignals", sig)}
                      />
                      <label htmlFor={`sig-${sig}`} className="text-xs font-semibold text-slate-300 leading-none cursor-pointer">
                        {sig}
                      </label>
                    </div>
                  ))}
                </div>
                {(data.buyingSignals || []).includes("Other") && (
                  <Input
                    placeholder="Specify other buying signal..."
                    value={data.buyingSignalsOther}
                    onChange={(e) => setData({ ...data, buyingSignalsOther: e.target.value })}
                    className="bg-black/20 border-white/10 text-white mt-1.5 placeholder-slate-500"
                  />
                )}
                {errors.buyingSignals && <p className="text-xs text-red-400">{errors.buyingSignals}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="prospectTechnologies">Are there specific technologies, platforms, or ecosystems your prospects commonly use?</Label>
                <Textarea
                  id="prospectTechnologies"
                  value={data.prospectTechnologies}
                  onChange={(e) => setData({ ...data, prospectTechnologies: e.target.value })}
                  placeholder="Salesforce, HubSpot, Shopify, AWS, Kubernetes, React, etc..."
                  className="bg-black/20 border-white/10 text-white placeholder-slate-500 min-h-[100px]"
                />
                {errors.prospectTechnologies && <p className="text-xs text-red-400">{errors.prospectTechnologies}</p>}
              </div>
            </>
          )}

          {/* Step 8: Sales & Marketing Technology Stack */}
          {step === 8 && (
            <>
              <div className="space-y-3">
                <Label>Which CRM systems do you currently use?</Label>
                <div className="grid grid-cols-2 gap-2.5 max-h-[140px] overflow-y-auto pr-1">
                  {crmSystemOptions.map((crm) => (
                    <div key={crm} className="flex items-center space-x-2 rounded-lg border border-white/5 bg-white/5 px-3 py-2.5">
                      <Checkbox
                        id={`crm-${crm}`}
                        checked={(data.crmSystems || []).includes(crm)}
                        onCheckedChange={() => toggleArrayItem("crmSystems", crm)}
                      />
                      <label htmlFor={`crm-${crm}`} className="text-xs font-semibold text-slate-300 leading-none cursor-pointer">
                        {crm}
                      </label>
                    </div>
                  ))}
                </div>
                {(data.crmSystems || []).includes("Other") && (
                  <Input
                    placeholder="Specify other CRM..."
                    value={data.crmSystemsOther}
                    onChange={(e) => setData({ ...data, crmSystemsOther: e.target.value })}
                    className="bg-black/20 border-white/10 text-white mt-1.5 placeholder-slate-500"
                  />
                )}
              </div>

              <div className="space-y-3">
                <Label>Which outbound, prospecting, or sales engagement tools do you use?</Label>
                <div className="grid grid-cols-2 gap-2.5 max-h-[140px] overflow-y-auto pr-1">
                  {outreachToolOptions.map((out) => (
                    <div key={out} className="flex items-center space-x-2 rounded-lg border border-white/5 bg-white/5 px-3 py-2.5">
                      <Checkbox
                        id={`out-${out}`}
                        checked={(data.outreachTools || []).includes(out)}
                        onCheckedChange={() => toggleArrayItem("outreachTools", out)}
                      />
                      <label htmlFor={`out-${out}`} className="text-xs font-semibold text-slate-300 leading-none cursor-pointer">
                        {out}
                      </label>
                    </div>
                  ))}
                </div>
                {(data.outreachTools || []).includes("Other") && (
                  <Input
                    placeholder="Specify other outreach tool..."
                    value={data.outreachToolsOther}
                    onChange={(e) => setData({ ...data, outreachToolsOther: e.target.value })}
                    className="bg-black/20 border-white/10 text-white mt-1.5 placeholder-slate-500"
                  />
                )}
              </div>

              <div className="space-y-3">
                <Label>Which marketing automation tools do you use?</Label>
                <div className="grid grid-cols-2 gap-2.5 max-h-[140px] overflow-y-auto pr-1">
                  {marketingAutomationOptions.map((mkt) => (
                    <div key={mkt} className="flex items-center space-x-2 rounded-lg border border-white/5 bg-white/5 px-3 py-2.5">
                      <Checkbox
                        id={`mkt-${mkt}`}
                        checked={(data.marketingAutomationTools || []).includes(mkt)}
                        onCheckedChange={() => toggleArrayItem("marketingAutomationTools", mkt)}
                      />
                      <label htmlFor={`mkt-${mkt}`} className="text-xs font-semibold text-slate-300 leading-none cursor-pointer">
                        {mkt}
                      </label>
                    </div>
                  ))}
                </div>
                {(data.marketingAutomationTools || []).includes("Other") && (
                  <Input
                    placeholder="Specify other marketing automation tool..."
                    value={data.marketingAutomationToolsOther}
                    onChange={(e) => setData({ ...data, marketingAutomationToolsOther: e.target.value })}
                    className="bg-black/20 border-white/10 text-white mt-1.5 placeholder-slate-500"
                  />
                )}
              </div>
            </>
          )}

          {/* Step 9: Messaging & Campaign Strategy */}
          {step === 9 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="commonObjections">What are the most common objections raised by prospects?</Label>
                <Textarea
                  id="commonObjections"
                  value={data.commonObjections}
                  onChange={(e) => setData({ ...data, commonObjections: e.target.value })}
                  placeholder="Pricing, integration complexity, lack of time, satisfy with current system..."
                  className="bg-black/20 border-white/10 text-white placeholder-slate-500 min-h-[60px]"
                />
                {errors.commonObjections && <p className="text-xs text-red-400">{errors.commonObjections}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="overcomeObjections">How do you typically overcome those objections?</Label>
                <Textarea
                  id="overcomeObjections"
                  value={data.overcomeObjections}
                  onChange={(e) => setData({ ...data, overcomeObjections: e.target.value })}
                  placeholder="Share ROI data, offering free pilots, demonstrating instant setup..."
                  className="bg-black/20 border-white/10 text-white placeholder-slate-500 min-h-[60px]"
                />
                {errors.overcomeObjections && <p className="text-xs text-red-400">{errors.overcomeObjections}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="messagingThemes">If you were designing a multi-touch outreach sequence, what messaging themes would you want included?</Label>
                <Textarea
                  id="messagingThemes"
                  value={data.messagingThemes}
                  onChange={(e) => setData({ ...data, messagingThemes: e.target.value })}
                  placeholder="Theme 1: Operational efficiency, Theme 2: Cost-reduction, Theme 3: Competitor comparisons..."
                  className="bg-black/20 border-white/10 text-white placeholder-slate-500 min-h-[60px]"
                />
                {errors.messagingThemes && <p className="text-xs text-red-400">{errors.messagingThemes}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="doNotTarget">Are there any industries, companies, or prospects you do NOT want targeted?</Label>
                <Textarea
                  id="doNotTarget"
                  value={data.doNotTarget || ""}
                  onChange={(e) => setData({ ...data, doNotTarget: e.target.value })}
                  placeholder="List competitor domains, specific niches, or legacy industries..."
                  className="bg-black/20 border-white/10 text-white placeholder-slate-500 min-h-[50px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="additionalNotes">Additional Notes, Requirements, or Strategic Considerations</Label>
                <Textarea
                  id="additionalNotes"
                  value={data.additionalNotes || ""}
                  onChange={(e) => setData({ ...data, additionalNotes: e.target.value })}
                  placeholder="Anything else we should factor into your GTM analysis & outreach plan..."
                  className="bg-black/20 border-white/10 text-white placeholder-slate-500 min-h-[50px]"
                />
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="mt-8 flex justify-between gap-4 relative z-10 border-t border-white/5 pt-5">
        {step > 0 ? (
          <Button 
            variant="outline" 
            onClick={back} 
            disabled={submitting}
            className="border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white"
          >
            <IconArrowLeft className="mr-2 h-4 w-4 text-teal-400" />
            Back
          </Button>
        ) : <div />}

        {step < 9 ? (
          <Button 
            className="bg-teal-600 hover:bg-teal-700 text-white shadow-[0_0_15px_rgba(20,184,166,0.3)] transition-all ml-auto" 
            onClick={next}
          >
            Next <IconArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button
            className="bg-teal-500 hover:bg-teal-600 text-white shadow-[0_0_20px_rgba(20,184,166,0.5)] transition-all ml-auto font-bold px-6"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin text-white" />
                Generating GTM Plan...
              </>
            ) : "Get AI Analysis"}
          </Button>
        )}
      </div>
    </div>
  );
}

