import { useEffect, useRef } from 'react'
import Message from './Message'
import './MessageList.css'

function MessageList({
  messages,
  currentUser,
  typingUsers,
  onLoadMore,
  hasMore,
  messagesEndRef,
  socket,
  currentRoom
}) {
  const messagesContainerRef = useRef(null)
  const prevMessagesLengthRef = useRef(messages.length)

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (messages.length > prevMessagesLengthRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
    prevMessagesLengthRef.current = messages.length
  }, [messages.length, messagesEndRef])

  const handleReaction = (messageId, reaction) => {
    if (socket) {
      const message = messages.find(m => m.id === messageId)
      const hasReacted = message?.reactions?.[reaction]?.includes(currentUser.id)
      
      if (hasReacted) {
        socket.emit('removeReaction', { messageId, roomId: currentRoom, reaction })
      } else {
        socket.emit('addReaction', { messageId, roomId: currentRoom, reaction })
      }
    }
  }

  return (
    <div className="message-list" ref={messagesContainerRef}>
      {hasMore && (
        <div className="load-more-container">
          <button className="load-more-btn" onClick={onLoadMore}>
            Load older messages
          </button>
        </div>
      )}

      {messages.length === 0 ? (
        <div className="empty-messages">
          <p>No messages yet. Start the conversation!</p>
        </div>
      ) : (
        messages.map((message, index) => {
          const showAvatar = index === 0 || messages[index - 1].userId !== message.userId
          const showTimestamp =
            index === 0 ||
            new Date(message.timestamp) - new Date(messages[index - 1].timestamp) > 300000 // 5 minutes

          return (
            <Message
              key={message.id}
              message={message}
              currentUser={currentUser}
              showAvatar={showAvatar}
              showTimestamp={showTimestamp}
              onReaction={handleReaction}
            />
          )
        })
      )}

      {typingUsers.length > 0 && (
        <div className="typing-indicator">
          <div className="typing-dots">
            {typingUsers.map((user) => (
              <span key={user.id}>{user.username}</span>
            ))}
            {typingUsers.length === 1 ? ' is typing' : ' are typing'}
            <span className="dots">
              <span>.</span>
              <span>.</span>
              <span>.</span>
            </span>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  )
}

export default MessageList

