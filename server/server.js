const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);

// Configure CORS for Socket.io
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Create uploads directory if it doesn't exist
const fs = require('fs');
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// In-memory storage (in production, use a database)
const users = new Map(); // socketId -> user info
const rooms = new Map(); // roomId -> room info
const messages = new Map(); // roomId -> array of messages
const typingUsers = new Map(); // roomId -> Set of typing user IDs

// Default global room
const GLOBAL_ROOM = 'global';
rooms.set(GLOBAL_ROOM, {
  id: GLOBAL_ROOM,
  name: 'Global Chat',
  type: 'public',
  createdAt: new Date()
});
messages.set(GLOBAL_ROOM, []);

// Helper functions
function getUserBySocketId(socketId) {
  return users.get(socketId);
}

function getUserByUsername(username) {
  for (const [socketId, user] of users.entries()) {
    if (user.username === username) {
      return { socketId, ...user };
    }
  }
  return null;
}

function getOnlineUsers() {
  return Array.from(users.values());
}

function addMessage(roomId, message) {
  if (!messages.has(roomId)) {
    messages.set(roomId, []);
  }
  const roomMessages = messages.get(roomId);
  roomMessages.push(message);
  
  // Keep only last 1000 messages per room
  if (roomMessages.length > 1000) {
    roomMessages.shift();
  }
  
  return message;
}

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // User joins with username
  socket.on('join', (data) => {
    const { username, avatar } = data;
    
    if (!username || username.trim() === '') {
      socket.emit('error', { message: 'Username is required' });
      return;
    }

    // Check if username is already taken
    const existingUser = getUserByUsername(username);
    if (existingUser && existingUser.socketId !== socket.id) {
      socket.emit('error', { message: 'Username already taken' });
      return;
    }

    // Store user info
    users.set(socket.id, {
      id: socket.id,
      username: username.trim(),
      avatar: avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random`,
      joinedAt: new Date(),
      status: 'online'
    });

    // Join global room by default
    socket.join(GLOBAL_ROOM);

    // Notify user of successful join
    socket.emit('joined', {
      user: users.get(socket.id),
      rooms: Array.from(rooms.values()),
      onlineUsers: getOnlineUsers()
    });

    // Notify others in global room
    socket.to(GLOBAL_ROOM).emit('userJoined', {
      user: users.get(socket.id),
      onlineUsers: getOnlineUsers()
    });

    // Send recent messages for global room
    const recentMessages = messages.get(GLOBAL_ROOM) || [];
    socket.emit('messages', {
      roomId: GLOBAL_ROOM,
      messages: recentMessages.slice(-50) // Last 50 messages
    });
  });

  // Join a room
  socket.on('joinRoom', (data) => {
    const { roomId } = data;
    const user = getUserBySocketId(socket.id);
    
    if (!user) {
      socket.emit('error', { message: 'You must join first' });
      return;
    }

    if (!rooms.has(roomId)) {
      socket.emit('error', { message: 'Room does not exist' });
      return;
    }

    socket.join(roomId);
    socket.emit('roomJoined', { roomId });

    // Send recent messages for the room
    const roomMessages = messages.get(roomId) || [];
    socket.emit('messages', {
      roomId,
      messages: roomMessages.slice(-50)
    });

    // Notify others in the room
    socket.to(roomId).emit('userJoinedRoom', {
      user,
      roomId
    });
  });

  // Leave a room
  socket.on('leaveRoom', (data) => {
    const { roomId } = data;
    const user = getUserBySocketId(socket.id);
    
    if (user) {
      socket.leave(roomId);
      socket.to(roomId).emit('userLeftRoom', {
        user,
        roomId
      });
    }
  });

  // Create a new room
  socket.on('createRoom', (data) => {
    const { name, type = 'public' } = data;
    const user = getUserBySocketId(socket.id);
    
    if (!user) {
      socket.emit('error', { message: 'You must join first' });
      return;
    }

    const roomId = `room-${uuidv4()}`;
    const newRoom = {
      id: roomId,
      name: name || `Room ${roomId.slice(0, 8)}`,
      type: type,
      createdBy: user.username,
      createdAt: new Date()
    };

    rooms.set(roomId, newRoom);
    messages.set(roomId, []);

    // Join the room
    socket.join(roomId);

    // Notify all users about the new room
    io.emit('roomCreated', { room: newRoom });

    socket.emit('roomJoined', { roomId });
  });

  // Send message
  socket.on('sendMessage', (data) => {
    const { roomId, text, type = 'text', filename } = data;
    const user = getUserBySocketId(socket.id);
    
    if (!user) {
      socket.emit('error', { message: 'You must join first' });
      return;
    }

    if (!rooms.has(roomId)) {
      socket.emit('error', { message: 'Room does not exist' });
      return;
    }

    const message = {
      id: uuidv4(),
      roomId,
      userId: user.id,
      username: user.username,
      avatar: user.avatar,
      text,
      type,
      filename: filename || null,
      timestamp: new Date(),
      readBy: [user.id],
      reactions: {}
    };

    addMessage(roomId, message);

    // Emit to all users in the room
    io.to(roomId).emit('newMessage', { message });

    // Stop typing indicator
    if (typingUsers.has(roomId)) {
      typingUsers.get(roomId).delete(user.id);
      socket.to(roomId).emit('typing', {
        roomId,
        users: Array.from(typingUsers.get(roomId)).map(id => {
          const u = Array.from(users.values()).find(usr => usr.id === id);
          return u ? { id: u.id, username: u.username } : null;
        }).filter(Boolean)
      });
    }
  });

  // Typing indicator
  socket.on('typing', (data) => {
    const { roomId, isTyping } = data;
    const user = getUserBySocketId(socket.id);
    
    if (!user) return;

    if (!typingUsers.has(roomId)) {
      typingUsers.set(roomId, new Set());
    }

    if (isTyping) {
      typingUsers.get(roomId).add(user.id);
    } else {
      typingUsers.get(roomId).delete(user.id);
    }

    socket.to(roomId).emit('typing', {
      roomId,
      users: Array.from(typingUsers.get(roomId)).map(id => {
        const u = Array.from(users.values()).find(usr => usr.id === id);
        return u ? { id: u.id, username: u.username } : null;
      }).filter(Boolean)
    });
  });

  // Mark message as read
  socket.on('markAsRead', (data) => {
    const { messageId, roomId } = data;
    const user = getUserBySocketId(socket.id);
    
    if (!user) return;

    const roomMessages = messages.get(roomId);
    if (roomMessages) {
      const message = roomMessages.find(m => m.id === messageId);
      if (message && !message.readBy.includes(user.id)) {
        message.readBy.push(user.id);
        io.to(roomId).emit('messageRead', { messageId, userId: user.id });
      }
    }
  });

  // Add reaction to message
  socket.on('addReaction', (data) => {
    const { messageId, roomId, reaction } = data;
    const user = getUserBySocketId(socket.id);
    
    if (!user) return;

    const roomMessages = messages.get(roomId);
    if (roomMessages) {
      const message = roomMessages.find(m => m.id === messageId);
      if (message) {
        if (!message.reactions[reaction]) {
          message.reactions[reaction] = [];
        }
        if (!message.reactions[reaction].includes(user.id)) {
          message.reactions[reaction].push(user.id);
          io.to(roomId).emit('reactionAdded', {
            messageId,
            reaction,
            userId: user.id,
            username: user.username
          });
        }
      }
    }
  });

  // Remove reaction from message
  socket.on('removeReaction', (data) => {
    const { messageId, roomId, reaction } = data;
    const user = getUserBySocketId(socket.id);
    
    if (!user) return;

    const roomMessages = messages.get(roomId);
    if (roomMessages) {
      const message = roomMessages.find(m => m.id === messageId);
      if (message && message.reactions[reaction]) {
        message.reactions[reaction] = message.reactions[reaction].filter(id => id !== user.id);
        if (message.reactions[reaction].length === 0) {
          delete message.reactions[reaction];
        }
        io.to(roomId).emit('reactionRemoved', {
          messageId,
          reaction,
          userId: user.id
        });
      }
    }
  });

  // Load more messages (pagination)
  socket.on('loadMessages', (data) => {
    const { roomId, beforeMessageId, limit = 50 } = data;
    const user = getUserBySocketId(socket.id);
    
    if (!user) return;

    const roomMessages = messages.get(roomId) || [];
    let messagesToSend = roomMessages;

    if (beforeMessageId) {
      const beforeIndex = roomMessages.findIndex(m => m.id === beforeMessageId);
      if (beforeIndex > 0) {
        messagesToSend = roomMessages.slice(Math.max(0, beforeIndex - limit), beforeIndex);
      } else {
        messagesToSend = [];
      }
    } else {
      messagesToSend = roomMessages.slice(-limit);
    }

    socket.emit('messages', {
      roomId,
      messages: messagesToSend,
      hasMore: beforeMessageId ? roomMessages.findIndex(m => m.id === beforeMessageId) > limit : false
    });
  });

  // Search messages
  socket.on('searchMessages', (data) => {
    const { roomId, query } = data;
    const user = getUserBySocketId(socket.id);
    
    if (!user) return;

    const roomMessages = messages.get(roomId) || [];
    const searchResults = roomMessages.filter(m => 
      m.text.toLowerCase().includes(query.toLowerCase())
    ).slice(-50); // Limit to 50 results

    socket.emit('searchResults', {
      roomId,
      query,
      messages: searchResults
    });
  });

  // Private message
  socket.on('sendPrivateMessage', (data) => {
    const { recipientUsername, text, type = 'text' } = data;
    const user = getUserBySocketId(socket.id);
    
    if (!user) {
      socket.emit('error', { message: 'You must join first' });
      return;
    }

    const recipient = getUserByUsername(recipientUsername);
    if (!recipient) {
      socket.emit('error', { message: 'User not found' });
      return;
    }

    // Create a private room ID (sorted usernames to ensure consistency)
    const roomId = `private-${[user.username, recipientUsername].sort().join('-')}`;
    
    if (!rooms.has(roomId)) {
      rooms.set(roomId, {
        id: roomId,
        name: `Private: ${user.username} & ${recipientUsername}`,
        type: 'private',
        participants: [user.username, recipientUsername],
        createdAt: new Date()
      });
      messages.set(roomId, []);
    }

    const message = {
      id: uuidv4(),
      roomId,
      userId: user.id,
      username: user.username,
      avatar: user.avatar,
      text,
      type,
      timestamp: new Date(),
      readBy: [user.id],
      reactions: {}
    };

    addMessage(roomId, message);

    // Emit to both users
    io.to(recipient.socketId).emit('newPrivateMessage', { message, from: user });
    socket.emit('newPrivateMessage', { message, from: user });

    // Notify recipient if they're not in the room
    io.to(recipient.socketId).emit('privateMessageNotification', {
      from: user,
      message: text,
      roomId
    });
  });

  // Handle file upload
  app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    res.json({
      url: `/uploads/${req.file.filename}`,
      filename: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
  });

  // Disconnect
  socket.on('disconnect', () => {
    const user = getUserBySocketId(socket.id);
    
    if (user) {
      users.delete(socket.id);
      
      // Clear typing indicators
      typingUsers.forEach((typingSet) => {
        typingSet.delete(user.id);
      });

      // Notify others
      io.emit('userLeft', {
        user,
        onlineUsers: getOnlineUsers()
      });
    }

    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

