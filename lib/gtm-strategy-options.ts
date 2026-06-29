export type StrategyOption = {
  id: string;
  name: string;
  description: string;
  subOptions: Array<{ id: string; name: string; description: string }>;
  requiredApiKeys: Array<{ key: string; provider: 'huggingface' | 'nvidia' | 'kimi' | 'other' }>;
};

export const GTM_STRATEGY_OPTIONS: StrategyOption[] = [
  {
    id: 'icp_definition',
    name: 'ICP Definition',
    description: 'Define your Ideal Customer Profile with firmographic, demographic, and behavioral criteria',
    subOptions: [
      { id: 'firmographic_criteria', name: 'Firmographic Criteria', description: 'Industry, company size, ARR range, location' },
      { id: 'behavioral_criteria', name: 'Behavioral Criteria', description: 'Technology usage, content engagement, buying signals' },
      { id: 'tiering_system', name: 'Tiering System', description: 'Tier 1, Tier 2, Tier 3 customer segmentation' },
      { id: 'exclusion_rules', name: 'Exclusion Rules', description: 'Which companies to filter out' },
      { id: 'tqm_validation', name: 'TQM Validation', description: 'Validate ICP against closed-won deals' },
    ],
    requiredApiKeys: [
      { key: 'HUGGINGFACE_API_TOKEN', provider: 'huggingface' }
    ]
  },
  {
    id: 'market_analysis',
    name: 'Market Analysis',
    description: 'TAM, SAM, SOM, competitive landscape, and market trends analysis',
    subOptions: [
      { id: 'tam_sam_som', name: 'TAM/SAM/SOM Calculation', description: 'Market sizing and penetration targets' },
      { id: 'competitive_landscape', name: 'Competitive Landscape', description: 'Competitor analysis and positioning' },
      { id: 'market_trends', name: 'Market Trends', description: 'Industry trends and growth opportunities' },
      { id: 'pricing_analysis', name: 'Pricing Analysis', description: 'Competitive pricing and packaging research' },
      { id: 'pestel_analysis', name: 'PESTEL Analysis', description: 'Political, Economic, Social, Technological, Environmental, Legal factors' },
    ],
    requiredApiKeys: [
      { key: 'HUGGINGFACE_API_TOKEN', provider: 'huggingface' },
      { key: 'NVIDIA_API_KEY', provider: 'nvidia' }
    ]
  },
  {
    id: 'messaging_positioning',
    name: 'Messaging & Positioning',
    description: 'Value proposition, hook lines, persona-specific messaging',
    subOptions: [
      { id: 'value_proposition', name: 'Value Proposition', description: 'Core value pillar definitions' },
      { id: 'persona_messaging', name: 'Persona Messaging', description: 'Role-specific messaging (VP Sales, CRO, SDR, etc.)' },
      { id: 'objection_handling', name: 'Objection Handling', description: 'Common objections and rebuttals' },
      { id: 'hook_lines', name: 'Hook Lines', description: 'High-impact opening lines' },
      { id: 'proof_points', name: 'Proof Points', description: 'Case studies and social proof' },
    ],
    requiredApiKeys: [
      { key: 'HUGGINGFACE_API_TOKEN', provider: 'huggingface' }
    ]
  },
  {
    id: 'channel_strategy',
    name: 'Channel Strategy',
    description: 'Optimize channel mix, allocation, and content strategy',
    subOptions: [
      { id: 'channel_mix', name: 'Channel Mix Optimization', description: 'LinkedIn, cold email, paid search, events' },
      { id: 'content_strategy', name: 'Content Strategy', description: 'SEO, thought leadership, webinars' },
      { id: 'budget_allocation', name: 'Budget Allocation', description: 'CAC, LTV, and channel budget breakdown' },
      { id: 'partner_strategy', name: 'Partner Strategy', description: 'Referral partners, integrators, and co-marketing' },
      { id: 'abm_program', name: 'ABM Program', description: 'Account-Based Marketing strategy' },
    ],
    requiredApiKeys: [
      { key: 'NVIDIA_API_KEY', provider: 'nvidia' },
      { key: 'HUGGINGFACE_API_TOKEN', provider: 'huggingface' }
    ]
  },
  {
    id: 'sales_process',
    name: 'Sales Process',
    description: 'Sales stage mapping, SLAs, and playbooks',
    subOptions: [
      { id: 'sales_stages', name: 'Sales Stage Mapping', description: 'Awareness → Consideration → Decision → Retention' },
      { id: 'sla_definition', name: 'SLA Definition', description: 'Response times and follow-up cadences' },
      { id: 'playbooks', name: 'Playbooks', description: 'Tier 1, Tier 2, and industry-specific playbooks' },
      { id: 'deal_review', name: 'Deal Review Process', description: 'Quarterly and weekly deal review cadences' },
      { id: 'pipeline_management', name: 'Pipeline Management', description: 'Health scoring and pipeline hygiene' },
    ],
    requiredApiKeys: [
      { key: 'HUGGINGFACE_API_TOKEN', provider: 'huggingface' }
    ]
  },
  {
    id: 'enablement',
    name: 'Enablement',
    description: 'Training, content library, and tools for sales teams',
    subOptions: [
      { id: 'training_materials', name: 'Training Materials', description: 'Onboarding and continuous training' },
      { id: 'content_library', name: 'Content Library', description: 'Case studies, battle cards, and whitepapers' },
      { id: 'crm_playbook', name: 'CRM Playbook', description: 'Field definitions, pipeline hygiene, and reporting' },
      { id: 'meeting_templates', name: 'Meeting Templates', description: 'Discovery, demo, and close call agendas' },
      { id: 'kpi_tracking', name: 'KPI Tracking', description: 'What to measure and how to report' },
    ],
    requiredApiKeys: [
      { key: 'NVIDIA_API_KEY', provider: 'nvidia' }
    ]
  },
  {
    id: 'analytics_optimization',
    name: 'Analytics & Optimization',
    description: 'Track performance, iterate, and continuously improve',
    subOptions: [
      { id: 'kpi_framework', name: 'KPI Framework', description: 'Pipeline value, conversion rates, CAC/LTV' },
      { id: 'ab_testing', name: 'A/B Testing', description: 'Messaging and channel experimentation' },
      { id: 'funnel_analysis', name: 'Funnel Analysis', description: 'Drop-off point identification and fixes' },
      { id: 'iterative_improvement', name: 'Iterative Improvement', description: 'Monthly optimization reviews' },
      { id: 'attribution_modeling', name: 'Attribution Modeling', description: 'Channel and content attribution' },
    ],
    requiredApiKeys: [
      { key: 'HUGGINGFACE_API_TOKEN', provider: 'huggingface' },
      { key: 'NVIDIA_API_KEY', provider: 'nvidia' }
    ]
  },
  {
    id: 'customer_success',
    name: 'Customer Success',
    description: 'Retention, expansion, and churn reduction strategies',
    subOptions: [
      { id: 'onboarding_playbook', name: 'Onboarding Playbook', description: 'First 30/60/90 days' },
      { id: 'retention_strategy', name: 'Retention Strategy', description: 'Churn reduction and customer health' },
      { id: 'expansion_strategy', name: 'Expansion Strategy', description: 'Upsell and cross-sell playbooks' },
      { id: 'qbr_templates', name: 'QBR Templates', description: 'Quarterly Business Reviews' },
      { id: 'customer_advocacy', name: 'Customer Advocacy', description: 'Referral and case study programs' },
    ],
    requiredApiKeys: [
      { key: 'HUGGINGFACE_API_TOKEN', provider: 'huggingface' }
    ]
  },
  {
    id: 'launch_strategy',
    name: 'Launch Strategy',
    description: 'Product launch and go-to-market execution plan',
    subOptions: [
      { id: 'launch_phases', name: 'Launch Phases', description: 'Pre-launch, launch, post-launch' },
      { id: 'timeline_milestones', name: 'Timeline & Milestones', description: 'Key dates and deliverables' },
      { id: 'launch_messaging', name: 'Launch Messaging', description: 'Product positioning and PR angle' },
      { id: 'beta_program', name: 'Beta Program', description: 'Early access and feedback loops' },
      { id: 'press_strategy', name: 'Press Strategy', description: 'Media outreach and thought leadership' },
    ],
    requiredApiKeys: [
      { key: 'NVIDIA_API_KEY', provider: 'nvidia' },
      { key: 'HUGGINGFACE_API_TOKEN', provider: 'huggingface' }
    ]
  },
  {
    id: 'lead_scoring',
    name: 'Lead Scoring',
    description: 'Scoring model, qualification criteria, and routing',
    subOptions: [
      { id: 'scoring_model', name: 'Scoring Model', description: 'Points-based or predictive scoring' },
      { id: 'mql_sql_definition', name: 'MQL/SQL Definition', description: 'What makes a lead qualified' },
      { id: 'lead_routing', name: 'Lead Routing', description: 'Territories and assignment rules' },
      { id: 'nurture_tracks', name: 'Nurture Tracks', description: 'Content for different lead segments' },
      { id: 'recycling_process', name: 'Recycling Process', description: 'What to do with disqualified leads' },
    ],
    requiredApiKeys: [
      { key: 'HUGGINGFACE_API_TOKEN', provider: 'huggingface' }
    ]
  },
  {
    id: 'pricing_packaging',
    name: 'Pricing & Packaging',
    description: 'Monetization strategy, packaging, and discounting',
    subOptions: [
      { id: 'pricing_model', name: 'Pricing Model', description: 'Usage-based, seat-based, or tiered' },
      { id: 'package_design', name: 'Package Design', description: 'Feature tiers and add-ons' },
      { id: 'discount_strategy', name: 'Discount Strategy', description: 'Approved discounts and negotiation guardrails' },
      { id: 'price_testing', name: 'Price Testing', description: 'A/B testing and elasticity analysis' },
      { id: 'comp_benchmarking', name: 'Competitive Benchmarking', description: 'Price positioning vs. competitors' },
    ],
    requiredApiKeys: [
      { key: 'NVIDIA_API_KEY', provider: 'nvidia' }
    ]
  },
  {
    id: 'risk_mitigation',
    name: 'Risk Mitigation',
    description: 'Identify risks and create mitigation plans',
    subOptions: [
      { id: 'risk_register', name: 'Risk Register', description: 'Risk list and impact/likelihood scoring' },
      { id: 'mitigation_plans', name: 'Mitigation Plans', description: 'Action plans for each risk' },
      { id: 'contingency_planning', name: 'Contingency Planning', description: 'Backup strategies' },
      { id: 'monitoring_framework', name: 'Monitoring Framework', description: 'Early warning signs and triggers' },
      { id: 'crisis_playbook', name: 'Crisis Playbook', description: 'How to respond to crises' },
    ],
    requiredApiKeys: [
      { key: 'HUGGINGFACE_API_TOKEN', provider: 'huggingface' },
      { key: 'NVIDIA_API_KEY', provider: 'nvidia' }
    ]
  }
];

export const REQUIRED_API_KEYS = [
  { key: 'HUGGINGFACE_API_TOKEN', provider: 'huggingface', description: 'Hugging Face Inference API for open-source models' },
  { key: 'NVIDIA_API_KEY', provider: 'nvidia', description: 'NVIDIA API for large language model inference' },
  { key: 'KIMI_API_KEY', provider: 'kimi', description: 'Kimi (Moonshot) API for Chinese-language GTM analysis' },
];
