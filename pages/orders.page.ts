import { Page } from '@playwright/test';
import { BasePage } from './base.page';

export class OrdersPage extends BasePage {
  constructor(page: Page) { super(page); }

  get heading() { return this.page.locator('h1'); }
  get orders() { return this.page.locator('div.bg-white.p-6.rounded-lg.shadow'); }

  async openPage() {
    await this.page.goto('/orders');
    await this.heading.waitFor({ state: 'visible' });
    await this.page.waitForTimeout(500);
  }

  async getOrderCount() {
    return this.orders.count();
  }

  async getOrderStatus(index: number) {
    return this.orders.nth(index).locator('span.rounded-full').textContent();
  }

  async getOrderTotal(index: number) {
    return this.orders.nth(index).locator('p.text-lg.font-bold').textContent();
  }
}
