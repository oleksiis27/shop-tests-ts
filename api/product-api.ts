import { APIRequestContext } from '@playwright/test';

export interface ProductQueryParams {
  category?: number;
  search?: string;
  sort_by?: string;
  limit?: number;
  page?: number;
}

export interface ProductData {
  name: string;
  description: string;
  price: number;
  stock: number;
  category_id: number;
  image_url: string;
}

export class ProductApi {
  constructor(private request: APIRequestContext) {}

  async getProducts(params?: ProductQueryParams) {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) query.append(key, String(value));
      });
    }
    const qs = query.toString();
    return this.request.get(`/api/products${qs ? `?${qs}` : ''}`);
  }

  async getProduct(id: number) {
    return this.request.get(`/api/products/${id}`);
  }

  async createProduct(token: string, data: ProductData) {
    return this.request.post('/api/products', {
      data,
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async createProductAsUser(token: string, data: ProductData) {
    return this.request.post('/api/products', {
      data,
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async createProductWithoutAuth(data: ProductData) {
    return this.request.post('/api/products', { data });
  }

  async updateProduct(token: string, id: number, data: Partial<ProductData>) {
    return this.request.put(`/api/products/${id}`, {
      data,
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async deleteProduct(token: string, id: number) {
    return this.request.delete(`/api/products/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }
}
