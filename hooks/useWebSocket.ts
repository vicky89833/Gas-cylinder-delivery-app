import { useEffect, useRef, useState } from 'react';

type WebSocketMessage = {
  from: string;
  group: string;
  message: string;
  timestamp: number;
};

type WebSocketGroup = 'user' | 'staff' | 'admin';

export const useWebSocket = (group: WebSocketGroup) => {
  const [ipAddress, setIpAddress] = useState<string>('unknown-ip');
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<WebSocketMessage[]>([]);
  const socketRef = useRef<WebSocket | null>(null);

  // Get client IP address
  const getIPAddress = async (): Promise<string> => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.error("Couldn't get IP address:", error);
      return 'unknown-ip';
    }
  };

  useEffect(() => {
    const connectSocket = async () => {
      const ip = await getIPAddress();
      setIpAddress(ip);

      // Create WebSocket connection
      const socket = new WebSocket(`ws://localhost:8765/${group}`);
      socketRef.current = socket;

      socket.onopen = () => {
        setIsConnected(true);
        console.log(`Connected as ${group} from ${ip}`);
      };

      socket.onmessage = (event) => {
        try {
          const msg: WebSocketMessage = JSON.parse(event.data);
          setMessages((prev) => [...prev, msg]);
          console.log(`[${msg.group} ${msg.from}]: ${msg.message}`);
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      };

      socket.onclose = () => {
        setIsConnected(false);
        console.log(`Disconnected ${group} connection`);
      };

      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    };

    connectSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [group]);

  const sendMessage = (message: string) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(message);
    }
  };

  return { ipAddress, isConnected, messages, sendMessage };
};