import { test as base, Page } from '@playwright/test';

interface CustomFixtures {
  authenticatedAdmin: Page;
  authenticatedCustomer: Page;
  authenticatedAgent: Page;
}

// Extend base test with custom fixtures
export const test = base.extend<CustomFixtures>({
  // Overriding standard page fixture to inject style tag on every page load
  page: async ({ page }, use) => {
    await page.addInitScript(() => {
      const appendStyle = () => {
        const root = document.documentElement || document.head || document.body;
        if (!root) return false;
        if (!document.getElementById('playwright-hide-overlays')) {
          const s = document.createElement('style');
          s.id = 'playwright-hide-overlays';
          s.textContent = '[aria-label="Book a call"], #cookie-consent-banner { display: none !important; }';
          root.appendChild(s);
        }
        return true;
      };

      appendStyle();

      const observer = new MutationObserver(() => {
        appendStyle();
      });
      observer.observe(document, { childList: true, subtree: true });
    });
    await use(page);
  },

  // Fixture for authenticated admin user
  authenticatedAdmin: async ({ page, context }, use) => {
    // Set cookie with correct name matching lib/auth.ts AUTH_COOKIE_NAME = "df_auth_token"
    await context.addCookies([
      {
        name: 'df_auth_token',
        value: 'dummyHeader.eyJ1c2VySWQiOiJkZW1vLWFkbWluLTEiLCJuYW1lIjoiRGVhbEZsb3cgQWRtaW4iLCJlbWFpbCI6ImFkbWluQGRlYWxmbG93LmFpIiwicm9sZSI6ImFkbWluIn0=.dummySignature',
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        secure: false,
        sameSite: 'Lax',
      },
    ]);

    const MOCK_ADMIN_USER = {
      id: 'demo-admin-1',
      name: 'DealFlow Admin',
      email: 'admin@dealflow.ai',
      role: 'admin',
    };

    // Flat customer format that matches what admin/page.tsx renders (c.name, c.status, c.businessModel, etc.)
    const mockCustomer = {
      id: 'customer-e2e-001',
      name: 'E2E Mock Customer',
      email: 'e2e-mock@example.com',
      phone: '+1-555-000-0000',
      companyName: 'E2E Corp',
      industry: 'SaaS',
      businessModel: 'b2b',
      status: 'active',
      assignedAgentId: '',
      assignedAgentName: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const ok = (body: object) => ({
      status: 200 as const,
      contentType: 'application/json',
      body: JSON.stringify(body),
    });

    // --- Auth ---
    await page.route('**/api/auth/me', (route) =>
      route.fulfill(ok({ success: true, user: MOCK_ADMIN_USER }))
    );

    // --- Customers GET + POST ---
    await page.route('**/api/admin/customers', async (route) => {
      const method = route.request().method();
      if (method === 'GET') {
        await route.fulfill(ok({ success: true, customers: [mockCustomer] }));
      } else if (method === 'POST') {
        let submittedName = 'E2E Test Customer';
        try {
          const body = JSON.parse(route.request().postData() || '{}');
          if (body.name) submittedName = body.name;
        } catch { /* ignore */ }
        await route.fulfill(ok({
          success: true,
          message: 'Customer onboarded successfully',
          customer: { ...mockCustomer, name: submittedName },
          defaultPassword: 'Customer@E2EAcmeCorp!2026',
        }));
      } else {
        await route.continue();
      }
    });

    // --- Agents ---
    await page.route('**/api/admin/agents', (route) =>
      route.fulfill(ok({ success: true, agents: [] }))
    );

    // --- Portal: Tasks, Requirements, Resignations, Documents, Feedback, Calls, Chat, GTM Reports ---
    await page.route('**/api/portal/tasks', (route) =>
      route.fulfill(ok({ success: true, tasks: [] }))
    );
    await page.route('**/api/portal/requirements', (route) =>
      route.fulfill(ok({ success: true, requirements: [] }))
    );
    await page.route('**/api/portal/resignations', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill(ok({ success: true, message: 'Resignation processed' }));
      } else {
        await route.fulfill(ok({ success: true, resignations: [] }));
      }
    });
    await page.route('**/api/portal/documents', (route) =>
      route.fulfill(ok({ success: true, documents: [] }))
    );
    await page.route('**/api/portal/gtm-reports', (route) =>
      route.fulfill(ok({ success: true, reports: [] }))
    );
    await page.route('**/api/portal/feedback', (route) =>
      route.fulfill(ok({ success: true, feedback: [] }))
    );
    await page.route('**/api/portal/calls', (route) =>
      route.fulfill(ok({ success: true, calls: [] }))
    );
    await page.route('**/api/portal/chat**', (route) =>
      route.fulfill(ok({ success: true, messages: [] }))
    );

    // --- Admin: Audit Logs, GTM Reports, Bot Monitor ---
    await page.route('**/api/admin/audit-logs', (route) =>
      route.fulfill(ok({ success: true, logs: [] }))
    );
    await page.route('**/api/admin/gtm-reports', (route) =>
      route.fulfill(ok({ success: true, reports: [] }))
    );
    await page.route('**/api/admin/bot-monitor**', (route) =>
      route.fulfill(ok({ success: true, meetings: [], totalMeetings: 0 }))
    );
    await page.route('**/api/admin/interactions**', (route) =>
      route.fulfill(ok({ success: true, interactions: [] }))
    );

    // --- LLM Manager ---
    await page.route('**/api/llm-manager/metrics', (route) =>
      route.fulfill(ok({ success: true, metrics: { totalQueries: 0, avgLatency: 0, accuracy: 0 } }))
    );
    await page.route('**/api/llm-manager/retrain', (route) =>
      route.fulfill(ok({ success: true, message: 'Retraining initiated!' }))
    );

    await use(page);
  },
  
  // Fixture for authenticated customer user
  authenticatedCustomer: async ({ page, context }, use) => {
    await context.addCookies([
      {
        name: 'df_auth_token',
        value: 'dummyHeader.eyJ1c2VySWQiOiJjdXN0b21lci1kZW1vIiwibmFtZSI6IkRlbW8gQ3VzdG9tZXIiLCJlbWFpbCI6ImRlbW9AY3VzdG9tZXIuY29tIiwicm9sZSI6ImN1c3RvbWVyIn0=.dummySignature',
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        secure: false,
        sameSite: 'Lax',
      },
    ]);
    
    await page.route('**/api/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          user: {
            id: 'customer-demo',
            name: 'Demo Customer',
            email: 'demo@customer.com',
            role: 'customer',
          },
        }),
      });
    });

    await use(page);
  },
  
  // Fixture for authenticated agent user
  authenticatedAgent: async ({ page, context }, use) => {
    await context.addCookies([
      {
        name: 'df_auth_token',
        value: 'dummyHeader.eyJ1c2VySWQiOiJhZ2VudC1wcmFuZWV0aCIsIm5hbWUiOiJQcmFuZWV0aCIsImVtYWlsIjoicHJhbmVldGhAZGVhbGZsb3cuYWkiLCJyb2xlIjoiYWdlbnQifQ==.dummySignature',
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        secure: false,
        sameSite: 'Lax',
      },
    ]);
    
    await page.route('**/api/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          user: {
            id: 'agent-praneeth',
            name: 'Praneeth',
            email: 'praneeth@dealflow.ai',
            role: 'agent',
          },
        }),
      });
    });

    await use(page);
  },
});

export { expect } from '@playwright/test';
