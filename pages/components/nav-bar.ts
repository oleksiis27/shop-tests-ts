import { Page } from '@playwright/test';

export class NavBar {
  constructor(private page: Page) {}

  get cartLink() { return this.page.locator("a[href='/cart']"); }
  get ordersLink() { return this.page.locator("a[href='/orders']"); }
  get adminLink() { return this.page.locator("a[href='/admin']"); }
  get loginLink() { return this.page.locator("a[href='/login']"); }
  get registerLink() { return this.page.locator("a[href='/register']"); }
  get logoutButton() { return this.page.locator('nav button'); }
  get userName() { return this.page.locator('nav span.text-sm'); }

  async clickCart() { await this.cartLink.click(); }
  async clickOrders() { await this.ordersLink.click(); }
  async clickAdmin() { await this.adminLink.click(); }
  async clickLogin() { await this.loginLink.click(); }
  async clickRegister() { await this.registerLink.click(); }
  async clickLogout() { await this.logoutButton.click(); }
  async getUserName() { return this.userName.textContent(); }
}
