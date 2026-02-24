import { test, expect } from '@playwright/test';
import { epic, feature, story, severity } from 'allure-js-commons';
import { LoginPage } from '../../pages/login.page';
import { NavBar } from '../../pages/components/nav-bar';
import { ProductApi } from '../../api/product-api';
import { config } from '../../config/config';
import { getAdminToken } from '../../helpers/auth.helper';
import { testProduct } from '../../helpers/test-data.helper';

test.describe('Visual Regression', () => {

  test('Home page layout', async ({ page }) => {
    await epic('Visual');
    await feature('Home Page');
    await story('Home page layout matches baseline');
    await severity('normal');

    await page.goto('/');
    await page.locator('nav').waitFor({ state: 'visible' });
    await page.locator('.grid a').first().waitFor({ state: 'visible' });

    await expect(page).toHaveScreenshot('home-page.png', {
      maxDiffPixelRatio: 0.05,
    });
  });

  test('Product card component', async ({ page }) => {
    await epic('Visual');
    await feature('Home Page');
    await story('Product card renders correctly');
    await severity('normal');

    await page.goto('/');
    await page.locator('.grid a').first().waitFor({ state: 'visible' });

    // Screenshot of just the first product card — catches CSS/layout issues
    await expect(page.locator('.grid a').first()).toHaveScreenshot('product-card.png', {
      maxDiffPixelRatio: 0.05,
    });
  });

  test('Login page layout', async ({ page }) => {
    await epic('Visual');
    await feature('Login');
    await story('Login form renders correctly');
    await severity('normal');

    await page.goto('/login');
    await page.locator('h1').waitFor({ state: 'visible' });

    await expect(page.locator('form')).toHaveScreenshot('login-form.png', {
      maxDiffPixelRatio: 0.05,
    });
  });

  test('Register page layout', async ({ page }) => {
    await epic('Visual');
    await feature('Registration');
    await story('Register form renders correctly');
    await severity('normal');

    await page.goto('/register');
    await page.locator('h1').waitFor({ state: 'visible' });

    await expect(page.locator('form')).toHaveScreenshot('register-form.png', {
      maxDiffPixelRatio: 0.05,
    });
  });

  test('Product detail page layout', async ({ page, request }) => {
    await epic('Visual');
    await feature('Product Page');
    await story('Product detail page renders correctly');
    await severity('normal');

    const adminToken = await getAdminToken(request);
    const productApi = new ProductApi(request);
    const product = testProduct(1);
    const res = await productApi.createProduct(adminToken, product);
    const productId = (await res.json()).id;

    await page.goto(`/products/${productId}`);
    await page.locator('h1').waitFor({ state: 'visible' });

    await expect(page).toHaveScreenshot('product-detail.png', {
      maxDiffPixelRatio: 0.05,
    });
  });

  test('Navigation bar - logged out', async ({ page }) => {
    await epic('Visual');
    await feature('Navigation');
    await story('Nav bar renders correctly when logged out');
    await severity('normal');

    await page.goto('/');
    await page.locator('nav').waitFor({ state: 'visible' });

    await expect(page.locator('nav')).toHaveScreenshot('nav-logged-out.png', {
      maxDiffPixelRatio: 0.05,
    });
  });

  test('Navigation bar - logged in', async ({ page }) => {
    await epic('Visual');
    await feature('Navigation');
    await story('Nav bar renders correctly when logged in');
    await severity('normal');

    const loginPage = new LoginPage(page);
    await loginPage.openPage();
    await loginPage.login(config.adminEmail, config.adminPassword);
    const navBar = new NavBar(page);
    await navBar.logoutButton.waitFor({ state: 'visible' });

    await expect(page.locator('nav')).toHaveScreenshot('nav-logged-in.png', {
      maxDiffPixelRatio: 0.05,
    });
  });

  test('Empty cart page', async ({ page }) => {
    await epic('Visual');
    await feature('Cart');
    await story('Empty cart page renders correctly');
    await severity('normal');

    const loginPage = new LoginPage(page);
    await loginPage.openPage();
    await loginPage.login(config.userEmail, config.userPassword);
    await page.locator('nav button').waitFor({ state: 'visible' });

    await page.goto('/cart');
    await page.locator('h1').waitFor({ state: 'visible' });
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot('empty-cart.png', {
      maxDiffPixelRatio: 0.05,
    });
  });
});
