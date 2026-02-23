import { test, expect } from '@playwright/test';
import { epic, feature, story, severity } from 'allure-js-commons';
import { AdminPage } from '../../pages/admin.page';
import { LoginPage } from '../../pages/login.page';
import { NavBar } from '../../pages/components/nav-bar';
import { ProductApi } from '../../api/product-api';
import { config } from '../../config/config';
import { getAdminToken } from '../../helpers/auth.helper';
import { testProduct } from '../../helpers/test-data.helper';

test.describe('Admin UI', () => {
  let adminPage: AdminPage;

  test.beforeEach(async ({ page }) => {
    adminPage = new AdminPage(page);
    // Login as admin
    const loginPage = new LoginPage(page);
    await loginPage.openPage();
    await loginPage.login(config.adminEmail, config.adminPassword);
    const navBar = new NavBar(page);
    await navBar.logoutButton.waitFor({ state: 'visible' });
    await adminPage.openPage();
  });

  test('Admin sees all orders', async () => {
    await epic('Admin');
    await feature('Admin Panel');
    await story('Admin can see all orders');
    await severity('blocker');

    await adminPage.switchToOrdersTab();
    const count = await adminPage.getOrderCount();
    expect(count).toBeGreaterThan(0);
  });

  test('Admin updates order status', async () => {
    await epic('Admin');
    await feature('Admin Panel');
    await story('Admin updates order status to confirmed');
    await severity('critical');

    await adminPage.switchToOrdersTab();
    await adminPage.updateOrderStatus(0, 'confirmed');
    const status = await adminPage.getOrderStatus(0);
    expect(status?.toLowerCase()).toContain('confirmed');
  });

  test('Admin creates product', async ({ page }) => {
    await epic('Admin');
    await feature('Admin Panel');
    await story('Admin creates new product');
    await severity('critical');

    const productName = `Test Product UI ${Date.now()}`;
    await adminPage.switchToProductsTab();
    await adminPage.addProduct(
      productName,
      'Test description',
      29.99,
      50,
      'Electronics',
      'https://example.com/test.jpg',
    );
    // Verify the new product appears in the table
    await expect(page.locator('table tbody').getByText(productName)).toBeVisible();
  });

  test('Admin deletes product', async ({ page, request }) => {
    await epic('Admin');
    await feature('Admin Panel');
    await story('Admin deletes product');
    await severity('critical');

    // Create a product via API first so we know it exists
    const adminToken = await getAdminToken(request);
    const productApi = new ProductApi(request);
    const product = testProduct(1);
    product.name = `Delete Me ${Date.now()}`;
    await productApi.createProduct(adminToken, product);

    // Refresh the admin page to see the new product
    await adminPage.openPage();
    await adminPage.switchToProductsTab();

    // Find the product in the first row and remember its name
    const firstRowName = await adminPage.productRows.first().locator('td').first().textContent();
    expect(firstRowName).toBeTruthy();
    await adminPage.deleteProduct(0);

    // Verify first row no longer has the deleted product name
    const newFirstRowName = await adminPage.productRows.first().locator('td').first().textContent();
    expect(newFirstRowName).not.toBe(firstRowName);
  });
});
