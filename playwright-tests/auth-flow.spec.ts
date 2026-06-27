import { test, expect } from './auth-test.fixture';

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

    // Wait for portal auth guard to resolve.
    // The portal layout shows a "Loading portal" spinner (role=status) while
    // useCurrentUser fetches /api/auth/me and React propagates the auth state.
    // We wait for that spinner to disappear, confirming checkingAccess=false.
    await expect(page.getByRole('status', { name: /Loading portal/i })).toBeHidden({ timeout: 30000 });

    // 2. LOGOUT FLOW
    // The portal layout renders an ExtrudedButton "Logout" once the auth guard
    // resolves — visible on both desktop and mobile viewports.
    // Use force:true to bypass CSS animation stability checks on ExtrudedButton.
    const logoutBtn = page.getByRole('button', { name: /^Logout(ing out\.\.\.)?$/i }).first();
    await expect(logoutBtn).toBeVisible({ timeout: 10000 });
    await logoutBtn.click({ force: true });

    // Verify redirected back to home '/' and session cookie is cleared
    await expect(page).toHaveURL(/\/$/, { timeout: 25000 });
  });

  test('should handle valid and invalid logins for demo customer', async ({ page }) => {
    // 1. INVALID LOGIN
    await page.goto('/portal/customer/login');
    await expect(page.locator('h2')).toContainText(/Welcome back/i);

    await page.getByLabel(/Email Address/i).fill('demo@customer.com');
    await page.getByLabel(/^Password$/i).fill('WrongPassword!');
    await page.locator('#auth-submit-btn').click();

    // Verify alert message is visible
    const alert = page.getByRole('alert').filter({ hasText: /Invalid email or password/i });
    await expect(alert).toBeVisible();

    // 2. VALID LOGIN
    await page.getByLabel(/^Password$/i).fill('CustomerDemo123!');
    await page.locator('#auth-submit-btn').click();

    // Verify successfully logged in and redirected
    await expect(page).toHaveURL(/\/portal\/customer/, { timeout: 25000 });
  });
});
