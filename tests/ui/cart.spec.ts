import { test, expect } from '@playwright/test';
import { epic, feature, story, severity } from 'allure-js-commons';
import { CartPage } from '../../pages/cart.page';
import { LoginPage } from '../../pages/login.page';
import { NavBar } from '../../pages/components/nav-bar';
import { ProductApi } from '../../api/product-api';
import { CartApi } from '../../api/cart-api';
import { config } from '../../config/config';
import { getAdminToken, getUserToken } from '../../helpers/auth.helper';
import { testProduct } from '../../helpers/test-data.helper';

test.describe('Cart UI', () => {
  let cartPage: CartPage;
  let testProductId: number;
  let uiUserToken: string;

  test.beforeAll(async ({ request }) => {
    const adminToken = await getAdminToken(request);
    uiUserToken = await getUserToken(request);
    const productApi = new ProductApi(request);
    const product = testProduct(1);
    const res = await productApi.createProduct(adminToken, product);
    testProductId = (await res.json()).id;
  });

  async function loginAndAddProduct(page: any, request: any) {
    // Clear cart and add product via API
    const cartApi = new CartApi(request);
    await cartApi.clearCart(uiUserToken);
    await cartApi.addItem(uiUserToken, testProductId, 1);

    // Login via UI
    const loginPage = new LoginPage(page);
    await loginPage.openPage();
    await loginPage.login(config.userEmail, config.userPassword);
    const navBar = new NavBar(page);
    await navBar.logoutButton.waitFor({ state: 'visible' });
  }

  test.beforeEach(async ({ page }) => {
    cartPage = new CartPage(page);
  });

  test('Added product visible in cart', async ({ page, request }) => {
    await epic('Cart');
    await feature('Cart Page');
    await story('Added product is visible in cart');
    await severity('blocker');

    await loginAndAddProduct(page, request);
    await cartPage.openPage();
    const count = await cartPage.getItemCount();
    expect(count).toBeGreaterThan(0);
  });

  test('Change quantity updates total', async ({ page, request }) => {
    await epic('Cart');
    await feature('Cart Page');
    await story('Changing quantity updates total');
    await severity('critical');

    await loginAndAddProduct(page, request);
    await cartPage.openPage();
    const initialTotal = await cartPage.getTotal();
    await cartPage.increaseQuantity(0);
    const updatedTotal = await cartPage.getTotal();
    expect(updatedTotal).not.toBe(initialTotal);
  });

  test('Remove item from cart', async ({ page, request }) => {
    await epic('Cart');
    await feature('Cart Page');
    await story('Remove item from cart');
    await severity('critical');

    await loginAndAddProduct(page, request);
    await cartPage.openPage();
    await cartPage.removeItem(0);
    await cartPage.emptyCartMessage.waitFor({ state: 'visible' });
    await expect(cartPage.emptyCartMessage).toBeVisible();
  });

  test('Clear cart removes all items', async ({ page, request }) => {
    await epic('Cart');
    await feature('Cart Page');
    await story('Clear cart removes all items');
    await severity('normal');

    await loginAndAddProduct(page, request);
    await cartPage.openPage();
    await cartPage.clearCart();
    await cartPage.emptyCartMessage.waitFor({ state: 'visible' });
    await expect(cartPage.emptyCartMessage).toBeVisible();
  });

  test('Checkout creates order', async ({ page, request }) => {
    await epic('Cart');
    await feature('Cart Page');
    await story('Checkout creates order and redirects');
    await severity('blocker');

    await loginAndAddProduct(page, request);
    await cartPage.openPage();
    await cartPage.checkout();
    await expect(page).toHaveURL(/\/orders/);
  });
});
