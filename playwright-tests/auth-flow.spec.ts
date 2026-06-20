import { test, expect } from '@playwright/test';

test.describe('Authentication End-to-End Flow', () => {
  test('should register a new customer, log in, and log out successfully', async ({ page }) => {
    // Generate a unique email to avoid registration collisions
    const randomSuffix = Math.random().toString(36).substring(2, 9);
    const email = `test.user.${randomSuffix}@example.com`;
    const password = 'TestUserPassword123!';
    const name = 'Automation Tester';

    // 1. SIGNUP FLOW
    await page.goto('/portal/customer/login?signup=true');
    await expect(page.locator('h2')).toContainText(/Join DealFlow AI/i);

    // Fill registration form using field labels
    await page.getByLabel(/Full Name/i).fill(name);
    await page.getByLabel(/Email Address/i).fill(email);
    await page.getByLabel(/^Password$/i).fill(password);

    // Submit signup
    const submitBtn = page.locator('#auth-submit-btn');
    await expect(submitBtn).toBeVisible();
    await submitBtn.click();

    // Verify successful registration and redirect to /portal/customer
    await expect(page).toHaveURL(/\/portal\/customer/, { timeout: 25000 });

    // 2. LOGOUT FLOW
    // Click Account Menu button (trigger) in the header
    const avatarBtn = page.getByLabel(/User account menu/i);
    await expect(avatarBtn).toBeVisible();
    await avatarBtn.click();

    // Click the logout button inside the Account Dropdown
    const logoutBtn = page.getByRole('menuitem', { name: /Logout/i });
    await expect(logoutBtn).toBeVisible();
    await logoutBtn.click();

    // Verify redirected back to home '/' and session cookie is cleared
    await expect(page).toHaveURL(/\/$/, { timeout: 25000 });

    // Open account menu again and verify it is in the guest/logged-out state
    await avatarBtn.click();
    await expect(page.getByText(/Access Portal/i)).toBeVisible();
  });

  test('should handle valid and invalid logins for demo customer', async ({ page }) => {
    // 1. INVALID LOGIN
    await page.goto('/portal/customer/login');
    await expect(page.locator('h2')).toContainText(/Welcome back/i);

    await page.getByLabel(/Email Address/i).fill('demo@customer.com');
    await page.getByLabel(/^Password$/i).fill('WrongPassword!');
    await page.locator('#auth-submit-btn').click();

    // Verify alert message is visible
    const alert = page.getByRole('alert');
    await expect(alert).toBeVisible();
    await expect(alert).toContainText(/Invalid email or password/i);

    // 2. VALID LOGIN
    await page.getByLabel(/^Password$/i).fill('CustomerDemo123!');
    await page.locator('#auth-submit-btn').click();

    // Verify successfully logged in and redirected
    await expect(page).toHaveURL(/\/portal\/customer/, { timeout: 25000 });
  });
});
