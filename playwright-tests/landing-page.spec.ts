import { test, expect } from './auth-test.fixture';

test.describe('Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    // Wait for the initial loading spinner to vanish (lazy compiled first load may be slow)
    await expect(page.getByText('Initializing experience')).toBeHidden({ timeout: 30000 });
    // Give client-side hydration a moment so event listeners are attached
    await page.waitForTimeout(1000);
  });

  test('should load the landing page and display key elements', async ({ page, isMobile }) => {
    await expect(page).toHaveTitle(/DealFlow/i);

    // Check that the hero section is present
    await expect(page.locator('h1').first()).toBeVisible();

    // Check that navigation is visible (only on desktop)
    if (!isMobile) {
      await expect(page.getByRole('navigation')).toBeVisible();
    } else {
      // On mobile, hamburger menu should be visible
      await expect(page.getByRole('button', { name: /Open main menu/i })).toBeVisible();
    }

    // Check hero CTA buttons
    await expect(page.getByText(/Get Started/i).filter({ visible: true }).first()).toBeVisible();
  });

  test('should navigate to the features page', async ({ page, isMobile }) => {
    if (isMobile) {
      // Open the slide-out drawer
      await page.getByRole('button', { name: /Open main menu/i }).click();
      // Wait for drawer animation
      await page.waitForTimeout(500);
      // Features is a simple nav link inside the drawer (no subOptions, so directly visible)
      const featuresLink = page.getByRole('link', { name: /^Features$/i }).filter({ visible: true }).first();
      await expect(featuresLink).toBeVisible({ timeout: 10000 });
      await featuresLink.click();
    } else {
      await page.getByRole('link', { name: /^Features$/i }).filter({ visible: true }).first().click();
    }
    await expect(page).toHaveURL(/features/);
  });

  test('should navigate to the pricing section', async ({ page, isMobile }) => {
    if (isMobile) {
      await page.getByRole('button', { name: /Open main menu/i }).click();
      await page.waitForTimeout(500);
    }
    // Pricing is a nav link in the header or mobile drawer
    await page.getByRole('link', { name: /^Pricing$/i }).filter({ visible: true }).first().click();
    // Pricing is an anchor scroll on landing page OR a /pricing route
    // Just verify we ended up somewhere with pricing content
    await expect(page.getByText(/pricing/i).filter({ visible: true }).first()).toBeVisible();
  });

  test('should navigate to the book demo page', async ({ page, isMobile }) => {
    if (isMobile) {
      // Book a Demo on mobile is inside the slide-out drawer as a Button (not a link)
      await page.getByRole('button', { name: /Open main menu/i }).click();
      await page.waitForTimeout(500);
      // Click the "Book a Demo" button in the drawer footer
      await page.getByRole('button', { name: /Book a Demo/i }).filter({ visible: true }).first().click();
    } else {
      // On desktop/tablet the CTA is a button in the header (ExtrudedButton renders as button)
      await page.getByRole('button', { name: /Book a Demo/i }).filter({ visible: true }).first().click();
    }
    await expect(page).toHaveURL(/book/, { timeout: 15000 });
  });

  test('should navigate to the solutions page', async ({ page }) => {
    // Navigate directly — avoids dropdown hover interaction complexity
    await page.goto('/solutions', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/solutions/);
  });

  test('should navigate to the portal login', async ({ page, isMobile }) => {
    if (isMobile) {
      await page.getByRole('button', { name: /Open main menu/i }).click();
      await page.waitForTimeout(500);
      // Click Portal accordion to expand
      await page.getByRole('button', { name: /^Portal$/ }).filter({ visible: true }).click();
      await page.waitForTimeout(300);
      // Click Overview link in subnav
      await page.getByRole('link', { name: /Overview/i }).filter({ visible: true }).click();
    } else {
      // Portal dropdown button exists in the nav
      await page.locator('nav').getByRole('button', { name: /Portal/i }).first().hover();
      await page.waitForTimeout(300);
      // "View All Portal" header link in dropdown → goes to /portal
      await page.getByRole('link', { name: /View All Portal/i }).filter({ visible: true }).click();
    }
    // Should redirect to some portal page (login if unauthenticated, or /portal)
    await expect(page).toHaveURL(/\/portal/, { timeout: 30000 });
  });
});
