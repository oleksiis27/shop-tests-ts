import { APIRequestContext } from '@playwright/test';

export class AuthApi {
  constructor(private request: APIRequestContext) {}

  async register(email: string, password: string, name: string) {
    return this.request.post('/api/auth/register', {
      data: { email, password, name },
    });
  }

  async login(email: string, password: string) {
    return this.request.post('/api/auth/login', {
      data: { email, password },
    });
  }

  async getMe(token: string) {
    return this.request.get('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async getMeWithoutToken() {
    return this.request.get('/api/auth/me');
  }

  async getMeWithInvalidToken() {
    return this.request.get('/api/auth/me', {
      headers: { Authorization: 'Bearer invalid-token-12345' },
    });
  }
}
