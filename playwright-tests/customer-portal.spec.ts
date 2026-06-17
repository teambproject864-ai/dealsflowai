import { test, expect } from './auth-test.fixture';

test.describe('Customer Portal - Authentication & Navigation', () => {
  test.beforeEach(async ({ authenticatedCustomer }) => {
    await authenticatedCustomer.goto('/portal/customer');
    await expect(authenticatedCustomer.getByText(/Dashboard/i)).toBeVisible();
    // Hide the booking FAB to prevent overlaps on mobile viewports
    await authenticatedCustomer.addStyleTag({ content: '[aria-label="Book a call"] { display: none !important; }' }).catch(() => {});
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
      ).toBeVisible();
    }
  });

  test('should navigate to GTM Analysis tab', async ({ authenticatedCustomer }) => {
    await authenticatedCustomer.getByRole('button', { name: /GTM Analysis/i }).click({ force: true });
    await expect(authenticatedCustomer.getByText(/GTM Analysis Reports/i)).toBeVisible();
  });

  test('should navigate to Support Tickets tab and show ticket form', async ({ authenticatedCustomer }) => {
    await authenticatedCustomer.getByRole('button', { name: /Support Tickets/i }).click({ force: true });
    await expect(authenticatedCustomer.getByText(/Submit Support Ticket/i)).toBeVisible();
  });
});
