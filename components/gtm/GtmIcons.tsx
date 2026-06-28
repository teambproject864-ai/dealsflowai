import { cn } from "@/lib/utils";
import type { ComponentType, ReactNode, SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { className?: string };

const S = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  fill: "none" as const,
  stroke: "currentColor" as const,
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function wrap(children: ReactNode, className?: string, props?: IconProps) {
  const { className: cn2, ...rest } = props ?? {};
  return (
    <svg className={cn("h-6 w-6 shrink-0 drop-shadow-[0_2px_6px_rgba(20,184,166,0.25)]", className, cn2)} {...S} {...rest}>
      {children}
    </svg>
  );
}

/** Modern 3D Isometric Logo */
export function IconDealflowLogo(props: IconProps) {
  const { className: cn2, ...rest } = props ?? {};
  return (
    <svg className={cn("shrink-0", props.className, cn2)} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...rest}>
      <defs>
        <linearGradient id="dfGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2dd4bf" />
          <stop offset="50%" stopColor="#14b8a6" />
          <stop offset="100%" stopColor="#0ea5e9" />
        </linearGradient>
      </defs>
      <polygon points="12,2 21,7 12,12 3,7" fill="url(#dfGradient)" opacity="0.9" />
      <polygon points="3,7 12,12 12,22 3,17" fill="url(#dfGradient)" opacity="0.5" />
      <polygon points="21,7 12,12 12,22 21,17" fill="url(#dfGradient)" opacity="0.25" />
      <path d="M12,2 L21,7 L12,12 L3,7 Z M3,7 L12,12 L12,22 L3,17 Z M21,7 L12,12 L12,22 L21,17 Z" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" strokeLinejoin="round" />
    </svg>
  );
}

/** Stacked sales funnel — awareness → opportunity */
export function IconSalesFunnel(props: IconProps) {
  return wrap(
    <>
      <path d="M3 4h18l-3 5H6L3 4z" />
      <path d="M6 9h12l-2.5 4h-7L6 9z" />
      <path d="M8.5 13h7l-2 6h-3l-2-6z" />
    </>,
    props.className,
    props
  );
}

/** Horizontal deal pipeline with stages */
export function IconPipelineStages(props: IconProps) {
  return wrap(
    <>
      <path d="M4 18V6h4v12H4zM10 18V9h4v9h-4zM16 18V12h4v6h-4z" />
      <path d="M2 20h20" />
    </>,
    props.className,
    props
  );
}

/** CRM sync — branching workflow */
export function IconPipelineCrm(props: IconProps) {
  return wrap(
    <>
      <circle cx="6" cy="6" r="2.5" />
      <circle cx="18" cy="6" r="2.5" />
      <circle cx="12" cy="18" r="2.5" />
      <path d="M8 7.5h8M12 8.5v7.5M9.5 17l-2-6M14.5 17l2-6" />
    </>,
    props.className,
    props
  );
}

/** Conversion trend — bars + uplift */
export function IconConversionBars(props: IconProps) {
  return wrap(
    <>
      <path d="M4 19V5M4 19h16" />
      <path d="M7 19v-5M11 19v-9M15 19v-3M19 19v-7" />
      <path d="M14 8l3-3 4 4" />
    </>,
    props.className,
    props
  );
}

/** Revenue growth curve */
export function IconRevenueGrowth(props: IconProps) {
  return wrap(
    <>
      <path d="M3 19V5M3 19h18" />
      <path d="M5 15c3-6 6-9 9-9s5 3 7 8" />
      <path d="M17 6l3 3-3 3" />
    </>,
    props.className,
    props
  );
}

/** GTM acceleration */
export function IconRevenueAcceleration(props: IconProps) {
  return wrap(
    <>
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </>,
    props.className,
    props
  );
}

/** Customer acquisition */
export function IconCustomerAcquisition(props: IconProps) {
  return wrap(
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M4 20v-1a5 5 0 0 1 5-5h1" />
      <path d="M18 11v6M15 14h6" />
    </>,
    props.className,
    props
  );
}

/** Territory / team coverage */
export function IconTeamTerritory(props: IconProps) {
  return wrap(
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </>,
    props.className,
    props
  );
}

/** Campaign launch */
export function IconMegaphoneCampaign(props: IconProps) {
  return wrap(
    <>
      <path d="M3 11l4-4v10l-4-4zM7 9h3a4 4 0 0 1 4 4v1a2 2 0 0 0 2 2h1" />
      <path d="M16 18h2M14 20h4" />
    </>,
    props.className,
    props
  );
}

/** Customer journey path */
export function IconCustomerJourney(props: IconProps) {
  return wrap(
    <>
      <path d="M3 18c4-8 8-12 18-14" strokeDasharray="2 3" />
      <circle cx="5" cy="16" r="1.5" fill="currentColor" />
      <circle cx="12" cy="11" r="1.5" fill="currentColor" />
      <circle cx="18" cy="7" r="1.5" fill="currentColor" />
    </>,
    props.className,
    props
  );
}

/** Lead capture */
export function IconLeadMagnet(props: IconProps) {
  return wrap(
    <>
      <path d="M8 4h8v4a4 4 0 0 1-8 0V4z" />
      <path d="M10 8V20M14 8v12" />
      <path d="M8 20h8" />
    </>,
    props.className,
    props
  );
}

/** KPI dashboard tiles */
export function IconKpiDashboard(props: IconProps) {
  return wrap(
    <>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <path d="M15 18h5M15 15l2.5-2.5L21 16" />
    </>,
    props.className,
    props
  );
}

/** Prospect & intel search */
export function IconProspectSearch(props: IconProps) {
  return wrap(
    <>
      <circle cx="10" cy="10" r="6" />
      <path d="M20 20l-4-4M6 8h8M6 11h5" />
    </>,
    props.className,
    props
  );
}

/** Stacked KPI bars */
export function IconKpiStackedBars(props: IconProps) {
  return wrap(
    <>
      <path d="M4 19V3M4 19h16" />
      <rect x="7" y="12" width="3" height="7" rx="0.5" />
      <rect x="12" y="8" width="3" height="11" rx="0.5" />
      <rect x="17" y="5" width="3" height="14" rx="0.5" />
    </>,
    props.className,
    props
  );
}

/** AI seller / copilot */
export function IconAiSeller(props: IconProps) {
  return wrap(
    <>
      <rect x="5" y="9" width="14" height="10" rx="2" />
      <path d="M9 9V7a3 3 0 0 1 6 0v2M12 14v2" />
      <path d="M8 4l1 2M16 4l-1 2" />
    </>,
    props.className,
    props
  );
}

/** Email sequences */
export function IconEmailSequence(props: IconProps) {
  return wrap(
    <>
      <path d="M4 6h16v12H4zM4 6l8 6 8-6" />
      <path d="M4 14l5-3M20 14l-5-3" />
    </>,
    props.className,
    props
  );
}

/** SMS / conversational thread */
export function IconSmsThread(props: IconProps) {
  return wrap(
    <>
      <path d="M21 15a4 4 0 0 1-4 4H8l-5 3v-3H4a4 4 0 0 1-4-4V6a4 4 0 0 1 4-4h13a4 4 0 0 1 4 4v9z" />
      <path d="M7 8h6M7 12h10" />
    </>,
    props.className,
    props
  );
}

/** Voice / dialer */
export function IconPhoneDialer(props: IconProps) {
  return wrap(
    <>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.86.3 1.7.54 2.5a2 2 0 0 1-.45 2.11L8.09 10.91a16 16 0 0 0 6 6l1.58-1.11a2 2 0 0 1 2.11-.45c.8.24 1.64.42 2.5.54A2 2 0 0 1 22 16.92z" />
    </>,
    props.className,
    props
  );
}

export function IconShieldCompliance(props: IconProps) {
  return wrap(
    <>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </>,
    props.className,
    props
  );
}

export function IconLockVault(props: IconProps) {
  return wrap(
    <>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </>,
    props.className,
    props
  );
}

export function IconPlaybookSettings(props: IconProps) {
  return wrap(
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </>,
    props.className,
    props
  );
}

export function IconSignalBell(props: IconProps) {
  return wrap(
    <>
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
      <circle cx="18" cy="5" r="2" fill="currentColor" />
    </>,
    props.className,
    props
  );
}

export function IconCalendarQuarter(props: IconProps) {
  return wrap(
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
      <path d="M8 14h3M8 17h2M14 14h4" />
    </>,
    props.className,
    props
  );
}

export function IconGlobeMarkets(props: IconProps) {
  return wrap(
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" />
    </>,
    props.className,
    props
  );
}

export function IconUserStakeholder(props: IconProps) {
  return wrap(
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20v-1a8 8 0 0 1 16 0v1" />
    </>,
    props.className,
    props
  );
}

export function IconVideoSession(props: IconProps) {
  return wrap(
    <>
      <rect x="2" y="6" width="14" height="12" rx="2" />
      <path d="M16 10l6-3v10l-6-3v-4z" />
    </>,
    props.className,
    props
  );
}

export function IconDealBrief(props: IconProps) {
  return wrap(
    <>
      <path d="M6 4h9l3 3v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
      <path d="M8 12h8M8 16h6" />
    </>,
    props.className,
    props
  );
}

export function IconCampaignBurst(props: IconProps) {
  return wrap(
    <>
      <path d="M12 3v2M12 19v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M3 12h2M19 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
      <circle cx="12" cy="12" r="4" />
    </>,
    props.className,
    props
  );
}

export function IconMenu(props: IconProps) {
  return wrap(
    <>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </>,
    props.className,
    props
  );
}

export function IconClose(props: IconProps) {
  return wrap(
    <>
      <path d="M18 6L6 18M6 6l12 12" />
    </>,
    props.className,
    props
  );
}

export function IconArrowRight(props: IconProps) {
  return wrap(
    <>
      <path d="M5 12h14M12 5l7 7-7 7" />
    </>,
    props.className,
    props
  );
}

export function IconArrowLeft(props: IconProps) {
  return wrap(
    <>
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </>,
    props.className,
    props
  );
}

export function IconPlus(props: IconProps) {
  return wrap(
    <>
      <path d="M12 5v14M5 12h14" />
    </>,
    props.className,
    props
  );
}

export function IconSend(props: IconProps) {
  return wrap(
    <>
      <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
    </>,
    props.className,
    props
  );
}

export function IconLogOut(props: IconProps) {
  return wrap(
    <>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
    </>,
    props.className,
    props
  );
}

export function IconExternalWindow(props: IconProps) {
  return wrap(
    <>
      <path d="M18 13v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
    </>,
    props.className,
    props
  );
}

export function IconRefreshPipeline(props: IconProps) {
  return wrap(
    <>
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
      <path d="M21 21v-5h-5" />
    </>,
    props.className,
    props
  );
}

export function IconAlertRisk(props: IconProps) {
  return wrap(
    <>
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01" />
    </>,
    props.className,
    props
  );
}

export function IconCheckCircle(props: IconProps) {
  return wrap(
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M8 12l2.5 2.5L16 9" />
    </>,
    props.className,
    props
  );
}

export function IconCheckStep(props: IconProps) {
  return wrap(
    <>
      <path d="M20 6L9 17l-5-5" />
    </>,
    props.className,
    props
  );
}

export function IconAlertObjection(props: IconProps) {
  return wrap(
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4M12 16h.01" />
    </>,
    props.className,
    props
  );
}

export function IconFunnelFilter(props: IconProps) {
  return wrap(
    <>
      <path d="M4 4h16l-6 8v6l-4 2v-8L4 4z" />
    </>,
    props.className,
    props
  );
}

export function IconLinkAttribution(props: IconProps) {
  return wrap(
    <>
      <path d="M10 13a5 5 0 0 1 0-7l1-1a5 5 0 0 1 7 7l-1 1M14 11a5 5 0 0 1 0 7l-1 1a5 5 0 0 1-7-7l1-1" />
    </>,
    props.className,
    props
  );
}

export function IconImageCollateral(props: IconProps) {
  return wrap(
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="8" cy="10" r="2" />
      <path d="M21 15l-5-5L8 19" />
    </>,
    props.className,
    props
  );
}

export function IconBriefingInfo(props: IconProps) {
  return wrap(
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" />
    </>,
    props.className,
    props
  );
}

export function IconAwardRoi(props: IconProps) {
  return wrap(
    <>
      <path d="M7 4h10v5a5 5 0 0 1-10 0V4zM9 9v8M15 9v8M8 21h8M12 17v4" />
    </>,
    props.className,
    props
  );
}

export function IconLaunchGtm(props: IconProps) {
  return wrap(
    <>
      <path d="M4.5 16.5c1.5 1.3 2 5 2 5s3.7-.5 5-2c.7-.8.7-2.1-.1-2.9s-2.1-.8-2.9-.1z" />
      <path d="M12 15l-3-3c2-4 6-9 14-11 0 3-2 8-6 11l-3 3" />
      <path d="M9 12H4s1-4 3-5c1.5-1 5 0 5 0M12 15v5s3-.5 4-2c1-1.5 0-5 0-5" />
    </>,
    props.className,
    props
  );
}

export function IconTargetAccount(props: IconProps) {
  return wrap(
    <>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </>,
    props.className,
    props
  );
}

export function IconChipPlatform(props: IconProps) {
  return wrap(
    <>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M9 9h6v6H9zM9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3" />
    </>,
    props.className,
    props
  );
}

export function IconInterfaceRevenue(props: IconProps) {
  return wrap(
    <>
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </>,
    props.className,
    props
  );
}

export function IconLogicStack(props: IconProps) {
  return wrap(
    <>
      <rect x="4" y="4" width="16" height="6" rx="1" />
      <rect x="4" y="14" width="16" height="6" rx="1" />
      <path d="M8 10v4M12 10v4M16 10v4" />
    </>,
    props.className,
    props
  );
}

export function IconDataVault(props: IconProps) {
  return wrap(
    <>
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5v6c0 1.66 4 3 9 3s9-1.34 9-3V5" />
      <path d="M3 11v6c0 1.66 4 3 9 3s9-1.34 9-3v-6" />
    </>,
    props.className,
    props
  );
}

export function IconBuyerMotion(props: IconProps) {
  return wrap(
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
      <path d="M18 5l2-2M18 5l2 2" />
    </>,
    props.className,
    props
  );
}

export function IconCaptureInbound(props: IconProps) {
  return wrap(
    <>
      <path d="M12 3v9M8 7l4-4 4 4" />
      <path d="M4 14h16v2a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-2z" />
    </>,
    props.className,
    props
  );
}

export function IconExecutePlay(props: IconProps) {
  return wrap(
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
      <path d="M15 12h3l2 3" />
    </>,
    props.className,
    props
  );
}

export function IconPersistLearn(props: IconProps) {
  return wrap(
    <>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2zM8 7h8M8 11h6" />
    </>,
    props.className,
    props
  );
}

/** Network / A2A communication */
export function IconNetworkNodes(props: IconProps) {
  return wrap(
    <>
      <circle cx="12" cy="12" r="2" />
      <circle cx="5" cy="5" r="2" />
      <circle cx="19" cy="5" r="2" />
      <circle cx="5" cy="19" r="2" />
      <circle cx="19" cy="19" r="2" />
      <path d="M7 7l3 3M17 7l-3 3M7 17l3-3M17 17l-3-3M14 12l3 0M10 12l-3 0" />
    </>,
    props.className,
    props
  );
}

/** Graph / Knowledge Graph */
export function IconKnowledgeGraph(props: IconProps) {
  return wrap(
    <>
      <circle cx="6" cy="6" r="2" />
      <circle cx="18" cy="6" r="2" />
      <circle cx="12" cy="18" r="2" />
      <path d="M7 7l4 9M17 7l-4 9M8 6h8" />
    </>,
    props.className,
    props
  );
}

/** Memory / Context */
export function IconContextMemory(props: IconProps) {
  return wrap(
    <>
      <path d="M3 5v4a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2z" />
      <path d="M3 10v6a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-6" />
      <path d="M7 19h10" />
    </>,
    props.className,
    props
  );
}

/** Orchestration / Task management */
export function IconOrchestrator(props: IconProps) {
  return wrap(
    <>
      <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
      <line x1="12" y1="22" x2="12" y2="15.5" />
      <polyline points="22 8.5 12 15.5 2 8.5" />
    </>,
    props.className,
    props
  );
}

/** Observability / Monitoring */
export function IconObservability(props: IconProps) {
  return wrap(
    <>
      <path d="M3 3v18h18" />
      <path d="M7 14l3-4 3 2 4-6 3 4" />
    </>,
    props.className,
    props
  );
}

/** Sparkles / FAPO */
export function IconSparkles(props: IconProps) {
  return wrap(
    <>
      <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
      <path d="M5 12l0.5 2L8 14.5l-2 0.5L5 17l-0.5-2L2 14.5l2-0.5L5 12z" />
      <path d="M19 12l0.5 2L22 14.5l-2 0.5L19 17l-0.5-2L16 14.5l2-0.5L19 12z" />
    </>,
    props.className,
    props
  );
}

/** Globe / International */
export function IconGlobe(props: IconProps) {
  return IconGlobeMarkets(props);
}

/** Star / Favorites */
export function IconStar(props: IconProps) {
  return wrap(
    <>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </>,
    props.className,
    props
  );
}

/** User / Account */
export function IconUser(props: IconProps) {
  return IconUserStakeholder(props);
}

/** Map legacy Lucide icon names from feature definitions to GTM icons */
export function getGtmFeatureIcon(iconName: string): ComponentType<IconProps> {
  const map: Record<string, ComponentType<IconProps>> = {
    Zap: IconRevenueAcceleration,
    Shield: IconShieldCompliance,
    MessageSquare: IconSmsThread,
    TrendingUp: IconConversionBars,
    Users: IconTeamTerritory,
    Bot: IconAiSeller,
    Layers: IconPipelineStages,
    Mail: IconEmailSequence,
    Phone: IconPhoneDialer,
    BarChart: IconKpiStackedBars,
    Settings: IconPlaybookSettings,
    Lock: IconLockVault,
    Workflow: IconPipelineCrm,
    Search: IconProspectSearch,
    Bell: IconSignalBell,
    Calendar: IconCalendarQuarter,
    Network: IconNetworkNodes,
    Graph: IconKnowledgeGraph,
    Memory: IconContextMemory,
    Orchestrator: IconOrchestrator,
    Monitor: IconObservability,
    Sparkles: IconSparkles,
    Globe: IconGlobeMarkets,
    Star: IconStar,
    User: IconUserStakeholder,
  };
  return map[iconName] ?? IconPlaybookSettings;
}
