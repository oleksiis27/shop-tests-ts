import { test, expect } from '@playwright/test';
import { epic, feature, story, severity } from 'allure-js-commons';
import { AuthApi } from '../../api/auth-api';
import { config } from '../../config/config';
import { randomEmail, randomName, randomPassword } from '../../helpers/test-data.helper';

test.describe('Auth API', () => {
  let authApi: AuthApi;

  test.beforeEach(async ({ request }) => {
    authApi = new AuthApi(request);
  });

  test('Register new user', async () => {
    await epic('Auth');
    await feature('Registration');
    await story('Register new user via API');
    await severity('blocker');

    const email = randomEmail();
    const password = randomPassword();
    const name = randomName();

    const response = await authApi.register(email, password, name);
    expect(response.status()).toBe(201);

    const body = await response.json();
    expect(body.email).toBe(email);
    expect(body.name).toBe(name);
    expect(body.role).toBe('user');
    expect(body.id).toBeDefined();
    expect(body.created_at).toBeDefined();
  });

  test('Register duplicate email', async () => {
    await epic('Auth');
    await feature('Registration');
    await story('Prevent duplicate email registration');
    await severity('normal');

    const email = randomEmail();
    const password = randomPassword();
    const name = randomName();

    await authApi.register(email, password, name);
    const response = await authApi.register(email, password, name);
    expect(response.status()).toBe(409);
  });

  test('Login with valid credentials', async () => {
    await epic('Auth');
    await feature('Login');
    await story('Login with valid credentials');
    await severity('blocker');

    const response = await authApi.login(config.adminEmail, config.adminPassword);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.access_token).toBeDefined();
    expect(body.token_type).toBe('bearer');
  });

  test('Login with wrong password', async () => {
    await epic('Auth');
    await feature('Login');
    await story('Reject login with wrong password');
    await severity('critical');

    const response = await authApi.login(config.adminEmail, 'wrong-password');
    expect(response.status()).toBe(401);
  });

  test('Get me with valid token', async () => {
    await epic('Auth');
    await feature('User Profile');
    await story('Get current user with valid token');
    await severity('critical');

    const loginResponse = await authApi.login(config.adminEmail, config.adminPassword);
    const { access_token } = await loginResponse.json();

    const response = await authApi.getMe(access_token);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.id).toBeDefined();
    expect(body.email).toBe(config.adminEmail);
    expect(body.role).toBe('admin');
  });

  test('Get me without token', async () => {
    await epic('Auth');
    await feature('User Profile');
    await story('Reject request without token');
    await severity('critical');

    const response = await authApi.getMeWithoutToken();
    expect(response.status()).toBe(403);
  });

  test('Get me with invalid token', async () => {
    await epic('Auth');
    await feature('User Profile');
    await story('Reject request with invalid token');
    await severity('normal');

    const response = await authApi.getMeWithInvalidToken();
    expect(response.status()).toBe(401);
  });
});
