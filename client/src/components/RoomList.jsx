import { useState } from 'react'
import './RoomList.css'

function RoomList({ rooms, currentRoom, onSelectRoom, onCreateRoom, unreadCounts }) {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newRoomName, setNewRoomName] = useState('')

  const handleCreateRoom = (e) => {
    e.preventDefault()
    if (newRoomName.trim()) {
      onCreateRoom(newRoomName)
      setNewRoomName('')
      setShowCreateForm(false)
    }
  }

  return (
    <div className="room-list">
      <div className="room-list-header">
        <h3>Chat Rooms</h3>
        <button
          className="create-room-btn"
          onClick={() => setShowCreateForm(!showCreateForm)}
          title="Create new room"
        >
          +
        </button>
      </div>

      {showCreateForm && (
        <form onSubmit={handleCreateRoom} className="create-room-form">
          <input
            type="text"
            placeholder="Room name"
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
            autoFocus
            maxLength={30}
          />
          <div className="create-room-actions">
            <button type="submit">Create</button>
            <button type="button" onClick={() => {
              setShowCreateForm(false)
              setNewRoomName('')
            }}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="rooms-container">
        {rooms.map((room) => {
          const unreadCount = unreadCounts[room.id] || 0
          const isActive = room.id === currentRoom

          return (
            <div
              key={room.id}
              className={`room-item ${isActive ? 'active' : ''}`}
              onClick={() => onSelectRoom(room.id)}
            >
              <div className="room-icon">
                {room.type === 'private' ? '🔒' : '💬'}
              </div>
              <div className="room-info">
                <div className="room-name">{room.name}</div>
                <div className="room-type">{room.type}</div>
              </div>
              {unreadCount > 0 && (
                <div className="unread-badge">{unreadCount}</div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default RoomList

