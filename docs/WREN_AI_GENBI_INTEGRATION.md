# Wren AI / GenBI Integration — DealFlow.AI

## Overview

DealFlow.AI implements a **GenBI (Generative Business Intelligence) Assistant** in the Agent Portal, providing the core capabilities of Wren AI — natural language to query translation, live data execution, and an error-correction loop — using the platform's existing AI provider router (Kimi / HuggingFace / NVIDIA).

This document covers the architecture, security model, data sources, and how to extend the system.

---

## Architecture

```
Agent asks a question in natural language
       │
       ▼
POST /api/agent/genbi-chat
       │
       ├─ Mode 1: NL → Firestore Query (via AI provider router)
       │         Uses buildNLToQuerySystemPrompt() + LLM
       │         Returns structured ParsedQuery JSON
       │
       ├─ Mode 2: Execute Query (read-only Firestore)
       │         Validates collection against allowlist
       │         Applies filters, ordering, limit
       │         Returns typed result rows
       │
       └─ Mode 3: Error Correction Loop
                 Takes failed query + error message
                 Re-prompts LLM with correction context
                 Returns fixed ParsedQuery + correction notes
```

---

## Accessible Data Sources

Only these Firestore collections are queryable via the GenBI Assistant:

| Collection      | Key Fields                                                                          | Notes                                |
|-----------------|-------------------------------------------------------------------------------------|--------------------------------------|
| `gtm_intakes`   | id, companyName, productName, customerId, createdAt, playbookStatus                 | GTM intake form submissions          |
| `gtm_playbooks` | trackingId, customerId, productName, status, confidence, generatedAt, channelStrategy | AI-generated GTM playbooks           |
| `gtm_reports`   | id, customerId, reportName, conversionRate, revenue, updatedAt                      | Simple GTM metric reports            |
| `leads`         | id, name, email, company, status, assignedAgentId, createdAt                        | Lead records                         |
| `customers`     | id, name, email, companyName, status, createdAt                                     | Customer profiles                    |

**To add a new collection**, edit `ALLOWED_COLLECTIONS` in `/api/agent/genbi-chat/route.ts` and add its field documentation to `buildNLToQuerySystemPrompt()`.

---

## Security Model

- **Role-gated**: Only `agent` and `admin` roles can access the GenBI API (403 for customers)
- **Read-only**: Only Firestore `.get()` / `.where()` / `.orderBy()` / `.limit()` — no writes, no DDL
- **Allowlist-enforced**: Collections must be in `ALLOWED_COLLECTIONS` — requests for unlisted collections return an error
- **Rate-limited**: Uses `checkRateLimitSensitive` (same as other sensitive API endpoints)
- **Max 100 rows**: Hard cap on query result size to prevent data exfiltration

---

## GTM Playbook Auto-Generation

### Trigger

When a GTM intake form is submitted via `POST /api/gtm-intake`:
1. Intake data is saved immediately to `gtm_intakes` Firestore collection
2. `generateAndPersistPlaybook()` is called asynchronously via `setImmediate()` (non-blocking)
3. A "generating" placeholder is written to `gtm_playbooks` immediately
4. AI generation completes in ~15-30 seconds
5. The playbook document is updated with `status: "ready"` and full playbook data

### Storage Structure (`gtm_playbooks/{trackingId}`)

```typescript
{
  trackingId: "GTM-ABC123",     // Same as intake ID
  customerId: "user-uid",       // Firestore scoping key
  productName: string,
  companyName: string,
  status: "generating" | "ready" | "error",
  generatedAt: ISO8601,
  confidence: 0-100,

  // AI-generated sections
  executiveSummary: string,
  icpProfile: { description, industries[], companySizes[], decisionMakers[], buyingTriggers[], painPoints[] },
  marketAnalysis: { targetRegion, segments[], competitiveAdvantage, marketOpportunity },
  channelStrategy: { priorityChannels[], messagingFramework, hooks[], cta },
  launchTimeline: { phase1, phase2, phase3, launchDate },
  salesEnablement: { objectionsAndRebuttals[], emailSequenceThemes[], callScript },
  riskAssessment: [{ risk, likelihood: "low"|"medium"|"high", mitigation }],
  kpis: string[],
  playbookSteps: [{ step, action, owner, timeframe, channel, message }]
}
```

### Access Control

| Role     | Access                                                    |
|----------|-----------------------------------------------------------|
| customer | Own playbook only (`customerId === user.id`)              |
| agent    | Any customer's playbook (scoped by `customerId` param)    |
| admin    | All playbooks                                             |

---

## API Reference

### `GET /api/gtm-playbook`

Fetch a GTM Playbook.

**Query params:**
- `id` — Fetch by specific tracking ID (e.g. `GTM-ABC123`)
- `customerId` — Fetch all playbooks for a customer

**Auth:** customer (own), agent/admin (any)

---

### `POST /api/agent/genbi-chat`

GenBI Assistant endpoint.

**Request body:**
```json
{
  "message": "List customers with no playbook",
  "executeQuery": false,
  "parsedQuery": null,
  "errorContext": null,
  "previousQuery": null
}
```

**Modes:**
1. **NL → Query** (default): `message` provided, no `executeQuery`/`errorContext`
2. **Execute**: `executeQuery: true`, `parsedQuery: {...}` — runs the query
3. **Error Correction**: `errorContext: "error msg"`, `previousQuery: {...}` — AI fixes the query

---

### `GET /api/portal/gtm-intakes`

List GTM intakes with playbook status enrichment.

**Query params:**
- `customerId` — Agent/admin: filter by customer
- `page`, `limit`, `search` — pagination and filtering

**Auth:** customer (own only), agent/admin (all or filtered)

---

## Error Correction Loop (Flow)

```
User asks question → AI generates query → Agent clicks Execute
       │
       ├─ Success → Results displayed in table
       │
       └─ Error → Red error message shown
                   "Fix with AI" button appears
                        │
                        ▼
               AI receives: failed query + error message
               AI corrects and returns: fixed query + correction notes
                        │
                        ▼
               Agent reviews corrected query → clicks Execute again
```

---

## Environment Variables

No new environment variables are required. The GenBI Assistant uses the existing AI provider configuration:

```env
KIMI_API_KEY=...         # Primary provider for analysis tasks
HUGGING_FACE_API_KEY=... # Fallback
NVIDIA_API_KEY=...       # Enterprise fallback
AI_PROVIDER=kimi         # Override: force specific provider
```

---

## True Wren AI Docker Option

If you prefer a full Wren AI deployment (requires Docker):

1. Add to `docker-compose.yml`:
```yaml
wren-ai:
  image: ghcr.io/canner/wren-ai-service:latest
  ports:
    - "5555:5555"
  environment:
    - LLM_PROVIDER=openai
    - OPENAI_API_KEY=${OPENAI_API_KEY}
```

2. Configure Wren AI to point at your Firestore data via a BigQuery export or direct connector.
3. Replace the `/api/agent/genbi-chat` route to proxy to `http://wren-ai:5555/v1/semantics-questions`.

The current implementation is functionally equivalent for Firestore-backed data and requires no Docker infrastructure.
