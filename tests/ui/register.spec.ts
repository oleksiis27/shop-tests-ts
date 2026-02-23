import { test, expect } from '@playwright/test';
import { epic, feature, story, severity } from 'allure-js-commons';
import { RegisterPage } from '../../pages/register.page';
import { NavBar } from '../../pages/components/nav-bar';
import { config } from '../../config/config';
import { randomEmail, randomName, randomPassword } from '../../helpers/test-data.helper';

test.describe('Register UI', () => {
  let registerPage: RegisterPage;
  let navBar: NavBar;

  test.beforeEach(async ({ page }) => {
    registerPage = new RegisterPage(page);
    navBar = new NavBar(page);
    await registerPage.openPage();
  });

  test('Register new user', async () => {
    await epic('Auth');
    await feature('Registration');
    await story('Successful registration via UI');
    await severity('blocker');

    await registerPage.register(randomName(), randomEmail(), randomPassword());
    await navBar.logoutButton.waitFor({ state: 'visible' });
    await expect(navBar.logoutButton).toBeVisible();
  });

  test('Register with existing email', async () => {
    await epic('Auth');
    await feature('Registration');
    await story('Error shown for existing email');
    await severity('normal');

    await registerPage.register('Test User', config.adminEmail, 'password123');
    await registerPage.errorMessage.waitFor({ state: 'visible' });
    await expect(registerPage.errorMessage).toBeVisible();
  });

  test('Navigate to login page', async ({ page }) => {
    await epic('Auth');
    await feature('Registration');
    await story('Navigate to login from register');
    await severity('normal');

    await registerPage.clickLoginLink();
    await expect(page).toHaveURL(/\/login/);
  });
});
