// lib/campaign-options-schema.ts
import { 
  FileText, 
  Share2, 
  Video, 
  Mic, 
  Image as ImageIcon, 
  Sparkles, 
  MousePointer, 
  Send, 
  BookOpen, 
  MessageSquare, 
  Tv, 
  Radio, 
  PieChart, 
  Cpu, 
  Search, 
  DollarSign, 
  Users, 
  Calendar, 
  Rocket, 
  Mail
} from "lucide-react";

export interface FieldDefinition {
  id: string;
  label: string;
  type: "text" | "textarea" | "select";
  placeholder?: string;
  required: boolean;
  options?: string[];
  defaultValue?: string;
  helperText?: string;
  maxLength?: number;
}

export interface ContentSubType {
  id: string;
  title: string;
  badge: string;
  description: string;
  fields: FieldDefinition[];
}

export interface CoreContentType {
  id: string;
  title: string;
  typeGroup: "content_types" | "marketing_tactics";
  icon: any;
  accentColor: "indigo" | "violet" | "emerald" | "amber" | "pink";
  badgeColor: string;
  borderColor: string;
  subTypes: ContentSubType[];
}

// Helper to construct standard inputs for rapid generation
function createStandardFields(
  primaryLabel: string,
  primaryPlaceholder: string,
  secondaryLabel: string,
  secondaryPlaceholder: string,
  thirdLabel?: string,
  thirdPlaceholder?: string
): FieldDefinition[] {
  const fields: FieldDefinition[] = [
    {
      id: "targetAudience",
      label: "Target Persona / Audience",
      type: "text",
      placeholder: "e.g. B2B Decision Makers, RevOps Directors, SaaS Founders",
      required: true,
      helperText: "Who is the primary audience for this asset/tactic?",
      maxLength: 300
    },
    {
      id: "primaryObjective",
      label: primaryLabel,
      type: "text",
      placeholder: primaryPlaceholder,
      required: true,
      maxLength: 300
    },
    {
      id: "coreMessage",
      label: secondaryLabel,
      type: "textarea",
      placeholder: secondaryPlaceholder,
      required: true,
      maxLength: 2000
    }
  ];

  if (thirdLabel && thirdPlaceholder) {
    fields.push({
      id: "additionalContext",
      label: thirdLabel,
      type: "text",
      placeholder: thirdPlaceholder,
      required: false,
      maxLength: 500
    });
  }

  fields.push({
    id: "callToAction",
    label: "Primary Call-to-Action (CTA)",
    type: "select",
    options: [
      "Schedule a 15-Minute Strategy Call",
      "Access Live Interactive Demo",
      "Download Full Industry Guide",
      "Start Free Platform Trial",
      "Join Exclusive Partner Community"
    ],
    required: true,
    defaultValue: "Schedule a 15-Minute Strategy Call"
  });

  return fields;
}

export const COMPLETE_CAMPAIGN_SCHEMA: CoreContentType[] = [
  // ==========================================
  // SECTION A: CONTENT TYPES
  // ==========================================

  // 1. Written Content
  {
    id: "written_content",
    title: "Written Content",
    typeGroup: "content_types",
    icon: FileText,
    accentColor: "indigo",
    badgeColor: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
    borderColor: "border-indigo-500",
    subTypes: [
      { id: "blog_posts_seo", title: "Blog posts (Educational/SEO)", badge: "SEO Article", description: "Search-optimized articles built to capture organic traffic and educate prospects.", fields: createStandardFields("Target Keyword / Topic", "e.g. AI B2B Deal Flow Automation", "Key Takeaways / Core Sections", "Explain 3 key benefits and step-by-step implementation.") },
      { id: "guest_posts", title: "Guest posts", badge: "Thought Leadership", description: "High-authority articles submitted to industry-leading publications.", fields: createStandardFields("Target Publication Name", "e.g. TechCrunch, VentureBeat, SaaS Mag", "Article Angle / Thesis", "Why modern teams are replacing manual spreadsheets with AI agents.") },
      { id: "case_studies", title: "Case studies / Success stories", badge: "Social Proof", description: "Detailed customer ROI breakdowns highlighting measurable outcomes.", fields: createStandardFields("Client Name & Industry", "e.g. Acme Corp (Enterprise SaaS)", "Core Results & Metrics Achieved", "e.g. 3.4x Pipeline growth in 60 days, 40% reduction in sales cycle.") },
      { id: "whitepapers", title: "Whitepapers", badge: "Deep Dive", description: "Comprehensive research papers detailing industry benchmarks and methodology.", fields: createStandardFields("Research Title / Theme", "e.g. The 2026 State of Autonomous Revenue Operations", "Executive Summary Points", "Key trends in AI agent adoption and pipeline predictability.") },
      { id: "ebooks", title: "eBooks", badge: "Lead Magnet", description: "Downloadable long-form guides used to capture qualified leads.", fields: createStandardFields("eBook Title", "e.g. The Ultimate Playbook for Scaling B2B Outbound", "Chapter Breakdown Overview", "Chapters 1-5 covering setup, ICP targeting, messaging, and scaling.") },
      { id: "newsletters", title: "Newsletters", badge: "Nurture", description: "Recurring email newsletters delivering curated insights to subscribers.", fields: createStandardFields("Newsletter Topic", "e.g. Weekly RevOps Brief #42", "Featured Story / Insight", "Breakdown of top 3 outbound email templates this week.") },
      { id: "press_releases", title: "Press releases", badge: "PR Announcement", description: "Formal company announcements distributed to media outlets.", fields: createStandardFields("Announcement Topic", "e.g. Launch of Next-Gen AI Agent Platform", "Key Quotes & Highlights", "Quote from Founder on driving enterprise pipeline efficiency.") },
      { id: "comparison_pages", title: "Comparison pages (X vs Y)", badge: "Bottom-Funnel", description: "Direct head-to-head comparison landing page copy against alternatives.", fields: createStandardFields("Competitor Name(s)", "e.g. Salesforce vs DealFlow AI", "Key Differentiators", "Zero manual setup, automated AI agent routing, built-in pipeline audits.") },
      { id: "glossary_pages", title: "Glossary / Definition pages", badge: "Programmatic SEO", description: "Search-friendly definitions of core industry terms.", fields: createStandardFields("Target Term to Define", "e.g. Autonomous Deal Flow", "Detailed Definition & Use Cases", "Define concept and provide 3 real-world application examples.") },
      { id: "documentation", title: "Documentation", badge: "Technical", description: "Clear user manuals, API docs, and feature integration walkthroughs.", fields: createStandardFields("Feature / API Module Name", "e.g. Webhook API Integration", "Integration Steps / Spec", "Step-by-step guide to connecting webhooks to CRM.") },
      { id: "original_research", title: "Original research", badge: "Data Report", description: "Proprietary survey data and original market statistics.", fields: createStandardFields("Research Survey Subject", "e.g. 2026 B2B Outbound Conversion Rates", "Key Data Highlights", "72% of respondents report higher win rates when using AI routing.") },
      { id: "industry_reports", title: "Industry reports", badge: "Market Insights", description: "Macro market trends and strategic recommendations.", fields: createStandardFields("Industry Sector Focus", "e.g. Mid-Market Fintech & HealthTech", "Key Market Trends", "Analysis of buying shifts and budget allocation trends for Q3/Q4.") },
      { id: "faq_pages", title: "FAQ pages", badge: "Objection Buster", description: "Answers to common buyer objections and platform questions.", fields: createStandardFields("Category of FAQs", "e.g. Enterprise Security & Pricing", "Top 5 Questions & Answers", "Cover data encryption, compliance, SLA, onboarding, and seats.") },
      { id: "listicles", title: "Listicles", badge: "Viral SEO", description: "Engaging top-list roundup posts (e.g. 10 Best Tools for RevOps).", fields: createStandardFields("Listicle Topic Title", "e.g. 7 Best AI Tools for Enterprise Sales Teams in 2026", "Featured List Items", "Include brief reviews, key features, and pros/cons for each tool.") },
      { id: "templates", title: "Templates", badge: "Free Tool", description: "Ready-to-use frameworks, spreadsheets, and document templates.", fields: createStandardFields("Template Name", "e.g. Cold Email Sequence Planning Template", "Template Deliverable Link/Format", "Notion / Google Docs template format.") },
      { id: "checklists", title: "Checklists", badge: "Actionable", description: "Step-by-step execution checklists for revenue teams.", fields: createStandardFields("Checklist Goal", "e.g. Pre-Launch Outbound Campaign Checklist", "Checklist Items (1-7)", "List 7 mandatory verification steps before hitting send.") },
      { id: "expert_interviews", title: "Expert interviews", badge: "Co-Marketing", description: "Q&A interviews with renowned industry leaders.", fields: createStandardFields("Expert Name & Title", "e.g. Jane Doe, VP Revenue at ScaleCo", "Interview Q&A Highlights", "Key advice on scaling outbound teams from 5 to 50 reps.") },
      { id: "changelog", title: "Changelog / Release notes", badge: "Product Update", description: "Regular updates documenting new product releases and fixes.", fields: createStandardFields("Version Number / Release Date", "e.g. Release v2.4 (July 2026)", "New Features & Fixes", "List major enhancements, UI improvements, and performance boosts.") },
      { id: "linkedin_newsletters", title: "LinkedIn newsletters", badge: "Social Nurture", description: "Long-form regular publications hosted directly on LinkedIn.", fields: createStandardFields("Newsletter Title", "e.g. The Autonomous Revenue Dispatch", "Edition Topic & Hook", "Why traditional cold calling is evolving into multi-channel AI outreach.") },
      { id: "medium_substack", title: "Medium/Substack articles", badge: "Subscriber Hub", description: "Editorial thought leadership articles published on subscription platforms.", fields: createStandardFields("Publication Name / Platform", "e.g. Substack: Future of RevOps", "Article Focus Point", "In-depth analysis of AI agent consensus models.") }
    ]
  },

  // 2. Social Media Content
  {
    id: "social_media_content",
    title: "Social Media Content",
    typeGroup: "content_types",
    icon: Share2,
    accentColor: "violet",
    badgeColor: "bg-violet-500/10 text-violet-400 border-violet-500/30",
    borderColor: "border-violet-500",
    subTypes: [
      { id: "linkedin_posts", title: "LinkedIn posts", badge: "B2B Social", description: "Short-to-medium text posts designed for professional feed reach.", fields: createStandardFields("Hook Line", "e.g. We audited 100 outbound campaigns. Here is what we found...", "Main Body Insight", "Provide 3 actionable tips for sales leaders.") },
      { id: "twitter_threads", title: "Twitter/X threads", badge: "Thread Series", description: "Multi-tweet breakdown of complex ideas into bite-sized tweets.", fields: createStandardFields("Thread Headline Topic", "e.g. How to build an AI sales agent stack in 10 tweets 🧵", "Tweet 1-7 Outline", "Outline the core steps to be posted in sequence.") },
      { id: "instagram_posts_reels", title: "Instagram posts & Reels", badge: "Visual & Short Video", description: "Visual graphics and short video captions for Instagram.", fields: createStandardFields("Visual / Reel Concept", "e.g. Behind the scenes: How AI generates playbooks in seconds", "Caption Text & Hashtags", "Write an engaging caption with target industry hashtags.") },
      { id: "facebook_posts", title: "Facebook posts", badge: "Community Post", description: "Engaging posts for Facebook brand pages and business groups.", fields: createStandardFields("Post Headline", "e.g. Exciting milestone for our user community!", "Post Body Copy", "Announce product update or share customer story.") },
      { id: "reddit_posts", title: "Reddit posts", badge: "Community Feedback", description: "Authentic, non-promotional discussions tailored for specific Subreddits.", fields: createStandardFields("Subreddit Name", "e.g. r/sales, r/SaaS, r/Entrepreneur", "Post Title & Opening Question", "Ask for community feedback on pipeline management strategies.") },
      { id: "quora_answers", title: "Quora answers", badge: "Q&A Authority", description: "Detailed, helpful answers to relevant industry questions on Quora.", fields: createStandardFields("Quora Question Title", "e.g. What is the best software for B2B deal tracking?", "Comprehensive Answer Copy", "Provide an authoritative answer with data points.") },
      { id: "threads_posts", title: "Threads posts", badge: "Text Social", description: "Conversational text updates for Meta Threads platform.", fields: createStandardFields("Threads Concept", "e.g. Quick hot take on outbound marketing in 2026...", "Short Conversational Text", "State a punchy insight and ask for replies.") },
      { id: "pinterest_pins", title: "Pinterest pins", badge: "Visual Pin", description: "Pin copy and infographic graphics description for Pinterest search.", fields: createStandardFields("Pin Title", "e.g. 5 Free Templates for Outbound Sales Sequences", "Pin Description Copy", "Describe the visual graphic and link to website.") },
      { id: "tiktok_videos", title: "TikTok videos", badge: "Short Video", description: "Trending short video concepts and spoken scripts for TikTok.", fields: createStandardFields("3-Second Hook Idea", "e.g. If you work in B2B sales, stop scrolling right now...", "Video Talking Points", "Explain a quick 30-second tip with on-screen text callouts.") },
      { id: "linkedin_polls", title: "LinkedIn polls", badge: "Poll Engagement", description: "Interactive polls designed to spark debate and capture lead intent.", fields: createStandardFields("Poll Question", "e.g. What is your #1 pipeline bottleneck this quarter?", "Poll Options (2-4)", "Option 1: Lead Quality, Option 2: Rep Bandwidth, Option 3: Tool Fatigue") },
      { id: "employee_advocacy", title: "Employee advocacy content", badge: "Team Sharing", description: "Pre-written social snippets for team members to share on personal profiles.", fields: createStandardFields("Event / Launch Milestone", "e.g. Celebrating our new product release!", "Employee Personal Post Variations", "Provide 2 sample text variations for reps to copy and share.") }
    ]
  },

  // 3. Video Content
  {
    id: "video_content",
    title: "Video Content",
    typeGroup: "content_types",
    icon: Video,
    accentColor: "emerald",
    badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    borderColor: "border-emerald-500",
    subTypes: [
      { id: "ai_generated_videos", title: "AI-generated videos", badge: "AI Avatar", description: "Scripts for synthetic AI avatar presenter videos.", fields: createStandardFields("Video Topic", "e.g. Platform Overview in 60 Seconds", "Avatar Script Copy", "Write word-for-word script for AI avatar narration.") },
      { id: "explainer_videos", title: "Explainer videos", badge: "Core Product", description: "90-second animated or voiceover product explainer scripts.", fields: createStandardFields("Problem Statement", "e.g. Sales reps spend 4 hours a day updating CRMs manually.", "Explainer Script Arc", "Problem -> Solution -> Platform Overview -> CTA") },
      { id: "product_demos", title: "Product demos", badge: "Live Walkthrough", description: "Screen-by-screen guided walkthrough scripts for sales engineers.", fields: createStandardFields("Key Modules Covered", "e.g. Dashboard, AI Router, Workflow Engine", "Demo Talk Track", "Step-by-step narrative while clicking through features.") },
      { id: "youtube_tutorials", title: "YouTube tutorials", badge: "Educational Video", description: "Structured video scripts for long-form YouTube tutorials.", fields: createStandardFields("Tutorial Title", "e.g. How to Build an AI-Powered Sales Funnel Step by Step", "Video Outline & Timestamp Plan", "Intro (0:00), Setup (1:30), Workflow (5:00), Testing (10:00)") },
      { id: "short_form_videos", title: "Short-form videos (Reels, Shorts, TikTok)", badge: "Viral Shorts", description: "60-second vertical video scripts optimized for high retention.", fields: createStandardFields("Hook Angle", "e.g. 3 secrets top enterprise sellers don't tell you", "Script & Visual Cues", "Fast-paced spoken script with on-screen text overlays.") },
      { id: "webinars", title: "Webinars", badge: "Event Masterclass", description: "Slide presentation outlines and speaker presentation scripts.", fields: createStandardFields("Webinar Title", "e.g. Masterclass: Scaling Outbound Pipeline with AI", "Presentation Agenda", "Outline 4 main presentation sections and live Q&A block.") },
      { id: "customer_testimonial_videos", title: "Customer testimonial videos", badge: "Video Case Study", description: "Interview questions and narrative flow for video case studies.", fields: createStandardFields("Client Name & Industry", "e.g. TechCorp (Fintech)", "Interview Questions List", "5 questions asking about before/after state and quantitative ROI.") },
      { id: "founder_vlogs", title: "Founder vlogs", badge: "Personal Brand", description: "Behind-the-scenes founder video scripts and talking points.", fields: createStandardFields("Vlog Topic", "e.g. Why we decided to rebuild our AI engine from scratch", "Key Founder Takeaways", "Share authentic challenges, lessons, and vision.") },
      { id: "animated_product_walkthroughs", title: "Animated product walkthroughs", badge: "Motion Design", description: "Motion graphics storyboard prompts and narration scripts.", fields: createStandardFields("Animation Concept", "e.g. Visualization of AI data flow between systems", "Storyboard Scene Descriptions", "Describe 4 animated scenes showing data moving effortlessly.") },
      { id: "live_streams", title: "Live streams", badge: "Real-Time Q&A", description: "Run-of-show scripts for YouTube/LinkedIn live streams.", fields: createStandardFields("Live Stream Subject", "e.g. Live Q&A: Answering Your RevOps Questions", "Run of Show Breakdown", "0-5 min Welcome, 5-25 min Live Demo, 25-45 min Audience Q&A.") },
      { id: "build_in_public", title: "Build-in-public series", badge: "Transparency", description: "Episodic series documenting product development in real time.", fields: createStandardFields("Episode Title", "e.g. Episode 12: Shipping 5 User Requests in 48 Hours", "Key Highlights & Lessons", "Show code progress, user feedback, and metric metrics.") },
      { id: "product_launch_videos", title: "Product launch videos", badge: "Hype Launch", description: "High-energy product reveal trailer scripts.", fields: createStandardFields("Launch Product Name", "e.g. Announcing DealFlow AI 3.0", "Trailer Script & Soundtrack Cue", "Dynamic script with high-impact visual transitions.") },
      { id: "onboarding_videos", title: "Onboarding videos", badge: "User Success", description: "First-run welcome video scripts for new software customers.", fields: createStandardFields("Onboarding Milestone", "e.g. Welcome to Your Dashboard (Step 1 of 3)", "Guided Script", "Walk customer through setting up their initial workspace.") },
      { id: "whiteboard_animations", title: "Whiteboard animations", badge: "Visual Explainer", description: "Whiteboard drawing scripts for simple conceptual education.", fields: createStandardFields("Core Concept", "e.g. How AI Lead Scoring Works Behind the Scenes", "Drawing Scene Sequence", "Describe illustrated scenes drawn on screen.") },
      { id: "video_case_studies", title: "Video case studies", badge: "Client Spotlight", description: "Polished customer success video narrative scripts.", fields: createStandardFields("Client Success Highlight", "e.g. How ScaleInc doubled revenues using our platform", "Narrative Arc Script", "Client problem -> Discovery -> Implementation -> Results") }
    ]
  },

  // 4. Audio Content
  {
    id: "audio_content",
    title: "Audio Content",
    typeGroup: "content_types",
    icon: Mic,
    accentColor: "amber",
    badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    borderColor: "border-amber-500",
    subTypes: [
      { id: "podcasts", title: "Podcasts", badge: "Podcast Show", description: "Episode show notes, introduction scripts, and interview outlines.", fields: createStandardFields("Episode Title", "e.g. Episode 54: The Future of Autonomous Sales", "Show Notes & Discussion Questions", "Key discussion points and guest introduction.") },
      { id: "guest_podcast_appearances", title: "Guest podcast appearances", badge: "Guest Pitch", description: "Pitch deck copy to secure guest spots on top industry podcasts.", fields: createStandardFields("Target Podcast Name", "e.g. The RevOps Podcast", "Guest Pitch Topics", "3 unique topic angles the guest can speak on.") },
      { id: "ai_audio_summaries", title: "AI-generated audio summaries", badge: "Audio Summary", description: "Concise scripts designed for AI text-to-speech audio recaps.", fields: createStandardFields("Article / Report Title", "e.g. 2-Minute Daily Industry News Recap", "Audio Narrative Script", "Write word-for-word audio narration copy.") },
      { id: "audio_blog_versions", title: "Audio blog versions", badge: "Accessible Audio", description: "Narration script adaptations for blog article listen options.", fields: createStandardFields("Blog Title", "e.g. Audio Version: The 2026 Outbound Guide", "Spoken Narration Script", "Clean text adapted for spoken audio reading.") },
      { id: "live_audio_rooms", title: "Live audio rooms (Twitter Spaces)", badge: "Live Audio", description: "Discussion prompts and host talking points for Twitter Spaces.", fields: createStandardFields("Space Topic Title", "e.g. Twitter Space: AI Tools AMA with Founders", "Host Opening & Speaker Q&A", "Opening 2-minute intro and questions for guest speakers.") }
    ]
  },

  // 5. Visual Content
  {
    id: "visual_content",
    title: "Visual Content",
    typeGroup: "content_types",
    icon: ImageIcon,
    accentColor: "pink",
    badgeColor: "bg-pink-500/10 text-pink-400 border-pink-500/30",
    borderColor: "border-pink-500",
    subTypes: [
      { id: "infographics", title: "Infographics", badge: "Data Visual", description: "Section-by-section data breakdown and graphic design prompts.", fields: createStandardFields("Infographic Title", "e.g. The Lifecycle of a B2B Lead in 2026", "Data Stats & Section Outline", "5 key stats and visual illustrations to include.") },
      { id: "carousel_posts", title: "Carousel posts", badge: "Multi-Slide", description: "Slide-by-slide copy and design layouts for LinkedIn/IG carousels.", fields: createStandardFields("Carousel Subject", "e.g. 5 Pipeline Automation Hacks", "Slide 1 to 7 Copy Breakdown", "Define headline, subtext, and graphic for each slide.") },
      { id: "memes", title: "Memes", badge: "Humor Social", description: "Relatable industry meme concepts and caption text.", fields: createStandardFields("Industry Joke Concept", "e.g. Sales reps updating CRM on Friday at 4:59 PM", "Meme Image Format & Text", "Specify meme format (Drake, Distracted Boyfriend, etc.) and text.") },
      { id: "data_visualizations", title: "Data visualizations", badge: "Charts & Graphs", description: "Chart concepts and explanatory captions for proprietary data.", fields: createStandardFields("Data Set Concept", "e.g. Conversion Rate comparison by Channel", "Graph Type & Key Takeaway", "Bar chart showing LinkedIn vs Email vs Cold Call performance.") },
      { id: "public_slide_decks", title: "Public slide decks", badge: "SlideShare", description: "Slide deck outlines for public presentation platforms.", fields: createStandardFields("Deck Title", "e.g. How AI Agents are Transforming B2B Sales", "Slide Outline (10 Slides)", "Brief bullet points for slides 1 through 10.") },
      { id: "quote_graphics", title: "Quote graphics", badge: "Social Quote", description: "Impactful quotes paired with visual design recommendations.", fields: createStandardFields("Quote Text", "e.g. 'Automation doesn't replace sellers—it empowers them.'", "Speaker Attribution", "John Doe, Founder at DealFlow AI") },
      { id: "before_after_visuals", title: "Before/After visuals", badge: "Comparison", description: "Split graphic concepts contrasting legacy vs modern workflows.", fields: createStandardFields("Comparison Concept", "e.g. Manual Prospecting vs AI Workflow Engine", "Left (Before) vs Right (After) Details", "Before: Messy sheets. After: Clean automated pipeline.") },
      { id: "process_diagrams", title: "Process diagrams", badge: "Diagram Flow", description: "Structured step-by-step process flowchart specifications.", fields: createStandardFields("Process Title", "e.g. Automated Lead Qualification Workflow", "Step 1 to Step 5 Sequence", "Map out trigger -> filter -> score -> route -> notify.") },
      { id: "flowcharts", title: "Flowcharts", badge: "Decision Tree", description: "Logic decision tree specifications for technical processes.", fields: createStandardFields("Decision Tree Subject", "e.g. Customer Renewal Decision Tree", "If/Then Logic Branches", "If high usage -> Upsell offer. If low usage -> Trigger alert.") },
      { id: "branded_gifs", title: "Branded GIFs", badge: "Animated GIF", description: "Short animated GIF concepts for email newsletters and product UI.", fields: createStandardFields("GIF Concept", "e.g. Animated checkmark popping up when lead closes", "Animation Spec", "3-second looping animation description.") },
      { id: "stickers", title: "Stickers", badge: "Swag Graphic", description: "Branded sticker graphics and slogan ideas for event swag.", fields: createStandardFields("Sticker Slogan", "e.g. Less Manual Work, More Closed Deals", "Visual Style Description", "Holographic retro tech design description.") }
    ]
  },

  // 6. AI-Generated Content
  {
    id: "ai_generated_content",
    title: "AI-Generated Content",
    typeGroup: "content_types",
    icon: Sparkles,
    accentColor: "indigo",
    badgeColor: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
    borderColor: "border-indigo-500",
    subTypes: [
      { id: "ai_blog_posts", title: "AI blog posts", badge: "AI Article", description: "Fully structured AI-drafted blog articles ready for editing.", fields: createStandardFields("Topic & Primary Keyword", "e.g. AI-driven pipeline velocity", "Key Content Parameters", "Include 4 H2 headings, 3 stats, and introductory hook.") },
      { id: "ai_avatar_videos", title: "AI avatar videos", badge: "AI Presenter", description: "Voice and visual prompts for AI avatar video platforms.", fields: createStandardFields("Avatar Persona Type", "e.g. Professional Executive Presenter", "Script & Gesture Instructions", "Script copy with camera angle and facial expression cues.") },
      { id: "ai_generated_images", title: "AI-generated images", badge: "Image Prompt", description: "Midjourney & DALL-E image generation prompts.", fields: createStandardFields("Visual Subject Concept", "e.g. Futuristic 3D dashboard glowing with neon data streams", "Detailed Image Generation Prompt", "Style: 3D render, octane render, 8k resolution, cybernetic aesthetic.") },
      { id: "ai_personalized_emails", title: "AI-personalized emails", badge: "Dynamic Email", description: "Dynamic variable templates for AI email personalization.", fields: createStandardFields("Personalization Signals", "e.g. Recent funding round, hiring surge, technology stack", "Dynamic Email Template Copy", "Email template using {{recentFunding}} and {{techStack}} tags.") },
      { id: "auto_social_posts", title: "Auto-generated social posts", badge: "Batch Social", description: "Batch social media snippets auto-extracted from long-form content.", fields: createStandardFields("Source Content Link/Topic", "e.g. Extracted from Q3 Market Report", "Generated Social Variations", "3 punchy social posts ready for scheduling.") },
      { id: "ai_voiceovers", title: "AI voiceovers", badge: "Text-to-Speech", description: "Scripts formatted specifically for AI voice synthesis software.", fields: createStandardFields("Voice Tone & Accent", "e.g. Deep male voice, confident American accent", "Narration Text Copy", "Script copy with pacer marks [pause 1s].") },
      { id: "ai_landing_pages", title: "AI-generated landing pages", badge: "Page Copy", description: "Full landing page structure including hero, features, and CTA.", fields: createStandardFields("Landing Page Offer", "e.g. DealFlow AI Enterprise Trial Page", "Section Copy Breakdown", "Hero Headline -> Features Grid -> Social Proof -> CTA Form") },
      { id: "ai_translated_content", title: "AI-translated content", badge: "Localization", description: "Multi-language translated marketing copy briefs.", fields: createStandardFields("Target Languages", "e.g. Spanish, German, Japanese", "Master English Text to Translate", "Primary marketing value prop and bullet points.") },
      { id: "ai_content_repurposing", title: "AI content repurposing", badge: "Omnichannel", description: "Repurpose 1 core article into 5 multi-channel marketing assets.", fields: createStandardFields("Master Source Content", "e.g. Long-form Case Study on Acme Corp", "Repurposed Formats List", "Create: 1 LinkedIn post, 1 Tweet thread, 1 Email snippet, 1 Ad copy.") },
      { id: "ai_summaries", title: "AI summaries", badge: "Executive Summary", description: "Concise executive summaries generated from long documents.", fields: createStandardFields("Source Document Name", "e.g. 50-Page Enterprise Contract Analysis", "Summary Output Format", "Provide 3 bullet points, key risks, and financial takeaways.") }
    ]
  },

  // 7. Interactive Content
  {
    id: "interactive_content",
    title: "Interactive Content",
    typeGroup: "content_types",
    icon: MousePointer,
    accentColor: "emerald",
    badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    borderColor: "border-emerald-500",
    subTypes: [
      { id: "roi_calculators", title: "ROI calculators", badge: "Calculator", description: "Logic formulas and text inputs for interactive ROI widgets.", fields: createStandardFields("Calculator Title", "e.g. Pipeline Acceleration ROI Calculator", "Input Parameters & Formula Logic", "Inputs: Rep count, deal size. Formula: Hours saved * Rep rate.") },
      { id: "savings_calculators", title: "Savings calculators", badge: "Cost Calculator", description: "Interactive tools showing potential cost savings.", fields: createStandardFields("Savings Focus", "e.g. Manual Data Entry Cost Savings Tool", "Calculated Outputs", "Show monthly $ saved and Rep hours freed up.") },
      { id: "quizzes", title: "Quizzes", badge: "Interactive Quiz", description: "Lead capture quizzes with custom outcome scoring.", fields: createStandardFields("Quiz Title", "e.g. Is Your Sales Pipeline Ready for AI Automation?", "Question & Result Logic", "5 multiple-choice questions leading to 3 personalized outcome tiers.") },
      { id: "assessments", title: "Assessments", badge: "Audit Tool", description: "Comprehensive maturity assessment tools for prospects.", fields: createStandardFields("Assessment Focus", "e.g. 2026 RevOps Maturity Audit", "Scoring Categories", "Grade team across Strategy, Tooling, Data, and Execution.") },
      { id: "interactive_product_tours", title: "Interactive product tours", badge: "Product Tour", description: "Step-by-step guided product tour script & hotspot copy.", fields: createStandardFields("Product Module Covered", "e.g. AI Deal Routing Engine Tour", "Hotspot 1 to 5 Copy", "Define tooltip text for 5 key interactive feature hotspots.") },
      { id: "chrome_extensions", title: "Chrome extensions", badge: "Mini App", description: "Concept brief and value proposition for utility extensions.", fields: createStandardFields("Extension Utility Name", "e.g. DealFlow Instant CRM Sync Extension", "Core Extension Functionality", "Allow rep to capture LinkedIn lead details in 1 click.") },
      { id: "free_mini_tools", title: "Free mini-tools", badge: "Lead Magnet", description: "Free browser-based micro-tools that drive organic backlinks.", fields: createStandardFields("Tool Concept", "e.g. Free Cold Email Subject Line Tester", "Tool Output Logic", "Grade subject line on length, spam triggers, and sentiment.") }
    ]
  },

  // ==========================================
  // SECTION B: MARKETING TACTICS
  // ==========================================

  // 8. Outreach & Direct Engagement
  {
    id: "outreach_tactics",
    title: "Outreach & Direct Engagement",
    typeGroup: "marketing_tactics",
    icon: Send,
    accentColor: "indigo",
    badgeColor: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
    borderColor: "border-indigo-500",
    subTypes: [
      { id: "tactic_cold_email", title: "Cold email outreach", badge: "Direct Outbound", description: "Targeted cold email strategies to book meetings with decision makers.", fields: createStandardFields("Target Industry / ICP", "e.g. VP Sales at Mid-Market SaaS", "Sequence Strategy", "3-touch sequence focusing on pipeline predictability.") },
      { id: "tactic_linkedin_outreach", title: "LinkedIn outreach", badge: "Social Outbound", description: "Direct InMail and connection request messaging flows.", fields: createStandardFields("Prospect Role", "e.g. Head of RevOps", "Connection Message & Follow-Up", "Personalized note referencing shared industry challenge.") },
      { id: "tactic_cold_calling", title: "Cold calling", badge: "Phone Pitch", description: "SDR phone pitch scripts and objection handling frameworks.", fields: createStandardFields("Prospect Decision Maker", "e.g. Chief Commercial Officer", "Pattern Interrupt & Script", "30-second opener handling 'send me an email' objection.") },
      { id: "tactic_abm", title: "Account-Based Marketing (ABM)", badge: "Enterprise ABM", description: "High-touch, account-specific campaigns for top 50 target accounts.", fields: createStandardFields("Target Account List Tier", "e.g. Top 20 Enterprise Financial Institutions", "Multi-Touch ABM Campaign", "Combine custom landing page, direct mail, and executive gift.") },
      { id: "tactic_influencer_partnerships", title: "Influencer partnerships", badge: "Co-Branding", description: "Collaborate with industry thought leaders to reach their audience.", fields: createStandardFields("Influencer Niche", "e.g. B2B Sales Influencer with 50k LinkedIn followers", "Partnership Deliverables", "1 Sponsored Post + 1 Co-hosted Webinar.") },
      { id: "tactic_affiliate_marketing", title: "Affiliate marketing", badge: "Commission", description: "Partner referral programs offering performance commissions.", fields: createStandardFields("Partner Profile", "e.g. Sales Consultants & CRM Agencies", "Commission Structure", "20% recurring revenue share for 12 months.") },
      { id: "tactic_pr_outreach", title: "PR outreach", badge: "Media Coverage", description: "Journalist pitching to gain press features and backlink coverage.", fields: createStandardFields("Target Journalist Niche", "e.g. Tech Reporters covering AI & Automation", "Pitch Hook", "Exclusive data release on 2026 sales trends.") },
      { id: "tactic_whatsapp_sms", title: "WhatsApp/SMS outreach", badge: "Direct Messaging", description: "High-open rate conversational messaging strategies.", fields: createStandardFields("Message Trigger", "e.g. Post-webinar attendee follow-up", "SMS / WhatsApp Message Text", "Concise message with quick link to calendar.") },
      { id: "tactic_direct_mail", title: "Direct mail", badge: "Physical Swag", description: "Physical gift boxes sent to high-value executive targets.", fields: createStandardFields("Target Executive Role", "e.g. Enterprise Chief Executive Officers", "Gift Box Package Concept", "Custom branded mug + personalized printed industry report.") },
      { id: "tactic_referral_outreach", title: "Referral outreach", badge: "Customer Advocacy", description: "Systematic campaigns asking satisfied clients for introductions.", fields: createStandardFields("Customer Segment", "e.g. Clients active > 90 days with high NPS score", "Referral Incentive & Email Copy", "Offer $250 credit per successful customer introduction.") },
      { id: "tactic_community_dm", title: "Community DM outreach", badge: "Community Pitch", description: "Relationship-first outreach in private Slack/Discord communities.", fields: createStandardFields("Community Name", "e.g. RevOps Co-Op Slack Community", "Non-salesy Conversation Starter", "Ask about their experience with current pipeline tools.") },
      { id: "tactic_coselling_partners", title: "Co-selling with partners", badge: "Partner Ecosystem", description: "Joint sales pitches alongside complementary tech vendors.", fields: createStandardFields("Complementary Tech Partner", "e.g. HubSpot / Salesforce Integration Partners", "Joint Value Proposition", "Combined solution pitch solving data sync bottlenecks.") }
    ]
  },

  // 9. Content Marketing
  {
    id: "content_marketing_tactics",
    title: "Content Marketing",
    typeGroup: "marketing_tactics",
    icon: BookOpen,
    accentColor: "violet",
    badgeColor: "bg-violet-500/10 text-violet-400 border-violet-500/30",
    borderColor: "border-violet-500",
    subTypes: [
      { id: "tactic_blogging", title: "Blogging", badge: "Organic Content", description: "Regular publishing of high-value articles to attract search traffic.", fields: createStandardFields("Blog Cadence", "e.g. 2 In-depth articles per week", "Editorial Pillar Strategy", "Cover 3 core pillars: Strategy, Tools, Case Studies.") },
      { id: "tactic_guest_posting", title: "Guest posting", badge: "Backlink Growth", description: "Publishing articles on partner sites to build domain authority.", fields: createStandardFields("Target Sites", "e.g. High DA Marketing Blogs (DA 70+)", "Pitch Topic", "How AI agents will reshape outbound marketing.") },
      { id: "tactic_tactic_case_studies", title: "Case studies", badge: "Conversion Asset", description: "In-depth customer success stories driving bottom-funnel conversions.", fields: createStandardFields("Target Buyer Objection", "e.g. 'Will this work for my specific industry?'", "Storytelling Framework", "Highlight rapid implementation and measurable ROI.") },
      { id: "tactic_whitepapers_tactic", title: "Whitepapers", badge: "Authority Asset", description: "In-depth technical papers establishing enterprise credibility.", fields: createStandardFields("Enterprise Persona", "e.g. CTOs and CISOs", "Technical Deep Dive Focus", "Data privacy, SOC2 compliance, and AI architecture.") },
      { id: "tactic_ebooks_tactic", title: "eBooks", badge: "Lead Capture", description: "Comprehensive guides used for inbound email capture.", fields: createStandardFields("Lead Magnet Title", "e.g. The 2026 Revenue Acceleration Playbook", "Promotion Strategy", "Promote via LinkedIn ads and blog popups.") },
      { id: "tactic_newsletters_tactic", title: "Newsletters", badge: "Audience Building", description: "Building a owned email subscriber media asset.", fields: createStandardFields("Subscriber Growth Goal", "e.g. 10,000 RevOps subscribers in 6 months", "Content Value Model", "Deliver 80% educational insights, 20% product CTA.") },
      { id: "tactic_doc_marketing", title: "Documentation marketing", badge: "Developer Growth", description: "Using comprehensive API docs as a customer acquisition channel.", fields: createStandardFields("Target Technical Audience", "e.g. Developers & Sales Engineers", "Doc Experience Strategy", "Provide interactive code sandboxes and SDK docs.") },
      { id: "tactic_research_reports", title: "Research reports", badge: "Media Driver", description: "Publishing annual benchmark data reports to earn PR coverage.", fields: createStandardFields("Annual Survey Topic", "e.g. The 2026 Pipeline Conversion Study", "PR Distribution Strategy", "Send embargoed copies to industry journalists.") },
      { id: "tactic_industry_reports_tactic", title: "Industry reports", badge: "Vertical Focus", description: "Tailored reports addressing specific industry vertical challenges.", fields: createStandardFields("Target Vertical", "e.g. Enterprise Fintech Companies", "Key Report Findings", "Breakdown of top growth levers for fintech sellers.") },
      { id: "tactic_templates_tactic", title: "Templates", badge: "Productivity Tool", description: "Offering downloadable templates to solve immediate user pain points.", fields: createStandardFields("Template Deliverable", "e.g. 2026 Sales Pipeline Spreadsheet", "In-App Conversion Upgrade", "Include CTA to automate the template inside our software.") },
      { id: "tactic_checklists_tactic", title: "Checklists", badge: "Quick Win", description: "Actionable checklists that guide prospects through complex tasks.", fields: createStandardFields("Checklist Topic", "e.g. AI CRM Onboarding Checklist", "Lead Capture Mechanism", "Require email address to download printable PDF version.") },
      { id: "tactic_expert_interviews_tactic", title: "Expert interviews", badge: "Network Reach", description: "Co-creating content with influencers to tap into their audience.", fields: createStandardFields("Expert Interviewee", "e.g. Top Sales Author / Practitioner", "Distribution Channels", "Publish as Blog post + YouTube Video + Podcast.") }
    ]
  },

  // 10. Social Media Marketing
  {
    id: "social_media_marketing_tactics",
    title: "Social Media Marketing",
    typeGroup: "marketing_tactics",
    icon: MessageSquare,
    accentColor: "emerald",
    badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    borderColor: "border-emerald-500",
    subTypes: [
      { id: "tactic_linkedin_marketing", title: "LinkedIn marketing", badge: "B2B Core", description: "Organic content and executive personal branding on LinkedIn.", fields: createStandardFields("Posting Cadence", "e.g. 1 Post daily per executive profile", "Content Mix Strategy", "40% Insights, 30% How-to, 20% Proof, 10% CTA.") },
      { id: "tactic_twitter_marketing", title: "Twitter/X marketing", badge: "Real-Time Reach", description: "Building a tech-forward audience via threads and interactions.", fields: createStandardFields("Target Audience Niche", "e.g. AI Founders, Tech Marketers", "Growth Strategy", "2 Threads weekly + 5 daily replies to top industry accounts.") },
      { id: "tactic_instagram_marketing", title: "Instagram marketing", badge: "Visual Brand", description: "Visual brand storytelling using Reels and Carousel posts.", fields: createStandardFields("Visual Aesthetic Theme", "e.g. Dark mode glassmorphism tech style", "Reels Video Strategy", "Show 30-second software feature breakdowns.") },
      { id: "tactic_facebook_marketing", title: "Facebook marketing", badge: "Group Building", description: "Engaging in Facebook groups and hosting brand pages.", fields: createStandardFields("Facebook Group Name", "e.g. B2B Sales Automation Community", "Group Engagement Plan", "Host weekly live Q&A sessions and share templates.") },
      { id: "tactic_reddit_engagement", title: "Reddit engagement", badge: "Organic Reddit", description: "Authentic community participation in relevant subreddits.", fields: createStandardFields("Target Subreddits", "e.g. r/sales, r/SaaS", "Karma & Credibility Plan", "Answer 3 user questions daily without promoting product directly.") },
      { id: "tactic_quora_marketing", title: "Quora marketing", badge: "Search Q&A", description: "Answering evergreen search questions to drive recurring referral traffic.", fields: createStandardFields("Question Topics Focus", "e.g. Questions about CRM workflows and pipeline tools", "Answering Strategy", "Provide long-form answers with embedded screenshots.") },
      { id: "tactic_threads_marketing", title: "Threads marketing", badge: "Meta Social", description: "Early adoption of Meta Threads to capture organic reach.", fields: createStandardFields("Content Style", "e.g. Short, witty tech observations and polls", "Posting Frequency", "2-3 short posts daily.") },
      { id: "tactic_pinterest_marketing", title: "Pinterest marketing", badge: "Visual Search", description: "Creating infographics and template pins for Pinterest search.", fields: createStandardFields("Target Search Terms", "e.g. Outbound sales scripts, marketing templates", "Pin Optimization", "Link all visual pins to dedicated landing pages.") },
      { id: "tactic_tiktok_marketing", title: "TikTok marketing", badge: "Short Video", description: "High-energy short form video marketing on TikTok.", fields: createStandardFields("Content Theme", "e.g. Sales humor, tech reviews, day-in-the-life", "Video Script Hook", "Fast-paced spoken hook in first 2 seconds.") },
      { id: "tactic_employee_advocacy_tactic", title: "Employee advocacy", badge: "Employee Reach", description: "Empowering employees to share company news on personal channels.", fields: createStandardFields("Employee Program Incentive", "e.g. Monthly gift card for top advocate", "Content Distribution Platform", "Provide weekly shareable social post snippets to team.") }
    ]
  },

  // 11. Video Marketing
  {
    id: "video_marketing_tactics",
    title: "Video Marketing",
    typeGroup: "marketing_tactics",
    icon: Tv,
    accentColor: "amber",
    badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    borderColor: "border-amber-500",
    subTypes: [
      { id: "tactic_explainer_videos", title: "Explainer videos", badge: "Product Video", description: "High-production product explainer videos for website homepage.", fields: createStandardFields("Video Duration Goal", "e.g. 90 Seconds", "Core Narrative Arc", "Hook -> Problem -> Solution -> Features -> CTA") },
      { id: "tactic_product_demos_tactic", title: "Product demos", badge: "Sales Video", description: "Interactive and video product demos for high-intent buyers.", fields: createStandardFields("Demo Access Strategy", "e.g. Self-serve interactive demo on website", "Key Features Demonstrated", "Show 3 killer features in action.") },
      { id: "tactic_youtube_marketing", title: "YouTube marketing", badge: "YouTube Channel", description: "Building a dedicated YouTube channel focused on tutorial SEO.", fields: createStandardFields("Channel Niche Title", "e.g. DealFlow Academy: Sales & AI", "Video Production Schedule", "1 Long-form tutorial weekly + 3 YouTube Shorts.") },
      { id: "tactic_short_form_video", title: "Short-form video strategy", badge: "Shorts & Reels", description: "Repurposing long videos into short vertical video clips.", fields: createStandardFields("Repurposing Source", "e.g. Cut 5 shorts from weekly webinar recordings", "Distribution Channels", "Publish to YouTube Shorts, IG Reels, and TikTok.") },
      { id: "tactic_webinar_marketing", title: "Webinar marketing", badge: "Lead Gen Webinar", description: "Live educational webinars driving targeted lead registrations.", fields: createStandardFields("Webinar Subject Title", "e.g. How to Automate Outbound in 2026", "Promotion Strategy", "Email list blast + LinkedIn event page + Paid social ads.") },
      { id: "tactic_testimonial_videos", title: "Testimonial videos", badge: "Social Proof Video", description: "Filming enterprise customer success stories on camera.", fields: createStandardFields("Featured Customer", "e.g. Chief Revenue Officer at ScaleCo", "Video Placement", "Embed prominently on pricing and demo pages.") },
      { id: "tactic_founder_branding", title: "Founder branding videos", badge: "Founder Video", description: "Founder-led video content establishing visionary leadership.", fields: createStandardFields("Founder Message Theme", "e.g. Why we built DealFlow AI and where B2B sales is going", "Distribution Strategy", "Post natively to LinkedIn and Twitter.") },
      { id: "tactic_product_walkthroughs", title: "Product walkthroughs", badge: "Feature Deep Dive", description: "Detailed walkthrough videos covering specific workflow modules.", fields: createStandardFields("Module Focus", "e.g. Advanced AI Routing Configuration", "Target Viewer", "Existing customers and technical sales engineers.") },
      { id: "tactic_live_streaming", title: "Live streaming", badge: "Live Interactive", description: "Hosting live interactive Q&A sessions on YouTube/LinkedIn.", fields: createStandardFields("Live Event Title", "e.g. Live Pipeline Audit with RevOps Experts", "Audience Participation", "Review live user pipelines submitted in chat.") }
    ]
  },

  // 12. Audio Marketing
  {
    id: "audio_marketing_tactics",
    title: "Audio Marketing",
    typeGroup: "marketing_tactics",
    icon: Radio,
    accentColor: "pink",
    badgeColor: "bg-pink-500/10 text-pink-400 border-pink-500/30",
    borderColor: "border-pink-500",
    subTypes: [
      { id: "tactic_podcast_marketing", title: "Podcast marketing", badge: "Podcast Show", description: "Launching and growing a branded podcast for industry thought leadership.", fields: createStandardFields("Podcast Show Name", "e.g. The DealFlow Dispatch Podcast", "Guest Strategy", "Interview top VPs of Sales and RevOps thought leaders.") },
      { id: "tactic_audio_repurposing", title: "Audio repurposing", badge: "Multi-Format", description: "Converting blog posts and webinars into audio snippets.", fields: createStandardFields("Source Material", "e.g. Convert top 10 blog posts into audio episodes", "Audio Distribution", "Publish audio versions to Spotify and Apple Podcasts.") },
      { id: "tactic_live_audio", title: "Live audio discussions", badge: "Twitter Spaces", description: "Hosting live Twitter Spaces and LinkedIn Audio rooms.", fields: createStandardFields("Audio Room Topic", "e.g. Weekly Outbound Strategy Roundtable", "Moderator Plan", "Host 45-minute casual discussion with 3 guest speakers.") }
    ]
  },

  // 13. Visual Marketing
  {
    id: "visual_marketing_tactics",
    title: "Visual Marketing",
    typeGroup: "marketing_tactics",
    icon: PieChart,
    accentColor: "indigo",
    badgeColor: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
    borderColor: "border-indigo-500",
    subTypes: [
      { id: "tactic_infographics_tactic", title: "Infographics", badge: "Visual Data", description: "Designing shareable visual data graphics for social and PR.", fields: createStandardFields("Infographic Data Focus", "e.g. 2026 B2B Revenue Tech Stack Benchmark", "Design Style", "Modern dark-mode glassmorphism visual layout.") },
      { id: "tactic_carousel_marketing", title: "Carousel marketing", badge: "Social Carousel", description: "Designing multi-slide visual posts for LinkedIn and Instagram.", fields: createStandardFields("Carousel Concept", "e.g. 7 Steps to Modernize Your Outbound Engine", "Slide-by-Slide Outline", "Outline headlines for slides 1 through 7.") },
      { id: "tactic_data_visualization", title: "Data visualization", badge: "Chart Design", description: "Creating compelling chart graphics from complex dataset insights.", fields: createStandardFields("Dataset Insight", "e.g. Conversion rate vs response time chart", "Visual Format", "High-contrast bar chart with callout annotations.") },
      { id: "tactic_meme_marketing", title: "Meme marketing", badge: "Viral Humor", description: "Using relatable industry humor graphics to boost social engagement.", fields: createStandardFields("Target Industry Joke", "e.g. RevOps reps when CRM data doesn't sync", "Caption Text", "Punchy caption that invites tagging colleagues.") },
      { id: "tactic_quote_graphics_tactic", title: "Quote graphics", badge: "Quote Card", description: "Branded quote graphics featuring customer and executive insights.", fields: createStandardFields("Quote Content", "e.g. 'AI doesn't replace sellers, it supercharges them.'", "Design Specs", "Branded background with high-contrast typography.") }
    ]
  },

  // 14. AI Marketing
  {
    id: "ai_marketing_tactics",
    title: "AI Marketing",
    typeGroup: "marketing_tactics",
    icon: Cpu,
    accentColor: "violet",
    badgeColor: "bg-violet-500/10 text-violet-400 border-violet-500/30",
    borderColor: "border-violet-500",
    subTypes: [
      { id: "tactic_ai_content_gen", title: "AI content generation", badge: "AI Speed", description: "Scaling content output using AI generation workflows.", fields: createStandardFields("Content Format Goal", "e.g. 20 SEO Articles per month", "Quality Control Process", "AI draft -> Human edit -> SEO optimization -> Publish.") },
      { id: "tactic_ai_personalization", title: "AI personalization", badge: "Hyper-Personalized", description: "Dynamically tailoring website copy and email copy to visitor ICP.", fields: createStandardFields("Personalization Segment", "e.g. Tailor homepage copy based on visitor industry", "Dynamic Replacement Fields", "Change headline, logo proof, and CTA based on visitor domain.") },
      { id: "tactic_ai_localization", title: "AI localization", badge: "Global Reach", description: "Auto-translating and culturally adapting marketing assets.", fields: createStandardFields("Target Regions", "e.g. LATAM (Spanish) and EMEA (German)", "Assets to Localize", "Translate top 5 landing pages and email sequences.") },
      { id: "tactic_ai_repurposing", title: "AI content repurposing", badge: "1-to-10 Strategy", description: "Automatically turning 1 core video into 10 multi-channel assets.", fields: createStandardFields("Master Asset", "e.g. 30-minute Product Launch Webinar", "Output Assets Generated", "AI generates: 1 Blog post, 3 Tweets, 2 LinkedIn posts, 3 Shorts.") },
      { id: "tactic_ai_landing_pages", title: "AI landing page generation", badge: "Programmatic LP", description: "Building targeted landing pages at scale for specific keywords.", fields: createStandardFields("Keyword Cluster", "e.g. 50 long-tail industry solution terms", "Landing Page Template Structure", "Dynamic headline, tailored bullet points, relevant case study.") },
      { id: "tactic_ai_chatbot", title: "AI chatbot engagement", badge: "AI Assistant", description: "Deploying conversational AI bots on website to qualify leads 24/7.", fields: createStandardFields("Chatbot Goal", "e.g. Qualify website visitors and book demo calls", "Conversation Script Flow", "Greet -> Ask team size -> Check budget -> Book call.") }
    ]
  },

  // 15. SEO Tactics
  {
    id: "seo_tactics",
    title: "SEO Tactics",
    typeGroup: "marketing_tactics",
    icon: Search,
    accentColor: "emerald",
    badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    borderColor: "border-emerald-500",
    subTypes: [
      { id: "tactic_kw_landing_pages", title: "Keyword-targeted landing pages", badge: "SEO Landing Page", description: "Creating dedicated landing pages targeting high-intent commercial keywords.", fields: createStandardFields("Primary Keyword Target", "e.g. B2B Deal Management Platform", "On-Page SEO Strategy", "H1 title tag, meta description, optimized subheadings.") },
      { id: "tactic_programmatic_seo", title: "Programmatic SEO", badge: "Scale SEO", description: "Generating hundreds of database-driven SEO pages automatically.", fields: createStandardFields("Database Dataset Focus", "e.g. CRM Integrations by Software (e.g. Salesforce, HubSpot)", "Page Template Structure", "Dynamic comparison specs and integration instructions.") },
      { id: "tactic_backlink_building", title: "Backlink building", badge: "Off-Page SEO", description: "Executing digital PR and link outreach to build Domain Rating.", fields: createStandardFields("Link Building Strategy", "e.g. Unlinked brand mentions + HARO responses", "Monthly Backlink Target", "Secure 10 high-authority DA 50+ backlinks per month.") },
      { id: "tactic_internal_linking", title: "Internal linking", badge: "Technical SEO", description: "Optimizing internal link architecture to pass PageRank to core pages.", fields: createStandardFields("Target High-Value Page", "e.g. Main Product Pricing & Feature pages", "Internal Link Audit Plan", "Add contextual internal links from top 20 blog posts.") },
      { id: "tactic_topic_clusters", title: "Topic clusters", badge: "Cluster SEO", description: "Organizing blog content into interconnected topic clusters around pillar pages.", fields: createStandardFields("Core Topic Cluster Subject", "e.g. Modern Sales Pipeline Acceleration", "Supporting Cluster Articles", "Create 5 cluster posts linking back to main pillar guide.") },
      { id: "tactic_pillar_pages", title: "Pillar pages", badge: "Comprehensive Guide", description: "Building massive ultimate guide pages that rank for high-volume keywords.", fields: createStandardFields("Pillar Page Subject", "e.g. The Complete Guide to AI Sales Automation", "Word Count & Table of Contents", "3,500+ word comprehensive page with interactive TOC.") },
      { id: "tactic_featured_snippets", title: "Featured snippet optimization", badge: "Position 0", description: "Structuring content formatting (tables, lists) to win Google position 0.", fields: createStandardFields("Snippet Keyword", "e.g. What is deal slip rate?", "Format Strategy", "Provide concise 45-word definition + bulleted list.") },
      { id: "tactic_local_seo", title: "Local SEO", badge: "Geographic SEO", description: "Optimizing Google Business Profile and local keywords for regional traffic.", fields: createStandardFields("Target Geographic Region", "e.g. San Francisco B2B Tech Market", "Local SEO Plan", "Optimize local listings, NAP consistency, and local case studies.") },
      { id: "tactic_free_tools_seo", title: "Free tools for SEO", badge: "Tool Marketing", description: "Building free interactive web tools that attract natural backlinks.", fields: createStandardFields("Free Tool Concept", "e.g. Free Sales Sequence Length Checker", "Backlink Acquisition Plan", "Promote mini-tool on ProductHunt and directory sites.") },
      { id: "tactic_skyscraper_content", title: "Skyscraper content", badge: "Skyscraper", description: "Finding top-ranking articles and building significantly better versions.", fields: createStandardFields("Competitor Article to Beat", "e.g. Competitor's 10 Outbound Tips guide", "Our Improvement Angle", "Make it 25 Outbound Tips + Add 3 downloadable templates.") }
    ]
  },

  // 16. Paid Marketing
  {
    id: "paid_marketing_tactics",
    title: "Paid Marketing",
    typeGroup: "marketing_tactics",
    icon: DollarSign,
    accentColor: "amber",
    badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    borderColor: "border-amber-500",
    subTypes: [
      { id: "tactic_google_ads", title: "Google Ads", badge: "Paid Search", description: "High-intent Google Search advertising targeting buying queries.", fields: createStandardFields("Target Keyword Group", "e.g. 'buy deal management software'", "Ad Headline & Extension Plan", "3 Headlines + Sitelist extensions + Callout extensions.") },
      { id: "tactic_linkedin_ads", title: "LinkedIn Ads", badge: "Paid B2B", description: "Hyper-targeted sponsored content and lead gen forms on LinkedIn.", fields: createStandardFields("Targeting Criteria", "e.g. VP Sales at 50-500 employee SaaS companies", "Ad Creative & Offer", "Promote Gated Benchmark Report via Lead Form Ad.") },
      { id: "tactic_retargeting_ads", title: "Retargeting ads", badge: "Pixel Retargeting", description: "Re-engaging past website visitors across Meta, LinkedIn, and Google.", fields: createStandardFields("Website Visitor Segment", "e.g. Users who visited Pricing page but didn't sign up", "Retargeting Offer Angle", "Show client testimonial video + offer 14-day trial.") },
      { id: "tactic_sponsored_newsletters", title: "Sponsored newsletters", badge: "Newsletter Sponsorship", description: "Buying dedicated ad spots in top industry email newsletters.", fields: createStandardFields("Target Newsletter", "e.g. Morning Brew Tech, RevOps Daily", "Ad Copy & Banner Spec", "100-word main ad section + primary CTA link.") },
      { id: "tactic_podcast_sponsorships", title: "Podcast sponsorships", badge: "Audio Ad", description: "Host-read sponsor spots on targeted business podcasts.", fields: createStandardFields("Target Podcast Show", "e.g. The SaaS Podcast", "Host Read Script Copy", "60-second host read highlighting key benefit + promo code.") },
      { id: "tactic_youtube_ads", title: "YouTube Ads", badge: "Video Ad", description: "Skippable in-stream video ads targeting relevant YouTube channels.", fields: createStandardFields("Target Channel Niche", "e.g. B2B Sales & CRM tutorial channels", "Video Ad Script (5-Sec Hook)", "Grab attention in first 5 seconds before skip button.") },
      { id: "tactic_reddit_ads", title: "Reddit Ads", badge: "Subreddit Ad", description: "Promoted posts targeted at specific developer or sales subreddits.", fields: createStandardFields("Target Subreddits", "e.g. r/sales, r/SaaS", "Reddit Ad Headline Style", "Authentic, non-corporate headline that fits Reddit tone.") },
      { id: "tactic_quora_ads", title: "Quora Ads", badge: "Intent Ads", description: "Promoted answers and question-targeted ads on Quora.", fields: createStandardFields("Target Question Topics", "e.g. Questions comparing sales software", "Ad Copy Hook", "Promote comparative landing page directly.") },
      { id: "tactic_native_ads", title: "Native Ads", badge: "Native Content", description: "Sponsored articles matching format of major publisher sites.", fields: createStandardFields("Publisher Network", "e.g. Taboola / Outbrain Tech network", "Native Article Headline", "Curiosity-driven headline leading to advertorial.") },
      { id: "tactic_display_ads", title: "Display Ads", badge: "Banner Ads", description: "Visual banner ad campaigns across Google Display Network.", fields: createStandardFields("Target Audience Audience", "e.g. In-market B2B software buyers", "Banner Ad Creative Sizes", "300x250, 728x90, 160x600 visual layout concepts.") },
      { id: "tactic_paid_influencers", title: "Paid influencer collaborations", badge: "Creator Sponsorship", description: "Paid partnerships with prominent B2B creators.", fields: createStandardFields("Creator Handle", "e.g. @SalesGuru (50k followers)", "Collaboration Scope", "1 Dedicated video review + 2 social posts.") }
    ]
  },

  // 17. Community Marketing
  {
    id: "community_marketing_tactics",
    title: "Community Marketing",
    typeGroup: "marketing_tactics",
    icon: Users,
    accentColor: "pink",
    badgeColor: "bg-pink-500/10 text-pink-400 border-pink-500/30",
    borderColor: "border-pink-500",
    subTypes: [
      { id: "tactic_ugc", title: "User-generated content (UGC)", badge: "UGC Content", description: "Encouraging existing users to post unboxing or workflow videos.", fields: createStandardFields("UGC Campaign Hashtag", "e.g. #BuiltWithDealFlow", "User Incentive", "Feature top user posts on main page + monthly swag prize.") },
      { id: "tactic_review_sites", title: "Review sites (G2, Capterra)", badge: "Review Gen", description: "Systematic review generation campaigns on G2, Capterra, and TrustRadius.", fields: createStandardFields("Target Review Platform", "e.g. G2 Crowd & Capterra", "Review Incentive Offer", "Offer $25 Amazon gift card for verified user reviews.") },
      { id: "tactic_community_forums", title: "Community forums", badge: "Forum Marketing", description: "Hosting branded discussion forums for customer interaction.", fields: createStandardFields("Forum Section Name", "e.g. Feature Requests & Workflow Hacks", "Community Moderation Strategy", "Acknowledge every user thread within 2 hours.") },
      { id: "tactic_open_source", title: "Open-source contributions", badge: "Developer Trust", description: "Releasing open-source tools to build developer trust and community goodwill.", fields: createStandardFields("Open Source Project Name", "e.g. DealFlow Open Connector SDK", "GitHub Promotion Strategy", "Share project on HackerNews and GitHub trending.") },
      { id: "tactic_slack_discord", title: "Slack/Discord communities", badge: "Private Community", description: "Hosting a private Slack/Discord space for active power users.", fields: createStandardFields("Community Name", "e.g. The DealFlow Insiders Slack", "Weekly Community Events", "Host Monday office hours + Friday workflow teardowns.") },
      { id: "tactic_ambassador_programs", title: "Ambassador programs", badge: "Advocacy", description: "Formalizing brand ambassador tiers for power users.", fields: createStandardFields("Ambassador Perks", "e.g. Free VIP tier access, exclusive badge, annual retreat", "Ambassador Requirements", "Post twice monthly and answer community questions.") },
      { id: "tactic_user_spotlight", title: "User spotlight features", badge: "User Spotlight", description: "Featuring outstanding user achievements in weekly blog posts.", fields: createStandardFields("Featured User Profile", "e.g. How Rep Alex Closed a $500k Deal using DealFlow", "Spotlight Interview Questions", "Highlight individual career growth and platform usage.") },
      { id: "tactic_hackathons", title: "Hackathons", badge: "Developer Event", description: "Hosting developer hackathons to build ecosystem plugins.", fields: createStandardFields("Hackathon Theme", "e.g. AI Workflow Plugin Challenge", "Prize Pool & Partners", "$10k Prize pool sponsored by cloud partners.") }
    ]
  },

  // 18. Event Marketing
  {
    id: "event_marketing_tactics",
    title: "Event Marketing",
    typeGroup: "marketing_tactics",
    icon: Calendar,
    accentColor: "indigo",
    badgeColor: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
    borderColor: "border-indigo-500",
    subTypes: [
      { id: "tactic_event_webinars", title: "Webinars", badge: "Virtual Event", description: "High-production educational virtual sessions driving qualified leads.", fields: createStandardFields("Webinar Topic", "e.g. 2026 Pipeline Automation Masterclass", "Registration Campaign Plan", "3 Email blasts + LinkedIn event + Partner co-promotion.") },
      { id: "tactic_virtual_conferences", title: "Virtual conferences", badge: "Online Summit", description: "Multi-speaker online summits featuring industry experts.", fields: createStandardFields("Summit Title", "e.g. The Future of Revenue Summit 2026", "Speaker Lineup Strategy", "Host 12 speakers across 3 tracks over 1 day.") },
      { id: "tactic_local_meetups", title: "Local meetups", badge: "In-Person Meetup", description: "Hosting intimate regional breakfast or dinner meetups for local leaders.", fields: createStandardFields("City Location", "e.g. San Francisco / New York", "Meetup Event Format", "Executive VIP Dinner with 15 target buyers.") },
      { id: "tactic_trade_shows", title: "Trade shows", badge: "Expo Booth", description: "Exhibiting at major industry trade shows and conventions.", fields: createStandardFields("Trade Show Name", "e.g. SaaStr Annual 2026", "Booth Activation Concept", "Live 3-minute AI pipeline audits at booth.") },
      { id: "tactic_conference_sponsorships", title: "Conference sponsorships", badge: "Event Sponsor", description: "Sponsoring keynote stages and networking lounges at major events.", fields: createStandardFields("Sponsorship Tier", "e.g. Gold Stage Sponsor", "Sponsorship Deliverables", "Keynote address + Logo on badges + Dedicated booth space.") },
      { id: "tactic_user_conferences", title: "User conferences", badge: "Customer Event", description: "Annual customer conference celebrating power users.", fields: createStandardFields("Conference Title", "e.g. DealFlow World 2026", "Keynote Announcements Plan", "Unveil product roadmap and host hands-on workshops.") },
      { id: "tactic_roundtables", title: "Roundtable discussions", badge: "Executive Roundtable", description: "Closed-door moderated discussions for C-suite decision makers.", fields: createStandardFields("Roundtable Discussion Topic", "e.g. Navigating AI Risk in Enterprise Sales", "Invitation Strategy", "Exclusive personalized invitation to top 20 accounts.") },
      { id: "tactic_popup_booths", title: "Pop-up booths", badge: "Pop-up", description: "High-impact popup installations at partner events.", fields: createStandardFields("Pop-up Activation Idea", "e.g. The 'AI Sales Lounge' with espresso bar", "Engagement Goal", "Scan 200 attendee badges and book on-site demos.") }
    ]
  },

  // 19. Product-Led Growth (PLG)
  {
    id: "plg_tactics",
    title: "Product-Led Growth (PLG)",
    typeGroup: "marketing_tactics",
    icon: Rocket,
    accentColor: "emerald",
    badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    borderColor: "border-emerald-500",
    subTypes: [
      { id: "tactic_interactive_tours", title: "Interactive product tours", badge: "Self-Serve Tour", description: "No-signup interactive product demos on landing pages.", fields: createStandardFields("Tour Focus Module", "e.g. 1-Minute Self-Guided Dashboard Tour", "Interactive Hotspots", "Let visitors click through AI lead assignment live.") },
      { id: "tactic_chrome_extensions_plg", title: "Chrome extensions", badge: "Utility PLG", description: "Free browser extension driving product adoption from daily workflows.", fields: createStandardFields("Extension Core Value", "e.g. DealFlow Instant CRM Sidebar", "Virality Trigger", "Prompt user to invite teammates when saving leads.") },
      { id: "tactic_free_mini_tools_plg", title: "Free mini-tools", badge: "PLG Mini Tool", description: "Standalone free tools that showcase platform capabilities.", fields: createStandardFields("Mini-Tool Concept", "e.g. Free Sales Email AI Grader", "Signup Bridge Strategy", "Offer 3 free audits, then prompt for full account creation.") },
      { id: "tactic_roi_calculators_plg", title: "ROI calculators", badge: "Value Calculator", description: "Interactive ROI modeling tools that quantify software value.", fields: createStandardFields("ROI Calculation Logic", "e.g. Calculate hours saved per rep", "Lead Capture Option", "Email report breakdown to prospect and their boss.") },
      { id: "tactic_product_demos_plg", title: "Product demos", badge: "On-Demand Demo", description: "Frictionless on-demand product demos available 24/7.", fields: createStandardFields("Demo Access Model", "e.g. Instant video demo unlock without form friction", "Conversion Trigger", "Display booking calendar overlay 2 minutes into video.") }
    ]
  },

  // 20. Email Marketing
  {
    id: "email_marketing_tactics",
    title: "Email Marketing",
    typeGroup: "marketing_tactics",
    icon: Mail,
    accentColor: "violet",
    badgeColor: "bg-violet-500/10 text-violet-400 border-violet-500/30",
    borderColor: "border-violet-500",
    subTypes: [
      { id: "tactic_drip_campaigns", title: "Drip campaigns", badge: "Drip Nurture", description: "Automated timed email series educating new subscribers.", fields: createStandardFields("Drip Campaign Focus", "e.g. 7-Day SaaS Onboarding Drip", "Email Cadence", "Daily emails for 7 days covering 1 tip per day.") },
      { id: "tactic_nurture_sequences", title: "Nurture sequences", badge: "Lead Nurture", description: "Segment-specific email nurture flows building buyer trust.", fields: createStandardFields("Audience Segment", "e.g. Trial users who haven't invited team members", "Core Value Messaging", "Highlight collaboration features and team ROI.") },
      { id: "tactic_reengagement_campaigns", title: "Re-engagement campaigns", badge: "Winback Email", description: "Winback emails re-activating cold email subscribers.", fields: createStandardFields("Target Subscriber Status", "e.g. Unopened past 60 days", "Winback Offer", "Offer exclusive 30-day trial extension or free audit.") },
      { id: "tactic_product_update_emails", title: "Product update emails", badge: "Product Update", description: "Monthly feature release emails keeping users informed.", fields: createStandardFields("Feature Release Highlights", "e.g. Announcing 5 New Integrations", "Email CTA", "Read full release notes or try new integrations now.") },
      { id: "tactic_milestone_emails", title: "Milestone emails", badge: "Behavioral Milestone", description: "Automated emails celebrating customer usage milestones.", fields: createStandardFields("Milestone Trigger", "e.g. Customer closed 100 deals on platform!", "Celebration Message", "Send congratulations graphic + unlock bonus platform credits.") },
      { id: "tactic_behavioral_triggers", title: "Behavioral trigger emails", badge: "Real-Time Trigger", description: "Instant emails triggered by specific user actions in software.", fields: createStandardFields("Behavioral Trigger", "e.g. User created first AI sequence", "Helpful Next Step Email", "Send best-practice tips for monitoring initial open rates.") }
    ]
  }
];

// --- Schema Helper Utilities ---

export function getOptionById(optionId: string): { category: CoreContentType; subType: ContentSubType } | null {
  for (const cat of COMPLETE_CAMPAIGN_SCHEMA) {
    const sub = cat.subTypes.find(s => s.id === optionId);
    if (sub) {
      return { category: cat, subType: sub };
    }
  }
  return null;
}

export function getOptionsByGroup(group: "content_types" | "marketing_tactics"): CoreContentType[] {
  return COMPLETE_CAMPAIGN_SCHEMA.filter(cat => cat.typeGroup === group);
}

export function getTaxonomyMetrics() {
  const totalCategories = COMPLETE_CAMPAIGN_SCHEMA.length;
  let totalOptions = 0;
  let contentTypesCount = 0;
  let marketingTacticsCount = 0;

  for (const cat of COMPLETE_CAMPAIGN_SCHEMA) {
    totalOptions += cat.subTypes.length;
    if (cat.typeGroup === "content_types") {
      contentTypesCount += cat.subTypes.length;
    } else {
      marketingTacticsCount += cat.subTypes.length;
    }
  }

  return {
    totalCategories,
    totalOptions,
    contentTypesCount,
    marketingTacticsCount
  };
}

export function validateFieldInputs(
  fields: FieldDefinition[],
  formValues: Record<string, string>
): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  fields.forEach(field => {
    const rawVal = formValues[field.id] ?? "";
    const trimmed = rawVal.trim();
    const maxLen = field.maxLength ?? (field.type === "textarea" ? 2000 : 300);

    if (field.required && !trimmed) {
      errors[field.id] = `${field.label} is required.`;
    } else if (rawVal.length > maxLen) {
      const diff = rawVal.length - maxLen;
      errors[field.id] = `${field.label} exceeds maximum allowed length of ${maxLen} characters by ${diff} character${diff === 1 ? "" : "s"}.`;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}


