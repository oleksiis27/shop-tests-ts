import { Page } from '@playwright/test';

export class BasePage {
  constructor(public page: Page) {}

  async waitForReactReady() {
    await this.page.locator('nav').waitFor({ state: 'visible' });
    await this.page.waitForTimeout(500);
  }
}
