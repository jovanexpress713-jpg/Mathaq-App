import test from 'node:test';
import assert from 'node:assert/strict';
import { db } from './db';

// Each test run provisions its own in-memory-style fixture in the isolated CI workspace.
const testProduct = db.createProduct({
  name: 'منتج اختبار الدفع',
  description: 'منتج مخصص للاختبارات فقط',
  image: '',
  gallery: [],
  price: 35,
  rating: 5,
  reviewsCount: 0,
  categoryId: 'test-category',
  isActive: true,
  isFeatured: false,
  isAvailable: true,
  sortOrder: 0,
  options: [{ id: 'opt-size', name: 'الحجم', required: false, choices: [{ id: 'sz-sm', name: 'صغيرة', priceModifier: 0 }] }],
}, 'test');

test('card method submitted by a client is not treated as proof of payment', () => {
  const result = db.createOrder({
    customer: { name: 'اختبار الدفع', phone: '0500000000', address: 'عنوان الاختبار' },
    items: [{ productId: testProduct.id, selectedOptions: [{ optionId: 'opt-size', choiceId: 'sz-sm' }], quantity: 1 }],
    paymentMethod: 'MADA_CARD',
  });

  assert.equal(result.success, true);
  if (result.success) assert.equal(result.order.paymentStatus, 'PENDING');
});

test('unsupported payment methods are rejected by the server', () => {
  const result = db.createOrder({
    customer: { name: 'اختبار الدفع', phone: '0500000001', address: 'عنوان الاختبار' },
    items: [{ productId: testProduct.id, selectedOptions: [{ optionId: 'opt-size', choiceId: 'sz-sm' }], quantity: 1 }],
    paymentMethod: 'UNVERIFIED' as any,
  });

  assert.equal(result.success, false);
});
