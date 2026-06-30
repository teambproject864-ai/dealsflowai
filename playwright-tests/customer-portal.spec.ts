import { test, expect } from './auth-test.fixture';

test.describe('Customer Portal - Authentication & Navigation', () => {
  test.beforeEach(async ({ authenticatedCustomer }) => {
    // Route any API calls the customer portal makes on load to avoid real DB calls
    await authenticatedCustomer.route('**/api/customer/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: [] }),
      });
    });
    await authenticatedCustomer.route('**/api/documents/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, documents: [] }),
      });
    });
    await authenticatedCustomer.route('**/api/support-tickets/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, tickets: [] }),
      });
    });

    // Navigate; waitUntil:'domcontentloaded' avoids hanging on slow 3rd-party resources
    await authenticatedCustomer.goto('/portal/customer', { waitUntil: 'domcontentloaded' });

    // Wait for page to compile & hydrate before asserting (lazy compilation can take >30s)
    await authenticatedCustomer.waitForSelector('[data-testid="customer-portal"], button, nav', { timeout: 60000 });
    await expect(authenticatedCustomer.getByText(/Dashboard/i).first()).toBeVisible({ timeout: 60000 });

    // Give client-side hydration a moment to complete event listeners
    await authenticatedCustomer.waitForTimeout(1000);
  });

  test('should allow customer to log in and access customer portal', async ({ authenticatedCustomer }) => {
    await expect(authenticatedCustomer).toHaveURL(/\/portal\/customer$/);
  });

  test('should display all main customer navigation tabs', async ({ authenticatedCustomer }) => {
    // These match the actual tabs defined in app/portal/customer/page.tsx
    const expectedTabs = [
      'Dashboard',
      'ICP Entries',
      'GTM Analysis',
      'Support Tickets',
      'Billing & Credits',
      'Settings',
      'Chat',
      'Documents',
      'Feedback',
    ];

    for (const tabName of expectedTabs) {
      await expect(
        authenticatedCustomer.getByRole('button', { name: tabName, exact: false })
      ).toBeVisible({ timeout: 10000 });
    }
  });

  test('should navigate to GTM Analysis tab', async ({ authenticatedCustomer }) => {
    await authenticatedCustomer.getByRole('button', { name: /GTM Analysis/i }).click({ force: true });
    await expect(authenticatedCustomer.getByText(/GTM Analysis Reports/i)).toBeVisible({ timeout: 15000 });
  });

  test('should navigate to Support Tickets tab and show ticket form', async ({ authenticatedCustomer }) => {
    await authenticatedCustomer.getByRole('button', { name: /Support Tickets/i }).click({ force: true });
    await expect(authenticatedCustomer.getByText(/Submit Support Ticket/i)).toBeVisible({ timeout: 15000 });
  });
});
