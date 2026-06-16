import { test as base } from '@playwright/test';

// Extend base test with custom fixtures
export const test = base.extend({
  // Fixture for authenticated admin user
  authenticatedAdmin: async ({ page, context }, use) => {
    // Set up mock authentication
    await context.addCookies([
      {
        name: 'auth_token',
        value: 'mock_admin_token',
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        secure: false,
        sameSite: 'Lax',
      },
    ]);
    
    // Mock current user response
    await page.route('**/api/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'demo-admin-1',
          name: 'DealFlow Admin',
          email: 'admin@dealflow.ai',
          role: 'admin',
          createdAt: '2024-01-01T00:00:00Z',
        }),
      });
    });

    await use(page);
  },
  
  // Fixture for authenticated customer user
  authenticatedCustomer: async ({ page, context }, use) => {
    await context.addCookies([
      {
        name: 'auth_token',
        value: 'mock_customer_token',
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
          id: 'customer-demo',
          name: 'Demo Customer',
          email: 'demo@customer.com',
          role: 'customer',
          createdAt: '2024-03-10T00:00:00Z',
        }),
      });
    });

    await use(page);
  },
  
  // Fixture for authenticated agent user
  authenticatedAgent: async ({ page, context }, use) => {
    await context.addCookies([
      {
        name: 'auth_token',
        value: 'mock_agent_token',
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
          id: 'agent-praneeth',
          name: 'Praneeth',
          email: 'praneeth@dealflow.ai',
          role: 'agent',
          createdAt: '2024-02-10T00:00:00Z',
        }),
      });
    });

    await use(page);
  },
});

export { expect } from '@playwright/test';
