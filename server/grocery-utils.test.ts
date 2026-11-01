import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizePhone } from '../src/utils/grocery';

test('normalizes phone numbers by removing formatting characters', () => {
  assert.equal(normalizePhone('+967 777-111-9726'), '9677771119726');
  assert.equal(normalizePhone('07 77 111 9726'), '07771119726');
});

test('treats differently formatted versions of the same phone as equal', () => {
  assert.equal(normalizePhone('+967-777-111-9726'), normalizePhone('9677771119726'));
});

test('does not mistake letters or backslashes for phone digits', () => {
  assert.equal(normalizePhone('abc\\D\\D+12'), '12');
});
