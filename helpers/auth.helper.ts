import { APIRequestContext } from '@playwright/test';
import { AuthApi } from '../api/auth-api';
import { config } from '../config/config';
import { randomEmail, randomName, randomPassword } from './test-data.helper';

export async function getAdminToken(request: APIRequestContext): Promise<string> {
  const authApi = new AuthApi(request);
  const response = await authApi.login(config.adminEmail, config.adminPassword);
  const body = await response.json();
  return body.access_token;
}

export async function getUserToken(request: APIRequestContext): Promise<string> {
  const authApi = new AuthApi(request);
  const response = await authApi.login(config.userEmail, config.userPassword);
  const body = await response.json();
  return body.access_token;
}

export async function registerAndGetToken(request: APIRequestContext): Promise<string> {
  const authApi = new AuthApi(request);
  const email = randomEmail();
  const password = randomPassword();
  const name = randomName();
  await authApi.register(email, password, name);
  const loginResponse = await authApi.login(email, password);
  const body = await loginResponse.json();
  return body.access_token;
}
