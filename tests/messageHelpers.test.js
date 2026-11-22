import test from 'node:test';
import assert from 'node:assert';
import {
  normalizeMessages,
  normalizeConversations,
  normalizeUsers,
} from '../src/features/chat/utils/messageHelpers.js';

test('normalizeMessages handles array directly', () => {
  const raw = [
    {
      id: '1',
      conversation_id: 'c1',
      sender_id: 'user1',
      content: 'Hello world',
      createdAt: '2026-11-22T10:00:00Z',
    },
  ];
  const result = normalizeMessages(raw);
  assert.strictEqual(result.length, 1);
  assert.strictEqual(result[0].id, '1');
  assert.strictEqual(result[0].content, 'Hello world');
  assert.strictEqual(result[0].sender_id, 'user1');
  assert.strictEqual(result[0].status, 'sent');
});

test('normalizeMessages handles { data: [...] } structure from reference backend', () => {
  const raw = {
    data: [
      {
        _id: 'msg_100',
        conversationId: 'c2',
        senderId: 'user2',
        message: 'Reference backend format',
        imageInfo: 'data:image/jpeg;base64,12345',
        created_at: '2026-11-22T11:00:00Z',
      },
    ],
  };
  const result = normalizeMessages(raw);
  assert.strictEqual(result.length, 1);
  assert.strictEqual(result[0].id, 'msg_100');
  assert.strictEqual(result[0].conversation_id, 'c2');
  assert.strictEqual(result[0].sender_id, 'user2');
  assert.strictEqual(result[0].content, 'Reference backend format');
  assert.strictEqual(result[0].imageInfo, 'data:image/jpeg;base64,12345');
});

test('normalizeConversations handles raw items and extracts participants_ids', () => {
  const raw = [
    {
      id: 'c_1',
      name: 'Project Team',
      type: 'GROUP',
      participants_ids: ['u1', 'u2', 'u3'],
      createdBy: 'u1',
    },
    {
      id: 'c_2',
      name: 'DM Chat',
      type: 'DM',
      participants: [{ id: 'u1' }, { id: 'u4' }],
      createdBy: 'u4',
    },
  ];
  const result = normalizeConversations(raw);
  assert.strictEqual(result.length, 2);
  assert.strictEqual(result[0].type, 'GROUP');
  assert.deepStrictEqual(result[0].participants_ids, ['u1', 'u2', 'u3']);
  assert.strictEqual(result[1].type, 'DM');
  assert.deepStrictEqual(result[1].participants_ids, ['u1', 'u4']);
});

test('normalizeUsers handles both standard and alternative backend schemas', () => {
  const raw = [
    {
      id: 'u1',
      name: 'Alice',
      bio: 'Mobile Dev',
      avatar: 'https://example.com/alice.jpg',
    },
    {
      _id: 'u2',
      username: 'Bob',
      status: 'Hey there!',
      profilePic: 'https://example.com/bob.jpg',
    },
  ];
  const result = normalizeUsers(raw);
  assert.strictEqual(result.length, 2);
  assert.strictEqual(result[0].name, 'Alice');
  assert.strictEqual(result[0].bio, 'Mobile Dev');
  assert.strictEqual(result[1].id, 'u2');
  assert.strictEqual(result[1].name, 'Bob');
  assert.strictEqual(result[1].bio, 'Hey there!');
});
