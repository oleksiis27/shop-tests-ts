import { test, expect } from '@playwright/test';
import { epic, feature, story, severity } from 'allure-js-commons';
import { LoginPage } from '../../pages/login.page';
import { NavBar } from '../../pages/components/nav-bar';
import { config } from '../../config/config';

test.describe('Network Interception', () => {

  test('Empty product list shows message', async ({ page }) => {
    await epic('Network');
    await feature('Product List');
    await story('Show empty state when no products returned');
    await severity('critical');

    // Intercept API and return empty product list
    await page.route('**/api/products*', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          items: [],
          total: 0,
          page: 1,
          limit: 12,
          pages: 0,
        }),
      });
    });

    await page.goto('/');
    await page.locator('nav').waitFor({ state: 'visible' });

    await expect(page.getByText('No products found.')).toBeVisible();
  });

  test('Server error shows graceful fallback', async ({ page }) => {
    await epic('Network');
    await feature('Error Handling');
    await story('UI handles 500 server error gracefully');
    await severity('critical');

    await page.route('**/api/products*', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ detail: 'Internal Server Error' }),
      });
    });

    await page.goto('/');
    await page.locator('nav').waitFor({ state: 'visible' });

    // Page should not crash — nav still visible, no unhandled error
    await expect(page.locator('nav')).toBeVisible();
    // Product grid should be empty or show error, not crash
    const productCards = page.locator('.grid a');
    await expect(productCards).toHaveCount(0);
  });

  test('Slow network shows loading state', async ({ page }) => {
    await epic('Network');
    await feature('Loading States');
    await story('Loading indicator appears during slow product page request');
    await severity('normal');

    // Delay the single product API response by 3 seconds
    await page.route('**/api/products/1', async route => {
      await new Promise(resolve => setTimeout(resolve, 3000));
      await route.continue();
    });

    await page.goto('/products/1');

    // During the delay, loading indicator should be visible (ProductPage shows "Loading...")
    await expect(page.getByText('Loading...')).toBeVisible();

    // After delay, product details should load
    await expect(page.locator('h1')).toBeVisible({ timeout: 10000 });
  });

  test('Mock product data renders correctly', async ({ page }) => {
    await epic('Network');
    await feature('Product List');
    await story('UI renders mocked product data accurately');
    await severity('critical');

    const mockProducts = {
      items: [
        {
          id: 9999,
          name: 'Mock Laptop Pro',
          description: 'A mocked product for testing',
          price: 1299.99,
          stock: 42,
          category_id: 1,
          category: { id: 1, name: 'Electronics', slug: 'electronics' },
          image_url: '',
          created_at: '2025-01-01T00:00:00',
        },
        {
          id: 9998,
          name: 'Mock Headphones',
          description: 'Another mocked product',
          price: 49.99,
          stock: 0,
          category_id: 1,
          category: { id: 1, name: 'Electronics', slug: 'electronics' },
          image_url: '',
          created_at: '2025-01-01T00:00:00',
        },
      ],
      total: 2,
      page: 1,
      limit: 12,
      pages: 1,
    };

    await page.route('**/api/products*', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockProducts),
      });
    });

    await page.goto('/');
    await page.locator('nav').waitFor({ state: 'visible' });

    // Verify mocked data renders in UI
    await expect(page.getByText('Mock Laptop Pro')).toBeVisible();
    await expect(page.getByText('$1,299.99').or(page.getByText('$1299.99'))).toBeVisible();
    await expect(page.getByText('Mock Headphones')).toBeVisible();

    // Exactly 2 product cards
    await expect(page.locator('.grid a')).toHaveCount(2);
  });

  test('Add to cart with network failure shows error', async ({ page }) => {
    await epic('Network');
    await feature('Cart');
    await story('Cart handles network failure gracefully');
    await severity('critical');

    // Login first
    const loginPage = new LoginPage(page);
    await loginPage.openPage();
    await loginPage.login(config.userEmail, config.userPassword);
    const navBar = new NavBar(page);
    await navBar.logoutButton.waitFor({ state: 'visible' });

    // Navigate to a product page (let it load normally first)
    await page.goto('/products/1');
    await page.locator('h1').waitFor({ state: 'visible' });

    // Now intercept cart API to return error
    await page.route('**/api/cart/items', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ detail: 'Internal Server Error' }),
      });
    });

    await page.locator("input[type='number']").fill('1');
    await page.getByRole('button', { name: 'Add to Cart' }).click();

    // Should show error, not crash
    await expect(page.locator('p.text-red-600')).toBeVisible({ timeout: 5000 });
  });

  test('Login with network failure shows error', async ({ page }) => {
    await epic('Network');
    await feature('Login');
    await story('Login handles network failure gracefully');
    await severity('critical');

    await page.goto('/login');
    await page.locator('h1').waitFor({ state: 'visible' });

    // Intercept login API
    await page.route('**/api/auth/login', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ detail: 'Service Unavailable' }),
      });
    });

    await page.locator("input[name='email']").fill('test@test.com');
    await page.locator("input[name='password']").fill('password');
    await page.locator("button[type='submit']").click();

    // Error should be displayed
    await expect(page.locator('p.text-red-600')).toBeVisible();
  });

  test('Intercept and verify API request payload', async ({ page }) => {
    await epic('Network');
    await feature('Request Validation');
    await story('Verify login sends correct request payload');
    await severity('normal');

    let capturedPayload: any = null;

    // Intercept login request, capture payload, then continue
    await page.route('**/api/auth/login', async route => {
      capturedPayload = route.request().postDataJSON();
      await route.continue();
    });

    await page.goto('/login');
    await page.locator('h1').waitFor({ state: 'visible' });

    await page.locator("input[name='email']").fill(config.adminEmail);
    await page.locator("input[name='password']").fill(config.adminPassword);
    await page.locator("button[type='submit']").click();

    // Wait for request to be captured
    await page.locator('nav button').waitFor({ state: 'visible' });

    // Verify the payload sent by frontend matches what we typed
    expect(capturedPayload).not.toBeNull();
    expect(capturedPayload.email).toBe(config.adminEmail);
    expect(capturedPayload.password).toBe(config.adminPassword);
  });
});
