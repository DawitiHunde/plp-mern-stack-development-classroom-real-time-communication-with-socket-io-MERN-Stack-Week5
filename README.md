# Real-Time Chat Application

A fully functional real-time chat application built with Node.js, Express, Socket.io, and React.

## Features

### Core Features
- ✅ User authentication (username-based)
- ✅ Global chat room
- ✅ Real-time messaging with timestamps
- ✅ Typing indicators
- ✅ Online/offline user status

### Advanced Features
- ✅ Private messaging between users
- ✅ Multiple chat rooms/channels
- ✅ File and image sharing
- ✅ Read receipts
- ✅ Message reactions (👍, ❤️, 😂, 😮, 😢, 🙏)
- ✅ Message search functionality

### Real-Time Notifications
- ✅ Browser notifications (Web Notifications API)
- ✅ Sound notifications
- ✅ Unread message counts
- ✅ Join/leave notifications

### Performance & UX
- ✅ Message pagination
- ✅ Auto-reconnection on disconnect
- ✅ Responsive design (mobile & desktop)
- ✅ Message delivery acknowledgment

## Tech Stack

### Backend
- Node.js
- Express.js
- Socket.io
- Multer (file uploads)
- UUID

### Frontend
- React
- Socket.io-client
- Vite
- Axios
- date-fns

## Setup Instructions

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

### Installation

1. **Clone the repository** (if applicable) or navigate to the project directory

2. **Install server dependencies:**
   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies:**
   ```bash
   cd ../client
   npm install
   ```

### Running the Application

1. **Start the server:**
   ```bash
   cd server
   npm run dev
   ```
   The server will run on `http://localhost:5000`

2. **Start the client:**
   ```bash
   cd client
   npm run dev
   ```
   The client will run on `http://localhost:3000`

3. **Open your browser** and navigate to `http://localhost:3000`

## Project Structure

```
week5/
├── server/
│   ├── server.js          # Main server file with Socket.io setup
│   ├── package.json       # Server dependencies
│   └── uploads/           # Uploaded files directory (created automatically)
│
└── client/
    ├── src/
    │   ├── components/
    │   │   ├── Login.jsx              # Login component
    │   │   ├── Chat.jsx               # Main chat component
    │   │   ├── MessageList.jsx        # Message list component
    │   │   ├── Message.jsx            # Individual message component
    │   │   ├── MessageInput.jsx       # Message input component
    │   │   ├── UserList.jsx           # Online users list
    │   │   ├── RoomList.jsx           # Chat rooms list
    │   │   └── NotificationManager.jsx # Notification handler
    │   ├── App.jsx                    # Main app component
    │   ├── main.jsx                   # React entry point
    │   └── index.css                  # Global styles
    ├── index.html
    ├── package.json
    └── vite.config.js
```

## Usage

1. **Login:** Enter a username to join the chat
2. **Global Chat:** Start chatting in the default global room
3. **Create Rooms:** Click on "Rooms" tab to create new chat rooms
4. **Private Messages:** Click on "Users" tab to send private messages
5. **File Sharing:** Click the attachment button (📎) to upload and share files/images
6. **Reactions:** Hover over a message and click on an emoji to react
7. **Search:** Use the search box to find messages in the current room

## Features in Detail

### Typing Indicators
When a user is typing, other users in the same room will see a "user is typing..." indicator.

### Read Receipts
Messages show read receipts (✓ for sent, ✓✓ for read) when viewed by recipients.

### File Sharing
- Supported formats: Images (JPEG, PNG, GIF), Documents (PDF, DOC, DOCX, TXT)
- Maximum file size: 10MB
- Files are stored in the `server/uploads/` directory

### Notifications
- Browser notifications require user permission
- Sound notifications play when receiving new messages
- Unread message counts are displayed on room tabs

### Message Pagination
Click "Load older messages" to load previous messages in a room (50 messages at a time).

## Environment Variables

You can set the following environment variables:

- `PORT`: Server port (default: 5000)
- `CLIENT_URL`: Client URL for CORS (default: http://localhost:3000)

## Notes

- The application uses in-memory storage. All data is lost when the server restarts.
- For production use, consider implementing a database (MongoDB, PostgreSQL, etc.)
- File uploads are stored locally. For production, consider using cloud storage (AWS S3, Cloudinary, etc.)

## License

ISC

