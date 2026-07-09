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
    
    // Mock current user response — the server reads the cookie then validates JWT.
    // We bypass JWT validation by mocking the /api/auth/me endpoint.
    await page.route('**/api/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          user: {
            id: 'demo-admin-1',
            name: 'DealFlow Admin',
            email: 'admin@dealflow.ai',
            role: 'admin',
          },
        }),
      });
    });

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
