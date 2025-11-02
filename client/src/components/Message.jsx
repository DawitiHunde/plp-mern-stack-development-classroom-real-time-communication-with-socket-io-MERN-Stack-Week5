import { useState } from 'react';
import { useSocket } from '../socket/socket';
import './Message.css';

function Message({ message }) {
  const { addReaction, removeReaction, messageReactions, socket } = useSocket();
  const [showReactions, setShowReactions] = useState(false);
  const reactions = messageReactions[message.id] || {};

  if (message.system) {
    return (
      <div className="message system-message">
        <span>{message.message}</span>
      </div>
    );
  }

  const isOwnMessage = message.senderId === socket.id;
  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleReactionClick = (emoji) => {
    const userReacted = reactions[emoji]?.includes(socket.id);
    if (userReacted) {
      removeReaction(message.id, emoji);
    } else {
      addReaction(message.id, emoji);
    }
  };

  const reactionEmojis = ['👍', '❤️', '😂', '🎉', '🔥', '👏'];

  return (
    <div className={`message ${isOwnMessage ? 'own-message' : 'other-message'}`}>
      {!isOwnMessage && (
        <div className="message-sender">{message.sender}</div>
      )}
      
      <div className="message-content">
        {message.isFile ? (
          <div className="file-message">
            {message.fileType?.startsWith('image/') ? (
              <img src={message.file} alt={message.fileName} className="message-image" />
            ) : (
              <a href={message.file} download={message.fileName} className="file-download">
                📎 {message.fileName}
              </a>
            )}
          </div>
        ) : (
          <div className="message-text">{message.message}</div>
        )}
        
        <div className="message-meta">
          <span className="message-time">{formattedTime}</span>
          {message.readBy && message.readBy.length > 0 && (
            <span className="read-receipt">✓✓</span>
          )}
        </div>

        <div className="message-reactions">
          {Object.entries(reactions).map(([emoji, userIds]) => (
            <button
              key={emoji}
              className={`reaction ${userIds.includes(socket.id) ? 'active' : ''}`}
              onClick={() => handleReactionClick(emoji)}
              title={userIds.join(', ')}
            >
              {emoji} {userIds.length}
            </button>
          ))}
          
          <button
            className="add-reaction-btn"
            onClick={() => setShowReactions(!showReactions)}
          >
            +
          </button>
          
          {showReactions && (
            <div className="reaction-picker">
              {reactionEmojis.map(emoji => (
                <button
                  key={emoji}
                  className="reaction-option"
                  onClick={() => {
                    handleReactionClick(emoji);
                    setShowReactions(false);
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Message;


