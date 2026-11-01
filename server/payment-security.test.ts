import test from 'node:test';
import assert from 'node:assert/strict';
import { db } from './db';

test('card method submitted by a client is not treated as proof of payment', () => {
  // Create an isolated valid catalog fixture: production databases intentionally
  // start with an empty catalog and must not depend on demo product IDs.
  const category = db.createCategory({
    name: 'اختبار أمني',
    subtitle: '',
    image: '/test-category.png',
    icon: 'cake',
    sortOrder: 9999,
    isActive: true,
  }, 'test');

  const product = db.createProduct({
    name: 'منتج اختبار أمني',
    description: '',
    image: '/test-product.png',
    gallery: [],
    price: 100,
    rating: 0,
    reviewsCount: 0,
    categoryId: category.id,
    isActive: true,
    isFeatured: false,
    isAvailable: true,
    isArchived: false,
    sortOrder: 9999,
    options: [],
  }, 'test');

  const result = db.createOrder({
    customer: { name: 'اختبار الدفع', phone: '0500000000', address: 'عنوان الاختبار' },
    items: [{ productId: product.id, quantity: 1 }],
    paymentMethod: 'MADA_CARD',
  });

  assert.equal(result.success, true);
  if (result.success) assert.equal(result.order.paymentStatus, 'PENDING');
});

test('unsupported payment methods are rejected by the server', () => {
  const result = db.createOrder({
    customer: { name: 'اختبار الدفع', phone: '0500000001', address: 'عنوان الاختبار' },
    items: [{ productId: 'missing-product', quantity: 1 }],
    paymentMethod: 'UNVERIFIED' as any,
  });

  assert.equal(result.success, false);
  if (result.success === false) assert.equal(result.error, 'طريقة الدفع غير مدعومة');
});
