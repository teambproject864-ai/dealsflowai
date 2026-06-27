import { test, expect } from './auth-test.fixture';

test.describe('Authentication End-to-End Flow', () => {
  test('should register a new customer, verify via MFA code, log in, and log out successfully', async ({ page }) => {
    // Generate a unique email to avoid registration collisions
    const randomSuffix = Math.random().toString(36).substring(2, 9);
    const email = `test.user.${randomSuffix}@example.com`;
    const password = 'TestUserPassword123!';
    const name = 'Automation Tester';

    // Mock the register endpoint to require verification
    await page.route('**/api/auth/register', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          requiresVerification: true,
          message: "Registration successful. A verification code has been sent to your registered address."
        }),
      });
    });

    // Mock the verify endpoint to succeed and set dummy auth cookie
    await page.route('**/api/auth/verify', async (route) => {
      await page.context().addCookies([
        {
          name: 'df_auth_token',
          value: 'dummyHeader.eyJ1c2VySWQiOiJjdXN0b21lci10ZXN0IiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwibmFtZSI6IkF1dG9tYXRpb24gVGVzdGVyIiwicm9sZSI6ImN1c3RvbWVyIn0=.dummySignature',
          domain: 'localhost',
          path: '/',
          httpOnly: true,
          secure: false,
          sameSite: 'Lax',
        },
      ]);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: "Account verified successfully",
          user: {
            id: 'customer-test',
            email: 'test@example.com',
            name: 'Automation Tester',
            role: 'customer'
          }
        }),
      });
    });

    // Mock /api/auth/me to return the test customer user
    await page.route('**/api/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          user: {
            id: 'customer-test',
            email: 'test@example.com',
            name: 'Automation Tester',
            role: 'customer'
          }
        }),
      });
    });

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

    // Verify verification code subform is shown
    const verificationLabel = page.getByLabel(/MFA Verification Code/i);
    await expect(verificationLabel).toBeVisible({ timeout: 10000 });

    // Fill code and submit confirmation
    await verificationLabel.fill('123456');
    await page.getByRole('button', { name: /Activate & Log In/i }).click();

    // Verify successful verification and redirect to /portal/customer
    await expect(page).toHaveURL(/\/portal\/customer/, { timeout: 25000 });

    // Wait for portal auth guard to resolve.
    await expect(page.getByRole('status', { name: /Loading portal/i })).toBeHidden({ timeout: 30000 });

    // 2. LOGOUT FLOW
    const logoutBtn = page.getByRole('button', { name: /^Logout(ing out\.\.\.)?$/i }).first();
    await expect(logoutBtn).toBeVisible({ timeout: 10000 });
    await logoutBtn.click({ force: true });

    // Verify redirected back to home '/'
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
