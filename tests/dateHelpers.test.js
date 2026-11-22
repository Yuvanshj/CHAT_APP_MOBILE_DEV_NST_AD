import test from 'node:test';
import assert from 'node:assert';
import {
  formatTimestamp,
  formatDateOrTime,
} from '../src/features/chat/utils/dateHelpers.js';

test('formatTimestamp formats valid ISO date to time string', () => {
  const date = new Date('2026-11-22T14:30:00Z');
  const formatted = formatTimestamp(date.toISOString());
  assert.ok(formatted.length > 0);
  assert.ok(formatted.includes(':'));
});

test('formatTimestamp handles empty or invalid dates gracefully', () => {
  assert.strictEqual(formatTimestamp(null), '');
  assert.strictEqual(formatTimestamp(undefined), '');
  assert.strictEqual(formatTimestamp('invalid-date'), '');
});

test('formatDateOrTime formats today date as time', () => {
  const today = new Date();
  const formatted = formatDateOrTime(today.toISOString());
  assert.ok(formatted.length > 0);
  assert.ok(formatted.includes(':'));
});

test('formatDateOrTime formats yesterday date', () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const formatted = formatDateOrTime(yesterday.toISOString());
  assert.strictEqual(formatted, 'Yesterday');
});
