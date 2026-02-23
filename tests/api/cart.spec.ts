import { test, expect } from '@playwright/test';
import { epic, feature, story, severity } from 'allure-js-commons';
import { CartApi } from '../../api/cart-api';
import { ProductApi } from '../../api/product-api';
import { getAdminToken, registerAndGetToken } from '../../helpers/auth.helper';
import { testProduct } from '../../helpers/test-data.helper';

test.describe('Cart API', () => {
  let cartApi: CartApi;
  let productApi: ProductApi;
  let userToken: string;
  let adminToken: string;
  let productId1: number;
  let productId2: number;

  test.beforeAll(async ({ request }) => {
    adminToken = await getAdminToken(request);
    userToken = await registerAndGetToken(request);

    productApi = new ProductApi(request);

    // Create 2 test products with high stock
    const product1 = testProduct(1);
    const res1 = await productApi.createProduct(adminToken, product1);
    productId1 = (await res1.json()).id;

    const product2 = testProduct(1);
    const res2 = await productApi.createProduct(adminToken, product2);
    productId2 = (await res2.json()).id;
  });

  test.beforeEach(async ({ request }) => {
    cartApi = new CartApi(request);
    // Clear cart before each test
    await cartApi.clearCart(userToken);
  });

  test('Add item to cart', async () => {
    await epic('Cart');
    await feature('Cart Items');
    await story('Add item to cart');
    await severity('blocker');

    const response = await cartApi.addItem(userToken, productId1, 2);
    expect(response.status()).toBe(201);

    const body = await response.json();
    expect(body.id).toBeDefined();
    expect(body.product_id).toBe(productId1);
    expect(body.quantity).toBe(2);
    expect(body.product).toBeDefined();
    expect(body.product.id).toBe(productId1);
    expect(body.product.name).toBeDefined();
  });

  test('Get cart with item', async () => {
    await epic('Cart');
    await feature('Cart Items');
    await story('Get cart with items');
    await severity('blocker');

    await cartApi.addItem(userToken, productId1, 2);

    const response = await cartApi.getCart(userToken);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.items.length).toBeGreaterThan(0);
    expect(body.items[0].product_id).toBe(productId1);
    expect(body.items[0].quantity).toBe(2);
    expect(body.total).toBeGreaterThan(0);
  });

  test('Add same product increases quantity', async () => {
    await epic('Cart');
    await feature('Cart Items');
    await story('Adding same product increases quantity');
    await severity('critical');

    const response1 = await cartApi.addItem(userToken, productId1, 2);
    expect(response1.status()).toBe(201);

    const response2 = await cartApi.addItem(userToken, productId1, 3);
    expect(response2.status()).toBe(201);

    const cartResponse = await cartApi.getCart(userToken);
    const cart = await cartResponse.json();
    const item = cart.items.find((i: any) => i.product_id === productId1);
    expect(item.quantity).toBe(5);
  });

  test('Update item quantity', async () => {
    await epic('Cart');
    await feature('Cart Items');
    await story('Update cart item quantity');
    await severity('critical');

    const addResponse = await cartApi.addItem(userToken, productId1, 2);
    const addedItem = await addResponse.json();

    const response = await cartApi.updateItem(userToken, addedItem.id, 5);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.quantity).toBe(5);
  });

  test('Delete cart item', async () => {
    await epic('Cart');
    await feature('Cart Items');
    await story('Delete item from cart');
    await severity('critical');

    const addResponse = await cartApi.addItem(userToken, productId1, 2);
    const addedItem = await addResponse.json();

    const response = await cartApi.deleteItem(userToken, addedItem.id);
    expect(response.status()).toBe(204);

    // Verify cart is empty
    const cartResponse = await cartApi.getCart(userToken);
    const cart = await cartResponse.json();
    expect(cart.items.length).toBe(0);
  });

  test('Clear cart', async () => {
    await epic('Cart');
    await feature('Cart Items');
    await story('Clear entire cart');
    await severity('normal');

    await cartApi.addItem(userToken, productId1, 1);
    await cartApi.addItem(userToken, productId2, 1);

    const response = await cartApi.clearCart(userToken);
    expect(response.status()).toBe(204);

    const cartResponse = await cartApi.getCart(userToken);
    const cart = await cartResponse.json();
    expect(cart.items.length).toBe(0);
    expect(cart.total).toBe(0);
  });

  test('Add item without auth', async () => {
    await epic('Cart');
    await feature('Cart Security');
    await story('Reject adding item without authentication');
    await severity('critical');

    const response = await cartApi.addItemWithoutAuth(productId1, 2);
    expect(response.status()).toBe(403);
  });
});
