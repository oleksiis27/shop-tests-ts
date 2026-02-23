import { Page } from '@playwright/test';
import { BasePage } from './base.page';

export class AdminPage extends BasePage {
  constructor(page: Page) { super(page); }

  get heading() { return this.page.locator('h1'); }
  get ordersTab() { return this.page.getByRole('button', { name: 'Orders' }); }
  get productsTab() { return this.page.getByRole('button', { name: 'Products' }); }
  get orderCards() { return this.page.locator('div.bg-white.p-6.rounded-lg.shadow'); }
  get addProductButton() { return this.page.getByRole('button', { name: 'Add Product' }); }
  get productRows() { return this.page.locator('table tbody tr'); }

  // Product form fields
  get productNameInput() { return this.page.locator("form input[name='name']"); }
  get productPriceInput() { return this.page.locator("form input[name='price']"); }
  get productStockInput() { return this.page.locator("form input[name='stock']"); }
  get productCategorySelect() { return this.page.locator("form select[name='category_id']"); }
  get productDescriptionInput() { return this.page.locator("form textarea[name='description']"); }
  get productImageInput() { return this.page.locator("form input[name='image_url']"); }
  get createButton() { return this.page.getByRole('button', { name: 'Create' }); }

  async openPage() {
    await this.page.goto('/admin');
    await this.heading.waitFor({ state: 'visible' });
    await this.page.waitForTimeout(500);
  }

  async switchToOrdersTab() {
    await this.ordersTab.click();
    await this.page.waitForTimeout(300);
  }

  async switchToProductsTab() {
    await this.productsTab.click();
    await this.page.waitForTimeout(300);
  }

  async getOrderCount() {
    return this.orderCards.count();
  }

  async getProductCount() {
    return this.productRows.count();
  }

  async updateOrderStatus(index: number, status: string) {
    await this.orderCards.nth(index).getByRole('button', { name: status }).click();
    await this.page.waitForTimeout(500);
  }

  async getOrderStatus(index: number) {
    return this.orderCards.nth(index).locator('span.rounded-full').textContent();
  }

  async addProduct(
    name: string,
    description: string,
    price: number,
    stock: number,
    category: string,
    imageUrl: string,
  ) {
    await this.addProductButton.click();
    await this.page.waitForTimeout(300);
    await this.productNameInput.fill(name);
    await this.productDescriptionInput.fill(description);
    await this.productPriceInput.fill(String(price));
    await this.productStockInput.fill(String(stock));
    await this.productCategorySelect.selectOption({ label: category });
    await this.productImageInput.fill(imageUrl);
    await this.createButton.click();
    await this.page.waitForTimeout(500);
  }

  async deleteProduct(index: number) {
    this.page.on('dialog', (dialog) => dialog.accept());
    await this.productRows.nth(index).getByRole('button', { name: 'Delete' }).click();
    await this.page.waitForTimeout(500);
  }
}
