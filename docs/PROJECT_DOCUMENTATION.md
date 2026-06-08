# DealFlow.AI Project Documentation
*Single Source of Truth (SSOT) — High-Level Specifications, Architecture, and Workflows*

---

## 1. Executive Summary

### 1.1 Project Purpose & Overview
**DealFlow.AI** is an intelligent sales automation and pipeline acceleration platform. It leverages autonomous multi-agent reasoning, semantic memory systems, and zero-trust security guardrails to automate the lead intake, Go-To-Market (GTM) analysis, demo call scheduling, and voice confirmation pipeline. By providing instant GTM strategy generation and automated compliance-checked phone confirmations, the platform bridges the gap between digital marketing and high-converting sales calls.

### 1.2 Business Value
- **Accelerated Sales Cycle:** Eliminates manual website research by automatically scraping prospects' websites and producing customized GTM insights in under a minute.
- **Improved Demo Attendance:** Increases meeting show rates by up to **24%** through automated voice confirmations, text-based follow-ups, and calendar reminders.
- **Reduced Sales Overhead:** Automates qualification, meeting scheduling, and post-call email recaps, allowing sales representatives to focus exclusively on closing high-probability deals.
- **SOC2-Compliant AI Interactions:** Protects brand reputation and sensitive customer data using rigorous output validation and input threat detection firewalls.

### 1.3 Key Success Metrics
- **Pipeline Conversion Rate:** Target a 15% increase in lead-to-opportunity conversions.
- **Meeting Show Rate:** Attain an 85% show rate for booked demo slots.
- **Memory OS Retrieval Latency:** Keep semantic search and retrieval under **100ms** via caching.
- **Compliance Adherence:** 100% logs audit compliance for TCPA quiet hours and SOC2 verification scores.

---

## 2. Project Scope

### 2.1 In-Scope Features and Capabilities
- **Intelligent Lead Intake:** Dynamic forms with real-time field validation and context-gathering questions.
- **AI-Powered GTM Analysis:** Scrapes prospect domains and analyzes positioning to produce a GTM core framework, market expansion opportunities, strategy gaps, and buyer journey recommendations.
- **Autonomous Agent Brain:** State-driven conversation engine supporting demo calls, live dashboard adjustments, and objections reframing.
- **Agent Security Firewall (Clawpatrol):** Detects prompt injections, prevents data exfiltration (redacts PII/emails/phone numbers), computes behavior anomaly scores, and executes policy blocks.
- **Memory OS (Hermes):** 4-tier persistent memory structure (`working`, `short-term`, `long-term`, `archival`) equipped with AES encryption, LRU cache, and agent-level permissions.
- **Veritas Validation Layer:** Post-inference output checker that truncates responses, aligns context with company data, filters out restricted patterns, and generates compliance hashes.
- **AI Provider Router:** Dynamic model and API provider routing (Hugging Face Llama, Nvidia NIMs, Kimi) based on user tier and regional requirements.
- **Multi-Agent Framework:** Orchestrated data retrieval, factual validation, and report synthesis using Research, Analysis, Fact-Checking, and Synthesis agents.
- **Automated Twilio Voice Confirmation:** TCPA/GDPR-compliant transactional phone alerts confirming meeting details with automated retries and parallel fallback (Email + SMS) channels.
- **Google Meet & Calendar Integration:** Scheduled calendars synced with custom Google Workspace service accounts.
- **Immersive AR/3D Overlays:** Interactive frontend modules highlighting pipeline performance using Framer Motion and mobile device orientation HUD.

### 2.2 Out-of-Scope Elements
- **Google Sheets Data Synchronization:** **[DEPRECATED & FULLY REMOVED]** Previously supported spreadsheet sync (e.g., `GOOGLE_SHEET_ID`, `lib/sheets.ts`, `/api/sync/metrics`) has been entirely removed from the application. All operational records (leads, calls, analyses, and audit logs) reside in Firebase Firestore.
- **Manual Outbound Calling:** Sales representatives cannot make manual voice calls directly through the system.
- **Voice Stream Transfers:** The virtual agent-brain does not support live transfers of active calls to human agents.

---

## 3. Core Architecture Overview

### 3.1 Design Principles & System Components
DealFlow.AI is designed on a zero-trust, service-oriented architecture with decoupled layers for UI presentation, agent reasoning, data storage, and external telephony integrations.

```mermaid
graph TD
    UI[Next.js App / Client UI] <--> API[Next.js API Gateway / Router]
    API <--> Claw[Clawpatrol AI Firewall]
    Claw <--> Hermes[Hermes Memory OS]
    Hermes <--> FS[(Firebase Firestore)]
    Hermes <--> Vector[(Vector Storage / Pinecone)]
    API <--> Brain[Agent Brain & Veritas Layer]
    Brain <--> Router[AI Provider Router]
    Router <--> HF[Hugging Face / Llama 3]
    Router <--> NV[Nvidia NIMs]
    Router <--> Kimi[Kimi API]
    API <--> Twilio[Twilio Voice Service]
    API <--> Google[Google Meet & Calendar]
```

### 3.2 Technology Stack
- **Frontend Framework:** Next.js (App Router), React, TailwindCSS, Framer Motion, Lucide icons.
- **Primary Database:** Firebase Firestore (Lead profiles, Call statuses, Analyses, Audit logs).
- **Semantic Storage:** Pinecone Vector DB / Local Semantic Search with Hugging Face embeddings.
- **Logic & Models Orchestration:** LangGraph (StateGraph-based workflow), Model Control Protocol (MCP) clients/servers.
- **Telephony & Messaging:** Twilio Node SDK (Voice Calls, Programmable SMS, Webhook status callbacks).
- **Voice Synthesis:** ElevenLabs Voice API.
- **Scraping Engine:** Cheerio / HTML parsers.

---

## 4. Key Stakeholders & Roles

### 4.1 Internal Stakeholders
- **Product Owner:** Defines the product vision, features roadmap, and monitors general platform performance.
- **Sales Manager:** Evaluates lead pipelines, reviews AI call summaries, and acts on forecasted deal probabilities.
- **AI & Security Engineer:** Maintains the Clawpatrol policy engine, monitors anomaly scores, and updates prompt injection signatures.
- **GTM Analyst:** Manages target ICP parameters, playbook documents, and updates the suitability criteria functions.
- **Systems Administrator:** Configures Google Service Accounts, Twilio credentials, and manages API resource consumption.

### 4.2 External Stakeholders
- **Leads & Prospects:** Input organizational profiles, browse solutions, book demo calls, and receive voice/text confirmations.
- **Compliance Auditors:** Inspect immutable audit logs stored in Firestore to verify TCPA compliance (opt-out adherence, quiet hours check) and SOC2 security verification states.

---

## 5. Primary Workflows

### 5.1 Intake & GTM Analysis Workflow
Automates the process of identifying lead needs and producing actionable advice.
```mermaid
sequenceDiagram
    autonumber
    Prospect->>UI: Submits Intake Form
    UI->>API: POST /api/analyze
    API->>Scraper Node: Extract website text (Cheerio)
    Scraper Node->>Llama Node: Generate GTM analysis
    Llama Node->>ICP Matcher: Find ICP (Enterprise SaaS, Mid-Market, SMB)
    ICP Matcher->>Firestore: Store GTM report
    Firestore->>UI: Render GTM insights & playbooks
```

### 5.2 Booking & Voice Confirmation Workflow
Ensures scheduled demos are verified automatically through TCPA-compliant telephony pipelines.
```mermaid
sequenceDiagram
    autonumber
    Prospect->>UI: Selects calendar slot
    UI->>API: POST /api/book-meeting
    API->>Google Calendar: Schedule Google Meet Event
    API->>Voice Conf: Trigger voice-confirmation.ts
    Voice Conf->>Consent Registry: Check opt-out status
    Voice Conf->>Compliance Check: Verify quiet hours (8 AM - 9 PM)
    alt Compliant & Opted-In
        Voice Conf->>Twilio: Place Call (Alice TTS TwiML)
        Twilio-->>API: Status Callback Webhook
        alt Call Successful
            API->>Firestore: Log status 'completed'
        else Call Fails / Unanswered (Max 3 attempts)
            API->>Voice Conf: Trigger Fallback Channel
            Voice Conf->>Notifications: Send parallel SMS + Email
            Notifications->>Firestore: Log fallback status
        end
    else Non-Compliant / Opted-Out
        Voice Conf->>Notifications: Direct fallback SMS + Email
        Notifications->>Firestore: Log compliance bypass
    end
```

### 5.3 Live AI Agent Sales Call Pipeline
Ensures live voice sessions are conversational, accurate, and completely secure.
```mermaid
graph TD
    Input[Incoming Audio / Text] --> ClawIn[Clawpatrol Inbound Check]
    ClawIn -- Blocked --> Reject[Block / Alert]
    ClawIn -- Allowed --> Hermes[Retrieve context from Hermes OS]
    Hermes --> Brain[Agent Brain / Decides next Action]
    Brain --> Veritas[Veritas Validation Layer]
    Veritas --> ClawOut[Clawpatrol Outbound Check]
    ClawOut --> TTS[Speech Synthesis / Audio response]
```

### 5.4 Multi-Agent Research & Synthesis Workflow
```mermaid
sequenceDiagram
    autonumber
    Orchestrator->>Message Queue: Pushes Research Task
    Message Queue->>Research Agent: Crawl domain & collect data
    Research Agent->>Message Queue: Push raw findings
    Message Queue->>Analysis Agent: Calculate GTM metrics & scoring
    Analysis Agent->>Message Queue: Push calculations
    Message Queue->>Fact Check Agent: Verify claims & consistency
    Fact Check Agent->>Message Queue: Push verified findings
    Message Queue->>Synthesis Agent: Consolidate final report
    Synthesis Agent->>Orchestrator: Deliver structured synthesis output
```

---

## 6. Functional Requirements

### 6.1 Core Platform
- **FR-1.1 (High):** Lead intake forms must accept domain URLs and validate structure.
- **FR-1.2 (Medium):** Interactive sales pipeline must display deal stages (Intake, Analysis, Solutions, Demo booked, Call completed).
- **FR-1.3 (Low):** Real-time activity feed must stream Firestore updates using WebSockets/Listeners.

### 6.2 AI & Automation
- **FR-2.1 (High):** System must scrape website pages and clean non-text elements (scripts/style/SVG).
- **FR-2.2 (High):** Llama-3 model must output structured JSON GTM analysis with zero-text markup.
- **FR-2.3 (Medium):** Veritas trust layer must truncate agent spoken responses to 5 sentences max.
- **FR-2.4 (High):** Multi-agent orchestrator must run Research, Analysis, Fact-Checking, and Synthesis tasks sequentially via Message Queue.

### 6.3 Outreach & Communication
- **FR-3.1 (High):** System must call prospects via Twilio REST API when a slot is booked.
- **FR-3.2 (High):** Confirmation voice message must spell out calendar codes phonetically (e.g. "G o o g l e   M e e t   c o d e").
- **FR-3.3 (Medium):** If outbound call fails after 3 tries, parallel SMS and transactional emails must be delivered.
- **FR-3.4 (Low):** Outbound confirmation campaigns must sync with WhatsApp templates.

### 6.4 Security & Compliance
- **FR-4.1 (High):** Clawpatrol firewall must detect prompt injection strings and halt processing.
- **FR-4.2 (High):** PII (emails, card details, phone numbers) must be redacted dynamically before storing.
- **FR-4.3 (High):** Voice confirmation service must verify the lead is not in the `user_consent` opt-out table and that call times fall within 8 AM - 9 PM recipient local time.
- **FR-4.4 (Medium):** Secure Firestore transactions must record OTP authentication events.

---

## 7. Non-Functional Requirements

### 7.1 Performance
- **Retrieval Latency:** Semantic memory lookups from [Hermes Memory OS](file:///d:/Project/DealFlow.AI/dealsflowsai/lib/hermes/hermes.ts) using cache must return under **100ms**.
- **Synthesis Turnaround:** GTM analysis and multi-agent synthesis workflows must complete in under **60s**.
- **Telephony Webhook Response:** Twilio status callbacks must be processed by `/api/calls/status-callback` in less than **200ms**.

### 7.2 Security
- **Data Encryption:** All long-term and archival memories must be encrypted at rest using AES block-level encryption inside [Hermes](file:///d:/Project/DealFlow.AI/dealsflowsai/lib/hermes/hermes.ts).
- **Zero-Trust Boundaries:** Outbound responses generated by agents must undergo validation (Veritas) and security scan (Clawpatrol) before release.

### 7.3 Reliability & Availability
- **Failover Routing:** The [AI Provider Router](file:///d:/Project/DealFlow.AI/dealsflowsai/lib/ai-provider-router.ts) must redirect requests to Hugging Face if Nvidia or Kimi API calls encounter 5xx errors or timeouts.
- **Database Durability:** Use offline persistence capabilities of Firebase Firestore SDK for client state.

### 7.4 Compliance
- **TCPA Quiet Hours:** Outbound phone confirmations must not execute before 8:00 AM or after 9:00 PM in the recipient's timezone.
- **SOC2 Audit Trail:** Every incoming prompt, outgoing agent utterance, and verification check must generate an audit record with a hash checksum and compliance flag in Firestore.

---

## 8. Project Timeline & Milestones

The project delivery plan is organized into five successive sprints, focusing on building foundations, agent reasoning, outreach, zero-trust security layers, and certification.

```mermaid
gantt
    title DealFlow.AI Release Schedule
    dateFormat  YYYY-MM-DD
    section Sprints
    Sprint 1: Foundations & Intake         :active, 2026-06-05, 14d
    Sprint 2: GTM Analysis & Multi-Agent  : 2026-06-19, 14d
    Sprint 3: Telephony & Voice Confirm   : 2026-07-03, 14d
    Sprint 4: Security & Persistent OS    : 2026-07-17, 14d
    Sprint 5: Compliance Audit & Launch   : 2026-07-31, 14d
```

| Milestone ID | Milestone Description | Target Date | Critical Dependencies |
|---|---|---|---|
| **M1** | Client UI intake form & Firestore database live | 2026-06-19 | None |
| **M2** | Multi-agent research pipeline and Llama-3 scraping live | 2026-07-03 | M1, Hugging Face Token |
| **M3** | Twilio integration with TCPA checks & voice confirmations | 2026-07-17 | M2, Twilio Account Verification |
| **M4** | Clawpatrol Firewall and Hermes Memory encryption active | 2026-07-31 | M3, Pinecone Index setup |
| **M5** | SOC2 assessment completed & Production Deployment | 2026-08-14 | M4, Audit Log configuration |

---

## 9. Risk Assessment & Mitigation Strategies

| Risk Description | Potential Impact | Severity | Planned Mitigation Measure |
|---|---|---|---|
| **LLM Output Hallucination** | Lead receives incorrect analysis or off-topic recommendations. | High | [Veritas validation layer](file:///d:/Project/DealFlow.AI/dealsflowsai/lib/veritas.ts) compares outputs against scraped web data, enforces maximum length, and applies compliance checks. |
| **Prompt Injection Attacks** | Adversaries inject jailbreaks to use the agent for malicious tasks. | Critical | [Clawpatrol firewall](file:///d:/Project/DealFlow.AI/dealsflowsai/lib/clawpatrol/clawpatrol.ts) reviews all inbound queries, flags suspicious regex patterns, and blocks accounts exceeding threat thresholds. |
| **TCPA Compliance Violation** | Automated voice calls made outside designated hours, leading to legal issues. | Critical | Built-in quiet hour checks in [voice-confirmation.ts](file:///d:/Project/DealFlow.AI/dealsflowsai/lib/voice-confirmation.ts) compute recipient local hours; automatically bypasses to email/SMS fallback if out of bounds. |
| **AI Provider Outages** | The platform is unable to generate GTM analysis or agent actions due to HF/Nvidia downtime. | High | [AI Provider Router](file:///d:/Project/DealFlow.AI/dealsflowsai/lib/ai-provider-router.ts) implements automatic failovers, immediately redirecting traffic to Kimi or Hugging Face. |

---

## 10. Maintenance & Support Framework

### 10.1 Post-Launch Support Tier Structure
- **Tier 1 (Customer Operations):** Handles intake form assistance, account setups, and meeting rescheduling requests.
- **Tier 2 (Integration Support):** Investigates carrier delivery errors, Twilio webhook timeouts, and Google API credential renewals.
- **Tier 3 (AI Engineering):** Investigates model routing failures, updates Clawpatrol security policies, and monitors Hermes Cache hit ratios.

### 10.2 Operations Maintenance Protocols
- **Weekly Policy Sync:** Update prompt injection strings and regex expressions inside Clawpatrol based on new vectors.
- **Monthly Cache Audit:** Review Hermes Memory OS memory cache utilization, adjusting cache TTL and max size limits.
- **Quarterly Compliance Review:** Audit `audit_logs` collections in Firestore to verify all Twilio calls respected the 8 AM - 9 PM local time window and opt-out statuses.

### 10.3 Future Enhancement Roadmap
- **Salesforce & HubSpot CRM integration:** Bi-directional contact syncing to import leads directly.
- **Expanded WhatsApp Sequencing:** Send pre-call preparation guides and interactive CTA options via WhatsApp Business.
- **Advanced Vector Storage Options:** Deploy hybrid keyword-vector search methods inside Hermes for better discovery.
