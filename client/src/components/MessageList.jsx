import { useEffect, useRef } from 'react';
import Message from './Message';
import './MessageList.css';

function MessageList({ messages, typingUsers, currentRoom }) {
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="message-list" ref={messagesContainerRef}>
      {messages.length === 0 ? (
        <div className="empty-messages">
          <p>No messages yet. Start the conversation!</p>
        </div>
      ) : (
        messages.map((message) => (
          <Message key={message.id} message={message} />
        ))
      )}
      
      {typingUsers.length > 0 && (
        <div className="typing-indicator">
          {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}

export default MessageList;


