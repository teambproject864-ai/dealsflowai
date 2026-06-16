import { test, expect } from './auth-test.fixture';

test.describe('Customer Portal - Authentication & Navigation', () => {
  test('should allow customer to log in and access customer portal', async ({ authenticatedCustomer }) => {
    await authenticatedCustomer.goto('/portal/customer');
    await expect(authenticatedCustomer).toHaveURL(/\/portal\/customer/);
    await expect(authenticatedCustomer.getByText(/Dashboard/i)).toBeVisible();
  });

  test('should display all main customer navigation tabs', async ({ authenticatedCustomer }) => {
    await authenticatedCustomer.goto('/portal/customer');
    
    const expectedTabs = [
      'Dashboard',
      'GTM Analysis',
      'Tickets',
      'Billing & Credits',
      'Settings',
      'Chat',
      'Documents',
      'Feedback',
    ];
    
    for (const tabName of expectedTabs) {
      await expect(authenticatedCustomer.getByRole('link', { name: tabName, exact: false })).toBeVisible();
    }
  });
});
