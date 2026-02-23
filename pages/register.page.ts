import { Page } from '@playwright/test';
import { BasePage } from './base.page';

export class RegisterPage extends BasePage {
  constructor(page: Page) { super(page); }

  get nameInput() { return this.page.locator("input[name='name']"); }
  get emailInput() { return this.page.locator("input[name='email']"); }
  get passwordInput() { return this.page.locator("input[name='password']"); }
  get registerButton() { return this.page.locator("button[type='submit']"); }
  get loginLink() { return this.page.locator("form ~ p a[href='/login'], form a[href='/login'], main a[href='/login']").first(); }
  get errorMessage() { return this.page.locator('p.text-red-600'); }
  get heading() { return this.page.locator('h1'); }

  async openPage() {
    await this.page.goto('/register');
    await this.heading.waitFor({ state: 'visible' });
    await this.page.waitForTimeout(500);
  }

  async register(name: string, email: string, password: string) {
    await this.nameInput.fill(name);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.registerButton.click();
  }

  async getErrorMessage() {
    return this.errorMessage.textContent();
  }

  async clickLoginLink() {
    await this.loginLink.click();
  }
}
