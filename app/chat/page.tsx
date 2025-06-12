// components/WebSocketComponent.js
import { useEffect, useState } from 'react';

export default function WebSocketComponent() {
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [input, setInput] = useState('');

  useEffect(() => {
    // Create WebSocket connection when component mounts
    const ws = new WebSocket('ws://localhost:8765/user');
    
    ws.onopen = () => {
      console.log('WebSocket Connected');
      setSocket(ws);
    };

    ws.onmessage = (event) => {
      const newMessage = JSON.parse(event.data);
      setMessages(prev => [...prev, newMessage]);
    };

    ws.onclose = () => {
      console.log('WebSocket Disconnected');
      setSocket(null);
    };

    // Clean up on unmount
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, []);

  const sendMessage = () => {
    if (socket && input) {
      socket.send(JSON.stringify({ message: input }));
      setInput('');
    }
  };

  return (
    <div>
      <h2>WebSocket Messages</h2>
      <ul>
        {messages.map((msg, i) => (
          <li key={i}>{msg.message}</li>
        ))}
      </ul>
      <input 
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type a message"
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}