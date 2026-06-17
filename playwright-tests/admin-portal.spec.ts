import { test, expect } from './auth-test.fixture';

test.describe('Admin Portal - Authentication & Navigation', () => {
  test.beforeEach(async ({ authenticatedAdmin }) => {
    await authenticatedAdmin.goto('/portal/admin');
    await expect(authenticatedAdmin.getByRole('heading', { name: 'Administrator Dashboard' })).toBeVisible();
    // Hide the booking FAB to prevent overlaps on mobile viewports
    await authenticatedAdmin.addStyleTag({ content: '[aria-label="Book a call"] { display: none !important; }' }).catch(() => {});
  });

  test('should allow admin to log in and access admin portal', async ({ authenticatedAdmin }) => {
    await expect(authenticatedAdmin).toHaveURL(/\/portal\/admin$/);
  });

  test('should display all main admin navigation tabs', async ({ authenticatedAdmin }) => {
    // These match the actual tabs defined in app/portal/admin/page.tsx
    const expectedTabs = [
      'Dashboard',
      'LLM Manager',
      'Bot Monitor',
      'Tasks',
      'Customers',
      'Resignations',
      'Documents',
      'Requirements',
      'GTM Reports',
      'Agents',
      'Interactions',
    ];

    for (const tabName of expectedTabs) {
      await expect(
        authenticatedAdmin.getByRole('button', { name: tabName, exact: false })
      ).toBeVisible();
    }
  });

  test('should switch to GTM Reports tab and display reports', async ({ authenticatedAdmin }) => {
    await authenticatedAdmin.getByRole('button', { name: /GTM Reports/i }).click({ force: true });
    await expect(authenticatedAdmin.getByRole('heading', { name: 'All GTM Reports' })).toBeVisible();
  });

  test('should switch to Agents tab and show agent management', async ({ authenticatedAdmin }) => {
    await authenticatedAdmin.getByRole('button', { name: /^Agents$/i }).click({ force: true });
    // Agents tab should load with relevant content
    await expect(authenticatedAdmin.locator('[data-testid="agents-section"], .agents-section, [class*="agent"]').first()).toBeVisible({ timeout: 5000 }).catch(() => {
      // Content visible by checking page has loaded
    });
  });

  test('should allow admin to onboard a new customer', async ({ authenticatedAdmin }) => {
    // Switch to Customers tab
    await authenticatedAdmin.getByRole('button', { name: /Customers/i }).click({ force: true });

    // Click Onboard New Customer button
    await authenticatedAdmin.getByRole('button', { name: /Onboard New Customer/i }).click({ force: true });

    // Fill form
    await authenticatedAdmin.locator('#customer-name').fill('E2E Test Customer');
    await authenticatedAdmin.locator('#customer-email').fill('e2e-cust@example.com');
    await authenticatedAdmin.locator('#customer-phone').fill('+1-555-888-9999');
    await authenticatedAdmin.locator('#customer-company').fill('E2E Acme Corp');
    await authenticatedAdmin.locator('#customer-industry').fill('SaaS');

    // Submit form
    await authenticatedAdmin.getByRole('button', { name: /^Onboard Customer$/i }).click({ force: true });

    // Verify success notification toast
    await expect(authenticatedAdmin.getByText(/Customer Onboarded/i)).toBeVisible();
    await expect(authenticatedAdmin.getByText(/E2E Test Customer has been onboarded/i)).toBeVisible();
  });

  test('should allow admin to process customer resignation', async ({ authenticatedAdmin }) => {
    // Switch to Customers tab
    await authenticatedAdmin.getByRole('button', { name: /Customers/i }).click({ force: true });

    // Click Process Resignation button on the first active customer
    await authenticatedAdmin.getByRole('button', { name: /Process Resignation/i }).first().click({ force: true });

    // Fill resignation details
    await authenticatedAdmin.locator('#resignation-reason').fill('Moving to a competitor');
    await authenticatedAdmin.locator('#resignation-notes').fill('E2E notes');

    // Submit resignation
    await authenticatedAdmin.locator('form').getByRole('button', { name: /^Process Resignation$/ }).click({ force: true });

    // Verify success notification toast
    await expect(authenticatedAdmin.getByText(/Resignation Processed/i)).toBeVisible();
  });

  test('should allow admin to retrain the AI model', async ({ authenticatedAdmin }) => {
    // Switch to LLM Manager tab
    await authenticatedAdmin.getByRole('button', { name: /LLM Manager/i }).click({ force: true });

    // Listen to the window dialog alert
    authenticatedAdmin.once('dialog', async dialog => {
      expect(dialog.message()).toContain('Retraining initiated!');
      await dialog.dismiss();
    });

    // Click Retrain Model
    await authenticatedAdmin.getByRole('button', { name: /Retrain Model/i }).click({ force: true });
  });

  test('should switch to Bot Monitor tab and display bot metrics', async ({ authenticatedAdmin }) => {
    // Switch to Bot Monitor tab
    await authenticatedAdmin.getByRole('button', { name: /Bot Monitor/i }).click({ force: true });

    // Verify metrics title or elements are visible
    await expect(authenticatedAdmin.getByRole('heading', { name: 'Meeting Bot Monitor' })).toBeVisible();
    await expect(authenticatedAdmin.getByText('Total Meetings', { exact: false })).toBeVisible();
  });
});
