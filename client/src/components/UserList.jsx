import { useState } from 'react'
import './UserList.css'

function UserList({ users, currentUser, onSendPrivateMessage, onSelectPrivateChat }) {
  const [selectedUser, setSelectedUser] = useState(null)
  const [messageText, setMessageText] = useState('')

  const handleUserClick = (user) => {
    if (user.id !== currentUser.id) {
      setSelectedUser(user)
      setMessageText('')
    }
  }

  const handleSendPrivate = (e) => {
    e.preventDefault()
    if (messageText.trim() && selectedUser) {
      onSendPrivateMessage(selectedUser.username, messageText)
      setMessageText('')
      
      // Create room ID for private chat
      const roomId = `private-${[currentUser.username, selectedUser.username].sort().join('-')}`
      onSelectPrivateChat(roomId)
    }
  }

  const otherUsers = users.filter(user => user.id !== currentUser.id)

  return (
    <div className="user-list">
      <div className="user-list-header">
        <h3>Online Users ({users.length})</h3>
      </div>
      
      <div className="users-container">
        {otherUsers.length === 0 ? (
          <div className="empty-users">
            <p>No other users online</p>
          </div>
        ) : (
          otherUsers.map((user) => (
            <div
              key={user.id}
              className={`user-item ${selectedUser?.id === user.id ? 'selected' : ''}`}
              onClick={() => handleUserClick(user)}
            >
              <div className="user-status">
                <img src={user.avatar} alt={user.username} className="user-item-avatar" />
                <span className="status-indicator online"></span>
              </div>
              <div className="user-item-info">
                <div className="user-item-name">{user.username}</div>
                <div className="user-item-status">{user.status}</div>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedUser && (
        <div className="private-message-form">
          <div className="private-message-header">
            <span>Message to {selectedUser.username}</span>
            <button onClick={() => setSelectedUser(null)}>✕</button>
          </div>
          <form onSubmit={handleSendPrivate}>
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type a private message..."
              rows={3}
            />
            <button type="submit" disabled={!messageText.trim()}>
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

export default UserList

