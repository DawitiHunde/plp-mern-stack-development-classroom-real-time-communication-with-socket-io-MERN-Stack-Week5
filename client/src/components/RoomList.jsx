import { useState } from 'react';
import './RoomList.css';

function RoomList({ rooms, currentRoom, onRoomChange, unreadCounts }) {
  const [newRoomName, setNewRoomName] = useState('');
  const [showNewRoomInput, setShowNewRoomInput] = useState(false);

  const handleCreateRoom = (e) => {
    e.preventDefault();
    if (newRoomName.trim() && !rooms.includes(newRoomName.trim())) {
      onRoomChange(newRoomName.trim());
      setNewRoomName('');
      setShowNewRoomInput(false);
    }
  };

  return (
    <div className="room-list">
      {rooms.map((room) => (
        <button
          key={room}
          className={`room-item ${room === currentRoom ? 'active' : ''}`}
          onClick={() => onRoomChange(room)}
        >
          <span>#{room}</span>
          {unreadCounts[room] > 0 && (
            <span className="unread-badge">{unreadCounts[room]}</span>
          )}
        </button>
      ))}
      
      {showNewRoomInput ? (
        <form onSubmit={handleCreateRoom} className="new-room-form">
          <input
            type="text"
            placeholder="Room name"
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
            maxLength={20}
            autoFocus
          />
          <button type="submit">Create</button>
          <button type="button" onClick={() => setShowNewRoomInput(false)}>Cancel</button>
        </form>
      ) : (
        <button
          className="create-room-btn"
          onClick={() => setShowNewRoomInput(true)}
        >
          + New Room
        </button>
      )}
    </div>
  );
}

export default RoomList;


