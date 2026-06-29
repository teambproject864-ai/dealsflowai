import { test, expect } from './auth-test.fixture';

test.describe('Password Management - Forgot & Reset Password Flow', () => {
  
  test('should allow user to submit a forgot password request', async ({ page }) => {
    // Navigate to forgot password page
    await page.goto('/auth/forgot-password');
    await page.addStyleTag({ content: '[aria-label="Book a call"], #cookie-consent-banner { display: none !important; }' }).catch(() => {});
    
    // Fill in email
    await page.locator('input[type="email"]').fill('demo@customer.com');
    
    // Intercept POST request to mock success
    await page.route('**/api/auth/forgot-password', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'If an account exists with that email, a password reset link has been sent.',
        }),
      });
    });
    
    // Submit the form
    const form = page.locator('form').first();
    await form.evaluate(form => (form as HTMLFormElement).requestSubmit());
    
    // Verify success message is displayed
    await expect(page.getByText('Check your inbox')).toBeVisible();
    await expect(page.getByText(/If an account with/)).toBeVisible();
  });

  test('should restrict direct reset password access for customer tokens', async ({ page }) => {
    // Generate a dummy JWT payload: {"role":"customer","type":"password-reset"}
    // Base64Url: eyJyb2xlIjoiY3VzdG9tZXIiLCJ0eXBlIjoicGFzc3dvcmQtcmVzZXQifQ
    const customerToken = 'dummyHeader.eyJyb2xlIjoiY3VzdG9tZXIiLCJ0eXBlIjoicGFzc3dvcmQtcmVzZXQifQ.dummySignature';
    
    await page.goto(`/auth/reset-password?token=${customerToken}`);
    await page.addStyleTag({ content: '[aria-label="Book a call"], #cookie-consent-banner { display: none !important; }' }).catch(() => {});
    
    // Verify restriction screen is shown
    await expect(page.getByText('Direct password reset is restricted for customers and agents')).toBeVisible();
    
    // Verify password inputs are not rendered
    await expect(page.locator('input[type="password"]')).not.toBeVisible();
  });

  test('should allow direct reset password access for admin tokens', async ({ page }) => {
    // Generate a dummy JWT payload: {"role":"admin","type":"password-reset"}
    // Base64Url: eyJyb2xlIjoiYWRtaW4iLCJ0eXBlIjoicGFzc3dvcmQtcmVzZXQifQ
    const adminToken = 'dummyHeader.eyJyb2xlIjoiYWRtaW4iLCJ0eXBlIjoicGFzc3dvcmQtcmVzZXQifQ.dummySignature';
    
    await page.goto(`/auth/reset-password?token=${adminToken}`);
    await page.addStyleTag({ content: '[aria-label="Book a call"], #cookie-consent-banner { display: none !important; }' }).catch(() => {});
    
    // Verify form header
    await expect(page.getByText('Set a new password')).toBeVisible();
    await expect(page.getByText('Choose a strong password to secure your account')).toBeVisible();
    
    // Verify password inputs are rendered
    await expect(page.locator('input[placeholder="Min. 8 characters"]')).toBeVisible();
    await expect(page.locator('input[placeholder="Repeat your new password"]')).toBeVisible();
  });

  test('should allow admin to view and process password reset requests', async ({ authenticatedAdmin }) => {
    // Mock the GET request to fetch password change requests
    await authenticatedAdmin.route('**/api/admin/password-requests', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          requests: [
            {
              id: 'req-1',
              email: 'demo@customer.com',
              role: 'customer',
              createdAt: new Date().toISOString(),
              used: false,
              status: 'pending',
            },
          ],
        }),
      });
    });

    // Mock the POST request to approve the reset
    await authenticatedAdmin.route('**/api/admin/reset-password', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Password reset successfully for demo@customer.com',
        }),
      });
    });

    // Navigate to admin portal
    await authenticatedAdmin.goto('/portal/admin');
    await expect(authenticatedAdmin.getByRole('heading', { name: 'Administrator Dashboard' })).toBeVisible();
    // Wait for Next.js client-side hydration to complete
    await authenticatedAdmin.waitForTimeout(2000);
    await authenticatedAdmin.addStyleTag({ content: '[aria-label="Book a call"], #cookie-consent-banner { display: none !important; }' }).catch(() => {});
    
    // Click on the Password Requests tab
    await authenticatedAdmin.getByRole('button', { name: 'Password Requests', exact: true }).click({ force: true });
    
    // Verify the list has our pending request
    await expect(authenticatedAdmin.getByText('demo@customer.com')).toBeVisible();
    await expect(authenticatedAdmin.getByText('Pending')).toBeVisible();
    
    // Click "Process Reset" button
    await authenticatedAdmin.getByRole('button', { name: /Process Reset/i }).click({ force: true });
    
    // Fill in new password in modal
    await authenticatedAdmin.locator('#new-password').fill('NewPassword123!');
    
    // Click submit in the modal
    await authenticatedAdmin.getByRole('button', { name: /^Reset Password$/ }).click({ force: true });
    
    // Verify success notification toast
    await expect(authenticatedAdmin.getByText(/Password Reset Approved/i)).toBeVisible();
    await expect(authenticatedAdmin.getByText(/Password has been successfully updated for demo@customer.com/i)).toBeVisible();
  });
});
