'use client'

import React, { useState } from 'react'
import {
  LayoutDashboard,
  TrendingUp,
  Users,
  FileText,
  Settings,
  Bell,
  Search,
  Plus,
  MoreHorizontal,
  Target,
  Zap,
  Filter,
  Calendar,
  Mail,
  Phone,
  CheckCircle,
  Clock,
  ArrowRight,
  PieChart,
  BarChart3,
  Activity,
  UserPlus,
  FileSearch,
  FileSpreadsheet,
  BarChart2,
  TrendingDown,
  CheckCircle2,
  Rocket,
  MessageSquare,
  Video,
  Smartphone
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Sample data for demonstration
const deals = [
  {
    id: '1',
    company: 'Stark Industries',
    contact: 'Tony Stark',
    value: 250000,
    stage: 'proposal',
    lastActivity: '2 days ago',
    avatar: 'SI'
  },
  {
    id: '2',
    company: 'Wayne Enterprises',
    contact: 'Bruce Wayne',
    value: 450000,
    stage: 'negotiation',
    lastActivity: '5 hours ago',
    avatar: 'WE'
  },
  {
    id: '3',
    company: 'Wakanda Industries',
    contact: "T'Challa",
    value: 800000,
    stage: 'closed-won',
    lastActivity: '1 week ago',
    avatar: 'WI'
  }
]

const stages = [
  { id: 'lead', label: 'Lead', color: 'text-gray-400 bg-gray-900' },
  { id: 'qualification', label: 'Qualification', color: 'text-blue-400 bg-blue-900/30' },
  { id: 'proposal', label: 'Proposal', color: 'text-purple-400 bg-purple-900/30' },
  { id: 'negotiation', label: 'Negotiation', color: 'text-orange-400 bg-orange-900/30' },
  { id: 'closed-won', label: 'Closed Won', color: 'text-green-400 bg-green-900/30' },
  { id: 'closed-lost', label: 'Closed Lost', color: 'text-red-400 bg-red-900/30' }
]

const contentAssets = [
  {
    id: '1',
    title: 'Enterprise Cold Email Template',
    type: 'Email',
    performance: 85,
    lastModified: '2024-01-15',
    tags: ['Enterprise', 'Cold Outreach']
  },
  {
    id: '2',
    title: 'Product One-Pager',
    type: 'Document',
    performance: 92,
    lastModified: '2024-01-10',
    tags: ['Sales Enablement']
  },
  {
    id: '3',
    title: 'Case Study - TechCorp',
    type: 'PDF',
    performance: 78,
    lastModified: '2024-01-05',
    tags: ['Case Study', 'Tech']
  }
]

const marketingTactics = [
  {
    id: '1',
    name: 'LinkedIn Outreach',
    status: 'active',
    reach: 2500,
    engagement: 12.5,
    leads: 45,
    budget: 5000
  },
  {
    id: '2',
    name: 'Email Campaign',
    status: 'active',
    reach: 10000,
    engagement: 8.2,
    leads: 120,
    budget: 3000
  },
  {
    id: '3',
    name: 'Webinar Series',
    status: 'draft',
    reach: 0,
    engagement: 0,
    leads: 0,
    budget: 8000
  }
]

const categories = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, color: 'text-blue-400' },
  { id: 'deals', label: 'Deals', icon: TrendingUp, color: 'text-green-400' },
  { id: 'marketing-intake', label: 'Marketing Intake', icon: FileSearch, color: 'text-cyan-400' },
  { id: 'marketing-profile', label: 'Marketing Profile', icon: FileSpreadsheet, color: 'text-emerald-400' },
  { id: 'content', label: 'Content', icon: FileText, color: 'text-purple-400' },
  { id: 'tactics', label: 'Tactics', icon: Target, color: 'text-orange-400' },
  { id: 'contacts', label: 'Contacts', icon: Users, color: 'text-pink-400' },
  { id: 'settings', label: 'Settings', icon: Settings, color: 'text-gray-400' }
]

export default function WorkspaceContent() {
  const [selectedCategory, setSelectedCategory] = useState(categories[0])
  const [searchQuery, setSearchQuery] = useState('')
  const [formStep, setFormStep] = useState(1)
  const [marketingIntakeData, setMarketingIntakeData] = useState({
    businessInfo: {
      officialBusinessName: '',
      primaryWebsiteUrl: '',
      industryVertical: '',
      businessType: 'B2B' as const,
      companySize: { numberOfEmployees: '', revenueBracket: '' },
      coreProductServiceName: '',
      productServiceDescription: '',
      uniqueValueProposition: '',
      pricingModel: '',
      targetMarket: '',
      targetCountries: [] as string[],
      targetLanguages: [] as string[]
    },
    customerInfo: {
      idealCustomerProfile: '',
      buyerPersonas: '',
      keyDecisionMakers: '',
      customerPainPoints: '',
      customerChallenges: '',
      buyingTriggers: '',
      commonObjections: ''
    },
    marketingInfo: {
      primaryBusinessGoal: '',
      measurableMarketingObjectives: '',
      currentMarketingChannels: [] as string[],
      existingMarketingAssets: '',
      competitors: '',
      primaryKeywords: '',
      longTailKeywords: '',
      brandTone: '',
      brandVoice: '',
      marketingBudget: '',
      salesCycleLength: ''
    }
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [marketingProfile, setMarketingProfile] = useState<any>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-200">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <div className="flex h-16 items-center border-b border-slate-800 px-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              DealFlow
            </span>
          </div>
        </div>

        <nav className="space-y-1 p-4">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                selectedCategory.id === category.id
                  ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 text-white shadow-lg shadow-blue-500/10'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent hover:border-slate-700'
              )}
            >
              <category.icon className="h-5 w-5" />
              <span className="font-medium">{category.label}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-bold">
              JD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">Jane Doe</p>
              <p className="text-xs text-slate-500 truncate">Sales Manager</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 border-b border-slate-800 bg-slate-900/30 backdrop-blur-sm flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search deals, contacts, or content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 w-96 rounded-xl border border-slate-700 bg-slate-900 pl-10 pr-4 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-all">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500"></span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:from-blue-500 hover:to-purple-500 transition-all shadow-lg shadow-blue-500/20">
              <Plus className="h-4 w-4" />
              <span>New Deal</span>
            </button>
          </div>
        </header>

        {/* Content area */}
        <div className="flex-1 overflow-auto p-6">
          {/* Category Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">
                  {selectedCategory.label}
                </h1>
                <p className="text-slate-400">
                  Manage your {selectedCategory.label.toLowerCase()} and track performance
                </p>
              </div>
            </div>
          </div>

          {/* Overview Dashboard */}
          {selectedCategory.id === 'overview' && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="Total Revenue"
                  value="$1.5M"
                  change="+24%"
                  positive={true}
                  icon={TrendingUp}
                />
                <StatCard
                  title="Active Deals"
                  value="24"
                  change="+5"
                  positive={true}
                  icon={Target}
                />
                <StatCard
                  title="Conversion Rate"
                  value="32%"
                  change="+8%"
                  positive={true}
                  icon={CheckCircle}
                />
                <StatCard
                  title="Pipeline Value"
                  value="$4.2M"
                  change="+12%"
                  positive={true}
                  icon={PieChart}
                />
              </div>

              {/* Recent Deals and Performance */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Recent Deals</h3>
                    <div className="space-y-4">
                      {deals.map((deal) => (
                        <DealCard key={deal.id} deal={deal} />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Stage Overview</h3>
                  <div className="space-y-3">
                    {stages.map((stage) => (
                      <div key={stage.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={cn('px-2 py-1 rounded-lg text-xs font-medium', stage.color)}>
                            {stage.label}
                          </span>
                        </div>
                        <span className="text-slate-400 text-sm">5 deals</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Deals Pipeline */}
          {selectedCategory.id === 'deals' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-sm">
                    <Filter className="h-4 w-4" />
                    Filter
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-sm">
                    <Calendar className="h-4 w-4" />
                    Timeline
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {stages.map((stage) => (
                  <div key={stage.id} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={cn('px-3 py-1 rounded-lg text-xs font-semibold', stage.color)}>
                        {stage.label}
                      </span>
                      <span className="text-slate-500 text-sm">5</span>
                    </div>
                    <div className="space-y-3">
                      {deals.map((deal) => (
                        <div
                          key={deal.id}
                          className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                              {deal.avatar}
                            </div>
                            <span className="text-xs text-slate-500">{deal.lastActivity}</span>
                          </div>
                          <p className="font-medium text-white mb-1">{deal.company}</p>
                          <p className="text-sm text-slate-400 mb-3">{deal.contact}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-green-400">
                              ${deal.value.toLocaleString()}
                            </span>
                            <button className="p-1.5 text-slate-500 hover:text-slate-300">
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Content Assets */}
          {selectedCategory.id === 'content' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {contentAssets.map((asset) => (
                  <div
                    key={asset.id}
                    className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/30 transition-all hover:shadow-lg hover:shadow-blue-500/5"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
                        <FileText className="h-6 w-6" />
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-medium text-slate-500">
                          {asset.type}
                        </span>
                      </div>
                    </div>
                    <h3 className="font-semibold text-white mb-2">{asset.title}</h3>
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-slate-400">Performance Score</span>
                          <span className="text-green-400 font-medium">{asset.performance}%</span>
                        </div>
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                            style={{ width: `${asset.performance}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {asset.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 rounded-lg text-xs bg-slate-800 text-slate-400"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <p className="text-xs text-slate-500">
                        Last modified: {asset.lastModified}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Marketing Intake */}
          {selectedCategory.id === 'marketing-intake' && (
            <div className="space-y-6">
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-white">Marketing Strategy Intake Form</h2>
                  <div className="flex gap-2">
                    {[1,2,3].map(step => (
                      <div 
                        key={step}
                        onClick={() => setFormStep(step)}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer transition-all ${
                          formStep === step
                            ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                      >
                        Step {step}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-6">
                  {/* Step 1: Business Info */}
                  {formStep === 1 && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-4 lg:col-span-2">
                        <h3 className="text-lg font-semibold text-cyan-400 flex items-center gap-2">
                          <FileText className="h-5 w-5" /> Business Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-300">Official Business Name</label>
                            <input 
                              type="text" 
                              value={marketingIntakeData.businessInfo.officialBusinessName}
                              onChange={(e) => setMarketingIntakeData(prev => ({
                                ...prev,
                                businessInfo: { ...prev.businessInfo, officialBusinessName: e.target.value }
                              }))}
                              className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                              placeholder="Acme Corporation"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-300">Primary Website URL</label>
                            <input 
                              type="url" 
                              value={marketingIntakeData.businessInfo.primaryWebsiteUrl}
                              onChange={(e) => setMarketingIntakeData(prev => ({
                                ...prev,
                                businessInfo: { ...prev.businessInfo, primaryWebsiteUrl: e.target.value }
                              }))}
                              className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                              placeholder="https://acme.com"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-300">Industry Vertical</label>
                            <input 
                              type="text" 
                              value={marketingIntakeData.businessInfo.industryVertical}
                              onChange={(e) => setMarketingIntakeData(prev => ({
                                ...prev,
                                businessInfo: { ...prev.businessInfo, industryVertical: e.target.value }
                              }))}
                              className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                              placeholder="e.g., SaaS, Healthcare, Fintech"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-300">Business Type</label>
                            <select
                              value={marketingIntakeData.businessInfo.businessType}
                              onChange={(e) => setMarketingIntakeData(prev => ({
                                ...prev,
                                businessInfo: { 
                                  ...prev.businessInfo, 
                                  businessType: e.target.value as any
                                }
                              }))}
                              className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                            >
                              <option value="B2B">B2B</option>
                              <option value="B2C">B2C</option>
                              <option value="D2C">D2C</option>
                              <option value="eCommerce">eCommerce</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-300">Number of Employees</label>
                            <input 
                              type="text" 
                              value={marketingIntakeData.businessInfo.companySize.numberOfEmployees}
                              onChange={(e) => setMarketingIntakeData(prev => ({
                                ...prev,
                                businessInfo: {
                                  ...prev.businessInfo,
                                  companySize: {
                                    ...prev.businessInfo.companySize,
                                    numberOfEmployees: e.target.value
                                  }
                                }
                              }))}
                              className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                              placeholder="e.g., 1-10, 11-50, 51-200"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-300">Revenue Bracket</label>
                            <input 
                              type="text" 
                              value={marketingIntakeData.businessInfo.companySize.revenueBracket}
                              onChange={(e) => setMarketingIntakeData(prev => ({
                                ...prev,
                                businessInfo: {
                                  ...prev.businessInfo,
                                  companySize: {
                                    ...prev.businessInfo.companySize,
                                    revenueBracket: e.target.value
                                  }
                                }
                              }))}
                              className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                              placeholder="e.g., $0-1M, $1M-$5M"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-slate-300">Core Product/Service Name</label>
                          <input 
                            type="text" 
                            value={marketingIntakeData.businessInfo.coreProductServiceName}
                            onChange={(e) => setMarketingIntakeData(prev => ({
                              ...prev,
                              businessInfo: { ...prev.businessInfo, coreProductServiceName: e.target.value }
                            }))}
                            className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                            placeholder="Acme Sales Tool"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-slate-300">Detailed Product/Service Description</label>
                          <textarea
                            value={marketingIntakeData.businessInfo.productServiceDescription}
                            onChange={(e) => setMarketingIntakeData(prev => ({
                              ...prev,
                              businessInfo: { ...prev.businessInfo, productServiceDescription: e.target.value }
                            }))}
                            className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 min-h-[120px]"
                            placeholder="What does your product or service do? What are core functionalities/use cases?"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-slate-300">Formal Unique Value Proposition (UVP)</label>
                          <textarea
                            value={marketingIntakeData.businessInfo.uniqueValueProposition}
                            onChange={(e) => setMarketingIntakeData(prev => ({
                              ...prev,
                              businessInfo: { ...prev.businessInfo, uniqueValueProposition: e.target.value }
                            }))}
                            className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 min-h-[80px]"
                            placeholder="What makes you unique?"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-slate-300">Current Pricing Model</label>
                          <input 
                            type="text" 
                            value={marketingIntakeData.businessInfo.pricingModel}
                            onChange={(e) => setMarketingIntakeData(prev => ({
                              ...prev,
                              businessInfo: { ...prev.businessInfo, pricingModel: e.target.value }
                            }))}
                            className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                            placeholder="Subscription, one-time, freemium, tiered, etc."
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-slate-300">Defined Target Market</label>
                          <textarea
                            value={marketingIntakeData.businessInfo.targetMarket}
                            onChange={(e) => setMarketingIntakeData(prev => ({
                              ...prev,
                              businessInfo: { ...prev.businessInfo, targetMarket: e.target.value }
                            }))}
                            className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 min-h-[80px]"
                            placeholder="Demographics, firmographics, etc."
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Customer Info */}
                  {formStep === 2 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-purple-400 flex items-center gap-2">
                        <Users className="h-5 w-5" /> Customer Information
                      </h3>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-300">Formal Ideal Customer Profile (ICP)</label>
                        <textarea
                          value={marketingIntakeData.customerInfo.idealCustomerProfile}
                          onChange={(e) => setMarketingIntakeData(prev => ({
                            ...prev,
                            customerInfo: { ...prev.customerInfo, idealCustomerProfile: e.target.value }
                          }))}
                          className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 min-h-[100px]"
                          placeholder="Who is your ideal customer?"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-300">Documented Buyer Personas</label>
                        <textarea
                          value={marketingIntakeData.customerInfo.buyerPersonas}
                          onChange={(e) => setMarketingIntakeData(prev => ({
                            ...prev,
                            customerInfo: { ...prev.customerInfo, buyerPersonas: e.target.value }
                          }))}
                          className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 min-h-[100px]"
                          placeholder="Include demographics, psychographics, behaviors, etc."
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-300">Key Decision Makers in Buying Process</label>
                        <textarea
                          value={marketingIntakeData.customerInfo.keyDecisionMakers}
                          onChange={(e) => setMarketingIntakeData(prev => ({
                            ...prev,
                            customerInfo: { ...prev.customerInfo, keyDecisionMakers: e.target.value }
                          }))}
                          className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 min-h-[80px]"
                          placeholder="Who makes the decisions?"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-300">Verified Customer Pain Points</label>
                        <textarea
                          value={marketingIntakeData.customerInfo.customerPainPoints}
                          onChange={(e) => setMarketingIntakeData(prev => ({
                            ...prev,
                            customerInfo: { ...prev.customerInfo, customerPainPoints: e.target.value }
                          }))}
                          className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 min-h-[80px]"
                          placeholder="What pain points do you solve?"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-300">Core Customer Challenges Preventing Purchase</label>
                        <textarea
                          value={marketingIntakeData.customerInfo.customerChallenges}
                          onChange={(e) => setMarketingIntakeData(prev => ({
                            ...prev,
                            customerInfo: { ...prev.customerInfo, customerChallenges: e.target.value }
                          }))}
                          className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 min-h-[80px]"
                          placeholder="What stops customers from buying?"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-300">Confirmed Buying Triggers</label>
                        <textarea
                          value={marketingIntakeData.customerInfo.buyingTriggers}
                          onChange={(e) => setMarketingIntakeData(prev => ({
                            ...prev,
                            customerInfo: { ...prev.customerInfo, buyingTriggers: e.target.value }
                          }))}
                          className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 min-h-[80px]"
                          placeholder="What drives customers to look for your solution?"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-300">Common Customer Objections</label>
                        <textarea
                          value={marketingIntakeData.customerInfo.commonObjections}
                          onChange={(e) => setMarketingIntakeData(prev => ({
                            ...prev,
                            customerInfo: { ...prev.customerInfo, commonObjections: e.target.value }
                          }))}
                          className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 min-h-[80px]"
                          placeholder="What objections do you face?"
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 3: Marketing Info */}
                  {formStep === 3 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-emerald-400 flex items-center gap-2">
                        <BarChart2 className="h-5 w-5" /> Marketing Information
                      </h3>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-300">Primary Business Goal for Next 12 Months</label>
                        <textarea
                          value={marketingIntakeData.marketingInfo.primaryBusinessGoal}
                          onChange={(e) => setMarketingIntakeData(prev => ({
                            ...prev,
                            marketingInfo: { ...prev.marketingInfo, primaryBusinessGoal: e.target.value }
                          }))}
                          className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 min-h-[80px]"
                          placeholder="Revenue, customers, etc."
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-300">Measurable Marketing Objectives</label>
                        <textarea
                          value={marketingIntakeData.marketingInfo.measurableMarketingObjectives}
                          onChange={(e) => setMarketingIntakeData(prev => ({
                            ...prev,
                            marketingInfo: { ...prev.marketingInfo, measurableMarketingObjectives: e.target.value }
                          }))}
                          className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 min-h-[80px]"
                          placeholder="E.g., Increase leads by 30% in 6 months"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-300">Existing Marketing Assets</label>
                        <textarea
                          value={marketingIntakeData.marketingInfo.existingMarketingAssets}
                          onChange={(e) => setMarketingIntakeData(prev => ({
                            ...prev,
                            marketingInfo: { ...prev.marketingInfo, existingMarketingAssets: e.target.value }
                          }))}
                          className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 min-h-[80px]"
                          placeholder="Content, creative, tools, etc."
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-300">Direct and Indirect Competitors</label>
                        <textarea
                          value={marketingIntakeData.marketingInfo.competitors}
                          onChange={(e) => setMarketingIntakeData(prev => ({
                            ...prev,
                            marketingInfo: { ...prev.marketingInfo, competitors: e.target.value }
                          }))}
                          className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 min-h-[80px]"
                          placeholder="Who are your competitors?"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-slate-300">Primary Keywords</label>
                          <textarea
                            value={marketingIntakeData.marketingInfo.primaryKeywords}
                            onChange={(e) => setMarketingIntakeData(prev => ({
                              ...prev,
                              marketingInfo: { ...prev.marketingInfo, primaryKeywords: e.target.value }
                            }))}
                            className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 min-h-[80px]"
                            placeholder="Keywords you target"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-slate-300">Long-Tail Keywords</label>
                          <textarea
                            value={marketingIntakeData.marketingInfo.longTailKeywords}
                            onChange={(e) => setMarketingIntakeData(prev => ({
                              ...prev,
                              marketingInfo: { ...prev.marketingInfo, longTailKeywords: e.target.value }
                            }))}
                            className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 min-h-[80px]"
                            placeholder="Expanded, specific keywords"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-300">Brand Tone Guidelines</label>
                        <textarea
                          value={marketingIntakeData.marketingInfo.brandTone}
                          onChange={(e) => setMarketingIntakeData(prev => ({
                            ...prev,
                            marketingInfo: { ...prev.marketingInfo, brandTone: e.target.value }
                          }))}
                          className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 min-h-[80px]"
                          placeholder="Professional, fun, casual, etc."
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-300">Brand Voice Parameters</label>
                        <textarea
                          value={marketingIntakeData.marketingInfo.brandVoice}
                          onChange={(e) => setMarketingIntakeData(prev => ({
                            ...prev,
                            marketingInfo: { ...prev.marketingInfo, brandVoice: e.target.value }
                          }))}
                          className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 min-h-[80px]"
                          placeholder="How do you speak to your audience?"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-slate-300">Marketing Budget</label>
                          <input 
                            type="text" 
                            value={marketingIntakeData.marketingInfo.marketingBudget}
                            onChange={(e) => setMarketingIntakeData(prev => ({
                              ...prev,
                              marketingInfo: { ...prev.marketingInfo, marketingBudget: e.target.value }
                            }))}
                            className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                            placeholder="Annual/quarterly budget"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-slate-300">Average Sales Cycle Length</label>
                          <input 
                            type="text" 
                            value={marketingIntakeData.marketingInfo.salesCycleLength}
                            onChange={(e) => setMarketingIntakeData(prev => ({
                              ...prev,
                              marketingInfo: { ...prev.marketingInfo, salesCycleLength: e.target.value }
                            }))}
                            className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                            placeholder="E.g., 2 weeks, 3 months"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                {/* Footer Actions */}
                <div className="p-6 border-t border-slate-800 flex justify-between">
                  <button 
                    disabled={formStep === 1}
                    onClick={() => setFormStep(prev => Math.max(1, prev - 1))}
                    className="px-6 py-3 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                  >
                    Back
                  </button>
                  {formStep === 3 ? (
                    <button 
                      onClick={() => {
                        setIsGenerating(true)
                        setTimeout(() => {
                          setMarketingProfile({
                            businessSummary: "This is a sample business summary based on the provided info.",
                            industryAnalysis: "Industry trends indicate strong demand in this vertical.",
                            strategicPositioning: "Differentiate via AI-powered automation.",
                            refinedUSP: "Deliver 2x ROI in half the time of competitors.",
                            targetAudienceSummary: "Target VP Sales and Demand Gen managers.",
                            prioritizedPainPoints: [
                              "Manual data entry",
                              "Slow lead follow-up",
                              "Low conversion rates"
                            ],
                            buyerJourney: "Awareness → Consideration → Decision",
                            recommendedChannels: ["LinkedIn Ads", "Cold Email", "Content Marketing"],
                            recommendedContent: ["Case Studies", "Whitepapers", "Webinars"],
                            seoOpportunities: ["Blog posts", "On-page SEO", "Link building"],
                            paidOpportunities: ["Search ads", "Social ads", "Retargeting"],
                            communityOpportunities: ["Slack community", "User groups"],
                            videoOpportunities: ["Explainer videos", "Testimonials"],
                            emailOpportunities: ["Nurture sequences", "Newsletters"],
                            aiOpportunities: ["AI personalization", "AI-generated content"],
                            topTactics: [
                              { name: "LinkedIn Outreach", effort: "High", impact: "High", priority: "High", roi3mo: "15%", roi6mo: "40%", roi12mo: "80%" },
                              { name: "Content Marketing", effort: "Medium", impact: "High", priority: "High", roi3mo: "10%", roi6mo: "35%", roi12mo: "90%" },
                              { name: "Paid Ads", effort: "Medium", impact: "Medium", priority: "Medium", roi3mo: "20%", roi6mo: "50%", roi12mo: "75%" }
                            ]
                          })
                          setIsGenerating(false)
                          setSelectedCategory(categories.find(c => c.id === 'marketing-profile')!)
                        }, 2000)
                      }}
                      disabled={isGenerating}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-500 hover:to-blue-500 font-semibold flex items-center gap-2"
                    >
                      {isGenerating ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Rocket className="h-4 w-4" />
                          Generate Marketing Profile
                        </>
                      )}
                    </button>
                  ) : (
                    <button 
                      onClick={() => setFormStep(prev => prev + 1)}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-500 hover:to-blue-500 font-semibold"
                    >
                      Next Step
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Marketing Profile */}
          {selectedCategory.id === 'marketing-profile' && (
            <div className="space-y-6">
              {!marketingProfile ? (
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center">
                  <FileSpreadsheet className="h-16 w-16 mx-auto text-slate-500 mb-4" />
                  <h2 className="text-xl font-semibold text-white mb-2">No Marketing Profile Yet</h2>
                  <p className="text-slate-400 max-w-md mx-auto">
                    Complete the Marketing Intake form to generate a comprehensive marketing strategy profile.
                  </p>
                  <button 
                    onClick={() => setSelectedCategory(categories.find(c => c.id === 'marketing-intake')!)}
                    className="mt-6 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold"
                  >
                    Go to Intake Form
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                    <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                      <CheckCircle2 className="h-6 w-6 text-emerald-400" /> Marketing Profile Generated Successfully
                    </h2>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                          <h3 className="text-sm font-semibold text-cyan-400 mb-2">Business Summary</h3>
                          <p className="text-sm text-slate-300">{marketingProfile.businessSummary}</p>
                        </div>
                        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                          <h3 className="text-sm font-semibold text-cyan-400 mb-2">Industry Analysis</h3>
                          <p className="text-sm text-slate-300">{marketingProfile.industryAnalysis}</p>
                        </div>
                        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                          <h3 className="text-sm font-semibold text-cyan-400 mb-2">Strategic Positioning</h3>
                          <p className="text-sm text-slate-300">{marketingProfile.strategicPositioning}</p>
                        </div>
                        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                          <h3 className="text-sm font-semibold text-cyan-400 mb-2">Refined USP</h3>
                          <p className="text-sm text-slate-300">{marketingProfile.refinedUSP}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                          <h3 className="text-sm font-semibold text-purple-400 mb-2">Target Audience</h3>
                          <p className="text-sm text-slate-300">{marketingProfile.targetAudienceSummary}</p>
                        </div>
                        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                          <h3 className="text-sm font-semibold text-purple-400 mb-2">Pain Points</h3>
                          <ul className="space-y-1 text-sm text-slate-300">
                            {marketingProfile.prioritizedPainPoints.map((pp: string, i: number) => (
                              <li key={i} className="flex items-start gap-2">
                                <CheckCircle className="h-4 w-4 text-purple-400 mt-0.5" />
                                {pp}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                          <h3 className="text-sm font-semibold text-purple-400 mb-2">Buyer Journey</h3>
                          <p className="text-sm text-slate-300">{marketingProfile.buyerJourney}</p>
                        </div>
                        
                        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-xs font-semibold text-emerald-400 mb-2">Recommended Channels</h4>
                            <ul className="space-y-1 text-xs text-slate-300">
                              {marketingProfile.recommendedChannels.map((ch: string, i: number) => (
                                <li key={i} className="flex items-center gap-2">
                                  <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                                  {ch}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4 className="text-xs font-semibold text-emerald-400 mb-2">Recommended Content</h4>
                            <ul className="space-y-1 text-xs text-slate-300">
                              {marketingProfile.recommendedContent.map((ct: string, i: number) => (
                                <li key={i} className="flex items-center gap-2">
                                  <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                                  {ct}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                      <h3 className="text-sm font-semibold text-amber-400 mb-4 flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Top Recommended Marketing Tactics
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="border-b border-slate-700">
                              <th className="text-left py-3 text-slate-400 font-semibold">Tactic</th>
                              <th className="text-center py-3 text-slate-400 font-semibold">Effort</th>
                              <th className="text-center py-3 text-slate-400 font-semibold">Impact</th>
                              <th className="text-center py-3 text-slate-400 font-semibold">Priority</th>
                              <th className="text-center py-3 text-slate-400 font-semibold">3-Mo ROI</th>
                              <th className="text-center py-3 text-slate-400 font-semibold">6-Mo ROI</th>
                              <th className="text-center py-3 text-slate-400 font-semibold">12-Mo ROI</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-700">
                            {marketingProfile.topTactics.map((tactic: any, i: number) => (
                              <tr key={i} className="hover:bg-slate-700/30">
                                <td className="py-3 text-white font-medium">{tactic.name}</td>
                                <td className={`text-center py-3 font-semibold ${
                                  tactic.effort === 'High' ? 'text-orange-400' : 
                                  tactic.effort === 'Medium' ? 'text-amber-400' : 
                                  'text-green-400'
                                }`}>{tactic.effort}</td>
                                <td className={`text-center py-3 font-semibold ${
                                  tactic.impact === 'High' ? 'text-green-400' : 
                                  tactic.impact === 'Medium' ? 'text-amber-400' : 
                                  'text-orange-400'
                                }`}>{tactic.impact}</td>
                                <td className={`text-center py-3 font-semibold ${
                                  tactic.priority === 'High' ? 'text-red-400' : 
                                  tactic.priority === 'Medium' ? 'text-amber-400' : 
                                  'text-green-400'
                                }`}>{tactic.priority}</td>
                                <td className="text-center py-3 text-emerald-400 font-semibold">{tactic.roi3mo}</td>
                                <td className="text-center py-3 text-emerald-400 font-semibold">{tactic.roi6mo}</td>
                                <td className="text-center py-3 text-emerald-400 font-semibold">{tactic.roi12mo}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Marketing Tactics */}
          {selectedCategory.id === 'tactics' && (
            <div className="space-y-6">
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-800">
                        <th className="text-left py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                          Campaign
                        </th>
                        <th className="text-left py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="text-left py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                          Reach
                        </th>
                        <th className="text-left py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                          Engagement
                        </th>
                        <th className="text-left py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                          Leads
                        </th>
                        <th className="text-left py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                          Budget
                        </th>
                        <th className="text-right py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {marketingTactics.map((tactic) => (
                        <tr key={tactic.id} className="hover:bg-slate-800/50 transition-colors">
                          <td className="py-4 px-6">
                            <div className="font-medium text-white">{tactic.name}</div>
                          </td>
                          <td className="py-4 px-6">
                            <span className={cn(
                              'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium',
                              tactic.status === 'active'
                                ? 'bg-green-500/10 text-green-400'
                                : 'bg-slate-800 text-slate-400'
                            )}>
                              <span className="w-1.5 h-1.5 rounded-full bg-current" />
                              {tactic.status.charAt(0).toUpperCase() + tactic.status.slice(1)}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-slate-300">
                            {tactic.reach.toLocaleString()}
                          </td>
                          <td className="py-4 px-6 text-slate-300">
                            {tactic.engagement}%
                          </td>
                          <td className="py-4 px-6 text-slate-300">
                            {tactic.leads}
                          </td>
                          <td className="py-4 px-6 text-slate-300">
                            ${tactic.budget.toLocaleString()}
                          </td>
                          <td className="py-4 px-6 text-right">
                            <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                              View details →
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function StatCard({
  title,
  value,
  change,
  positive,
  icon: Icon
}: {
  title: string
  value: string
  change: string
  positive: boolean
  icon: any
}) {
  return (
    <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-slate-400">{title}</h3>
        <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold text-white mb-1">{value}</p>
        <p className={cn('text-sm font-medium flex items-center gap-1', positive ? 'text-green-400' : 'text-red-400')}>
          {change}
          <ArrowRight className={cn('h-3 w-3', positive ? 'text-green-400' : 'text-red-400 rotate-[-90deg]')} />
        </p>
      </div>
    </div>
  )
}

function DealCard({ deal }: { deal: typeof deals[0] }) {
  const stage = stages.find(s => s.id === deal.stage)!

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-all">
      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
        {deal.avatar}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-white truncate">{deal.company}</p>
        <p className="text-sm text-slate-400 truncate">{deal.contact}</p>
      </div>
      <div className="text-right">
        <p className="font-bold text-green-400">${deal.value.toLocaleString()}</p>
        <div className="flex items-center gap-2 justify-end mt-1">
          <span className={cn('px-2 py-0.5 rounded-lg text-xs font-medium', stage.color)}>
            {stage.label}
          </span>
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {deal.lastActivity}
          </span>
        </div>
      </div>
    </div>
  )
}
