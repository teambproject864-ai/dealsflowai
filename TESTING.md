# DealFlow AI - Testing Guide

## Overview
This document describes the comprehensive testing setup for the DealFlow AI platform, including:
- **Unit/Integration Tests**: Using Node.js assert and tsx runner
- **End-to-End UI Tests**: Using Playwright (cross-browser)
- **Load/Stress Tests**: Using k6
- **Reporting**: Built-in reporters (HTML, JSON, JUnit)

---

## Prerequisites
- Node.js 18+ and npm
- k6 installed (for load testing: https://k6.io/docs/get-started/installation/)
- Playwright browsers (run `npm install && npx playwright install`)

---

## Test Suites

### 1. Unit & Integration Tests
**Location**: `tests/` directory  
**Run command**: `npm run test`  
**Runner**: tsx (using Node.js assert library)

**Coverage**:
- Calendar & meeting management
- RAG and AI integration
- ICP matching
- Voice & Twilio communications
- Post-call processing
- 3D solution visualization
- Security & compliance checks

---

### 2. Playwright End-to-End UI Tests
**Location**: `playwright-tests/` directory  
**Config File**: `playwright.config.ts`  
**Test Reports**: Generated in `playwright-report/` (HTML), `test-results/` (JSON, JUnit)

**Available Scripts**:
```bash
# Run all E2E tests (headless)
npm run test:e2e

# Run tests in headed mode (for debugging)
npm run test:e2e:debug

# Show last test report
npm run test:e2e:report
```

**Browser Coverage**:
- Chromium (Desktop Chrome)
- Firefox
- WebKit (Safari)
- Mobile: Pixel 5, iPhone 12

**Test Isolation**:
Each test runs in a fresh browser context with cookies cleared
Auth state is mocked via fixtures (no real auth needed for tests)

---

### 3. k6 Load & Stress Tests
**Location**: `k6-tests/` directory
**Config File**: `k6-tests/load-test.js`
**Reports**: JSON output in `test-results/k6-results.json`

**Available Scripts**:
```bash
# Run full load test
npm run test:load

# Run small smoke test (10 VUs, 1 minute)
npm run test:load:smoke
```

**Test Scenarios**:
1. `smoke`: Small quick test to check basic functionality
2. `load`: Full ramp-up/ramp-down load test (100 VUs)

**Performance Baselines/Thresholds**:
- p95 response time: < 500ms
- p99 response time: < 1000ms
- Error rate: < 1%

---

## Test Results & Reporting

### Playwright Reports
- **HTML Report**: Open with `npm run test:e2e:report`
- **JSON Report**: `test-results/results.json`
- **JUnit Report**: `test-results/results.xml`

### k6 Reports
- **JSON Report**: `test-results/k6-results.json`
- **Terminal Summary**: Printed directly to console after run

---

## CI/CD Integration
### Suggested Workflow:
1. On every commit:
   - Run unit/integration tests (`npm run test`)
   - Run linter (`npm run lint`)

2. On every PR/push to main:
   - Run unit/integration tests
   - Run Playwright E2E tests (`npm run test:e2e`)
   - Run build (`npm run build`)
   - Run smoke load test (`npm run test:load:smoke`)

3. Nightly:
   - Full E2E tests across all browsers
   - Full load test (`npm run test:load`)
   - Generate and store performance baselines

### Example GitHub Actions (Basic)
Create a `.github/workflows/tests.yml` file with:
```yaml
name: Tests
on: [push, pull_request]

jobs:
  tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run lint
      - run: npm run build
      - run: npm run test
      - run: npm run test:e2e
```

---

## How to Add New Tests
### New Unit/Integration Test:
- Create in `tests/` directory
- Export a named async function
- Add it to `tests/run.ts`

### New Playwright E2E Test:
- Create in `playwright-tests/` with `.spec.ts` extension
- Use fixtures from `auth-test.fixture.ts` for auth

### New k6 Load Test:
- Create in `k6-tests/` with `.js` extension
- Update `package.json` scripts if needed

---

## Next Steps for Enhancement
- Add Jest/Vitest for better test reporting and coverage
- Add code coverage reporting (Istanbul, nyc)
- Set up performance monitoring with Grafana
- Add screenshot diffing (Pixelmatch, Playwright's toHaveScreenshot)
- Add full role-based access control (RBAC) E2E tests
- Add test data management and mocking for all APIs
