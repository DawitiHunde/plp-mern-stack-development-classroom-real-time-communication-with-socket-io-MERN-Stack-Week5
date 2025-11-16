import { forwardRef, useImperativeHandle, useEffect, useState } from 'react'
import './NotificationManager.css'

const NotificationManager = forwardRef((props, ref) => {
  const [notifications, setNotifications] = useState([])
  const [permission, setPermission] = useState('default')

  useEffect(() => {
    // Request notification permission
    if ('Notification' in window) {
      Notification.requestPermission().then((perm) => {
        setPermission(perm)
      })
    }
  }, [])

  useImperativeHandle(ref, () => ({
    showNotification: (username, message, roomId) => {
      const notification = {
        id: Date.now(),
        username,
        message,
        roomId,
        timestamp: new Date()
      }

      setNotifications((prev) => [...prev, notification])

      // Browser notification
      if (permission === 'granted') {
        new Notification(`${username} sent a message`, {
          body: message.length > 50 ? message.substring(0, 50) + '...' : message,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: roomId
        })
      }

      // Sound notification (using Web Audio API for a simple beep)
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)
        
        oscillator.frequency.value = 800
        oscillator.type = 'sine'
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)
        
        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.2)
      } catch (err) {
        console.log('Could not play notification sound:', err)
      }

      // Auto-remove notification after 5 seconds
      setTimeout(() => {
        setNotifications((prev) =>
          prev.filter((n) => n.id !== notification.id)
        )
      }, 5000)
    }
  }))

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  return (
    <div className="notification-container">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="notification-toast"
          onClick={() => removeNotification(notification.id)}
        >
          <div className="notification-header">
            <strong>{notification.username}</strong>
            <button
              className="notification-close"
              onClick={(e) => {
                e.stopPropagation()
                removeNotification(notification.id)
              }}
            >
              ✕
            </button>
          </div>
          <div className="notification-message">{notification.message}</div>
        </div>
      ))}
    </div>
  )
})

NotificationManager.displayName = 'NotificationManager'

export default NotificationManager

