import { test, expect } from '@playwright/test';

test.describe('Demo Flow Smoke Tests', () => {
  test('products page loads and shows catalog', async ({ page }) => {
    await page.goto('/products');

    await expect(page.getByTestId('products-heading')).toBeVisible();
    await expect(page.getByTestId('products-heading')).toHaveText('Products');

    // Should show at least one product card
    await expect(page.getByTestId('product-card').first()).toBeVisible();

    // New product button should be visible
    await expect(page.getByTestId('new-product-button')).toBeVisible();
  });

  test('create product from template flow', async ({ page }) => {
    await page.goto('/products');

    // Click new product button
    await page.getByTestId('new-product-button').click();

    // Dialog should open with template selection
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('Select a Template')).toBeVisible();

    // Select the first template (Standard Flight Delay)
    await page.getByTestId('template-card-template-flight-delay-standard').click();

    // Should move to details step
    await expect(page.getByText('Product Details')).toBeVisible();

    // Create the product
    await page.getByTestId('create-product-button').click();

    // Should redirect to product detail page
    await expect(page).toHaveURL(/\/products\/prod-/);
  });

  test('simulator runs claim and shows decision', async ({ page }) => {
    await page.goto('/simulator');

    await expect(page.getByTestId('simulator-heading')).toBeVisible();
    await expect(page.getByTestId('simulator-heading')).toHaveText('Claim Simulator');

    // Expand sample claims
    await page.getByTestId('sample-claims-trigger').click();

    // Load a sample claim (first button in the accordion)
    await page.getByRole('button', { name: /BK-/ }).first().click();

    // Run decision button should be enabled now
    await expect(page.getByTestId('run-decision-button')).toBeEnabled();

    // Run the decision
    await page.getByTestId('run-decision-button').click();

    // Wait for decision result
    await expect(page.getByTestId('decision-result')).toBeVisible({ timeout: 10000 });

    // Decision result card should be visible (contains title)
    await expect(page.getByTestId('decision-result').locator('[data-slot="card-title"]')).toHaveText('Decision Result');
  });

  test('metrics dashboard renders', async ({ page }) => {
    await page.goto('/metrics');

    await expect(page.getByTestId('metrics-heading')).toBeVisible();
    await expect(page.getByTestId('metrics-heading')).toHaveText('Metrics Dashboard');

    // Wait for dashboard to load (has loading state)
    await expect(page.getByTestId('metrics-dashboard')).toBeVisible({ timeout: 10000 });

    // Check key metrics are displayed (use exact match to avoid ambiguity)
    await expect(page.getByText('Automation Rate', { exact: true })).toBeVisible();
    await expect(page.getByText('Avg Processing Time', { exact: true })).toBeVisible();
    await expect(page.getByText('Approval Rate', { exact: true })).toBeVisible();
  });

  test('API demo sends request and gets response', async ({ page }) => {
    await page.goto('/api-demo');

    await expect(page.getByTestId('api-demo-heading')).toBeVisible();
    await expect(page.getByTestId('api-demo-heading')).toHaveText('API Demo');

    // Send request button should be visible
    await expect(page.getByTestId('send-request-button')).toBeVisible();

    // Send the request (default payload is already loaded)
    await page.getByTestId('send-request-button').click();

    // Wait for response
    await expect(page.getByTestId('response-status')).toBeVisible({ timeout: 10000 });

    // Should show Success status
    await expect(page.getByTestId('response-status')).toHaveText('Success');
  });

  test('navigation between pages works', async ({ page }) => {
    // Start at products
    await page.goto('/products');
    await expect(page.getByTestId('products-heading')).toBeVisible();

    // Navigate to simulator via sidebar
    await page.getByRole('link', { name: /simulator/i }).click();
    await expect(page.getByTestId('simulator-heading')).toBeVisible();

    // Navigate to metrics
    await page.getByRole('link', { name: /metrics/i }).click();
    await expect(page.getByTestId('metrics-heading')).toBeVisible();

    // Navigate to API demo
    await page.getByRole('link', { name: /api/i }).click();
    await expect(page.getByTestId('api-demo-heading')).toBeVisible();
  });
});

test.describe('API Validation Tests', () => {
  test('API returns error for invalid flight number format', async ({ request }) => {
    const response = await request.post('/api/decision', {
      data: {
        bookingRef: 'BK-12345',
        flightNo: 'invalid', // Invalid: should be 2-3 letters + 1-4 digits
        flightDate: '2024-12-20',
        passengerToken: 'pax-abc123',
        productId: 'prod-eu-delay',
        productVersion: 'v1.2',
      },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.errorCode).toBe('INVALID_FLIGHT_NO');
  });

  test('API returns error for invalid date format', async ({ request }) => {
    const response = await request.post('/api/decision', {
      data: {
        bookingRef: 'BK-12345',
        flightNo: 'BA123',
        flightDate: '12-20-2024', // Invalid: should be YYYY-MM-DD
        passengerToken: 'pax-abc123',
        productId: 'prod-eu-delay',
        productVersion: 'v1.2',
      },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.errorCode).toBe('INVALID_DATE_FORMAT');
  });

  test('API returns error for invalid version format', async ({ request }) => {
    const response = await request.post('/api/decision', {
      data: {
        bookingRef: 'BK-12345',
        flightNo: 'BA123',
        flightDate: '2024-12-20',
        passengerToken: 'pax-abc123',
        productId: 'prod-eu-delay',
        productVersion: '1.2', // Invalid: should start with 'v'
      },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.errorCode).toBe('INVALID_VERSION_FORMAT');
  });

  test('API handles unknown flight with dynamic generation', async ({ request }) => {
    const response = await request.post('/api/decision', {
      data: {
        bookingRef: 'BK-12345',
        flightNo: 'ZZ999', // Unknown flight - should be generated
        flightDate: '2024-12-20',
        passengerToken: 'pax-abc123',
        productId: 'prod-eu-delay',
        productVersion: 'v1.2',
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    // Should have flight data (generated)
    expect(body.flightData.flightNo).toBe('ZZ999');
    // Should have a valid decision
    expect(['approved', 'denied']).toContain(body.decision.outcome);
  });

  test('API returns consistent results for same flight (deterministic)', async ({ request }) => {
    const payload = {
      bookingRef: 'BK-DETER-001',
      flightNo: 'XX123',
      flightDate: '2024-12-20',
      passengerToken: 'pax-test',
      productId: 'prod-eu-delay',
      productVersion: 'v1.2',
    };

    const response1 = await request.post('/api/decision', { data: payload });
    const response2 = await request.post('/api/decision', { data: payload });

    const body1 = await response1.json();
    const body2 = await response2.json();

    // Same flight should produce same delay/outcome
    expect(body1.flightData.delayMinutes).toBe(body2.flightData.delayMinutes);
    expect(body1.decision.outcome).toBe(body2.decision.outcome);
    expect(body1.decision.payoutAmountUSD).toBe(body2.decision.payoutAmountUSD);
  });
});
