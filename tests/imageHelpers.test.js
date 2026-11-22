import test from 'node:test';
import assert from 'node:assert';
import {
  normalizeImageUri,
  isBase64String,
} from '../src/features/chat/utils/imageHelpers.js';

test('normalizeImageUri preserves data:image URIs', () => {
  const dataUri = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
  assert.strictEqual(normalizeImageUri(dataUri), dataUri);
});

test('normalizeImageUri preserves http/https URLs', () => {
  const url = 'https://example.com/image.jpg';
  assert.strictEqual(normalizeImageUri(url), url);
});

test('normalizeImageUri prepends data:image/jpeg;base64, to raw base64 string', () => {
  const rawBase64 = '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';
  const expected = `data:image/jpeg;base64,${rawBase64}`;
  assert.strictEqual(normalizeImageUri(rawBase64), expected);
});

test('normalizeImageUri returns null for empty or invalid input', () => {
  assert.strictEqual(normalizeImageUri(null), null);
  assert.strictEqual(normalizeImageUri(undefined), null);
  assert.strictEqual(normalizeImageUri(''), null);
  assert.strictEqual(normalizeImageUri('   '), null);
});

test('isBase64String detects valid base64 strings', () => {
  const valid = 'VGhpcyBpcyBhIHNhbXBsZSBiYXNlNjQgc3RyaW5nIGZvciB0ZXN0aW5nIHB1cnBvc2VzIGluIG91ciBjaGF0IGFwcGxpY2F0aW9uIQ==';
  assert.strictEqual(isBase64String(valid), true);

  const notBase64 = 'This is plain unencoded text with spaces and punctuation!';
  assert.strictEqual(isBase64String(notBase64), false);
});
