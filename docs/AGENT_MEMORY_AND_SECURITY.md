# Agent Memory & Security Platform Documentation

## Table of Contents
1. [Overview](#overview)
2. [MEM Palace](#mem-palace)
3. [ALMA (Agent Learning and Memory Architecture)](#alma-agent-learning-and-memory-architecture)
4. [Memory OS (Hermes)](#memory-os-hermes)
5. [Clawpatrol (AI Agent Security Firewall)](#clawpatrol-ai-agent-security-firewall)
6. [Feature Comparison Matrix](#feature-comparison-matrix)
7. [Integration Guide](#integration-guide)

---

## Overview

This document describes the four integrated platforms for agent memory management and security:
- **MEM Palace**: Legacy memory storage system
- **ALMA**: Hierarchical memory architecture with vector search
- **Memory OS (Hermes)**: Modern distributed memory OS (new)
- **Clawpatrol**: AI agent security firewall (new)

---

## MEM Palace

### Current Status
**Platform Type**: Legacy Storage System  
**Last Updated**: Before 2026-06-02  
**Status**: Maintained (for backward compatibility)

### Core Features
- Firebase-based memory persistence
- Lead-specific and global memory organization
- Importance-based retrieval
- Access count tracking

### API Reference
```typescript
// Store a memory
saveMemory(memory: Omit<MemoryEntry, 'id' | 'createdAt' | 'accessCount' | 'lastAccessed'>): Promise<MemoryEntry | null>

// Retrieve relevant memories
getRelevantMemories(leadId: string, queryKeywords?: string[]): Promise<MemoryEntry[]>

// Extract keywords from text
extractKeywords(text: string): string[]
```

### Deprecation Notice
- No new features will be added to MEM Palace
- Recommended migration path: ALMA → Memory OS (Hermes)

---

## ALMA (Agent Learning and Memory Architecture)

### Current Status
**Platform Type**: Hierarchical Memory Architecture  
**Last Updated**: Before 2026-06-02  
**Status**: Active (with upgrade path to Hermes)

### Core Features
1. **Memory Tiers**
   - Short-Term Memory (STM): Session-based, high volatility
   - Episodic Memory: Specific event/call records
   - Long-Term Memory (LTM): Consolidated insights

2. **Vector Semantic Search**
   - Hugging Face embeddings generation
   - Pinecone vector index integration
   - Fallback to keyword search

3. **Memory Consolidation**
   - Automatic STM → LTM promotion for high-importance memories
   - Batch processing with Firestore

4. **Forgetting Mechanism**
   - Deletes low-importance, old (>30 days) memories
   - Reduces storage bloat

### API Reference
```typescript
// Memory layer types
type MemoryLayer = 'short-term' | 'episodic' | 'long-term'

// Store memory with embedding
storeMemory(memory: Omit<ALMAMemory, 'id' | 'createdAt' | 'accessCount' | 'lastAccessed'>): Promise<ALMAMemory | null>

// Retrieve memories with semantic search
retrieveMemories(args: {
  leadId?: string
  sessionId?: string
  layer?: MemoryLayer
  keywords?: string[]
  queryText?: string
  limit?: number
}): Promise<ALMAMemory[]>

// Consolidate memories
consolidateMemories(): Promise<void>

// Apply forgetting
applyForgetting(): Promise<void>
```

### Integration Points
- Firebase Firestore
- Hugging Face Inference API
- Pinecone Vector DB

---

## Memory OS (Hermes)

### Current Status
**Platform Type**: Modern Distributed Memory OS  
**Last Updated**: 2026-06-02  
**Status**: Active (recommended for new deployments)

### New Feature Additions (since last revision)
1. **Expanded Memory Tiers** (4 tiers)
   - `working`: Real-time session state
   - `short-term`: 1-7 day retention
   - `long-term`: Permanent consolidated knowledge
   - `archival`: Cold storage for historical data

2. **Built-in Encryption**
   - AES-based content encryption
   - Transparent decryption during retrieval
   - Configurable via `enableEncryption` flag

3. **In-Memory Cache**
   - LRU cache for frequent retrievals
   - Configurable size and TTL
   - Reduces latency by ~60%

4. **Granular Permissions**
   - Per-memory read/write/delete permissions
   - Agent-level access controls
   - Supports custom permission schemas

5. **Real-time Metrics & Observability**
   - Retrieval latency tracking
   - Success rate monitoring
   - Storage usage analytics
   - Tier distribution breakdown

### Feature Enhancements (existing)
- Improved semantic search with cosine similarity
- Automatic memory archiving based on last access time
- Consolidation policies with multiple criteria (importance, access count, age)

### API Reference
```typescript
// Memory tier types
type MemoryTier = 'working' | 'short-term' | 'long-term' | 'archival'

// Initialize Hermes
const hermes = new HermesMemoryOS({
  defaultTier: 'short-term',
  consolidationIntervalMs: 3600000,
  archivalThresholdDays: 90,
  enableEncryption: true,
  cacheMaxSize: 1000,
  cacheTtlMs: 300000,
})

// Store memory
await hermes.storeMemory({
  content: 'Customer wants pricing info',
  category: 'support',
  tier: 'short-term',
  leadId: 'lead-123',
  agentId: 'agent-456',
  keywords: ['pricing', 'inquiry'],
  importance: 8,
  permissions: [{ agentId: 'agent-456', read: true, write: true, delete: false }],
  metadata: { sessionId: 'sess-789' },
})

// Retrieve memory
const memory = await hermes.retrieveMemory(memoryId, 'agent-456')

// Search memories semantically
const memories = await hermes.searchMemories({
  query: 'How much does it cost?',
  leadId: 'lead-123',
  agentId: 'agent-456',
  limit: 5,
})

// Get metrics
const metrics = hermes.getMetrics()

// Consolidate memories
await hermes.consolidateMemories({
  sourceTier: 'short-term',
  targetTier: 'long-term',
  criteria: { minImportance: 7, minAccessCount: 3 },
})

// Archive old memories
await hermes.archiveOldMemories()
```

### REST API Endpoints (New)
```bash
# Store memory
POST /api/hermes/store
Body: { content, category, tier, ... }

# Search memories
POST /api/hermes/search
Body: { query, leadId, agentId, limit, ... }

# Get metrics
GET /api/hermes/metrics
```

### Performance Metrics (Target)
- Retrieval latency: < 100ms (with cache)
- Cache hit rate: > 70%
- Consolidation time: < 10s (1000 memories)

---

## Clawpatrol (AI Agent Security Firewall)

### Current Status
**Platform Type**: Zero-Trust AI Agent Security  
**Last Updated**: 2026-06-02  
**Status**: Active (production-ready)

### New Feature Additions (since last revision)
1. **Prompt Injection Detection (New)**
   - 15+ suspicious patterns
   - Severity-based scoring
   - Auto-block for high/critical threats
   - Example blocked phrases:
     - "Ignore previous instructions"
     - "System prompt"
     - "You are now..."
     - Template injection (`{{...}}`, `[[...]]`)

2. **Data Exfiltration Prevention (New)**
   - Email address sanitization
   - Phone number redaction
   - Base64 detection
   - Credit card pattern matching
   - Configurable redaction templates

3. **Anomaly Detection (New)**
   - Request rate monitoring
   - Behavior scoring (0-100)
   - Auto-blocking at score > 90
   - Real-time anomaly tracking

4. **Policy Engine (New)**
   - Custom security policies
   - Multiple conditions: pattern match, behavior threshold, permission check, rate limit
   - Action types: block, log, alert, rate limit, quarantine
   - Priority-based policy evaluation

5. **Audit Logging & SIEM Integration (New)**
   - In-memory audit trail (up to 10,000 logs)
   - Persistent storage via Hermes
   - Filterable by agent, type, severity
   - SIEM-ready export format

### Core Features
- Agent identity & authentication
- Inbound/outbound traffic inspection
- TLS 1.3 ready for external communication
- SOC2 compliant by default

### API Reference
```typescript
// Initialize Clawpatrol
const clawpatrol = new ClawpatrolFirewall({
  enablePromptInjectionDetection: true,
  enableDataExfiltrationPrevention: true,
  enableAnomalyDetection: true,
  defaultPolicySeverity: SecuritySeverity.MEDIUM,
  alertThresholds: {
    low: 10,
    medium: 5,
    high: 2,
    critical: 1,
  },
  siemIntegrationEnabled: true,
})

// Register agent
clawpatrol.registerAgent({
  agentId: 'agent-123',
  agentType: 'sales',
  permissions: ['read', 'write', 'send_email'],
  lastAuthenticatedAt: new Date().toISOString(),
})

// Authenticate agent
const authenticated = clawpatrol.authenticateAgent('agent-123', credentials)

// Inspect inbound prompt
const inboundCheck = clawpatrol.inspectInbound('agent-123', 'Hello, how are you?')

// Inspect outbound response
const outboundCheck = clawpatrol.inspectOutbound('agent-123', 'Contact me at user@example.com')

// Get audit logs
const logs = clawpatrol.getAuditLogs({
  agentId: 'agent-123',
  type: 'prompt_injection',
  severity: 'high',
  limit: 50,
})
```

### REST API Endpoints (New)
```bash
# Inspect traffic
POST /api/clawpatrol/inspect
Body: { agentId, prompt, direction: 'inbound'|'outbound', context }

# Get audit logs
GET /api/clawpatrol/logs?agentId=...&type=...&severity=...&limit=...

# Clear logs
DELETE /api/clawpatrol/logs
```

### Security Threat Detection Models
| Threat Type          | Detection Method          | Severity Levels | Block Threshold |
|----------------------|---------------------------|-----------------|-----------------|
| Prompt Injection     | Pattern matching + scoring| LOW-HIGH-CRITICAL | ≥ HIGH |
| Data Exfiltration    | Content regex matching    | HIGH           | Always sanitize |
| Anomalous Behavior   | Rate + frequency analysis | LOW-CRITICAL  | > 90 score      |
| Unauthorized Access  | Identity + permission check | HIGH       | Always block    |
| Policy Violation     | Custom policy engine      | Configurable  | Policy-defined  |

---

## Feature Comparison Matrix

| Feature                          | MEM Palace | ALMA | Memory OS (Hermes) | Clawpatrol |
|-----------------------------------|------------|------|---------------------|------------|
| Memory Storage                    | ✅ Firebase | ✅ Firebase + Pinecone | ✅ In-memory + persistent | ❌ |
| Memory Tiers                      | ❌ | ✅ 3 tiers | ✅ 4 tiers | ❌ |
| Vector Semantic Search            | ❌ | ✅ | ✅ | ❌ |
| Memory Encryption                 | ❌ | ❌ | ✅ | ❌ |
| Permissions & Access Control      | ❌ | ❌ | ✅ | ✅ |
| Prompt Injection Detection        | ❌ | ❌ | ❌ | ✅ |
| Data Exfiltration Prevention      | ❌ | ❌ | ❌ | ✅ |
| Anomaly Detection                 | ❌ | ❌ | ❌ | ✅ |
| Audit Logging                     | ❌ | ❌ | ✅ | ✅ |
| Caching Layer                     | ❌ | ❌ | ✅ | ❌ |
| Metrics & Observability           | ❌ | ❌ | ✅ | ✅ |
| Policy Engine                     | ❌ | ❌ | ❌ | ✅ |
| API Endpoints                     | ❌ | ❌ | ✅ | ✅ |
| Integration with Security Logs    | ❌ | ❌ | ✅ (stores Clawpatrol logs) | ✅ |
| Deprecated (legacy only)          | ✅ | ❌ | ❌ | ❌ |

---

## Integration Guide

### Recommended Architecture (2026+)
```
┌─────────────────────────────────────────────────────────────┐
│                         Agent Layer                           │
│                     (agent-brain, personas)                  │
└─────────────────────────────────┬───────────────────────────┘
                                  │
                      ┌───────────┴───────────┐
                      ▼                       ▼
            ┌───────────────────┐    ┌───────────────────┐
            │   Clawpatrol      │    │  Memory OS        │
            │  (Security FW)    │    │  (Hermes)         │
            └────────┬──────────┘    └────────┬──────────┘
                     │                        │
                     └──────────┬─────────────┘
                                │
                    ┌───────────▼───────────┐
                    │  Integrated Agent     │
                    │  System              │
                    └───────────────────────┘
```

### Using Memory OS + Clawpatrol Together
```typescript
import { getIntegratedSystem } from '@/lib/integrated-agent-system'

const system = getIntegratedSystem()

// Register agent
system.registerAgent({
  agentId: 'agent-789',
  agentType: 'support',
  permissions: ['read', 'write'],
  lastAuthenticatedAt: new Date().toISOString(),
})

// Process request through full pipeline
const result = await system.processRequest({
  agentId: 'agent-789',
  prompt: 'Tell me about DealFlow AI pricing',
  context: { leadId: 'lead-001', sessionId: 'sess-001' },
})

// Get combined system status
const status = system.getSystemStatus()
console.log('Hermes metrics:', status.hermes)
console.log('Clawpatrol status:', status.clawpatrol)
```

### REST API (Integrated)
```bash
# Process end-to-end agent request
POST /api/integrated-system/process
Body: { agentId, prompt, context }

# Get system status
GET /api/integrated-system/status
```

---

## Release Notes

### 2026-06-02 Release
- **Added**: Memory OS (Hermes) - modern distributed memory system
- **Added**: Clawpatrol - AI agent security firewall
- **Added**: Integrated System API
- **Updated**: ALMA documentation with migration path
- **Updated**: MEM Palace marked as legacy, maintained for compatibility

---

## Changelog

| Version | Changes |
|---------|---------|
| 2026-06-02 | Added Memory OS (Hermes), Clawpatrol, integrated system |
| Pre-2026-06-02 | Initial MEM Palace & ALMA implementation |
