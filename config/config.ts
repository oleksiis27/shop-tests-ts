import dotenv from 'dotenv';

dotenv.config();

export const config = {
  baseUrl: process.env.BASE_URL || 'http://localhost:8000',
  uiUrl: process.env.UI_URL || 'http://localhost:3000',
  adminEmail: process.env.ADMIN_EMAIL || 'admin@shop.com',
  adminPassword: process.env.ADMIN_PASSWORD || 'admin123',
  userEmail: process.env.USER_EMAIL || 'user@shop.com',
  userPassword: process.env.USER_PASSWORD || 'user123',
};
