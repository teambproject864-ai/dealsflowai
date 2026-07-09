
# End-to-End Testing Plan

## Objective
Conduct comprehensive testing of the DealFlow AI system to identify all functional, performance, security, and usability issues.

## Test Scope
- Admin Portal (all tabs)
- LLM Manager System
- Meeting Bot System
- Customer Portal
- API Endpoints
- Firebase Integrations

## Test Environment
- Node.js 20.x
- Next.js 15.x
- Firebase Emulator Suite (if available)
- Test users and demo data

---

## Test Cases

### 1. Functional Testing

#### 1.1 Admin Portal
| TC ID | Test Case | Preconditions | Steps | Expected Result | Actual Result | Severity | Status |
|-------|-----------|---------------|-------|-----------------|---------------|----------|--------|
| ADM-001 | Navigate to all admin portal tabs | Admin logged in | Click each tab in admin portal | All tabs load without errors | --- | --- | --- |
| ADM-002 | Onboard a new customer | Admin logged in | Go to Customers tab → click "Onboard New Customer" → fill form → submit | Customer added successfully, audit log created | --- | --- | --- |
| ADM-003 | Process customer resignation | Active customer exists | Go to Customers tab → click "Process Resignation" for a customer → fill form → submit | Customer marked as resigned, resignation logged | --- | --- | --- |
| ADM-004 | Access document repository | Admin logged in | Go to Documents tab | Documents load, can view and filter | --- | --- | --- |
| ADM-005 | View LLM Manager dashboard | Admin logged in | Go to LLM Manager tab | Metrics, model catalog, recent interactions display correctly | --- | --- | --- |
| ADM-006 | Retrain orchestration model | Admin logged in | Go to LLM Manager tab → click "Retrain Model" | Retraining initiated, success message displayed | --- | --- | --- |
| ADM-007 | View Bot Monitor dashboard | Admin logged in | Go to Bot Monitor tab | Bot metrics, active sessions, and logs display | --- | --- | --- |

#### 1.2 LLM Manager System
| TC ID | Test Case | Preconditions | Steps | Expected Result | Actual Result | Severity | Status |
|-------|-----------|---------------|-------|-----------------|---------------|----------|--------|
| LLM-001 | Execute RAG request (HuggingFace) | API keys configured | Send RAG request via /api/rag/ask | Response returned, logged in interactions | --- | --- | --- |
| LLM-002 | Execute RAG request (NVIDIA) | API keys configured | Send RAG request specifying provider=nvidia | Response returned, logged in interactions | --- | --- | --- |
| LLM-003 | Load balancing across API keys | Multiple keys configured | Send 10 concurrent requests | Requests balanced across available keys | --- | --- | --- |
| LLM-004 | Failover to alternate provider | One provider failing | Disable one provider → send request | Request routed to other provider | --- | --- | --- |
| LLM-005 | Data anonymization | Request contains PII | Send request with email/phone in prompt | PII is anonymized in logs | --- | --- | --- |

#### 1.3 Meeting Bot System
| TC ID | Test Case | Preconditions | Steps | Expected Result | Actual Result | Severity | Status |
|-------|-----------|---------------|-------|-----------------|---------------|----------|--------|
| BOT-001 | Create a scheduled meeting | Firebase initialized | Create a meeting via API/calendar integration | Meeting stored in DB, status "scheduled" | --- | --- | --- |
| BOT-002 | Bot joins meeting | Scheduled meeting exists | Bot triggered 5 mins before scheduled time | Bot joins meeting successfully | --- | --- | --- |
| BOT-003 | Bot handles network interruption | Bot in meeting | Simulate network outage → restore | Bot reconnects and continues | --- | --- | --- |
| BOT-004 | Post-meeting follow-up | Meeting completed | Mark meeting as completed | Summary generated, follow-up sent | --- | --- | --- |

---

### 2. Performance Testing

| TC ID | Test Case | Preconditions | Steps | Expected Result | Actual Result | Severity | Status |
|-------|-----------|---------------|-------|-----------------|---------------|----------|--------|
| PERF-001 | Concurrent requests (10) | Server running | Send 10 simultaneous RAG requests | All requests complete within 2 sec | --- | --- | --- |
| PERF-002 | Concurrent requests (50) | Server running | Send 50 simultaneous requests | System handles load without errors | --- | --- | --- |
| PERF-003 | Page load performance | Admin logged in | Load each admin tab | First contentful paint < 1.5 sec | --- | --- | --- |

---

### 3. Security Testing

| TC ID | Test Case | Preconditions | Steps | Expected Result | Actual Result | Severity | Status |
|-------|-----------|---------------|-------|-----------------|---------------|----------|--------|
| SEC-001 | Unauthorized access to admin portal | Not logged in | Attempt to access /portal/admin | Redirected to login page | --- | --- | --- |
| SEC-002 | API key encryption | API keys stored | Inspect storage location | Keys are encrypted (not plaintext) | --- | --- | --- |
| SEC-003 | SQL injection attempts | API endpoints active | Send malicious SQL via API | No injection vulnerabilities | --- | --- | --- |
| SEC-004 | XSS attacks | Admin portal open | Inject malicious scripts in inputs | Scripts not executed, inputs sanitized | --- | --- | --- |

---

### 4. Usability Testing

| TC ID | Test Case | Preconditions | Steps | Expected Result | Actual Result | Severity | Status |
|-------|-----------|---------------|-------|-----------------|---------------|----------|--------|
| UX-001 | Mobile responsiveness | Access on mobile device | Resize window to 375px wide | All tabs and elements responsive | --- | --- | --- |
| UX-002 | Error message clarity | Trigger error scenario | Submit invalid form data | Clear, helpful error messages displayed | --- | --- | --- |
| UX-003 | Form submission feedback | Submit a form | Click "Onboard New Customer" → fill form → submit | Loading indicator and success feedback | --- | --- | --- |

---

## Severity Ratings
- **Critical**: System crash, data loss, security breach
- **High**: Major functionality broken, significant performance impact
- **Medium**: Minor functionality issues, non-critical UI bugs
- **Low**: Cosmetic issues, minor inconveniences

