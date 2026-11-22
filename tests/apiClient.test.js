import test from 'node:test';
import assert from 'node:assert';
import http from 'node:http';
import { apiClient, ApiError } from '../src/features/chat/services/apiClient.js';

test('apiClient handles trailing slashes in base URL correctly', () => {
  apiClient.setBaseURL('http://localhost:3000///');
  assert.strictEqual(apiClient.getBaseURL(), 'http://localhost:3000');
});

test('apiClient updates and retrieves auth header', () => {
  apiClient.setAuthHeader('Basic test:credentials');
  assert.strictEqual(apiClient.getAuthHeader(), 'Basic test:credentials');
});

test('apiClient passes authorization headers and parses json response', async () => {
  let receivedAuth = null;
  const server = http.createServer((req, res) => {
    receivedAuth = req.headers['authorization'];
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', authenticated: true }));
  });

  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;

  apiClient.setBaseURL(`http://localhost:${port}`);
  apiClient.setAuthHeader('Basic custom:header');

  const result = await apiClient.get('/test-endpoint');
  assert.strictEqual(result.status, 'ok');
  assert.strictEqual(receivedAuth, 'Basic custom:header');

  await new Promise((resolve) => server.close(resolve));
});

test('apiClient formats 400 Bad Request error correctly', async () => {
  const server = http.createServer((req, res) => {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Validation failed: name is required' }));
  });

  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;

  apiClient.setBaseURL(`http://localhost:${port}`);

  await assert.rejects(
    async () => {
      await apiClient.post('/create', { invalid: true });
    },
    (err) => {
      assert.ok(err instanceof ApiError);
      assert.strictEqual(err.status, 400);
      assert.strictEqual(err.message, 'Validation failed: name is required');
      return true;
    }
  );

  await new Promise((resolve) => server.close(resolve));
});

test('apiClient handles 500 Internal Server Error correctly', async () => {
  const server = http.createServer((req, res) => {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal database connection error');
  });

  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;

  apiClient.setBaseURL(`http://localhost:${port}`);

  await assert.rejects(
    async () => {
      await apiClient.get('/error-endpoint');
    },
    (err) => {
      assert.ok(err instanceof ApiError);
      assert.strictEqual(err.status, 500);
      assert.ok(err.message.includes('Internal database connection error'));
      return true;
    }
  );

  await new Promise((resolve) => server.close(resolve));
});
