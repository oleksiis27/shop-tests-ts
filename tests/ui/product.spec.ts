import { test, expect } from '@playwright/test';
import { epic, feature, story, severity } from 'allure-js-commons';
import { ProductPage } from '../../pages/product.page';
import { LoginPage } from '../../pages/login.page';
import { NavBar } from '../../pages/components/nav-bar';
import { ProductApi } from '../../api/product-api';
import { config } from '../../config/config';
import { getAdminToken } from '../../helpers/auth.helper';
import { testProduct } from '../../helpers/test-data.helper';

test.describe('Product UI', () => {
  let productPage: ProductPage;
  let testProductId: number;

  test.beforeAll(async ({ request }) => {
    const adminToken = await getAdminToken(request);
    const productApi = new ProductApi(request);
    const product = testProduct(1);
    const res = await productApi.createProduct(adminToken, product);
    testProductId = (await res.json()).id;
  });

  test.beforeEach(async ({ page }) => {
    productPage = new ProductPage(page);
  });

  test('Product page shows details', async () => {
    await epic('Products');
    await feature('Product Page');
    await story('Product details are displayed');
    await severity('blocker');

    await productPage.openPage(testProductId);
    const name = await productPage.getProductName();
    const price = await productPage.getPrice();
    expect(name).toBeTruthy();
    expect(price).toBeTruthy();
  });

  test('Add product to cart', async ({ page }) => {
    await epic('Products');
    await feature('Product Page');
    await story('Add product to cart from product page');
    await severity('critical');

    // Login first
    const loginPage = new LoginPage(page);
    await loginPage.openPage();
    await loginPage.login(config.userEmail, config.userPassword);
    const navBar = new NavBar(page);
    await navBar.logoutButton.waitFor({ state: 'visible' });

    await productPage.openPage(testProductId);
    await productPage.setQuantity(1);
    await productPage.addToCart();
    await productPage.successMessage.waitFor({ state: 'visible' });
    await expect(productPage.successMessage).toBeVisible();
  });

  test('Unauthorized add to cart redirects to login', async ({ page }) => {
    await epic('Products');
    await feature('Product Page');
    await story('Unauthenticated user redirected to login');
    await severity('normal');

    await productPage.openPage(testProductId);
    await productPage.addToCart();
    await expect(page).toHaveURL(/\/login/);
  });
});
