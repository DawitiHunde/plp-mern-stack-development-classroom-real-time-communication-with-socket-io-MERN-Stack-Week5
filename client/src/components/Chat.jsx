import { useState, useEffect, useRef } from 'react'
import MessageList from './MessageList'
import MessageInput from './MessageInput'
import UserList from './UserList'
import RoomList from './RoomList'
import NotificationManager from './NotificationManager'
import './Chat.css'

function Chat({ socket, user, setUser }) {
  const [messages, setMessages] = useState([])
  const [rooms, setRooms] = useState([])
  const [currentRoom, setCurrentRoom] = useState('global')
  const [onlineUsers, setOnlineUsers] = useState([])
  const [typingUsers, setTypingUsers] = useState([])
  const [showRooms, setShowRooms] = useState(false)
  const [showUsers, setShowUsers] = useState(false)
  const [unreadCounts, setUnreadCounts] = useState({})
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState(null)
  const messagesEndRef = useRef(null)
  const notificationManagerRef = useRef(null)

  useEffect(() => {
    if (!socket) return

    // Handle successful join
    socket.on('joined', (data) => {
      setRooms(data.rooms || [])
      setOnlineUsers(data.onlineUsers || [])
    })

    // Handle new messages
    socket.on('newMessage', (data) => {
      const { message } = data
      if (message.roomId === currentRoom) {
        setMessages((prev) => [...prev, message])
        scrollToBottom()
        
        // Mark as read if in current room
        if (message.userId !== user.id) {
          socket.emit('markAsRead', { messageId: message.id, roomId: currentRoom })
        }
      } else {
        // Increment unread count
        setUnreadCounts((prev) => ({
          ...prev,
          [message.roomId]: (prev[message.roomId] || 0) + 1
        }))
      }

      // Show notification
      if (notificationManagerRef.current && message.userId !== user.id) {
        notificationManagerRef.current.showNotification(
          message.username,
          message.text,
          message.roomId
        )
      }
    })

    // Handle private messages
    socket.on('newPrivateMessage', (data) => {
      const { message } = data
      if (message.roomId === currentRoom) {
        setMessages((prev) => [...prev, message])
        scrollToBottom()
      } else {
        setUnreadCounts((prev) => ({
          ...prev,
          [message.roomId]: (prev[message.roomId] || 0) + 1
        }))
      }

      if (notificationManagerRef.current && message.userId !== user.id) {
        notificationManagerRef.current.showNotification(
          message.username,
          message.text,
          message.roomId
        )
      }
    })

    socket.on('privateMessageNotification', (data) => {
      if (notificationManagerRef.current) {
        notificationManagerRef.current.showNotification(
          data.from.username,
          data.message,
          data.roomId
        )
      }
    })

    // Handle messages list
    socket.on('messages', (data) => {
      if (data.roomId === currentRoom) {
        setMessages(data.messages || [])
        scrollToBottom()
        // Clear unread count for current room
        setUnreadCounts((prev) => {
          const newCounts = { ...prev }
          delete newCounts[data.roomId]
          return newCounts
        })
      }
    })

    // Handle typing indicators
    socket.on('typing', (data) => {
      if (data.roomId === currentRoom) {
        setTypingUsers(data.users || [])
      }
    })

    // Handle user join/leave
    socket.on('userJoined', (data) => {
      setOnlineUsers(data.onlineUsers || [])
    })

    socket.on('userLeft', (data) => {
      setOnlineUsers(data.onlineUsers || [])
    })

    // Handle room creation
    socket.on('roomCreated', (data) => {
      setRooms((prev) => [...prev, data.room])
    })

    // Handle search results
    socket.on('searchResults', (data) => {
      if (data.roomId === currentRoom) {
        setSearchResults(data.messages)
      }
    })

    // Handle message read receipts
    socket.on('messageRead', (data) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === data.messageId
            ? { ...msg, readBy: [...(msg.readBy || []), data.userId] }
            : msg
        )
      )
    })

    // Handle reactions
    socket.on('reactionAdded', (data) => {
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id === data.messageId) {
            const newReactions = { ...msg.reactions }
            if (!newReactions[data.reaction]) {
              newReactions[data.reaction] = []
            }
            if (!newReactions[data.reaction].includes(data.userId)) {
              newReactions[data.reaction].push(data.userId)
            }
            return { ...msg, reactions: newReactions }
          }
          return msg
        })
      )
    })

    socket.on('reactionRemoved', (data) => {
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id === data.messageId && msg.reactions[data.reaction]) {
            const newReactions = { ...msg.reactions }
            newReactions[data.reaction] = newReactions[data.reaction].filter(
              (id) => id !== data.userId
            )
            if (newReactions[data.reaction].length === 0) {
              delete newReactions[data.reaction]
            }
            return { ...msg, reactions: newReactions }
          }
          return msg
        })
      )
    })

    return () => {
      socket.off('joined')
      socket.off('newMessage')
      socket.off('newPrivateMessage')
      socket.off('privateMessageNotification')
      socket.off('messages')
      socket.off('typing')
      socket.off('userJoined')
      socket.off('userLeft')
      socket.off('roomCreated')
      socket.off('searchResults')
      socket.off('messageRead')
      socket.off('reactionAdded')
      socket.off('reactionRemoved')
    }
  }, [socket, currentRoom, user])

  useEffect(() => {
    // Join the current room
    if (socket && currentRoom) {
      socket.emit('joinRoom', { roomId: currentRoom })
      setMessages([])
      setSearchResults(null)
    }
  }, [currentRoom, socket])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = (text, type = 'text', filename = null) => {
    if (socket && text.trim()) {
      const messageData = {
        roomId: currentRoom,
        text: text.trim(),
        type
      }
      if (filename) {
        messageData.filename = filename
      }
      socket.emit('sendMessage', messageData)
    }
  }

  const handleCreateRoom = (name) => {
    if (socket && name.trim()) {
      socket.emit('createRoom', { name: name.trim() })
    }
  }

  const handleSendPrivateMessage = (recipientUsername, text) => {
    if (socket && text.trim()) {
      socket.emit('sendPrivateMessage', {
        recipientUsername,
        text: text.trim()
      })
    }
  }

  const handleSearch = (query) => {
    setSearchQuery(query)
    if (query.trim() && socket) {
      socket.emit('searchMessages', {
        roomId: currentRoom,
        query: query.trim()
      })
    } else {
      setSearchResults(null)
    }
  }

  const handleLoadMore = () => {
    if (messages.length > 0 && socket) {
      const oldestMessageId = messages[0].id
      socket.emit('loadMessages', {
        roomId: currentRoom,
        beforeMessageId: oldestMessageId,
        limit: 50
      })
    }
  }

  const handleLogout = () => {
    if (socket) {
      socket.disconnect()
    }
    setUser(null)
  }

  const displayMessages = searchResults || messages

  return (
    <div className="chat-container">
      <NotificationManager ref={notificationManagerRef} />
      
      <div className="chat-sidebar">
        <div className="chat-header">
          <div className="user-info">
            <img src={user.avatar} alt={user.username} className="user-avatar" />
            <span className="user-name">{user.username}</span>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Logout">
            🚪
          </button>
        </div>

        <div className="sidebar-tabs">
          <button
            className={`tab-btn ${!showRooms && !showUsers ? 'active' : ''}`}
            onClick={() => {
              setShowRooms(false)
              setShowUsers(false)
            }}
          >
            💬 Chat
          </button>
          <button
            className={`tab-btn ${showRooms ? 'active' : ''}`}
            onClick={() => {
              setShowRooms(!showRooms)
              setShowUsers(false)
            }}
          >
            🏠 Rooms
          </button>
          <button
            className={`tab-btn ${showUsers ? 'active' : ''}`}
            onClick={() => {
              setShowUsers(!showUsers)
              setShowRooms(false)
            }}
          >
            👥 Users
          </button>
        </div>

        {showRooms && (
          <RoomList
            rooms={rooms}
            currentRoom={currentRoom}
            onSelectRoom={setCurrentRoom}
            onCreateRoom={handleCreateRoom}
            unreadCounts={unreadCounts}
          />
        )}

        {showUsers && (
          <UserList
            users={onlineUsers}
            currentUser={user}
            onSendPrivateMessage={handleSendPrivateMessage}
            onSelectPrivateChat={(roomId) => {
              setCurrentRoom(roomId)
              setShowUsers(false)
            }}
          />
        )}

        {!showRooms && !showUsers && (
          <div className="room-info">
            <h3>Current Room: {rooms.find(r => r.id === currentRoom)?.name || currentRoom}</h3>
            <div className="online-count">
              {onlineUsers.length} user{onlineUsers.length !== 1 ? 's' : ''} online
            </div>
          </div>
        )}
      </div>

      <div className="chat-main">
        <div className="chat-messages-header">
          <h2>{rooms.find(r => r.id === currentRoom)?.name || 'Chat'}</h2>
          <div className="search-box">
            <input
              type="text"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
            {searchResults && (
              <button
                className="clear-search"
                onClick={() => {
                  setSearchQuery('')
                  setSearchResults(null)
                }}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <MessageList
          messages={displayMessages}
          currentUser={user}
          typingUsers={typingUsers}
          onLoadMore={handleLoadMore}
          hasMore={!searchResults && messages.length >= 50}
          messagesEndRef={messagesEndRef}
          socket={socket}
          currentRoom={currentRoom}
        />

        <MessageInput
          onSendMessage={handleSendMessage}
          socket={socket}
          currentRoom={currentRoom}
        />
      </div>
    </div>
  )
}

export default Chat

