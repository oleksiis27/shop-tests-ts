import { Page } from '@playwright/test';
import { BasePage } from './base.page';

export class HomePage extends BasePage {
  constructor(page: Page) { super(page); }

  get searchInput() { return this.page.locator("input[name='search']"); }
  get searchButton() { return this.page.locator("form button[type='submit']").first(); }
  get categorySelect() { return this.page.locator('select').first(); }
  get sortSelect() { return this.page.locator('select').last(); }
  get productCards() { return this.page.locator('.grid a'); }
  get nextPageButton() { return this.page.getByRole('button', { name: 'Next' }); }
  get prevPageButton() { return this.page.getByRole('button', { name: 'Previous' }); }

  async openPage() {
    await this.page.goto('/');
    await this.waitForReactReady();
  }

  async searchProduct(query: string) {
    await this.searchInput.fill(query);
    await this.searchButton.click();
  }

  async selectCategory(name: string) {
    await this.categorySelect.selectOption({ label: name });
  }

  async selectSort(option: string) {
    await this.sortSelect.selectOption({ label: option });
  }

  async getProductCards() {
    return this.productCards;
  }

  async clickProduct(index: number) {
    await this.productCards.nth(index).click();
  }

  async clickNextPage() {
    await this.nextPageButton.click();
  }

  async clickPrevPage() {
    await this.prevPageButton.click();
  }
}
