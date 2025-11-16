import { useState, useEffect } from 'react'
import './Login.css'

function Login({ onLogin, socket, onJoined }) {
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (socket) {
      socket.on('joined', (data) => {
        onJoined(data)
      })

      socket.on('error', (data) => {
        setError(data.message)
      })

      return () => {
        socket.off('joined')
        socket.off('error')
      }
    }
  }, [socket, onJoined])

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    
    if (username.trim() === '') {
      setError('Please enter a username')
      return
    }

    onLogin(username.trim())
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>💬 Real-Time Chat</h1>
        <p>Enter your username to start chatting</p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            maxLength={20}
            autoFocus
          />
          {error && <div className="error-message">{error}</div>}
          <button type="submit">Join Chat</button>
        </form>
      </div>
    </div>
  )
}

export default Login

