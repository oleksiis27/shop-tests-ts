import { faker } from '@faker-js/faker';
import { ProductData } from '../api/product-api';

export function randomEmail(): string {
  return faker.internet.email();
}

export function randomPassword(): string {
  return faker.internet.password({ length: 12 });
}

export function randomName(): string {
  return faker.person.fullName();
}

export function randomProduct(categoryId: number): ProductData {
  return {
    name: faker.commerce.productName(),
    description: faker.lorem.sentence(10),
    price: parseFloat(faker.commerce.price({ min: 10, max: 1000 })),
    stock: faker.number.int({ min: 1, max: 100 }),
    category_id: categoryId,
    image_url: `https://example.com/images/${faker.helpers.slugify(faker.commerce.productName())}.jpg`,
  };
}

export function testProduct(categoryId: number): ProductData {
  return {
    name: `Test Product ${faker.string.alphanumeric(6)}`,
    description: faker.lorem.sentence(10),
    price: 19.99,
    stock: 9999,
    category_id: categoryId,
    image_url: 'https://example.com/images/test.jpg',
  };
}
