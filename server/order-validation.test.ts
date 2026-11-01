import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveProductSelections } from './db';

const options = [{
  id: 'opt-size',
  name: 'الحجم',
  required: true,
  choices: [
    { id: 'small', name: 'صغير', priceModifier: 0, extraPrice: 0 },
    { id: 'large', name: 'كبير', priceModifier: 25, extraPrice: 25 },
  ],
}];

test('resolves the storefront cart Record format using server-owned option prices', () => {
  const result = resolveProductSelections(options, {
    الحجم: { id: 'large', name: 'كبير', priceModifier: 9999, extraPrice: 9999 },
  });
  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.selections[0].choiceId, 'large');
    assert.equal(result.selections[0].priceModifier, 25);
  }
});

test('supports normalized option arrays from API clients', () => {
  const result = resolveProductSelections(options, [
    { optionId: 'opt-size', choiceId: 'small' },
  ]);
  assert.equal(result.success, true);
  if (result.success) assert.equal(result.selections[0].priceModifier, 0);
});

test('rejects a missing required option', () => {
  const result = resolveProductSelections(options, {});
  assert.equal(result.success, false);
  if (!result.success) assert.match(result.error, /الحجم/);
});

test('rejects unknown option choices instead of silently ignoring them', () => {
  const result = resolveProductSelections(options, {
    الحجم: { id: 'not-a-real-choice', name: 'اختيار غير موجود' },
  });
  assert.equal(result.success, false);
});

test('rejects duplicate selections for the same option group', () => {
  const result = resolveProductSelections(options, [
    { optionId: 'opt-size', choiceId: 'small' },
    { optionId: 'opt-size', choiceId: 'large' },
  ]);
  assert.equal(result.success, false);
});
