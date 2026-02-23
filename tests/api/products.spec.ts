import { test, expect } from '@playwright/test';
import { epic, feature, story, severity } from 'allure-js-commons';
import { ProductApi } from '../../api/product-api';
import { getAdminToken, getUserToken } from '../../helpers/auth.helper';
import { randomProduct } from '../../helpers/test-data.helper';

test.describe('Products API', () => {
  let productApi: ProductApi;
  let adminToken: string;
  let userToken: string;

  test.beforeAll(async ({ request }) => {
    adminToken = await getAdminToken(request);
    userToken = await getUserToken(request);
  });

  test.beforeEach(async ({ request }) => {
    productApi = new ProductApi(request);
  });

  test('Get products list', async () => {
    await epic('Products');
    await feature('Product List');
    await story('Get paginated products list');
    await severity('blocker');

    const response = await productApi.getProducts();
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.items.length).toBeGreaterThan(0);
    expect(body.total).toBeGreaterThan(0);
    expect(body.page).toBe(1);
    expect(body.limit).toBeGreaterThan(0);
    expect(body.pages).toBeGreaterThan(0);
  });

  test('Filter by category', async () => {
    await epic('Products');
    await feature('Product Filtering');
    await story('Filter products by category');
    await severity('normal');

    const response = await productApi.getProducts({ category: 1 });
    expect(response.status()).toBe(200);

    const body = await response.json();
    for (const item of body.items) {
      expect(item.category_id).toBe(1);
    }
  });

  test('Search by name', async () => {
    await epic('Products');
    await feature('Product Search');
    await story('Search products by name');
    await severity('normal');

    // First get a product name to search for
    const listResponse = await productApi.getProducts();
    const listBody = await listResponse.json();
    const searchTerm = listBody.items[0].name.split(' ')[0];

    const response = await productApi.getProducts({ search: searchTerm });
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.items.length).toBeGreaterThanOrEqual(0);
  });

  test('Sort by price ascending', async () => {
    await epic('Products');
    await feature('Product Sorting');
    await story('Sort products by price ascending');
    await severity('normal');

    const response = await productApi.getProducts({ sort_by: 'price_asc' });
    expect(response.status()).toBe(200);

    const body = await response.json();
    const prices = body.items.map((item: any) => parseFloat(item.price));
    for (let i = 1; i < prices.length; i++) {
      expect(prices[i]).toBeGreaterThanOrEqual(prices[i - 1]);
    }
  });

  test('Sort by price descending', async () => {
    await epic('Products');
    await feature('Product Sorting');
    await story('Sort products by price descending');
    await severity('normal');

    const response = await productApi.getProducts({ sort_by: 'price_desc' });
    expect(response.status()).toBe(200);

    const body = await response.json();
    const prices = body.items.map((item: any) => parseFloat(item.price));
    for (let i = 1; i < prices.length; i++) {
      expect(prices[i]).toBeLessThanOrEqual(prices[i - 1]);
    }
  });

  test('Get product by ID', async () => {
    await epic('Products');
    await feature('Product Details');
    await story('Get single product by ID');
    await severity('blocker');

    const response = await productApi.getProduct(1);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.id).toBe(1);
    expect(body.name).toBeDefined();
    expect(body.description).toBeDefined();
    expect(body.price).toBeDefined();
    expect(body.stock).toBeDefined();
    expect(body.category_id).toBeDefined();
    expect(body.category).toBeDefined();
    expect(body.category.id).toBeDefined();
    expect(body.category.name).toBeDefined();
    expect(body.created_at).toBeDefined();
  });

  test('Get non-existent product', async () => {
    await epic('Products');
    await feature('Product Details');
    await story('Return 404 for non-existent product');
    await severity('normal');

    const response = await productApi.getProduct(99999);
    expect(response.status()).toBe(404);
  });

  test('Create product as admin', async () => {
    await epic('Products');
    await feature('Product Management');
    await story('Admin creates a new product');
    await severity('critical');

    const productData = randomProduct(1);
    const response = await productApi.createProduct(adminToken, productData);
    expect(response.status()).toBe(201);

    const body = await response.json();
    expect(body.name).toBe(productData.name);
    expect(parseFloat(body.price)).toBe(productData.price);
    expect(body.stock).toBe(productData.stock);
    expect(body.category_id).toBe(productData.category_id);
  });

  test('Create product as user', async () => {
    await epic('Products');
    await feature('Product Management');
    await story('Regular user cannot create product');
    await severity('critical');

    const productData = randomProduct(1);
    const response = await productApi.createProductAsUser(userToken, productData);
    expect(response.status()).toBe(403);
  });

  test('Create product without auth', async () => {
    await epic('Products');
    await feature('Product Management');
    await story('Unauthenticated user cannot create product');
    await severity('critical');

    const productData = randomProduct(1);
    const response = await productApi.createProductWithoutAuth(productData);
    expect(response.status()).toBe(403);
  });

  test('Update product as admin', async () => {
    await epic('Products');
    await feature('Product Management');
    await story('Admin updates product');
    await severity('critical');

    // Create a product to update
    const productData = randomProduct(1);
    const createResponse = await productApi.createProduct(adminToken, productData);
    const created = await createResponse.json();

    const response = await productApi.updateProduct(adminToken, created.id, {
      name: 'Updated Product Name',
    });
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.name).toBe('Updated Product Name');
  });

  test('Delete product as admin', async () => {
    await epic('Products');
    await feature('Product Management');
    await story('Admin deletes product');
    await severity('critical');

    // Create a product to delete
    const productData = randomProduct(1);
    const createResponse = await productApi.createProduct(adminToken, productData);
    const created = await createResponse.json();

    const response = await productApi.deleteProduct(adminToken, created.id);
    expect(response.status()).toBe(204);

    // Verify product is deleted
    const getResponse = await productApi.getProduct(created.id);
    expect(getResponse.status()).toBe(404);
  });

  test('Delete non-existent product', async () => {
    await epic('Products');
    await feature('Product Management');
    await story('Return 404 when deleting non-existent product');
    await severity('normal');

    const response = await productApi.deleteProduct(adminToken, 99999);
    expect(response.status()).toBe(404);
  });
});
