import { Page } from '@playwright/test';
import { BasePage } from './base.page';

export class LoginPage extends BasePage {
  constructor(page: Page) { super(page); }

  get emailInput() { return this.page.locator("input[name='email']"); }
  get passwordInput() { return this.page.locator("input[name='password']"); }
  get loginButton() { return this.page.locator("button[type='submit']"); }
  get registerLink() { return this.page.locator("form ~ p a[href='/register'], form a[href='/register'], main a[href='/register']").first(); }
  get errorMessage() { return this.page.locator('p.text-red-600'); }
  get heading() { return this.page.locator('h1'); }

  async openPage() {
    await this.page.goto('/login');
    await this.heading.waitFor({ state: 'visible' });
    await this.page.waitForTimeout(500);
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async getErrorMessage() {
    return this.errorMessage.textContent();
  }

  async clickRegisterLink() {
    await this.registerLink.click();
  }
}
