import { APIRequestContext } from '@playwright/test';

export class OrderApi {
  constructor(private request: APIRequestContext) {}

  async createOrder(token: string) {
    return this.request.post('/api/orders', {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async getOrders(token: string) {
    return this.request.get('/api/orders', {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async getOrder(token: string, orderId: number) {
    return this.request.get(`/api/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async getAdminOrders(token: string) {
    return this.request.get('/api/admin/orders', {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async updateOrderStatus(token: string, orderId: number, status: string) {
    return this.request.put(`/api/admin/orders/${orderId}/status`, {
      data: { status },
      headers: { Authorization: `Bearer ${token}` },
    });
  }
}
