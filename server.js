/**
 * Lightweight Zero-Dependency Local Backend Server
 * Implements the complete NST AD Chat API contract:
 * - GET  /user
 * - GET  /user/profile?user_id=ID
 * - GET  /conversation
 * - POST /conversation
 * - GET  /message?conversation_id=ID
 * - POST /message
 */

const http = require('http');

let wss = null;
try {
  const WebSocket = require('ws');
  // ws Server will be attached to http server
} catch {
  // ws optional
}

const PORT = process.env.PORT || 3000;

// Seed Data
let users = [
  { id: 'first', name: 'Vaibhav', bio: 'Instructor @ NST AD' },
  { id: 'second', name: 'Student 1', bio: 'React Native & Mobile Dev' },
  { id: 'third', name: 'Student 2', bio: 'Full-stack & Mobile Developer' },
  { id: 'fourth', name: 'Aarav Sharma', bio: 'Building cool mobile apps' },
  { id: 'fifth', name: 'Ananya Verma', bio: 'UI/UX enthusiast' },
];

let conversations = [
  {
    id: 'convo-1',
    name: 'NST Mobile Dev Class',
    type: 'GROUP',
    participants_ids: ['first', 'second', 'third', 'fourth'],
    createdBy: 'first',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    lastMessage: 'Welcome to the live chat session!',
    lastMessageAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'convo-2',
    name: 'Vaibhav',
    type: 'DM',
    participants_ids: ['first', 'second'],
    createdBy: 'first',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    lastMessage: 'Check out the new camera and image picker feature',
    lastMessageAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
];

let messages = [
  {
    id: 'msg-1',
    conversation_id: 'convo-1',
    sender_id: 'first',
    sender_name: 'Vaibhav',
    content: 'Welcome to the live chat session!',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'msg-2',
    conversation_id: 'convo-1',
    sender_id: 'second',
    sender_name: 'Student 1',
    content: 'Awesome! Text messages, image sharing, and cameras are all working.',
    createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
  },
  {
    id: 'msg-3',
    conversation_id: 'convo-2',
    sender_id: 'first',
    sender_name: 'Vaibhav',
    content: 'Check out the new camera and image picker feature',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
];

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const method = req.method;
  const pathname = url.pathname;

  // CORS headers for Web and Mobile development
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');

  if (method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  let body = '';
  req.on('data', (chunk) => {
    body += chunk;
  });

  req.on('end', () => {
    let json = {};
    if (body) {
      try {
        json = JSON.parse(body);
      } catch {
        json = {};
      }
    }

    const log = (status) => {
      console.log(`[${new Date().toLocaleTimeString()}] ${method} ${pathname} -> ${status}`);
    };

    // Route: GET /user
    if (method === 'GET' && pathname === '/user') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      log(200);
      return res.end(JSON.stringify(users));
    }

    // Route: GET /user/profile?user_id=ID
    if (method === 'GET' && pathname === '/user/profile') {
      const userId = url.searchParams.get('user_id');
      const user = users.find((u) => String(u.id) === String(userId));
      if (user) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        log(200);
        return res.end(JSON.stringify(user));
      }
      res.writeHead(404, { 'Content-Type': 'application/json' });
      log(404);
      return res.end(JSON.stringify({ message: `User ${userId} not found` }));
    }

    // Route: GET /conversation
    if (method === 'GET' && pathname === '/conversation') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      log(200);
      return res.end(JSON.stringify(conversations));
    }

    // Route: POST /conversation
    if (method === 'POST' && pathname === '/conversation') {
      if (!json.name || !json.type) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        log(400);
        return res.end(JSON.stringify({ message: 'Conversation name and type are required' }));
      }

      const newConvo = {
        id: `convo-${Date.now()}`,
        name: json.name,
        type: json.type,
        participants_ids: json.participants_ids || ['first'],
        createdBy: 'first',
        createdAt: new Date().toISOString(),
        lastMessage: 'Conversation created',
        lastMessageAt: new Date().toISOString(),
      };
      conversations.unshift(newConvo);

      res.writeHead(201, { 'Content-Type': 'application/json' });
      log(201);
      return res.end(JSON.stringify(newConvo));
    }

    // Route: GET /message?conversation_id=ID
    if (method === 'GET' && pathname === '/message') {
      const convoId = url.searchParams.get('conversation_id');
      const filtered = messages.filter((m) => String(m.conversation_id) === String(convoId));
      res.writeHead(200, { 'Content-Type': 'application/json' });
      log(200);
      return res.end(JSON.stringify({ data: filtered }));
    }

    // Route: POST /message
    if (method === 'POST' && pathname === '/message') {
      if (!json.conversation_id || (!json.content && !json.imageInfo)) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        log(400);
        return res.end(JSON.stringify({ message: 'conversation_id and content or imageInfo are required' }));
      }

      const newMsg = {
        id: `msg-${Date.now()}`,
        conversation_id: json.conversation_id,
        sender_id: 'first',
        sender_name: 'Vaibhav',
        content: json.content || '',
        imageInfo: json.imageInfo || null,
        createdAt: new Date().toISOString(),
      };
      messages.push(newMsg);

      // Broadcast to WebSocket clients if connected
      broadcastWsMessage(newMsg);

      // Update conversation lastMessage
      const convo = conversations.find((c) => String(c.id) === String(json.conversation_id));
      if (convo) {
        convo.lastMessage = json.content ? json.content : '📷 [Image]';
        convo.lastMessageAt = newMsg.createdAt;
      }

      res.writeHead(201, { 'Content-Type': 'application/json' });
      log(201);
      return res.end(JSON.stringify(newMsg));
    }

    // 404 Fallback
    res.writeHead(404, { 'Content-Type': 'application/json' });
    log(404);
    res.end(JSON.stringify({ message: 'Endpoint not found' }));
  });
});

// WebSocket Server Support
try {
  const WebSocket = require('ws');
  wss = new WebSocket.Server({ server });
  wss.on('connection', (socket, req) => {
    try {
      const parsedUrl = new URL(req.url, 'http://localhost');
      socket.conversationId = parsedUrl.searchParams.get('conversation_id');
    } catch {}

    socket.on('message', (data) => {
      try {
        const payload = JSON.parse(data.toString());
        if (payload.action === 'join' && payload.conversation_id) {
          socket.conversationId = payload.conversation_id;
        }
      } catch {}
    });
  });
} catch (e) {
  wss = null;
}

function broadcastWsMessage(newMsg) {
  if (!wss) return;
  const payload = JSON.stringify({ type: 'NEW_MESSAGE', data: newMsg });
  wss.clients.forEach((client) => {
    if (client.readyState === 1) { // OPEN
      if (!client.conversationId || String(client.conversationId) === String(newMsg.conversation_id)) {
        client.send(payload);
      }
    }
  });
}

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Error: Port ${PORT} is already in use by another process.`);
    console.error(`👉 Run this command to free it and try again:\n   kill -9 $(lsof -t -i :${PORT})\n`);
    process.exit(1);
  } else {
    console.error('Server error:', err);
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n========================================`);
  console.log(`🚀 Chat API & WebSocket Server running on port ${PORT}`);
  console.log(`========================================`);
  console.log(`• Localhost (Web / iOS Simulator): http://localhost:${PORT} / ws://localhost:${PORT}`);
  console.log(`• Android Emulator:                http://10.0.2.2:${PORT} / ws://10.0.2.2:${PORT}`);
  console.log(`• Physical Device LAN:             http://<YOUR_LOCAL_IP>:${PORT} / ws://<YOUR_LOCAL_IP>:${PORT}\n`);
});
