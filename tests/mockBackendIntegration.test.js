import test from 'node:test';
import assert from 'node:assert';
import http from 'node:http';

import { apiClient } from '../src/features/chat/services/apiClient.js';
import { userApi } from '../src/features/chat/services/userApi.js';
import { chatApi } from '../src/features/chat/services/chatApi.js';

let usersDb = [
  { id: 'first', name: 'Yuvansh', bio: 'Instructor at NST' },
  { id: 'second', name: 'Student 1', bio: 'React Native Learner' },
  { id: 'third', name: 'Student 2', bio: 'Mobile Developer' },
];

let conversationsDb = [
  {
    id: 'convo-1',
    name: 'NST Mobile Dev',
    type: 'GROUP',
    participants_ids: ['first', 'second', 'third'],
    createdBy: 'first',
    createdAt: new Date().toISOString(),
  },
];

let messagesDb = [
  {
    id: 'msg-1',
    conversation_id: 'convo-1',
    sender_id: 'first',
    content: 'Welcome to NST Chat App!',
    createdAt: new Date().toISOString(),
  },
];

let server;
let serverPort;

test.before(async () => {
  server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://localhost:${server.address().port}`);
    const method = req.method;
    const pathname = url.pathname;

    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });

    req.on('end', () => {
      let parsedBody = null;
      if (body) {
        try {
          parsedBody = JSON.parse(body);
        } catch {
          parsedBody = null;
        }
      }

      if (method === 'GET' && pathname === '/user') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify(usersDb));
      }

      if (method === 'GET' && pathname === '/user/profile') {
        const userId = url.searchParams.get('user_id');
        const user = usersDb.find((u) => String(u.id) === String(userId));
        if (user) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify(user));
        } else {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ message: 'User not found' }));
        }
      }

      if (method === 'GET' && pathname === '/conversation') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify(conversationsDb));
      }

      if (method === 'POST' && pathname === '/conversation') {
        const newConvo = {
          id: `convo-${conversationsDb.length + 1}`,
          name: parsedBody.name,
          type: parsedBody.type,
          participants_ids: parsedBody.participants_ids,
          createdBy: 'first',
          createdAt: new Date().toISOString(),
        };
        conversationsDb.push(newConvo);
        res.writeHead(201, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify(newConvo));
      }

      if (method === 'GET' && pathname === '/message') {
        const convoId = url.searchParams.get('conversation_id');
        const msgs = messagesDb.filter((m) => String(m.conversation_id) === String(convoId));
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ data: msgs }));
      }

      if (method === 'POST' && pathname === '/message') {
        const newMsg = {
          id: `msg-${messagesDb.length + 1}`,
          conversation_id: parsedBody.conversation_id,
          sender_id: 'first',
          content: parsedBody.content,
          imageInfo: parsedBody.imageInfo,
          createdAt: new Date().toISOString(),
        };
        messagesDb.push(newMsg);
        res.writeHead(201, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify(newMsg));
      }

      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Not Found' }));
    });
  });

  await new Promise((resolve) => {
    server.listen(0, () => {
      serverPort = server.address().port;
      apiClient.setBaseURL(`http://localhost:${serverPort}`);
      apiClient.setAuthHeader('Basic first:second');
      resolve();
    });
  });
});

test.after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

test('FLOW 1 - USERS: Fetches users and retrieves specific profile', async () => {
  const users = await userApi.getUsers();
  assert.strictEqual(users.length, 3);
  assert.strictEqual(users[0].name, 'Yuvansh');

  const profile = await userApi.getUserProfile('second');
  assert.strictEqual(profile.name, 'Student 1');
  assert.strictEqual(profile.bio, 'React Native Learner');
});

test('FLOW 2 - DIRECT MESSAGE: Creates a DM conversation', async () => {
  const dmConvo = await chatApi.createConversation({
    type: 'DM',
    name: 'Student 1',
    participants_ids: ['first', 'second'],
  });
  assert.strictEqual(dmConvo.type, 'DM');
  assert.strictEqual(dmConvo.name, 'Student 1');
  assert.deepStrictEqual(dmConvo.participants_ids, ['first', 'second']);
});

test('FLOW 3 - GROUP CHAT: Creates a Group conversation and verifies in conversation list', async () => {
  const groupConvo = await chatApi.createConversation({
    type: 'GROUP',
    name: 'Hackathon Team',
    participants_ids: ['first', 'second', 'third'],
  });
  assert.strictEqual(groupConvo.type, 'GROUP');
  assert.strictEqual(groupConvo.name, 'Hackathon Team');

  const convos = await chatApi.getConversations();
  assert.ok(convos.some((c) => c.name === 'Hackathon Team'));
});

test('FLOW 4 - MESSAGING: Sends text message and verifies conversation history', async () => {
  const sent = await chatApi.sendMessage({
    conversation_id: 'convo-1',
    content: 'This is an automated test message',
  });
  assert.strictEqual(sent.content, 'This is an automated test message');

  const history = await chatApi.getMessages('convo-1');
  assert.ok(history.length >= 2);
  assert.ok(history.some((m) => m.content === 'This is an automated test message'));
});

test('FLOW 5 - IMAGE SHARING: Sends image message with imageInfo contract and fetches it', async () => {
  const sampleBase64 = 'data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
  const sentImg = await chatApi.sendMessage({
    conversation_id: 'convo-1',
    imageInfo: sampleBase64,
  });
  assert.strictEqual(sentImg.imageInfo, sampleBase64);

  const history = await chatApi.getMessages('convo-1');
  assert.ok(history.some((m) => m.imageInfo === sampleBase64));
});

test('FLOW 8 - FAILURE STATES: Handles 404 or backend errors gracefully', async () => {
  await assert.rejects(
    async () => {
      await userApi.getUserProfile('non-existent-user-id');
    },
    (err) => {
      assert.strictEqual(err.name, 'ApiError');
      assert.strictEqual(err.status, 404);
      return true;
    }
  );
});
