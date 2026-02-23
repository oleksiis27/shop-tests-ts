import { APIRequestContext } from '@playwright/test';

export class CartApi {
  constructor(private request: APIRequestContext) {}

  async getCart(token: string) {
    return this.request.get('/api/cart', {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async addItem(token: string, productId: number, quantity: number) {
    return this.request.post('/api/cart/items', {
      data: { product_id: productId, quantity },
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async addItemWithoutAuth(productId: number, quantity: number) {
    return this.request.post('/api/cart/items', {
      data: { product_id: productId, quantity },
    });
  }

  async updateItem(token: string, itemId: number, quantity: number) {
    return this.request.put(`/api/cart/items/${itemId}`, {
      data: { quantity },
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async deleteItem(token: string, itemId: number) {
    return this.request.delete(`/api/cart/items/${itemId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async clearCart(token: string) {
    return this.request.delete('/api/cart', {
      headers: { Authorization: `Bearer ${token}` },
    });
  }
}
