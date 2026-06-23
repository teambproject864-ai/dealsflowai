import { test, expect } from './auth-test.fixture';

test.describe('Versatile Dealflow Platform - Business Model Support', () => {
  let mockCustomersList = [
    {
      id: 'customer-demo',
      name: 'Demo Customer',
      email: 'demo@customer.com',
      companyName: 'Demo Corp',
      status: 'active',
      businessModel: 'b2b',
      serviceConfigurations: { gtmReports: true, leadScoring: true, aiCalls: true }
    },
    {
      id: 'customer-anil',
      name: 'Anil Kumar',
      email: 'anil@cralgo.com',
      companyName: 'Cralgo',
      status: 'onboarding',
      businessModel: 'b2c',
      serviceConfigurations: { gtmReports: true }
    }
  ];

  test.describe('Admin Workspace Toggles & Metrics', () => {
    test.beforeEach(async ({ authenticatedAdmin }) => {
      // Intercept /api/admin/customers to return mock data and handle updates
      await authenticatedAdmin.route('**/api/admin/customers', async (route) => {
        if (route.request().method() === 'POST') {
          const body = JSON.parse(route.request().postData() || '{}');
          const { customerId, businessModel } = body;
          const idx = mockCustomersList.findIndex(c => c.id === customerId);
          if (idx !== -1) {
            mockCustomersList[idx].businessModel = businessModel;
          }
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ success: true, message: "Customer updated successfully" }),
          });
        } else {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ success: true, customers: mockCustomersList }),
          });
        }
      });

      // Log browser console output and page errors
      authenticatedAdmin.on('console', msg => console.log('ADMIN BROWSER LOG:', msg.text()));
      authenticatedAdmin.on('pageerror', err => console.log('ADMIN BROWSER PAGE ERROR:', err.message));

      await authenticatedAdmin.goto('/portal/admin');
      // Hide the booking FAB
      await authenticatedAdmin.addStyleTag({ content: '[aria-label="Book a call"] { display: none !important; }' }).catch(() => {});
    });

    test('should show Operating Models distribution card and onboard a new B2C customer', async ({ authenticatedAdmin }) => {
      // 1. Verify metrics card
      await expect(authenticatedAdmin.getByText('Operating Models', { exact: true })).toBeVisible();
      await expect(authenticatedAdmin.getByText('B2B:', { exact: false })).toBeVisible();
      await expect(authenticatedAdmin.getByText('B2C:', { exact: false })).toBeVisible();
      await expect(authenticatedAdmin.getByText('D2C:', { exact: false })).toBeVisible();

      // 2. Go to Customers tab
      await authenticatedAdmin.getByRole('button', { name: /Customers/i }).click({ force: true });
      await expect(authenticatedAdmin.getByRole('heading', { name: 'Customer Management' })).toBeVisible();

      // 3. Open Onboarding Modal
      await authenticatedAdmin.getByRole('button', { name: /Onboard New Customer/i }).click({ force: true });

      // 4. Fill form including Business Model dropdown
      await authenticatedAdmin.locator('#customer-name').fill('Custom B2C Brand');
      await authenticatedAdmin.locator('#customer-email').fill('custom-b2c@example.com');
      await authenticatedAdmin.locator('#customer-phone').fill('+1-555-999-0000');
      await authenticatedAdmin.locator('#customer-company').fill('Acme B2C Ltd');
      await authenticatedAdmin.locator('#customer-industry').fill('Retail');
      
      // Select B2C Retail model
      await authenticatedAdmin.locator('#business-model').selectOption('b2c');

      // Onboard customer - ensure button is scrolled into view and clicked cleanly
      const onboardBtn = authenticatedAdmin.getByRole('button', { name: /^Onboard Customer$/i });
      await onboardBtn.scrollIntoViewIfNeeded();
      await onboardBtn.click();

      // Verify success notification toast
      await expect(authenticatedAdmin.getByText(/Customer Onboarded/i)).toBeVisible();
      await expect(authenticatedAdmin.getByText(/Custom B2C Brand has been onboarded/i)).toBeVisible();
    });

    test('should allow admin to update business model of a customer dynamically', async ({ authenticatedAdmin }) => {
      // Go to Customers tab
      await authenticatedAdmin.getByRole('button', { name: /Customers/i }).click({ force: true });
      await expect(authenticatedAdmin.getByRole('heading', { name: 'Customer Management' })).toBeVisible();

      // Locate first customer's business model select dropdown and update to B2C Retail
      const selectDropdown = authenticatedAdmin.locator('select:has-text("B2B Enterprise")').first();
      await selectDropdown.selectOption('b2c');

      // Verify success notification toast
      await expect(authenticatedAdmin.getByText(/Business Model Updated/i)).toBeVisible();
      await expect(authenticatedAdmin.getByText(/Successfully set to B2C/i)).toBeVisible();
    });
  });

  test.describe('Customer Portal Adaptation & Interactive Tools', () => {
    let currentConfig = {
      id: 'customer-demo',
      name: 'Demo Customer',
      email: 'demo@customer.com',
      companyName: 'Demo Corp',
      status: 'active',
      businessModel: 'b2b',
      serviceConfigurations: { gtmReports: true, leadScoring: true, aiCalls: true }
    };

    test.beforeEach(async ({ authenticatedCustomer }) => {
      // Intercept config requests
      await authenticatedCustomer.route('**/api/customer/config', async (route) => {
        if (route.request().method() === 'POST') {
          const body = JSON.parse(route.request().postData() || '{}');
          if (body.businessModel) {
            currentConfig.businessModel = body.businessModel;
          }
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ success: true, customer: currentConfig }),
          });
        } else {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ success: true, customer: currentConfig }),
          });
        }
      });

      // Intercept ICP entries request to return clean mock
      await authenticatedCustomer.route('**/api/customer/icp', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, icpEntries: [] }),
        });
      });

      // Intercept agent assignments request to return clean mock
      await authenticatedCustomer.route('**/api/agent-assignments', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, assignments: [] }),
        });
      });

      // Automatically accept any browser dialogs (alerts/confirmations)
      authenticatedCustomer.on('dialog', async (dialog) => {
        await dialog.accept();
      });

      // Log browser console output and page errors
      authenticatedCustomer.on('console', msg => console.log('CUSTOMER BROWSER LOG:', msg.text()));
      authenticatedCustomer.on('pageerror', err => console.log('CUSTOMER BROWSER PAGE ERROR:', err.message));

      // Navigate to portal
      await authenticatedCustomer.goto('/portal/customer');
      // Hide the booking FAB
      await authenticatedCustomer.addStyleTag({ content: '[aria-label="Book a call"] { display: none !important; }' }).catch(() => {});
    });

    test('should render B2B view by default and support B2B wholesale order placement', async ({ authenticatedCustomer }) => {
      // 1. Verify B2B banner and KPI metrics
      await expect(authenticatedCustomer.getByText('B2B Enterprise Mode')).toBeVisible();
      await expect(authenticatedCustomer.getByText('Total Contract Value', { exact: false })).toBeVisible();
      await expect(authenticatedCustomer.getByText('Active Pilot Deals', { exact: false })).toBeVisible();

      // 2. Go to Operating Model Toolset tab
      await authenticatedCustomer.getByRole('button', { name: /Operating Model Toolset/i }).click({ force: true });
      await expect(authenticatedCustomer.getByRole('heading', { name: 'Process Bulk Wholesale Order' })).toBeVisible();

      // 3. Process a wholesale order
      await authenticatedCustomer.locator('select[name="productName"]').selectOption('API Infrastructure Pack');
      await authenticatedCustomer.locator('input[name="quantity"]').fill('200');
      await authenticatedCustomer.locator('input[name="unitPrice"]').fill('200');
      await authenticatedCustomer.locator('textarea[name="notes"]').fill('Playwright B2B E2E Test Order');

      // Click button (dialog will be automatically accepted by the listener)
      const b2bSubmitBtn = authenticatedCustomer.getByRole('button', { name: 'Submit Wholesale Order' });
      await b2bSubmitBtn.scrollIntoViewIfNeeded();
      await b2bSubmitBtn.click({ force: true });

      // Verify new order is added to B2B Bulk Orders Log table
      await expect(authenticatedCustomer.locator('table').getByText('API Infrastructure Pack').first()).toBeVisible();
    });

    test('should adapt to B2C mode and run checkout simulation', async ({ authenticatedCustomer }) => {
      // 1. Change business model to B2C via POST API
      await authenticatedCustomer.evaluate(async () => {
        await fetch('/api/customer/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ businessModel: 'b2c' })
        });
      });

      // Reload the page to load B2C mode
      await authenticatedCustomer.reload();
      await expect(authenticatedCustomer.getByText('B2C Consumer Retail Mode')).toBeVisible();

      // 2. Verify B2C KPIs
      await expect(authenticatedCustomer.getByText('Checkout Sales', { exact: false })).toBeVisible();
      await expect(authenticatedCustomer.getByText('Conversion Rate', { exact: false })).toBeVisible();
      await expect(authenticatedCustomer.getByText('Cart Abandonment', { exact: false })).toBeVisible();

      // 3. Go to Operating Model Toolset
      await authenticatedCustomer.getByRole('button', { name: /Operating Model Toolset/i }).click({ force: true });
      await expect(authenticatedCustomer.getByRole('heading', { name: 'B2C Retail Checkout Simulator' })).toBeVisible();

      // 4. Click Hoodie item to add to simulated cart (using direct text selector for robustness)
      const hoodieBtn = authenticatedCustomer.getByRole('button').filter({ hasText: 'Hoodie' }).first();
      await hoodieBtn.scrollIntoViewIfNeeded();
      await hoodieBtn.click();
      await expect(authenticatedCustomer.getByText('Organic Hoodie').first()).toBeVisible();

      // 5. Fill out checkout form
      await authenticatedCustomer.locator('input[placeholder="e.g. John Smith"]').fill('Playwright Shopper');
      await authenticatedCustomer.locator('input[placeholder="123 Main St, New York"]').fill('456 Playwright Ave');

      // Click simulated checkout button (dialog accepted automatically)
      const b2cCheckoutBtn = authenticatedCustomer.getByRole('button', { name: 'Simulate Successful Checkout' });
      await b2cCheckoutBtn.scrollIntoViewIfNeeded();
      await b2cCheckoutBtn.click({ force: true });

      // Verify transaction is logged in Simulated Retail Sales Feed table
      await expect(authenticatedCustomer.locator('table').getByText('Playwright Shopper')).toBeVisible();
    });

    test('should adapt to D2C mode and customize brand styling', async ({ authenticatedCustomer }) => {
      // 1. Change business model to D2C via POST API
      await authenticatedCustomer.evaluate(async () => {
        await fetch('/api/customer/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ businessModel: 'd2c' })
        });
      });

      // Reload to load D2C layout
      await authenticatedCustomer.reload();
      await expect(authenticatedCustomer.getByText('D2C Direct Brand Mode')).toBeVisible();

      // 2. Verify D2C KPIs
      await expect(authenticatedCustomer.getByText('Avg. Order Value', { exact: false })).toBeVisible();
      await expect(authenticatedCustomer.getByText('Brand NPS', { exact: false })).toBeVisible();
      await expect(authenticatedCustomer.getByText('Social ROI', { exact: false })).toBeVisible();

      // 3. Go to Operating Model Toolset
      await authenticatedCustomer.getByRole('button', { name: /Operating Model Toolset/i }).click({ force: true });
      await expect(authenticatedCustomer.getByRole('heading', { name: 'Brand Customization Studio' })).toBeVisible();

      // 4. Fill brand customizer form
      await authenticatedCustomer.locator('input[name="brandName"]').fill('E2E Custom Brand');
      await authenticatedCustomer.locator('input[name="instagramHandle"]').fill('@e2e_insta');

      // Click save button (dialog accepted automatically)
      const d2cSaveBtn = authenticatedCustomer.getByRole('button', { name: 'Save Brand Themes' });
      await d2cSaveBtn.scrollIntoViewIfNeeded();
      await d2cSaveBtn.click({ force: true });

      // 5. Verify the live brand preview card reflects new details
      await expect(authenticatedCustomer.getByText('E2E Custom Brand')).toBeVisible();
      await expect(authenticatedCustomer.getByText('@e2e_insta')).toBeVisible();
    });
  });
});
