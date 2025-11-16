import { format, formatDistanceToNow } from 'date-fns'
import './Message.css'

const REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏']

function Message({ message, currentUser, showAvatar, showTimestamp, onReaction }) {
  const isOwnMessage = message.userId === currentUser.id

  const handleReactionClick = (reaction) => {
    if (onReaction) {
      onReaction(message.id, reaction)
    }
  }

  const renderContent = () => {
    if (message.type === 'image') {
      return (
        <div className="message-image">
          <img src={message.text} alt="Shared image" />
        </div>
      )
    } else if (message.type === 'file') {
      return (
        <div className="message-file">
          <a href={message.text} target="_blank" rel="noopener noreferrer" download>
            📎 {message.filename || 'File'}
          </a>
        </div>
      )
    }
    return <div className="message-text">{message.text}</div>
  }

  return (
    <div className={`message-wrapper ${isOwnMessage ? 'own-message' : ''}`}>
      {showTimestamp && (
        <div className="message-timestamp-divider">
          {format(new Date(message.timestamp), 'MMM d, yyyy h:mm a')}
        </div>
      )}

      <div className={`message ${isOwnMessage ? 'own' : 'other'}`}>
        {showAvatar && !isOwnMessage && (
          <img src={message.avatar} alt={message.username} className="message-avatar" />
        )}

        <div className="message-content">
          {!isOwnMessage && showAvatar && (
            <div className="message-username">{message.username}</div>
          )}

          <div className="message-bubble">
            {renderContent()}

            <div className="message-reactions">
              {Object.entries(message.reactions || {}).map(([reaction, userIds]) => (
                <button
                  key={reaction}
                  className={`reaction-btn ${
                    userIds.includes(currentUser.id) ? 'active' : ''
                  }`}
                  onClick={() => handleReactionClick(reaction)}
                  title={userIds.length > 1 ? `${userIds.length} reactions` : ''}
                >
                  {reaction} {userIds.length > 1 && <span>{userIds.length}</span>}
                </button>
              ))}

              <div className="reaction-picker">
                {REACTIONS.map((reaction) => (
                  <button
                    key={reaction}
                    className="reaction-option"
                    onClick={() => handleReactionClick(reaction)}
                    title="Add reaction"
                  >
                    {reaction}
                  </button>
                ))}
              </div>
            </div>

            <div className="message-footer">
              <span className="message-time">
                {format(new Date(message.timestamp), 'h:mm a')}
              </span>
              {isOwnMessage && (
                <span className="read-receipt">
                  {message.readBy && message.readBy.length > 1 ? '✓✓' : '✓'}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Message

