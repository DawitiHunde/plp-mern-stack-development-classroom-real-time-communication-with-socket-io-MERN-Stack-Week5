import { useState, useRef, useEffect } from 'react';
import { useSocket } from '../socket/socket';
import './MessageInput.css';

function MessageInput({ currentRoom }) {
  const { sendMessage, sendFile, setTyping } = useSocket();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      setTyping(false, currentRoom);
    };
  }, [currentRoom, setTyping]);

  const handleInputChange = (e) => {
    setInput(e.target.value);

    if (!isTyping) {
      setIsTyping(true);
      setTyping(true, currentRoom);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      setTyping(false, currentRoom);
    }, 1000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage(input.trim(), currentRoom);
      setInput('');
      setIsTyping(false);
      setTyping(false, currentRoom);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      sendFile(file, file.name, file.type, currentRoom);
    }
    e.target.value = '';
  };

  return (
    <div className="message-input-container">
      <form onSubmit={handleSubmit} className="message-input-form">
        <button
          type="button"
          className="file-button"
          onClick={() => fileInputRef.current?.click()}
          title="Attach file"
        >
          📎
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          accept="image/*,application/pdf,.doc,.docx"
        />
        <input
          type="text"
          className="message-input"
          placeholder={`Message #${currentRoom}...`}
          value={input}
          onChange={handleInputChange}
          maxLength={1000}
        />
        <button type="submit" className="send-button" disabled={!input.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}

export default MessageInput;


