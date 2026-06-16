import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test('should load the landing page and display key elements', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/DealFlow/);
    
    // Check that the hero section is present
    await expect(page.locator('h1').first()).toBeVisible();
    
    // Check that navigation is visible
    await expect(page.getByRole('navigation')).toBeVisible();
  });

  test('should navigate to GTM analysis, pricing, features, and book demo pages', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to GTM Analysis page
    await page.getByRole('link', { name: /GTM/i }).first().click();
    await expect(page).toHaveURL(/gtm/);
    
    // Navigate to Pricing page
    await page.getByRole('link', { name: /Pricing/i }).first().click();
    await expect(page).toHaveURL(/pricing/);
    
    // Navigate to Features page
    await page.getByRole('link', { name: /Features/i }).first().click();
    await expect(page).toHaveURL(/features/);
    
    // Navigate to Book Demo page
    await page.getByRole('link', { name: /Book Demo/i }).first().click();
    await expect(page).toHaveURL(/book-demo/);
  });
});
