# Quick Start Guide

## Installation & Setup

1. **Install Server Dependencies:**
   ```bash
   cd server
   npm install
   ```

2. **Install Client Dependencies:**
   ```bash
   cd ../client
   npm install
   ```

## Running the Application

### Terminal 1 - Start the Server:
```bash
cd server
npm run dev
```
Server will run on: `http://localhost:5000`

### Terminal 2 - Start the Client:
```bash
cd client
npm run dev
```
Client will run on: `http://localhost:3000`

## First Steps

1. Open `http://localhost:3000` in your browser
2. Enter a username to join the chat
3. Start chatting in the global room!

## Features to Try

- **Create a Room:** Click "Rooms" tab → Click "+" → Enter room name
- **Private Message:** Click "Users" tab → Click on a user → Send message
- **Share Files:** Click the 📎 button → Select image or file
- **React to Messages:** Hover over a message → Click an emoji
- **Search Messages:** Use the search box in the chat header
- **Load Older Messages:** Scroll to top → Click "Load older messages"

## Troubleshooting

- **Port already in use:** Change PORT in server/.env or update vite.config.js for client
- **CORS errors:** Make sure server is running before starting client
- **File upload fails:** Ensure `server/uploads/` directory exists (created automatically)

## Notes

- All data is stored in memory (lost on server restart)
- File uploads are stored in `server/uploads/`
- Maximum file size: 10MB

