import { test, expect } from './auth-test.fixture';

test.describe('Admin Portal - Authentication & Navigation', () => {
  test('should allow admin to log in and access admin portal', async ({ authenticatedAdmin }) => {
    await authenticatedAdmin.goto('/portal/admin');
    await expect(authenticatedAdmin).toHaveURL(/\/portal\/admin/);
    await expect(authenticatedAdmin.getByText(/Dashboard/i)).toBeVisible();
  });

  test('should display all main admin navigation tabs', async ({ authenticatedAdmin }) => {
    await authenticatedAdmin.goto('/portal/admin');
    
    const expectedTabs = [
      'Dashboard',
      'GTM Reports',
      'Agents',
      'Requirements',
      'Tickets',
      'Settings',
    ];
    
    for (const tabName of expectedTabs) {
      await expect(authenticatedAdmin.getByRole('link', { name: tabName, exact: false })).toBeVisible();
    }
  });
});
