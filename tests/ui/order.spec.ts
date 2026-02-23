import { test, expect } from '@playwright/test';
import { epic, feature, story, severity } from 'allure-js-commons';
import { OrdersPage } from '../../pages/orders.page';
import { LoginPage } from '../../pages/login.page';
import { NavBar } from '../../pages/components/nav-bar';
import { ProductApi } from '../../api/product-api';
import { CartApi } from '../../api/cart-api';
import { OrderApi } from '../../api/order-api';
import { config } from '../../config/config';
import { getAdminToken, getUserToken } from '../../helpers/auth.helper';
import { testProduct } from '../../helpers/test-data.helper';

test.describe('Order UI', () => {
  let ordersPage: OrdersPage;
  let testProductId: number;
  let uiUserToken: string;

  test.beforeAll(async ({ request }) => {
    const adminToken = await getAdminToken(request);
    uiUserToken = await getUserToken(request);
    const productApi = new ProductApi(request);
    const cartApi = new CartApi(request);
    const orderApi = new OrderApi(request);

    // Create test product
    const product = testProduct(1);
    const res = await productApi.createProduct(adminToken, product);
    testProductId = (await res.json()).id;

    // Add to cart and create order
    await cartApi.clearCart(uiUserToken);
    await cartApi.addItem(uiUserToken, testProductId, 1);
    await orderApi.createOrder(uiUserToken);
  });

  test.beforeEach(async ({ page }) => {
    ordersPage = new OrdersPage(page);
    // Login
    const loginPage = new LoginPage(page);
    await loginPage.openPage();
    await loginPage.login(config.userEmail, config.userPassword);
    const navBar = new NavBar(page);
    await navBar.logoutButton.waitFor({ state: 'visible' });
  });

  test('Order appears in list', async () => {
    await epic('Orders');
    await feature('Orders Page');
    await story('Order appears in orders list');
    await severity('blocker');

    await ordersPage.openPage();
    const count = await ordersPage.getOrderCount();
    expect(count).toBeGreaterThan(0);

    const status = await ordersPage.getOrderStatus(0);
    expect(status?.toLowerCase()).toContain('pending');
  });

  test('Order details show total', async () => {
    await epic('Orders');
    await feature('Orders Page');
    await story('Order shows total amount');
    await severity('critical');

    await ordersPage.openPage();
    const count = await ordersPage.getOrderCount();
    expect(count).toBeGreaterThan(0);

    const total = await ordersPage.getOrderTotal(0);
    expect(total).toBeTruthy();
  });
});
