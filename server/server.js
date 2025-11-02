// server.js - Main server file for Socket.io chat application

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Store connected users, messages, rooms, and state
const users = {}; // { socketId: { username, id, room } }
const messages = {}; // { room: [messages] }
const typingUsers = {}; // { room: { socketId: username } }
const rooms = ['general', 'random', 'tech', 'gaming']; // Default rooms
const userRooms = {}; // Track which rooms each user is in
const messageReactions = {}; // { messageId: { emoji: [userIds] } }
const readReceipts = {}; // { messageId: [userId] }

// Initialize default room messages
rooms.forEach(room => {
  messages[room] = [];
  typingUsers[room] = {};
});

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Handle user joining with username
  socket.on('user_join', ({ username, room = 'general' }) => {
    users[socket.id] = { username, id: socket.id, room, joinedAt: new Date().toISOString() };
    userRooms[socket.id] = [room];
    socket.join(room);
    
    // Send system message to room
    const systemMessage = {
      id: Date.now(),
      system: true,
      message: `${username} joined the chat`,
      timestamp: new Date().toISOString(),
      room,
    };
    messages[room].push(systemMessage);
    io.to(room).emit('receive_message', systemMessage);
    
    // Broadcast user list and join event
    io.emit('user_list', Object.values(users));
    io.to(room).emit('user_joined', { username, id: socket.id, room });
    socket.emit('room_list', rooms);
    socket.emit('current_room', room);
    console.log(`${username} joined room: ${room}`);
  });

  // Handle joining a new room
  socket.on('join_room', (room) => {
    if (!rooms.includes(room)) {
      rooms.push(room);
      messages[room] = [];
      typingUsers[room] = {};
      io.emit('room_list', rooms);
    }
    
    if (!userRooms[socket.id]) {
      userRooms[socket.id] = [];
    }
    
    if (!userRooms[socket.id].includes(room)) {
      userRooms[socket.id].push(room);
      socket.join(room);
      
      if (users[socket.id]) {
        const systemMessage = {
          id: Date.now(),
          system: true,
          message: `${users[socket.id].username} joined ${room}`,
          timestamp: new Date().toISOString(),
          room,
        };
        messages[room].push(systemMessage);
        io.to(room).emit('receive_message', systemMessage);
      }
      
      // Send room history
      socket.emit('room_history', { room, messages: messages[room].slice(-50) });
      socket.emit('current_room', room);
    }
  });

  // Handle leaving a room
  socket.on('leave_room', (room) => {
    socket.leave(room);
    if (userRooms[socket.id]) {
      userRooms[socket.id] = userRooms[socket.id].filter(r => r !== room);
    }
    
    if (users[socket.id]) {
      const systemMessage = {
        id: Date.now(),
        system: true,
        message: `${users[socket.id].username} left ${room}`,
        timestamp: new Date().toISOString(),
        room,
      };
      messages[room].push(systemMessage);
      io.to(room).emit('receive_message', systemMessage);
    }
  });

  // Handle chat messages in a room
  socket.on('send_message', (messageData) => {
    const room = messageData.room || 'general';
    const message = {
      ...messageData,
      id: Date.now() + Math.random(),
      sender: users[socket.id]?.username || 'Anonymous',
      senderId: socket.id,
      timestamp: new Date().toISOString(),
      room,
      readBy: [],
    };
    
    if (!messages[room]) {
      messages[room] = [];
    }
    
    messages[room].push(message);
    
    // Limit stored messages per room
    if (messages[room].length > 500) {
      messages[room] = messages[room].slice(-500);
    }
    
    // Emit to room with acknowledgment
    socket.emit('message_sent', { messageId: message.id, status: 'sent' });
    io.to(room).emit('receive_message', message);
    
    // Send notification to users not in the room
    Object.keys(users).forEach(userId => {
      if (userId !== socket.id && userRooms[userId] && !userRooms[userId].includes(room)) {
        io.to(userId).emit('notification', {
          type: 'new_message',
          room,
          sender: message.sender,
          message: message.message?.substring(0, 50) || 'New message',
        });
      }
    });
  });

  // Handle typing indicator
  socket.on('typing', ({ isTyping, room = 'general' }) => {
    if (users[socket.id]) {
      const username = users[socket.id].username;
      
      if (!typingUsers[room]) {
        typingUsers[room] = {};
      }
      
      if (isTyping) {
        typingUsers[room][socket.id] = username;
      } else {
        delete typingUsers[room][socket.id];
      }
      
      socket.to(room).emit('typing_users', { room, users: Object.values(typingUsers[room]) });
    }
  });

  // Handle private messages
  socket.on('private_message', ({ to, message }) => {
    const messageData = {
      id: Date.now() + Math.random(),
      sender: users[socket.id]?.username || 'Anonymous',
      senderId: socket.id,
      receiverId: to,
      message,
      timestamp: new Date().toISOString(),
      isPrivate: true,
      readBy: [],
    };
    
    // Send to receiver
    socket.to(to).emit('private_message', messageData);
    // Send back to sender
    socket.emit('private_message', messageData);
    
    // Send notification
    io.to(to).emit('notification', {
      type: 'private_message',
      sender: messageData.sender,
      message: message.substring(0, 50),
    });
  });

  // Handle message reactions
  socket.on('add_reaction', ({ messageId, emoji }) => {
    if (!messageReactions[messageId]) {
      messageReactions[messageId] = {};
    }
    if (!messageReactions[messageId][emoji]) {
      messageReactions[messageId][emoji] = [];
    }
    
    if (!messageReactions[messageId][emoji].includes(socket.id)) {
      messageReactions[messageId][emoji].push(socket.id);
      io.emit('reaction_added', { messageId, emoji, userId: socket.id });
    }
  });

  socket.on('remove_reaction', ({ messageId, emoji }) => {
    if (messageReactions[messageId] && messageReactions[messageId][emoji]) {
      messageReactions[messageId][emoji] = messageReactions[messageId][emoji].filter(
        id => id !== socket.id
      );
      if (messageReactions[messageId][emoji].length === 0) {
        delete messageReactions[messageId][emoji];
      }
      io.emit('reaction_removed', { messageId, emoji, userId: socket.id });
    }
  });

  // Handle read receipts
  socket.on('mark_read', ({ messageId, room }) => {
    if (!readReceipts[messageId]) {
      readReceipts[messageId] = [];
    }
    if (!readReceipts[messageId].includes(socket.id)) {
      readReceipts[messageId].push(socket.id);
      io.emit('read_receipt', { messageId, userId: socket.id });
    }
  });

  // Handle file/image sharing
  socket.on('send_file', ({ file, fileName, fileType, room = 'general' }) => {
    const message = {
      id: Date.now() + Math.random(),
      sender: users[socket.id]?.username || 'Anonymous',
      senderId: socket.id,
      fileName,
      fileType,
      file,
      timestamp: new Date().toISOString(),
      room,
      isFile: true,
      readBy: [],
    };
    
    if (!messages[room]) {
      messages[room] = [];
    }
    
    messages[room].push(message);
    io.to(room).emit('receive_message', message);
  });

  // Handle message search request
  socket.on('search_messages', ({ query, room }) => {
    const roomMessages = messages[room] || [];
    const results = roomMessages.filter(msg => 
      msg.message && msg.message.toLowerCase().includes(query.toLowerCase())
    ).slice(-20);
    socket.emit('search_results', results);
  });

  // Handle pagination request
  socket.on('get_messages', ({ room, page = 0, limit = 50 }) => {
    const roomMessages = messages[room] || [];
    const start = roomMessages.length - (page + 1) * limit;
    const end = roomMessages.length - page * limit;
    const paginatedMessages = roomMessages.slice(Math.max(0, start), end);
    socket.emit('messages_page', {
      messages: paginatedMessages,
      page,
      hasMore: start > 0,
    });
  });

  // Get reactions for a message
  socket.on('get_reactions', (messageId) => {
    socket.emit('message_reactions', {
      messageId,
      reactions: messageReactions[messageId] || {},
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    if (users[socket.id]) {
      const { username, room } = users[socket.id];
      
      // Notify all rooms user was in
      if (userRooms[socket.id]) {
        userRooms[socket.id].forEach(r => {
          const systemMessage = {
            id: Date.now(),
            system: true,
            message: `${username} left the chat`,
            timestamp: new Date().toISOString(),
            room: r,
          };
          messages[r].push(systemMessage);
          io.to(r).emit('receive_message', systemMessage);
        });
      }
      
      io.emit('user_left', { username, id: socket.id });
      console.log(`${username} left the chat`);
    }
    
    // Clean up
    delete users[socket.id];
    delete userRooms[socket.id];
    
    // Clean up typing indicators in all rooms
    Object.keys(typingUsers).forEach(room => {
      delete typingUsers[room][socket.id];
      io.to(room).emit('typing_users', { room, users: Object.values(typingUsers[room]) });
    });
    
    io.emit('user_list', Object.values(users));
  });
});

// API routes
app.get('/api/messages/:room', (req, res) => {
  const room = req.params.room || 'general';
  res.json(messages[room] || []);
});

app.get('/api/users', (req, res) => {
  res.json(Object.values(users));
});

app.get('/api/rooms', (req, res) => {
  res.json(rooms);
});

// Root route
app.get('/', (req, res) => {
  res.send('Socket.io Chat Server is running');
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Default rooms: ${rooms.join(', ')}`);
});

module.exports = { app, server, io }; 