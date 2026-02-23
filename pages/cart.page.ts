import { Page } from '@playwright/test';
import { BasePage } from './base.page';

export class CartPage extends BasePage {
  constructor(page: Page) { super(page); }

  get heading() { return this.page.locator('h1'); }
  get cartItems() { return this.page.locator('div.bg-white.p-4.rounded-lg'); }
  get totalPrice() { return this.page.locator('p.text-2xl.font-bold'); }
  get checkoutButton() { return this.page.getByRole('button', { name: 'Checkout' }); }
  get clearCartButton() { return this.page.getByRole('button', { name: 'Clear Cart' }); }
  get emptyCartMessage() { return this.page.getByText('Your cart is empty.'); }

  async openPage() {
    await this.page.goto('/cart');
    await this.heading.waitFor({ state: 'visible' });
    await this.page.waitForTimeout(500);
  }

  async getItemCount() {
    return this.cartItems.count();
  }

  async getTotal() {
    return this.totalPrice.textContent();
  }

  async increaseQuantity(index: number) {
    await this.cartItems.nth(index).getByRole('button', { name: '+' }).click();
    await this.page.waitForTimeout(500);
  }

  async decreaseQuantity(index: number) {
    await this.cartItems.nth(index).getByRole('button', { name: '-' }).click();
    await this.page.waitForTimeout(500);
  }

  async removeItem(index: number) {
    await this.cartItems.nth(index).getByRole('button', { name: 'Remove' }).click();
    await this.page.waitForTimeout(500);
  }

  async clearCart() {
    await this.clearCartButton.click();
    await this.page.waitForTimeout(500);
  }

  async checkout() {
    await this.checkoutButton.click();
  }
}
