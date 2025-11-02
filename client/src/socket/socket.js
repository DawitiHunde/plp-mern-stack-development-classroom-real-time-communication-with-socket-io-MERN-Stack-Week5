// socket.js - Socket.io client setup

import { io } from 'socket.io-client';
import { useEffect, useState, useCallback } from 'react';

// Socket.io connection URL
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

// Create socket instance
export const socket = io(SOCKET_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
});

// Custom hook for using socket.io
export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [lastMessage, setLastMessage] = useState(null);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState('general');
  const [notifications, setNotifications] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [privateMessages, setPrivateMessages] = useState({});
  const [messageReactions, setMessageReactions] = useState({});

  // Connect to socket server
  const connect = useCallback((username, room = 'general') => {
    socket.connect();
    if (username) {
      socket.emit('user_join', { username, room });
    }
  }, []);

  // Disconnect from socket server
  const disconnect = useCallback(() => {
    socket.disconnect();
  }, []);

  // Send a message
  const sendMessage = useCallback((message, room) => {
    socket.emit('send_message', { message, room: room || currentRoom });
  }, [currentRoom]);

  // Send a private message
  const sendPrivateMessage = useCallback((to, message) => {
    socket.emit('private_message', { to, message });
  }, []);

  // Set typing status
  const setTyping = useCallback((isTyping, room) => {
    socket.emit('typing', { isTyping, room: room || currentRoom });
  }, [currentRoom]);

  // Join a room
  const joinRoom = useCallback((room) => {
    socket.emit('join_room', room);
  }, []);

  // Leave a room
  const leaveRoom = useCallback((room) => {
    socket.emit('leave_room', room);
  }, []);

  // Add reaction to message
  const addReaction = useCallback((messageId, emoji) => {
    socket.emit('add_reaction', { messageId, emoji });
  }, []);

  // Remove reaction from message
  const removeReaction = useCallback((messageId, emoji) => {
    socket.emit('remove_reaction', { messageId, emoji });
  }, []);

  // Mark message as read
  const markRead = useCallback((messageId, room) => {
    socket.emit('mark_read', { messageId, room: room || currentRoom });
  }, [currentRoom]);

  // Send file
  const sendFile = useCallback((file, fileName, fileType, room) => {
    const reader = new FileReader();
    reader.onload = () => {
      socket.emit('send_file', {
        file: reader.result,
        fileName,
        fileType,
        room: room || currentRoom,
      });
    };
    reader.readAsDataURL(file);
  }, [currentRoom]);

  // Search messages
  const searchMessages = useCallback((query, room) => {
    socket.emit('search_messages', { query, room: room || currentRoom });
  }, [currentRoom]);

  // Get messages page
  const getMessages = useCallback((room, page) => {
    socket.emit('get_messages', { room: room || currentRoom, page, limit: 50 });
  }, [currentRoom]);

  // Get reactions for message
  const getReactions = useCallback((messageId) => {
    socket.emit('get_reactions', messageId);
  }, []);

  // Socket event listeners
  useEffect(() => {
    // Connection events
    const onConnect = () => {
      setIsConnected(true);
    };

    const onDisconnect = () => {
      setIsConnected(false);
    };

    const onReconnect = () => {
      setIsConnected(true);
    };

    // Message events
    const onReceiveMessage = (message) => {
      setLastMessage(message);
      
      if (message.isPrivate) {
        const otherUserId = message.senderId === socket.id ? message.receiverId : message.senderId;
        setPrivateMessages(prev => ({
          ...prev,
          [otherUserId]: [...(prev[otherUserId] || []), message],
        }));
      } else {
        setMessages((prev) => {
          // Avoid duplicates
          if (prev.some(msg => msg.id === message.id)) {
            return prev;
          }
          return [...prev, message];
        });
      }

      // Update unread count if not in current room
      if (!message.isPrivate && message.room !== currentRoom) {
        setUnreadCounts(prev => ({
          ...prev,
          [message.room]: (prev[message.room] || 0) + 1,
        }));
      }

      // Play notification sound
      if (message.senderId !== socket.id) {
        try {
          const audio = new Audio('/notification.mp3');
          audio.volume = 0.5;
          audio.play().catch(() => {});
        } catch (e) {
          // Ignore if sound file doesn't exist
        }
      }
    };

    const onPrivateMessage = (message) => {
      setLastMessage(message);
      const otherUserId = message.senderId === socket.id ? message.receiverId : message.senderId;
      setPrivateMessages(prev => ({
        ...prev,
        [otherUserId]: [...(prev[otherUserId] || []), message],
      }));
    };

    const onRoomHistory = ({ room, messages: roomMessages }) => {
      if (room === currentRoom) {
        setMessages(roomMessages);
      }
    };

    const onMessagesPage = ({ messages: pageMessages, page, hasMore }) => {
      if (page === 0) {
        setMessages(pageMessages);
      } else {
        setMessages(prev => [...pageMessages, ...prev]);
      }
    };

    const onMessageSent = ({ messageId, status }) => {
      // Update message status if needed
      setMessages(prev => prev.map(msg =>
        msg.id === messageId ? { ...msg, status } : msg
      ));
    };

    // User events
    const onUserList = (userList) => {
      setUsers(userList);
    };

    const onUserJoined = (user) => {
      // Handled by server system messages
    };

    const onUserLeft = (user) => {
      // Handled by server system messages
    };

    // Room events
    const onRoomList = (roomList) => {
      setRooms(roomList);
    };

    const onCurrentRoom = (room) => {
      setCurrentRoom(room);
      // Clear unread count for this room
      setUnreadCounts(prev => ({ ...prev, [room]: 0 }));
    };

    // Typing events
    const onTypingUsers = ({ room, users: typingUsersList }) => {
      setTypingUsers(prev => ({ ...prev, [room]: typingUsersList }));
    };

    // Reaction events
    const onReactionAdded = ({ messageId, emoji, userId }) => {
      setMessageReactions(prev => ({
        ...prev,
        [messageId]: {
          ...(prev[messageId] || {}),
          [emoji]: [...(prev[messageId]?.[emoji] || []), userId],
        },
      }));
    };

    const onReactionRemoved = ({ messageId, emoji, userId }) => {
      setMessageReactions(prev => {
        const reactions = { ...prev[messageId] };
        if (reactions[emoji]) {
          reactions[emoji] = reactions[emoji].filter(id => id !== userId);
        }
        return { ...prev, [messageId]: reactions };
      });
    };

    const onMessageReactions = ({ messageId, reactions }) => {
      setMessageReactions(prev => ({ ...prev, [messageId]: reactions }));
    };

    // Notification events
    const onNotification = (notification) => {
      setNotifications(prev => [...prev, notification]);
      
      // Browser notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(notification.sender || 'New message', {
          body: notification.message,
          icon: '/favicon.ico',
        });
      }

      // Update unread counts
      if (notification.type === 'new_message') {
        setUnreadCounts(prev => ({
          ...prev,
          [notification.room]: (prev[notification.room] || 0) + 1,
        }));
      }
    };

    // Search results
    const onSearchResults = (results) => {
      // Handle search results if needed
      console.log('Search results:', results);
    };

    // Register event listeners
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('reconnect', onReconnect);
    socket.on('receive_message', onReceiveMessage);
    socket.on('private_message', onPrivateMessage);
    socket.on('room_history', onRoomHistory);
    socket.on('messages_page', onMessagesPage);
    socket.on('message_sent', onMessageSent);
    socket.on('user_list', onUserList);
    socket.on('user_joined', onUserJoined);
    socket.on('user_left', onUserLeft);
    socket.on('room_list', onRoomList);
    socket.on('current_room', onCurrentRoom);
    socket.on('typing_users', onTypingUsers);
    socket.on('reaction_added', onReactionAdded);
    socket.on('reaction_removed', onReactionRemoved);
    socket.on('message_reactions', onMessageReactions);
    socket.on('notification', onNotification);
    socket.on('search_results', onSearchResults);

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Clean up event listeners
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('reconnect', onReconnect);
      socket.off('receive_message', onReceiveMessage);
      socket.off('private_message', onPrivateMessage);
      socket.off('room_history', onRoomHistory);
      socket.off('messages_page', onMessagesPage);
      socket.off('message_sent', onMessageSent);
      socket.off('user_list', onUserList);
      socket.off('user_joined', onUserJoined);
      socket.off('user_left', onUserLeft);
      socket.off('room_list', onRoomList);
      socket.off('current_room', onCurrentRoom);
      socket.off('typing_users', onTypingUsers);
      socket.off('reaction_added', onReactionAdded);
      socket.off('reaction_removed', onReactionRemoved);
      socket.off('message_reactions', onMessageReactions);
      socket.off('notification', onNotification);
      socket.off('search_results', onSearchResults);
    };
  }, [currentRoom]);

  return {
    socket,
    isConnected,
    lastMessage,
    messages,
    users,
    typingUsers,
    rooms,
    currentRoom,
    notifications,
    unreadCounts,
    privateMessages,
    messageReactions,
    connect,
    disconnect,
    sendMessage,
    sendPrivateMessage,
    setTyping,
    joinRoom,
    leaveRoom,
    addReaction,
    removeReaction,
    markRead,
    sendFile,
    searchMessages,
    getMessages,
    getReactions,
  };
};

export default socket; 