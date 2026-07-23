"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Search, 
  ChevronRight, 
  ChevronDown, 
  Sparkles, 
  Check, 
  Copy, 
  AlertCircle, 
  Edit3, 
  Layers, 
  Loader2,
  CheckCircle2,
  Filter,
  Grid,
  Zap,
  Target,
  ArrowUpRight,
  Sliders,
  Bookmark,
  FileCode,
  Globe,
  Share2,
  Video,
  Mic,
  Image as ImageIcon,
  MousePointer,
  Send,
  BookOpen,
  MessageSquare,
  Tv,
  Radio,
  PieChart,
  Cpu,
  DollarSign,
  Users,
  Calendar,
  Rocket,
  Mail
} from "lucide-react";
import { GlassPanel } from "@/components/immersive/GlassPanel";
import { ExtrudedButton } from "@/components/immersive/ExtrudedButton";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  COMPLETE_CAMPAIGN_SCHEMA, 
  CoreContentType, 
  ContentSubType, 
  FieldDefinition,
  getTaxonomyMetrics,
  validateFieldInputs
} from "@/lib/campaign-options-schema";

interface CampaignContentGeneratorProps {
  customerData?: any;
  customerName?: string;
  onSaveContent?: (contentData: any) => Promise<boolean>;
}

// Dynamic Content Generation Function
function generateDynamicContent(
  category: CoreContentType,
  subType: ContentSubType,
  formValues: Record<string, string>,
  customerName: string
): string {
  const dateStr = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  
  return `# 🚀 Generated Deliverable: ${subType.title}
**Category Domain:** ${category.title} (${category.typeGroup === "marketing_tactics" ? "Marketing Tactic" : "Content Type Asset"})  
**Target Brand / Account:** ${customerName}  
**Generation Timestamp:** ${dateStr}  
**Execution Badge:** [${subType.badge}]

---

## 📋 Campaign Strategy & Execution Blueprint
Custom-generated deliverable engineered from multi-level validated inputs for **${subType.title}**.

### 1. Validated Target Parameters
${Object.entries(formValues)
  .map(([key, value]) => `- **${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:** ${value}`)
  .join("\n")}

---

## ✍️ Campaign Copy & Deliverable Assets

### Primary Hook / Headline Focus
> "${formValues.openingHook || formValues.primaryKeyword || formValues.targetPersona || formValues.primaryObjective || "Accelerating B2B deal flow and pipeline velocity for " + customerName}"

### Execution Step-by-Step Breakdown
${Object.entries(formValues)
  .map(([key, val], idx) => `#### Step ${idx + 1}: ${key.replace(/([A-Z])/g, ' $1').toUpperCase()}\n${val}\n`)
  .join("\n")}

---

### 🌐 Channel Deployment & Call-to-Action
- **Primary CTA:** ${formValues.callToAction || formValues.primaryCta || "Schedule a 15-Minute Strategy Call with " + customerName}
- **Deployment Channels:** Integrated across ${category.title} touchpoints.
- **Tracking Parameters:** UTM parameters pre-configured for ${customerName} analytics dashboard.

---
*Generated via DealFlow.AI Autonomous Multi-Agent Consensus Engine.*`;
}

export function CampaignContentGenerator({
  customerData,
  customerName = "Customer",
  onSaveContent
}: CampaignContentGeneratorProps) {
  const metrics = getTaxonomyMetrics();

  // Filter & Navigation State
  const [activeGroupFilter, setActiveGroupFilter] = useState<"all" | "content_types" | "marketing_tactics">("all");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("written_content");
  const [selectedSubTypeId, setSelectedSubTypeId] = useState<string>("blog_posts_seo");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Collapsible Categories
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    written_content: true,
    social_media_content: true,
    outreach_tactics: true,
    seo_tactics: true,
    paid_marketing_tactics: true
  });

  // Form & Validation State
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formTouched, setFormTouched] = useState(false);

  // Generation & Output State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStage, setGenerationStage] = useState("");
  const [generatedOutput, setGeneratedOutput] = useState<string | null>(null);
  const [copiedState, setCopiedState] = useState(false);
  const [isEditingOutput, setIsEditingOutput] = useState(false);
  const [editedText, setEditedText] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);

  // Filter Categories Logic
  const filteredCategories = COMPLETE_CAMPAIGN_SCHEMA.map(cat => {
    if (activeGroupFilter !== "all" && cat.typeGroup !== activeGroupFilter) {
      return null;
    }

    const matchesCat = cat.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchingSubTypes = cat.subTypes.filter(sub => 
      sub.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.badge.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (matchesCat || matchingSubTypes.length > 0) {
      return {
        ...cat,
        subTypes: matchesCat ? cat.subTypes : matchingSubTypes
      };
    }
    return null;
  }).filter(Boolean) as CoreContentType[];

  // Resolvers
  const activeCategory = COMPLETE_CAMPAIGN_SCHEMA.find(c => c.id === selectedCategoryId) || COMPLETE_CAMPAIGN_SCHEMA[0];
  const activeSubType = activeCategory.subTypes.find(s => s.id === selectedSubTypeId) || activeCategory.subTypes[0];

  // LocalStorage Persistence Helpers for Studio Inputs
  const STORAGE_KEY_PREFIX = "dealflow_studio_form_";

  const formValuesMapRef = useRef<Record<string, Record<string, string>>>({});

  // Load and retain form values across subType switches, re-renders, and page navigation
  useEffect(() => {
    if (!activeSubType) return;
    
    // 1. Check in-memory map first
    let currentVals = formValuesMapRef.current[selectedSubTypeId];

    // 2. If not in memory, check localStorage for previously saved user input
    if (!currentVals) {
      const saved = getSavedFormValues(selectedSubTypeId);
      if (saved) {
        currentVals = saved;
        formValuesMapRef.current[selectedSubTypeId] = saved;
      }
    }

    // 3. If no saved data exists, construct initial defaults
    if (!currentVals) {
      const initialVals: Record<string, string> = {};
      const company = customerData?.companyInformation || {};
      
      activeSubType.fields.forEach(field => {
        if (field.defaultValue) {
          initialVals[field.id] = field.defaultValue;
        } else if (field.id === "targetPersona" || field.id === "targetAudience") {
          initialVals[field.id] = customerData?.targetAudience || customerData?.icpCategory || "B2B Decision Makers";
        } else if (field.id === "targetIndustry" || field.id === "industry") {
          initialVals[field.id] = company.industry || customerData?.industry || "SaaS & Enterprise Tech";
        } else if (field.id === "primaryKeyword" || field.id === "targetKeywords") {
          initialVals[field.id] = customerData?.keywords || "AI pipeline automation, B2B deal flow";
        } else if (field.id === "valueProposition" || field.id === "valueHook") {
          initialVals[field.id] = customerData?.businessGoals || `Accelerate ${customerName} growth and automate outbound pipelines.`;
        } else {
          initialVals[field.id] = "";
        }
      });
      currentVals = initialVals;
      formValuesMapRef.current[selectedSubTypeId] = initialVals;
    }

    setFormValues(currentVals);
    setFieldErrors({});
    setFormTouched(false);
    setGeneratedOutput(null);
  }, [selectedSubTypeId]);

  // Expand/Collapse category
  const toggleCategoryExpand = (catId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [catId]: !prev[catId]
    }));
  };

  // Expand All / Collapse All
  const handleToggleExpandAll = (expand: boolean) => {
    const newState: Record<string, boolean> = {};
    COMPLETE_CAMPAIGN_SCHEMA.forEach(cat => {
      newState[cat.id] = expand;
    });
    setExpandedCategories(newState);
  };

  const getSavedFormValues = (subTypeId: string): Record<string, string> | null => {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${subTypeId}`);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed && parsed._manuallySaved ? parsed : null;
    } catch (e) {
      return null;
    }
  };

  const setSavedFormValues = (subTypeId: string, values: Record<string, string>) => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}${subTypeId}`, JSON.stringify(values));
    } catch (e) {
      // ignore storage quota errors
    }
  };

  // Handle Form Change (Preserves raw un-trimmed input mid-entry in local state and memory cache; background auto-save disabled)
  const handleInputChange = (fieldId: string, value: string) => {
    setFormValues(prev => {
      const updated = { ...prev, [fieldId]: value };
      // Synchronously update in-memory cache for currently selected subType so text is retained during typing
      formValuesMapRef.current[selectedSubTypeId] = updated;
      return updated;
    });
    
    // Clear error for field if now valid according to schema validation
    if (fieldErrors[fieldId]) {
      const fieldDef = activeSubType.fields.find(f => f.id === fieldId);
      if (fieldDef) {
        const { errors } = validateFieldInputs([fieldDef], { ...formValues, [fieldId]: value });
        if (!errors[fieldId]) {
          setFieldErrors(prev => {
            const updated = { ...prev };
            delete updated[fieldId];
            return updated;
          });
        }
      }
    }
  };

  // Handle Input Blur (Triggers validation after user finishes typing in a field)
  const handleInputBlur = (fieldId: string) => {
    const fieldDef = activeSubType.fields.find(f => f.id === fieldId);
    if (!fieldDef) return;

    const { errors } = validateFieldInputs([fieldDef], formValues);
    if (errors[fieldId]) {
      setFieldErrors(prev => ({ ...prev, [fieldId]: errors[fieldId] }));
    }
  };

  // Input Validation (Runs on submit or full form check post-entry)
  const validateInputs = (): boolean => {
    const { isValid, errors } = validateFieldInputs(activeSubType.fields, formValues);
    setFieldErrors(errors);
    setFormTouched(true);
    return isValid;
  };

  // Generation Trigger
  const handleInitiateGeneration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInputs()) return;

    setIsGenerating(true);
    setGenerationProgress(25);
    setGenerationStage("Indexing campaign parameters & ICP context...");
    await new Promise(r => setTimeout(r, 450));

    setGenerationProgress(65);
    setGenerationStage(`Synthesizing ${activeSubType.title} deliverable...`);
    await new Promise(r => setTimeout(r, 550));

    setGenerationProgress(90);
    setGenerationStage("Optimizing call-to-action & channel alignment...");
    await new Promise(r => setTimeout(r, 400));

    const result = generateDynamicContent(activeCategory, activeSubType, formValues, customerName);

    setGenerationProgress(100);
    setGeneratedOutput(result);
    setEditedText(result);
    setIsGenerating(false);
    setIsEditingOutput(false);
  };

  // Manual Save for Option Deliverable Inputs
  const [isSavingInputs, setIsSavingInputs] = useState(false);
  const [savedInputsState, setSavedInputsState] = useState(false);

  const handleManualSaveInputs = async () => {
    const subTypeId = selectedSubTypeId;
    setIsSavingInputs(true);
    // Explicitly persist form values on manual save with _manuallySaved flag
    const dataToSave = { ...formValues, _manuallySaved: "true" };
    setSavedFormValues(subTypeId, dataToSave);
    formValuesMapRef.current[subTypeId] = dataToSave;

    if (onSaveContent) {
      await onSaveContent({
        type: subTypeId,
        category: activeCategory.id,
        inputs: formValues,
        savedAt: new Date().toISOString()
      });
    }

    setIsSavingInputs(false);
    setSavedInputsState(true);
    setTimeout(() => setSavedInputsState(false), 2500);
  };

  // Manual Save to Database / Customer Profile
  const [isSaving, setIsSaving] = useState(false);
  const [savedState, setSavedState] = useState(false);

  const handleManualSave = async () => {
    if (!generatedOutput || !onSaveContent) return;
    setIsSaving(true);
    await onSaveContent({
      type: activeSubType.id,
      category: activeCategory.id,
      inputs: formValues,
      output: isEditingOutput ? editedText : generatedOutput,
      createdAt: new Date().toISOString()
    });
    setIsSaving(false);
    setSavedState(true);
    setTimeout(() => setSavedState(false), 2500);
  };

  // Copy Clipboard
  const handleCopyOutput = () => {
    if (!generatedOutput) return;
    navigator.clipboard.writeText(isEditingOutput ? editedText : generatedOutput);
    setCopiedState(true);
    setTimeout(() => setCopiedState(false), 2000);
  };

  return (
    <GlassPanel tilt={false} className="border-slate-850 p-6 lg:p-8 bg-slate-950/60 space-y-8 relative overflow-hidden">
      
      {/* BACKGROUND DECORATIVE ACCENTS */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none" />

      {/* HEADER BANNER & STATS DASHBOARD */}
      <div className="space-y-6 border-b border-slate-850 pb-6 relative z-10">
        
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-gradient-to-r from-violet-500/20 to-indigo-500/20 text-violet-300 border border-violet-500/40 px-2.5 py-0.5 rounded-full font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                <Sparkles className="h-3 w-3 text-violet-400" /> Complete Campaign Taxonomy
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Integrated Studio Hub</span>
            </div>
            
            <h2 className="text-xl lg:text-2xl font-black text-white tracking-tight mt-2 flex items-center gap-3">
              <Layers className="h-6 w-6 text-violet-400" />
              Content Types & Marketing Tactics Studio
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl font-light leading-relaxed">
              Explore all <span className="text-violet-400 font-bold">20 major categories</span> and <span className="text-white font-bold">{metrics.totalOptions} selectable sub-options</span>. Click any option to load required input fields, auto-prefill ICP context, and generate campaign deliverables.
            </p>
          </div>

          {/* STAT COUNTERS BADGES */}
          <div className="grid grid-cols-3 gap-3 w-full lg:w-auto shrink-0 font-mono">
            <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-2xl text-center">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Total Options</span>
              <span className="text-lg font-black text-white">{metrics.totalOptions}</span>
            </div>
            <div className="bg-violet-950/30 border border-violet-850/60 p-3 rounded-2xl text-center">
              <span className="text-[10px] text-violet-400 font-bold uppercase block">Content Types</span>
              <span className="text-lg font-black text-violet-300">{metrics.contentTypesCount}</span>
            </div>
            <div className="bg-emerald-950/30 border border-emerald-850/60 p-3 rounded-2xl text-center">
              <span className="text-[10px] text-emerald-400 font-bold uppercase block">Marketing Tactics</span>
              <span className="text-lg font-black text-emerald-300">{metrics.marketingTacticsCount}</span>
            </div>
          </div>
        </div>

        {/* GROUP FILTER TABS & SEARCH BAR */}
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-slate-900/50 p-2.5 rounded-2xl border border-slate-850">
          
          {/* Group Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 md:pb-0">
            <button
              onClick={() => setActiveGroupFilter("all")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeGroupFilter === "all" 
                  ? "bg-violet-600 text-white shadow-lg shadow-violet-500/25 ring-1 ring-violet-400" 
                  : "text-slate-400 hover:text-white hover:bg-slate-850"
              }`}
            >
              All {metrics.totalOptions} Options
            </button>
            <button
              onClick={() => setActiveGroupFilter("content_types")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeGroupFilter === "content_types" 
                  ? "bg-violet-600 text-white shadow-lg shadow-violet-500/25 ring-1 ring-violet-400" 
                  : "text-slate-400 hover:text-white hover:bg-slate-850"
              }`}
            >
              <Grid className="h-3.5 w-3.5 text-violet-300" /> 
              Content Types ({metrics.contentTypesCount})
            </button>
            <button
              onClick={() => setActiveGroupFilter("marketing_tactics")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeGroupFilter === "marketing_tactics" 
                  ? "bg-violet-600 text-white shadow-lg shadow-violet-500/25 ring-1 ring-violet-400" 
                  : "text-slate-400 hover:text-white hover:bg-slate-850"
              }`}
            >
              <Target className="h-3.5 w-3.5 text-emerald-400" /> 
              Marketing Tactics ({metrics.marketingTacticsCount})
            </button>
          </div>

          {/* Search & Collapse Controls */}
          <div className="flex items-center gap-2">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search across all options..."
                className="bg-slate-950 border-slate-800 text-xs pl-9 py-1.5 h-9 rounded-xl focus:border-violet-500"
              />
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => handleToggleExpandAll(true)}
                className="text-[10px] bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-white border border-slate-800 px-2 py-1.5 rounded-lg font-mono"
                title="Expand All Categories"
              >
                Expand All
              </button>
              <button
                onClick={() => handleToggleExpandAll(false)}
                className="text-[10px] bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-white border border-slate-800 px-2 py-1.5 rounded-lg font-mono"
                title="Collapse All Categories"
              >
                Collapse All
              </button>
            </div>
          </div>

        </div>

        {/* 20 CATEGORY QUICK JUMP MATRIX CHIPS */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono flex items-center gap-1.5">
            <Sliders className="h-3 w-3 text-violet-400" /> Quick Jump Category Matrix (20 Major Categories)
          </span>
          <div className="flex flex-wrap gap-1.5">
            {filteredCategories.map(cat => {
              const isSelected = selectedCategoryId === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategoryId(cat.id);
                    setSelectedSubTypeId(cat.subTypes[0]?.id || "");
                    setExpandedCategories(prev => ({ ...prev, [cat.id]: true }));
                  }}
                  className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1.5 ${
                    isSelected 
                      ? "bg-violet-600 text-white border-violet-400 shadow-md shadow-violet-500/20" 
                      : "bg-slate-900/60 text-slate-400 border-slate-850 hover:border-slate-750 hover:text-slate-200"
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${isSelected ? "bg-white" : "bg-violet-400"}`} />
                  {cat.title}
                  <span className="opacity-60 font-normal">({cat.subTypes.length})</span>
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* MAIN SPLIT WORKSPACE: LEFT HIERARCHICAL TREE (5/12) & RIGHT DYNAMIC STUDIO (7/12) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
        
        {/* LEFT COLUMN: HIERARCHICAL TAXONOMY BROWSER (5/12) */}
        <div className="lg:col-span-5 space-y-4 bg-slate-900/40 border border-slate-850 rounded-2xl p-4 lg:p-5">
          <div className="flex justify-between items-center px-1 pb-3 border-b border-slate-850/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
              <Filter className="h-3.5 w-3.5 text-violet-400" /> 
              Options Taxonomy Browser
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              {filteredCategories.reduce((acc, c) => acc + c.subTypes.length, 0)} Active Options
            </span>
          </div>

          <div className="space-y-3.5 max-h-[720px] overflow-y-auto pr-1.5 custom-scrollbar">
            {filteredCategories.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 bg-slate-950/40 rounded-xl border border-slate-900">
                No matching categories or sub-options found for &quot;{searchQuery}&quot;
              </div>
            ) : (
              filteredCategories.map((category) => {
                const IconComp: any = category.icon;
                const isExpanded = expandedCategories[category.id] !== false;

                return (
                  <div key={category.id} className="space-y-1.5">
                    
                    {/* Category Header */}
                    <button
                      onClick={() => toggleCategoryExpand(category.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all duration-200 ${
                        selectedCategoryId === category.id 
                          ? "bg-slate-850/80 border-slate-700 text-white shadow-md shadow-violet-950/30" 
                          : "bg-slate-950/40 border-slate-900 text-slate-300 hover:border-slate-800 hover:bg-slate-900/60"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 shrink-0">
                          <IconComp className="h-4 w-4 text-violet-400" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-bold truncate tracking-tight block text-white">{category.title}</span>
                          <span className="text-[9px] text-slate-500 font-mono block uppercase">
                            {category.typeGroup === "marketing_tactics" ? "Marketing Tactic" : "Content Type Asset"}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-md border ${category.badgeColor}`}>
                          {category.subTypes.length} options
                        </span>
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-slate-500" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-slate-500" />
                        )}
                      </div>
                    </button>

                    {/* Indented Options Tree */}
                    {isExpanded && (
                      <div className="pl-4 ml-3.5 space-y-1.5 border-l-2 border-slate-800/80 pt-1 pb-1">
                        {category.subTypes.map((subType) => {
                          const isSelected = selectedCategoryId === category.id && selectedSubTypeId === subType.id;

                          return (
                            <button
                              key={subType.id}
                              onClick={() => {
                                setSelectedCategoryId(category.id);
                                setSelectedSubTypeId(subType.id);
                              }}
                              className={`w-full text-left p-3 rounded-xl border text-xs transition-all duration-200 group relative flex flex-col gap-1.5 ${
                                isSelected
                                  ? "bg-gradient-to-r from-violet-950/70 via-slate-900 to-slate-900 border-violet-500/70 text-white shadow-lg shadow-violet-500/10 ring-1 ring-violet-500/40"
                                  : "bg-slate-950/20 border-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 hover:border-slate-800"
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-bold text-xs flex items-center gap-1.5 truncate">
                                  {isSelected ? (
                                    <CheckCircle2 className="h-3.5 w-3.5 text-violet-400 shrink-0" />
                                  ) : (
                                    <span className="h-1.5 w-1.5 rounded-full bg-slate-700 shrink-0 group-hover:bg-violet-400" />
                                  )}
                                  {subType.title}
                                </span>
                                <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border shrink-0 ${
                                  isSelected ? "bg-violet-500/20 text-violet-300 border-violet-400/40 font-bold" : "bg-slate-900 text-slate-500 border-slate-850"
                                }`}>
                                  {subType.badge}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 font-light line-clamp-1 group-hover:text-slate-400">
                                {subType.description}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    )}

                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: DYNAMIC STUDIO GENERATOR & OUTPUT WORKSPACE (7/12) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* BREADCRUMB NAV & ACTIVE OPTION HEADER */}
          <div className="bg-slate-900/60 border border-slate-850 p-6 rounded-2xl space-y-3 relative overflow-hidden">
            <div className="flex justify-between items-center flex-wrap gap-2 text-xs font-mono text-slate-400 border-b border-slate-850 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Taxonomy Path:</span>
                <span className="text-violet-400 font-bold uppercase">{activeCategory.typeGroup.replace("_", " ")}</span>
                <span>/</span>
                <span className="text-slate-300 font-bold">{activeCategory.title}</span>
                <span>/</span>
                <span className="text-white font-bold underline decoration-violet-500">{activeSubType.title}</span>
              </div>

              <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${activeCategory.badgeColor}`}>
                {activeSubType.badge}
              </span>
            </div>

            <div className="flex justify-between items-start flex-wrap gap-4">
              <div className="space-y-1 max-w-xl">
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  Option Deliverable: {activeSubType.title}
                </h3>
                <p className="text-xs text-slate-400 font-light leading-relaxed">
                  {activeSubType.description}
                </p>
              </div>

              <button
                type="button"
                onClick={handleManualSaveInputs}
                disabled={isSavingInputs}
                className="bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/40 text-violet-200 text-xs font-bold py-1.5 px-3.5 rounded-xl flex items-center gap-1.5 transition-all shrink-0"
              >
                {isSavingInputs ? (
                  <><Loader2 className="h-3.5 w-3.5 animate-spin text-violet-400" /> Saving...</>
                ) : savedInputsState ? (
                  <><Check className="h-3.5 w-3.5 text-emerald-400" /> Saved Option Deliverable!</>
                ) : (
                  <><Bookmark className="h-3.5 w-3.5 text-violet-400" /> Save Option Deliverable</>
                )}
              </button>
            </div>
          </div>

          {/* VALIDATION ERROR ALERT BANNER */}
          {formTouched && Object.keys(fieldErrors).length > 0 && (
            <div className="bg-red-500/10 border border-red-500/40 rounded-2xl p-4 flex items-start gap-3 animate-in fade-in duration-200">
              <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h5 className="text-xs font-bold text-red-300">Mandatory Data Missing</h5>
                <p className="text-[11px] text-red-400/90 font-light">
                  Please complete all required fields highlighted in red below to generate campaign content for this option.
                </p>
              </div>
            </div>
          )}

          {/* DYNAMIC FORM INPUTS */}
          <form onSubmit={handleInitiateGeneration} className="bg-slate-900/30 border border-slate-850 p-6 rounded-2xl space-y-6">
            
            <div className="grid grid-cols-1 gap-5">
              {activeSubType.fields.map((field) => {
                const hasError = !!fieldErrors[field.id];
                const rawVal = formValues[field.id] ?? "";
                const maxLen = field.maxLength ?? (field.type === "textarea" ? 2000 : 300);
                const isOverLimit = rawVal.length > maxLen;
                const isNearLimit = rawVal.length >= maxLen * 0.9 && !isOverLimit;

                return (
                  <div key={field.id} className="space-y-2">
                    <div className="flex justify-between items-center flex-wrap gap-1">
                      <Label className="text-xs font-bold text-slate-200 flex items-center gap-1">
                        {field.label}
                        {field.required && <span className="text-red-400 font-bold">*</span>}
                      </Label>
                      
                      <div className="flex items-center gap-2">
                        {field.helperText && (
                          <span className="text-[10px] text-slate-500 font-light">{field.helperText}</span>
                        )}
                        
                        {(field.type === "text" || field.type === "textarea") && (
                          <span className={`text-[10px] font-mono font-medium px-1.5 py-0.5 rounded border transition-colors ${
                            isOverLimit
                              ? "bg-red-500/10 text-red-400 border-red-500/40 font-bold"
                              : isNearLimit
                              ? "bg-amber-500/10 text-amber-300 border-amber-500/40"
                              : "bg-slate-900 text-slate-500 border-slate-800"
                          }`}>
                            {rawVal.length} / {maxLen}
                          </span>
                        )}
                      </div>
                    </div>

                    {field.type === "text" && (
                      <Input
                        value={rawVal}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        onBlur={() => handleInputBlur(field.id)}
                        placeholder={field.placeholder}
                        className={`bg-slate-950/80 border text-xs py-2.5 h-10 rounded-xl text-slate-100 placeholder:text-slate-600 transition-colors ${
                          hasError || isOverLimit ? "border-red-500/80 focus:border-red-400 ring-1 ring-red-500/20" : "border-slate-800 focus:border-violet-500"
                        }`}
                      />
                    )}

                    {field.type === "textarea" && (
                      <textarea
                        rows={3}
                        value={rawVal}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        onBlur={() => handleInputBlur(field.id)}
                        placeholder={field.placeholder}
                        className={`w-full bg-slate-950/80 border text-xs p-3 rounded-xl text-slate-100 placeholder:text-slate-600 focus:outline-none transition-colors ${
                          hasError || isOverLimit ? "border-red-500/80 focus:border-red-400 ring-1 ring-red-500/20" : "border-slate-800 focus:border-violet-500"
                        }`}
                      />
                    )}

                    {field.type === "select" && (
                      <select
                        value={formValues[field.id] ?? field.defaultValue ?? ""}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        onBlur={() => handleInputBlur(field.id)}
                        className={`w-full bg-slate-950 border text-xs px-3 py-2.5 h-10 rounded-xl text-slate-200 focus:outline-none transition-colors ${
                          hasError ? "border-red-500/80" : "border-slate-800 focus:border-violet-500"
                        }`}
                      >
                        {field.options?.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    )}

                    {hasError && (
                      <p className="text-[10px] text-red-400 font-semibold flex items-center gap-1 mt-0.5">
                        <AlertCircle className="h-3 w-3 shrink-0" /> {fieldErrors[field.id]}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* FORM FOOTER ACTION BUTTONS */}
            <div className="pt-4 border-t border-slate-850 flex justify-between items-center flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  const resetVals: Record<string, string> = {};
                  activeSubType.fields.forEach(f => resetVals[f.id] = f.defaultValue || "");
                  setFormValues(resetVals);
                  formValuesMapRef.current[selectedSubTypeId] = resetVals;
                  setFieldErrors({});
                  setFormTouched(false);
                }}
                className="text-xs text-slate-400 hover:text-slate-200 font-semibold font-mono"
              >
                Reset Fields
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleManualSaveInputs}
                  disabled={isSavingInputs}
                  className="bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-200 hover:text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center gap-1.5 transition-all shadow-md"
                >
                  {isSavingInputs ? (
                    <><Loader2 className="h-3.5 w-3.5 animate-spin text-violet-400" /> Saving...</>
                  ) : savedInputsState ? (
                    <><Check className="h-3.5 w-3.5 text-emerald-400" /> Saved Option Deliverable!</>
                  ) : (
                    <><Bookmark className="h-3.5 w-3.5 text-violet-400" /> Save Option Deliverable</>
                  )}
                </button>

                <ExtrudedButton
                  type="submit"
                  disabled={isGenerating}
                  className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs py-3 px-7 rounded-xl shadow-lg shadow-indigo-500/20 inline-flex items-center gap-2"
                >
                  {isGenerating ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Generating Deliverable...</>
                  ) : (
                    <><Sparkles className="h-4 w-4" /> Generate {activeSubType.title}</>
                  )}
                </ExtrudedButton>
              </div>
            </div>
          </form>

          {/* GENERATION PROGRESS INDICATOR */}
          {isGenerating && (
            <div className="bg-slate-900/60 border border-slate-800 p-8 rounded-2xl text-center space-y-4 animate-in fade-in duration-200">
              <Loader2 className="h-8 w-8 animate-spin text-violet-400 mx-auto" />
              <h5 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Multi-Agent Content & Tactic Engine Running</h5>
              <div className="max-w-xs mx-auto h-2 bg-slate-950 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="h-full bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-500 transition-all duration-300"
                  style={{ width: `${generationProgress}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">{generationStage}</p>
            </div>
          )}

          {/* GENERATED OUTPUT PREVIEW PANEL */}
          {generatedOutput && !isGenerating && (
            <div className="bg-slate-900/40 border border-violet-500/40 p-6 lg:p-8 rounded-2xl space-y-5 shadow-xl shadow-violet-950/20 animate-in fade-in slide-in-from-bottom-2 duration-300">
              
              {/* Output Header Toolbar */}
              <div className="flex justify-between items-center border-b border-slate-850 pb-4 flex-wrap gap-3">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  <div>
                    <h5 className="text-xs font-extrabold text-white uppercase tracking-wider">Generated Option Deliverable</h5>
                    <span className="text-[10px] text-slate-400 font-mono">Deliverable Ready</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsEditingOutput(!isEditingOutput)}
                    className="text-[11px] bg-slate-950 hover:bg-slate-900 border border-slate-850 text-slate-300 font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1.5"
                  >
                    <Edit3 className="h-3.5 w-3.5 text-violet-400" />
                    {isEditingOutput ? "Preview Markdown" : "Edit Copy"}
                  </button>

                  <button
                    onClick={handleCopyOutput}
                    className="text-[11px] bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-200 font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5"
                  >
                    {copiedState ? (
                      <><Check className="h-3.5 w-3.5 text-emerald-400" /> Copied!</>
                    ) : (
                      <><Copy className="h-3.5 w-3.5 text-slate-400" /> Copy Content</>
                    )}
                  </button>

                  {onSaveContent && (
                    <button
                      onClick={handleManualSave}
                      disabled={isSaving}
                      className="text-[11px] bg-violet-600 hover:bg-violet-500 text-white font-bold px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow-md shadow-violet-500/20"
                    >
                      {isSaving ? (
                        <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving...</>
                      ) : savedState ? (
                        <><Check className="h-3.5 w-3.5 text-white" /> Saved to Profile!</>
                      ) : (
                        <><Bookmark className="h-3.5 w-3.5" /> Save to Profile</>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Output Display Area */}
              {isEditingOutput ? (
                <textarea
                  rows={16}
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-xs font-mono p-4 rounded-xl text-slate-200 focus:outline-none focus:border-violet-500"
                />
              ) : (
                <div className="bg-slate-950/90 border border-slate-850 rounded-xl p-5 text-xs text-slate-200 font-mono whitespace-pre-line leading-relaxed max-h-[550px] overflow-y-auto custom-scrollbar">
                  {editedText}
                </div>
              )}

              {/* Output Footer */}
              <div className="flex justify-between items-center text-[10px] text-slate-500 pt-2 font-mono border-t border-slate-850/60">
                <span>Format: Markdown / Plain Text</span>
                <span>Target Brand: {customerName}</span>
              </div>
            </div>
          )}

        </div>

      </div>

    </GlassPanel>
  );
}
