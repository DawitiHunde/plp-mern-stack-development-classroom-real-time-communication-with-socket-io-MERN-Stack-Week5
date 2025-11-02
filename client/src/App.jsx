import { useState } from 'react';
import { useSocket } from './socket/socket';
import Login from './components/Login';
import Chat from './components/Chat';
import './App.css';

function App() {
  const [username, setUsername] = useState(null);
  const { isConnected } = useSocket();

  const handleLogin = (name) => {
    setUsername(name);
  };

  const handleLogout = () => {
    setUsername(null);
    window.location.reload();
  };

  if (!username) {
    return <Login onLogin={handleLogin} />;
  }

  return <Chat username={username} onLogout={handleLogout} />;
}

export default App;


