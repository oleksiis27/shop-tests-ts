import { test, expect } from '@playwright/test';
import { epic, feature, story, severity } from 'allure-js-commons';
import { LoginPage } from '../../pages/login.page';
import { NavBar } from '../../pages/components/nav-bar';
import { config } from '../../config/config';

test.describe('Login UI', () => {
  let loginPage: LoginPage;
  let navBar: NavBar;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    navBar = new NavBar(page);
    await loginPage.openPage();
  });

  test('Login with valid credentials', async ({ page }) => {
    await epic('Auth');
    await feature('Login');
    await story('Successful login via UI');
    await severity('blocker');

    await loginPage.login(config.adminEmail, config.adminPassword);
    await navBar.logoutButton.waitFor({ state: 'visible' });
    await expect(navBar.logoutButton).toBeVisible();
  });

  test('Login with wrong password', async () => {
    await epic('Auth');
    await feature('Login');
    await story('Error shown for wrong password');
    await severity('critical');

    await loginPage.login(config.adminEmail, 'wrong-password');
    await loginPage.errorMessage.waitFor({ state: 'visible' });
    await expect(loginPage.errorMessage).toBeVisible();
  });

  test('Navigate to register page', async ({ page }) => {
    await epic('Auth');
    await feature('Login');
    await story('Navigate to register from login');
    await severity('normal');

    await loginPage.clickRegisterLink();
    await expect(page).toHaveURL(/\/register/);
  });

  test('Logout shows login and register links', async ({ page }) => {
    await epic('Auth');
    await feature('Logout');
    await story('After logout, login and register links visible');
    await severity('critical');

    await loginPage.login(config.adminEmail, config.adminPassword);
    await navBar.logoutButton.waitFor({ state: 'visible' });
    await navBar.clickLogout();
    await navBar.loginLink.waitFor({ state: 'visible' });
    await expect(navBar.loginLink).toBeVisible();
    await expect(navBar.registerLink).toBeVisible();
  });
});
