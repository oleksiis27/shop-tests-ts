import { test, expect } from '@playwright/test';
import { epic, feature, story, severity } from 'allure-js-commons';
import { OrderApi } from '../../api/order-api';
import { CartApi } from '../../api/cart-api';
import { ProductApi } from '../../api/product-api';
import { getAdminToken, registerAndGetToken } from '../../helpers/auth.helper';
import { testProduct } from '../../helpers/test-data.helper';

test.describe('Orders API', () => {
  let orderApi: OrderApi;
  let cartApi: CartApi;
  let productApi: ProductApi;
  let userToken: string;
  let adminToken: string;
  let productId: number;

  test.beforeAll(async ({ request }) => {
    adminToken = await getAdminToken(request);
    userToken = await registerAndGetToken(request);

    productApi = new ProductApi(request);

    // Create test product
    const product = testProduct(1);
    const res = await productApi.createProduct(adminToken, product);
    productId = (await res.json()).id;
  });

  test.beforeEach(async ({ request }) => {
    orderApi = new OrderApi(request);
    cartApi = new CartApi(request);
    // Clear cart before each test
    await cartApi.clearCart(userToken);
  });

  test('Create order from cart', async () => {
    await epic('Orders');
    await feature('Order Creation');
    await story('Create order from cart');
    await severity('blocker');

    await cartApi.addItem(userToken, productId, 2);

    const response = await orderApi.createOrder(userToken);
    expect(response.status()).toBe(201);

    const body = await response.json();
    expect(body.id).toBeDefined();
    expect(body.status).toBe('pending');
    expect(body.total).toBeGreaterThan(0);
    expect(body.items.length).toBeGreaterThan(0);
    expect(body.items[0].product_id).toBe(productId);
    expect(body.items[0].quantity).toBe(2);
    expect(body.items[0].price).toBeGreaterThan(0);
  });

  test('Create order from empty cart', async () => {
    await epic('Orders');
    await feature('Order Creation');
    await story('Reject order from empty cart');
    await severity('critical');

    const response = await orderApi.createOrder(userToken);
    expect(response.status()).toBe(400);
  });

  test('Cart empty after order', async () => {
    await epic('Orders');
    await feature('Order Creation');
    await story('Cart is cleared after order');
    await severity('critical');

    await cartApi.addItem(userToken, productId, 1);
    await orderApi.createOrder(userToken);

    const cartResponse = await cartApi.getCart(userToken);
    const cart = await cartResponse.json();
    expect(cart.items.length).toBe(0);
    expect(cart.total).toBe(0);
  });

  test('Get orders list', async () => {
    await epic('Orders');
    await feature('Order List');
    await story('Get user orders list');
    await severity('blocker');

    // Create an order first
    await cartApi.addItem(userToken, productId, 1);
    const createResponse = await orderApi.createOrder(userToken);
    const createdOrder = await createResponse.json();

    const response = await orderApi.getOrders(userToken);
    expect(response.status()).toBe(200);

    const body = await response.json();
    const orderIds = body.map((o: any) => o.id);
    expect(orderIds).toContain(createdOrder.id);
  });

  test('Get order by ID', async () => {
    await epic('Orders');
    await feature('Order Details');
    await story('Get order by ID');
    await severity('critical');

    await cartApi.addItem(userToken, productId, 1);
    const createResponse = await orderApi.createOrder(userToken);
    const createdOrder = await createResponse.json();

    const response = await orderApi.getOrder(userToken, createdOrder.id);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.id).toBe(createdOrder.id);
    expect(body.status).toBe('pending');
    expect(body.total).toBeGreaterThan(0);
    expect(body.user_id).toBeDefined();
    expect(body.created_at).toBeDefined();
    expect(body.items.length).toBeGreaterThan(0);
  });

  test('Get other user order', async ({ request }) => {
    await epic('Orders');
    await feature('Order Security');
    await story('Cannot access other user order');
    await severity('critical');

    await cartApi.addItem(userToken, productId, 1);
    const createResponse = await orderApi.createOrder(userToken);
    const createdOrder = await createResponse.json();

    // Register another user and try to access
    const otherToken = await registerAndGetToken(request);
    const response = await orderApi.getOrder(otherToken, createdOrder.id);
    expect(response.status()).toBe(404);
  });

  test('Admin get all orders', async () => {
    await epic('Orders');
    await feature('Admin Orders');
    await story('Admin gets all orders');
    await severity('critical');

    const response = await orderApi.getAdminOrders(adminToken);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.length).toBeGreaterThan(0);
  });

  test('Admin update status to confirmed', async () => {
    await epic('Orders');
    await feature('Admin Orders');
    await story('Admin updates order status to confirmed');
    await severity('critical');

    await cartApi.addItem(userToken, productId, 1);
    const createResponse = await orderApi.createOrder(userToken);
    const createdOrder = await createResponse.json();

    const response = await orderApi.updateOrderStatus(adminToken, createdOrder.id, 'confirmed');
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.status).toBe('confirmed');
  });

  test('Admin invalid status transition', async () => {
    await epic('Orders');
    await feature('Admin Orders');
    await story('Reject invalid status transition');
    await severity('normal');

    await cartApi.addItem(userToken, productId, 1);
    const createResponse = await orderApi.createOrder(userToken);
    const createdOrder = await createResponse.json();

    // pending -> delivered is invalid
    const response = await orderApi.updateOrderStatus(adminToken, createdOrder.id, 'delivered');
    expect(response.status()).toBe(400);
  });

  test('User cannot update status', async () => {
    await epic('Orders');
    await feature('Order Security');
    await story('Regular user cannot update order status');
    await severity('critical');

    await cartApi.addItem(userToken, productId, 1);
    const createResponse = await orderApi.createOrder(userToken);
    const createdOrder = await createResponse.json();

    const response = await orderApi.updateOrderStatus(userToken, createdOrder.id, 'confirmed');
    expect(response.status()).toBe(403);
  });
});
