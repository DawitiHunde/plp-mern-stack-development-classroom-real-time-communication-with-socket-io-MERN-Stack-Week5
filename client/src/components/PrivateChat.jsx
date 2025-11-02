import { useState, useEffect, useRef } from 'react';
import { useSocket } from '../socket/socket';
import Message from './Message';
import './PrivateChat.css';

function PrivateChat({ user, onClose }) {
  const { sendPrivateMessage, privateMessages, socket } = useSocket();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const messages = privateMessages[user.id] || [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      sendPrivateMessage(user.id, input.trim());
      setInput('');
    }
  };

  return (
    <div className="private-chat-overlay" onClick={onClose}>
      <div className="private-chat" onClick={(e) => e.stopPropagation()}>
        <div className="private-chat-header">
          <h3>💬 Private chat with {user.username}</h3>
          <button onClick={onClose} className="close-btn">✕</button>
        </div>
        
        <div className="private-chat-messages">
          {messages.length === 0 ? (
            <div className="empty-messages">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((message) => (
              <Message key={message.id} message={message} />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <form onSubmit={handleSubmit} className="private-chat-input">
          <input
            type="text"
            placeholder={`Message ${user.username}...`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            maxLength={1000}
          />
          <button type="submit" disabled={!input.trim()}>Send</button>
        </form>
      </div>
    </div>
  );
}

export default PrivateChat;


