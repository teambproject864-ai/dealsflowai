
# Integrated Ecosystem: Hermes, Vexa & OpenSpec

## Overview
This document describes the full implementation of an interconnected ecosystem for Hermes (Memory OS), Vexa (GTM Strategist), and OpenSpec (Validation Engine). The system uses an Agent-to-Agent (A2A) message bus, shared authentication, real-time state propagation, and standardized APIs.

## Architecture
- **A2A Message Bus**: Central communication channel (lib/a2a/message-bus.ts)
- **Authentication**: Shared secret, HMAC signatures, nonce replay protection (lib/a2a/auth.ts)
- **Validation**: Zod-based schemas (lib/a2a/validator.ts)
- **Retry Logic**: Exponential backoff (lib/a2a/retry.ts)
- **Logging & Metrics**: Detailed logging and performance tracking (lib/a2a/logger.ts)
- **Unified Integration Layer**: Orchestrates the three systems (lib/a2a/integration-layer.ts)

## Systems
### 1. Hermes - Memory OS
- **File**: lib/hermes/hermes.ts
- **Agent**: lib/agents/hermes-agent.ts
- **Capabilities**: Memory storage, retrieval, search, metrics
- **APIs**:
  - /api/hermes/store
  - /api/hermes/search
  - /api/hermes/metrics

### 2. Vexa - GTM Strategist
- **File**: lib/agents/vexa-agent.ts
- **Capabilities**: GTM analysis, playbook generation, website crawling
- **APIs**:
  - /api/gtm-intake
  - /api/gtm-analysis

### 3. OpenSpec - Validation Engine
- **File**: lib/openspec/validator.ts
- **Agent**: lib/agents/openspec-agent.ts
- **Capabilities**: GTM and playbook validation against OpenSpec standards
- **APIs**:
  - /api/openspec/validate

## Unified Integration APIs
### 1. Initialize Ecosystem
`POST /api/integrated-ecosystem/init`
- Initializes all three systems on the message bus
- Requires authentication
- Response: Metrics, system states

### 2. Get Ecosystem Metrics
`GET /api/integrated-ecosystem/metrics`
- Retrieves message bus metrics, retry queue, system states
- Requires authentication

### 3. Send State Sync
`POST /api/integrated-ecosystem/sync`
- Body: { systemId, stateType, stateData }
- Broadcasts state update to all systems
- Requires authentication

## Usage Example
```typescript
import { getEcosystem } from '@/lib/a2a/integration-layer';
import { A2AMessageType } from '@/lib/a2a';

// Initialize ecosystem
const ecosystem = getEcosystem();
await ecosystem.initializeEcosystem();

// Access message bus
const bus = ecosystem.getMessageBus();

// Send a task to Vexa
await bus.createAndSendMessage(
  'hermes-system',
  'vexa-system',
  A2AMessageType.TASK_DELEGATION,
  {
    taskId: crypto.randomUUID(),
    taskType: 'generate_gtm',
    input: { companyName: 'Test Co' },
  }
);
```

## Security
- **A2A_SHARED_SECRET**: Required in production environment
- **HMAC-SHA256 Signatures**: All messages are signed
- **Replay Protection**: Nonces are tracked and expire after 5 minutes
- **TTL**: All messages have a configurable TTL

## Testing
Tests are located in:
- tests/hermes.test.ts
- tests/agent-ecosystem.test.ts
- tests/semantic-cache-e2e.test.ts

Run tests:
```bash
npm run test
```

## Monitoring
Metrics available in:
- /api/integrated-ecosystem/metrics
- /api/system/metrics

## Deployment
1. Set environment variable A2A_SHARED_SECRET
2. Initialize the ecosystem via /api/integrated-ecosystem/init
3. Monitor via /api/integrated-ecosystem/metrics
4. Use the retry manager to handle failures

## Performance
- Retry policy: Max 5 retries, exponential backoff, max 30s delay
- Logging: 10k max entries, last hour stats
- State sync: Real-time broadcasts every 10 seconds

