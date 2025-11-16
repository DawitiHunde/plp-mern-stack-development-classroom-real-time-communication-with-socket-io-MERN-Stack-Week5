import { useState, useEffect } from 'react'
import { io } from 'socket.io-client'
import Login from './components/Login'
import Chat from './components/Chat'
import './App.css'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

function App() {
  const [socket, setSocket] = useState(null)
  const [user, setUser] = useState(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    })

    newSocket.on('connect', () => {
      console.log('Connected to server')
      setIsConnected(true)
    })

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server')
      setIsConnected(false)
    })

    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error)
      setIsConnected(false)
    })

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [])

  const handleLogin = (username, avatar) => {
    if (socket && username) {
      socket.emit('join', { username, avatar })
    }
  }

  const handleJoined = (userData) => {
    setUser(userData.user)
  }

  if (!socket || !isConnected) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
        <p>Connecting to server...</p>
      </div>
    )
  }

  if (!user) {
    return <Login onLogin={handleLogin} socket={socket} onJoined={handleJoined} />
  }

  return <Chat socket={socket} user={user} setUser={setUser} />
}

export default App

