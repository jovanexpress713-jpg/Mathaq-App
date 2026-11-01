import test from 'node:test';
import assert from 'node:assert/strict';
import { db } from './db';

test('card method submitted by a client is not treated as proof of payment', () => {
  const result = db.createOrder({
    customer: { name: 'اختبار الدفع', phone: '0500000000', address: 'عنوان الاختبار' },
    items: [{ productId: 'prod-choco-cake', selectedOptions: [{ optionId: 'opt-size', choiceId: 'sz-sm' }], quantity: 1 }],
    paymentMethod: 'MADA_CARD',
  });

  assert.equal(result.success, true);
  if (result.success) assert.equal(result.order.paymentStatus, 'PENDING');
});

test('unsupported payment methods are rejected by the server', () => {
  const result = db.createOrder({
    customer: { name: 'اختبار الدفع', phone: '0500000001', address: 'عنوان الاختبار' },
    items: [{ productId: 'prod-choco-cake', selectedOptions: [{ optionId: 'opt-size', choiceId: 'sz-sm' }], quantity: 1 }],
    paymentMethod: 'UNVERIFIED' as any,
  });

  assert.equal(result.success, false);
});
