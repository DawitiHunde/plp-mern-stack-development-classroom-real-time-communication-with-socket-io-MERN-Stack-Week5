import { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import './MessageInput.css'

function MessageInput({ onSendMessage, socket, currentRoom }) {
  const [message, setMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [uploading, setUploading] = useState(false)
  const typingTimeoutRef = useRef(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      if (socket && isTyping) {
        socket.emit('typing', { roomId: currentRoom, isTyping: false })
      }
    }
  }, [socket, currentRoom, isTyping])

  const handleInputChange = (e) => {
    setMessage(e.target.value)

    if (!isTyping && e.target.value.trim()) {
      setIsTyping(true)
      if (socket) {
        socket.emit('typing', { roomId: currentRoom, isTyping: true })
      }
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
      if (socket) {
        socket.emit('typing', { roomId: currentRoom, isTyping: false })
      }
    }, 1000)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (message.trim() && !uploading) {
      onSendMessage(message, 'text')
      setMessage('')
      
      // Stop typing indicator
      setIsTyping(false)
      if (socket) {
        socket.emit('typing', { roomId: currentRoom, isTyping: false })
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleFileSelect = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      const fileUrl = `http://localhost:5000${response.data.url}`
      const fileType = file.type.startsWith('image/') ? 'image' : 'file'
      
      onSendMessage(fileUrl, fileType, response.data.filename || file.name)
    } catch (error) {
      console.error('File upload error:', error)
      alert('Failed to upload file. Please try again.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className="message-input-container">
      <form onSubmit={handleSubmit} className="message-input-form">
        <button
          type="button"
          className="attach-btn"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          title="Attach file"
        >
          {uploading ? '⏳' : '📎'}
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          accept="image/*,.pdf,.doc,.docx,.txt"
        />
        <textarea
          value={message}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="Type a message... (Press Enter to send, Shift+Enter for new line)"
          rows={1}
          className="message-input"
          disabled={uploading}
        />
        <button
          type="submit"
          className="send-btn"
          disabled={!message.trim() || uploading}
        >
          ➤
        </button>
      </form>
    </div>
  )
}

export default MessageInput

