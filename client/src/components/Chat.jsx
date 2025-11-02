import { useState, useEffect } from 'react';
import { useSocket } from '../socket/socket';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import UserList from './UserList';
import RoomList from './RoomList';
import PrivateChat from './PrivateChat';
import './Chat.css';

function Chat({ username, onLogout }) {
  const {
    isConnected,
    messages,
    users,
    typingUsers,
    rooms,
    currentRoom,
    connect,
    disconnect,
    joinRoom,
    unreadCounts,
    socket,
  } = useSocket();

  const [showPrivateChat, setShowPrivateChat] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showRooms, setShowRooms] = useState(true);
  const [showUsers, setShowUsers] = useState(true);

  useEffect(() => {
    connect(username, 'general');
    return () => {
      disconnect();
    };
  }, [username, connect, disconnect]);

  const handleRoomChange = (room) => {
    joinRoom(room);
  };

  const handleUserClick = (user) => {
    if (user.id !== socket?.id) {
      setSelectedUser(user);
      setShowPrivateChat(true);
    }
  };

  const toggleRooms = () => setShowRooms(!showRooms);
  const toggleUsers = () => setShowUsers(!showUsers);

  return (
    <div className="chat-container">
      <header className="chat-header">
        <div className="header-left">
          <h2>💬 Real-Time Chat</h2>
          <span className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
            {isConnected ? '🟢 Online' : '🔴 Offline'}
          </span>
        </div>
        <div className="header-right">
          <span className="username">👤 {username}</span>
          <button onClick={onLogout} className="logout-btn">Logout</button>
        </div>
      </header>

      <div className="chat-content">
        <aside className="sidebar">
          <div className="sidebar-section">
            <button className="sidebar-toggle" onClick={toggleRooms}>
              {showRooms ? '▼' : '▶'} Rooms
            </button>
            {showRooms && (
              <RoomList
                rooms={rooms}
                currentRoom={currentRoom}
                onRoomChange={handleRoomChange}
                unreadCounts={unreadCounts}
              />
            )}
          </div>

          <div className="sidebar-section">
            <button className="sidebar-toggle" onClick={toggleUsers}>
              {showUsers ? '▼' : '▶'} Online Users ({users.length})
            </button>
            {showUsers && (
              <UserList users={users} onUserClick={handleUserClick} currentUserId={socket?.id} />
            )}
          </div>
        </aside>

        <main className="chat-main">
          <div className="room-header">
            <h3>#{currentRoom}</h3>
          </div>
          <MessageList
            messages={messages.filter(msg => !msg.isPrivate && msg.room === currentRoom)}
            typingUsers={typingUsers[currentRoom] || []}
            currentRoom={currentRoom}
          />
          <MessageInput currentRoom={currentRoom} />
        </main>
      </div>

      {showPrivateChat && selectedUser && (
        <PrivateChat
          user={selectedUser}
          onClose={() => {
            setShowPrivateChat(false);
            setSelectedUser(null);
          }}
        />
      )}
    </div>
  );
}

export default Chat;

