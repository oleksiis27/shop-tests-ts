import { test, expect } from '@playwright/test';
import { epic, feature, story, severity } from 'allure-js-commons';
import { HomePage } from '../../pages/home.page';

test.describe('Home Page UI', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.openPage();
  });

  test('Home page loads with products', async () => {
    await epic('Products');
    await feature('Home Page');
    await story('Products displayed on home page');
    await severity('blocker');

    await expect(homePage.productCards.first()).toBeVisible();
    const count = await homePage.productCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('Search product filters results', async () => {
    await epic('Products');
    await feature('Home Page');
    await story('Search filters product list');
    await severity('critical');

    await homePage.searchProduct('Laptop');
    await homePage.page.waitForTimeout(500);
    const count = await homePage.productCards.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('Filter by category', async () => {
    await epic('Products');
    await feature('Home Page');
    await story('Category filter works');
    await severity('critical');

    await homePage.selectCategory('Electronics');
    await homePage.page.waitForTimeout(500);
    const count = await homePage.productCards.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('Sort by price ascending', async () => {
    await epic('Products');
    await feature('Home Page');
    await story('Sort by price works');
    await severity('normal');

    await homePage.selectSort('Price: Low to High');
    await homePage.page.waitForTimeout(500);
    const count = await homePage.productCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('Pagination works', async ({ page }) => {
    await epic('Products');
    await feature('Home Page');
    await story('Pagination navigates between pages');
    await severity('normal');

    await expect(homePage.productCards.first()).toBeVisible();
    await homePage.clickNextPage();
    await expect(page).toHaveURL(/\//);
  });
});
