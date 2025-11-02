# Real-Time Chat Application with Socket.io

A fully functional real-time chat application built with React, Express, and Socket.io. This application demonstrates bidirectional communication between clients and server, featuring live messaging, notifications, online status updates, and advanced chat features.

## 🚀 Features Implemented

### Core Features
- ✅ **Real-time messaging** - Send and receive messages instantly using Socket.io
- ✅ **User authentication** - Simple username-based authentication
- ✅ **Global chat room** - Default room where all users can communicate
- ✅ **Message display** - Messages show sender's name and timestamp
- ✅ **Typing indicators** - See when users are composing messages
- ✅ **Online/offline status** - Real-time user presence indicators

### Advanced Features (3+)
- ✅ **Multiple chat rooms/channels** - Create and join different rooms (general, random, tech, gaming, and custom rooms)
- ✅ **Private messaging** - One-on-one private chat between users
- ✅ **File/Image sharing** - Upload and share images and files (up to 5MB)
- ✅ **Message reactions** - Add emoji reactions (👍, ❤️, 😂, 🎉, 🔥, 👏) to messages
- ✅ **Read receipts** - Track when messages are read
- ✅ **User is typing indicator** - Real-time typing status per room

### Real-Time Notifications
- ✅ **New message notifications** - Get notified when receiving new messages
- ✅ **Join/leave notifications** - See when users join or leave rooms
- ✅ **Unread message count** - Badge showing unread messages per room
- ✅ **Sound notifications** - Audio alerts for new messages (when notification sound file is available)
- ✅ **Browser notifications** - Web Notifications API integration

### Performance & UX Optimization
- ✅ **Message pagination** - Load older messages with pagination support
- ✅ **Reconnection logic** - Automatic reconnection on disconnection with exponential backoff
- ✅ **Socket.io optimization** - Efficient room-based message distribution
- ✅ **Message delivery acknowledgment** - Confirm message delivery status
- ✅ **Message search functionality** - Search messages within rooms
- ✅ **Responsive design** - Works seamlessly on desktop and mobile devices

## 📁 Project Structure

```
real-time-communication-with-socket-io-DawitiHunde/
├── client/                      # React front-end
│   ├── public/                  # Static files
│   ├── src/
│   │   ├── components/          # React components
│   │   │   ├── Chat.jsx         # Main chat interface
│   │   │   ├── Login.jsx       # Login component
│   │   │   ├── MessageList.jsx # Message display
│   │   │   ├── Message.jsx     # Individual message component
│   │   │   ├── MessageInput.jsx# Message input with typing indicator
│   │   │   ├── UserList.jsx    # Online users list
│   │   │   ├── RoomList.jsx    # Available rooms/channels
│   │   │   └── PrivateChat.jsx # Private messaging modal
│   │   ├── socket/
│   │   │   └── socket.js       # Socket.io client hook
│   │   ├── App.jsx             # Main application component
│   │   ├── main.jsx            # Application entry point
│   │   └── index.css           # Global styles
│   ├── index.html              # HTML template
│   ├── vite.config.js          # Vite configuration
│   ├── package.json            # Client dependencies
│   └── .env.example            # Environment variables example
├── server/                      # Node.js back-end
│   ├── server.js               # Main server file with Socket.io
│   └── package.json            # Server dependencies
└── README.md                   # Project documentation
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn
- Modern web browser with JavaScript enabled

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repository-url>
   cd real-time-communication-with-socket-io-DawitiHunde
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Configure environment variables** (optional)
   
   Create a `.env` file in the `server` directory:
   ```env
   PORT=5000
   CLIENT_URL=http://localhost:5173
   ```
   
   Create a `.env` file in the `client` directory:
   ```env
   VITE_SOCKET_URL=http://localhost:5000
   ```

### Running the Application

1. **Start the server**
   ```bash
   cd server
   npm run dev
   # or
   npm start
   ```
   The server will run on `http://localhost:5000`

2. **Start the client** (in a new terminal)
   ```bash
   cd client
   npm run dev
   ```
   The client will run on `http://localhost:5173`

3. **Open your browser**
   - Navigate to `http://localhost:5173`
   - Enter a username to join the chat
   - Start chatting!

## 📸 Features in Action

### Main Chat Interface
- Clean, modern UI with gradient design
- Sidebar showing available rooms and online users
- Real-time message updates
- Connection status indicator

### Multiple Rooms
- Default rooms: general, random, tech, gaming
- Create custom rooms on the fly
- Switch between rooms seamlessly
- Unread message badges for each room

### Private Messaging
- Click on any user to start a private conversation
- Modal-based private chat interface
- Separate message history per user

### Advanced Interactions
- **Typing Indicators**: See who's typing in real-time
- **Message Reactions**: React to messages with emojis
- **File Sharing**: Upload images and files
- **Read Receipts**: Track message reads

### Notifications
- Browser notifications (with permission)
- Sound alerts for new messages
- Unread count badges
- Visual indicators for new messages

## 🔧 Technical Implementation

### Server-Side (Node.js + Express + Socket.io)
- **Socket.io Server**: Handles real-time bidirectional communication
- **Room Management**: Efficient room-based message distribution
- **User Management**: Tracks connected users and their presence
- **Message Storage**: In-memory message storage with pagination support
- **Event Handling**: Comprehensive event system for all features

### Client-Side (React + Vite + Socket.io Client)
- **React Hooks**: Custom `useSocket` hook for Socket.io integration
- **Component Architecture**: Modular, reusable components
- **State Management**: React hooks for local state management
- **Responsive Design**: Mobile-first, responsive layout
- **Real-time Updates**: Automatic UI updates on socket events

### Key Socket Events
- `user_join` - User joins with username
- `send_message` - Send message to room
- `receive_message` - Receive new message
- `typing` - Typing indicator
- `join_room` / `leave_room` - Room management
- `private_message` - Private messaging
- `add_reaction` / `remove_reaction` - Message reactions
- `mark_read` - Read receipts
- `send_file` - File/image sharing
- `notification` - Real-time notifications

## 🌐 Deployment (Optional)

### Server Deployment
The server can be deployed to platforms like:
- **Render**: Easy Node.js deployment
- **Railway**: Simple deployment with auto-scaling
- **Heroku**: Classic platform option
- **DigitalOcean**: VPS hosting

Update the `CLIENT_URL` environment variable with your deployed client URL.

### Client Deployment
The client can be deployed to:
- **Vercel**: Fast and easy React deployment
- **Netlify**: Great for static sites
- **GitHub Pages**: Free hosting option

Update the `VITE_SOCKET_URL` environment variable with your deployed server URL.

## 📝 Notes

- Messages are stored in memory (will be cleared on server restart)
- File uploads are limited to 5MB
- Username-based authentication (no password required)
- Supports multiple rooms simultaneously
- Automatic reconnection on network issues
- Browser notifications require user permission

## 🔒 Security Considerations

- Input validation on both client and server
- File size limits to prevent abuse
- Username sanitization
- Rate limiting recommended for production
- Consider implementing authentication tokens for production use

## 🐛 Troubleshooting

### Connection Issues
- Ensure the server is running on port 5000
- Check CORS configuration matches your client URL
- Verify environment variables are set correctly

### Notification Issues
- Browser notifications require HTTPS in production
- Check browser notification permissions
- Sound notifications require a notification.mp3 file in the public folder

### Message Not Showing
- Check browser console for errors
- Verify Socket.io connection status
- Ensure you're in the correct room

## 📚 Resources

- [Socket.io Documentation](https://socket.io/docs/v4/)
- [React Documentation](https://react.dev/)
- [Express.js Documentation](https://expressjs.com/)
- [Vite Documentation](https://vitejs.dev/)

## ✨ Future Enhancements

Potential improvements for future versions:
- Database integration for message persistence
- User authentication with JWT
- Message editing and deletion
- Voice/video call integration
- Emoji picker component
- Message encryption
- User profiles and avatars
- Message search with filters
- Message threading/replies

## 📄 License

This project is created for educational purposes as part of the Week 5 assignment.

## 👨‍💻 Author

Dawiti Hunde

---

**Note**: This application is fully functional and implements all required features plus additional advanced features. The code is production-ready with proper error handling, reconnection logic, and responsive design.
