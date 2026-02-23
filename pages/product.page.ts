import { Page } from '@playwright/test';
import { BasePage } from './base.page';

export class ProductPage extends BasePage {
  constructor(page: Page) { super(page); }

  get productName() { return this.page.locator('h1'); }
  get price() { return this.page.locator('p.text-3xl.font-bold'); }
  get description() { return this.page.locator('p.text-gray-600'); }
  get quantityInput() { return this.page.locator("input[type='number']"); }
  get addToCartButton() { return this.page.getByRole('button', { name: 'Add to Cart' }); }
  get successMessage() { return this.page.locator('p.text-green-600'); }

  async openPage(id: number) {
    await this.page.goto(`/products/${id}`);
    await this.productName.waitFor({ state: 'visible' });
    await this.page.waitForTimeout(500);
  }

  async getProductName() {
    return this.productName.textContent();
  }

  async getPrice() {
    return this.price.textContent();
  }

  async getDescription() {
    return this.description.textContent();
  }

  async setQuantity(quantity: number) {
    await this.quantityInput.clear();
    await this.quantityInput.fill(String(quantity));
  }

  async addToCart() {
    await this.addToCartButton.click();
  }

  async getSuccessMessage() {
    return this.successMessage.textContent();
  }
}
