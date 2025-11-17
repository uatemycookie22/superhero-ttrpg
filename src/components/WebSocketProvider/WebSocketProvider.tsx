'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { io, type Socket } from 'socket.io-client';

interface WebSocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const WebSocketContext = createContext<WebSocketContextType>({
  socket: null,
  isConnected: false,
});

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Only connect if WebSocket URL is configured
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL;
    
    if (!wsUrl) {
      console.log('[WebSocket] Skipping connection - NEXT_PUBLIC_WS_URL not configured');
      return;
    }

    console.log('[WebSocket] Connecting to:', wsUrl);

    // Initialize Socket.IO client
    const socketInstance = io(wsUrl, {
      path: '/api/websocket',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
    });

    socketInstance.on('connect', () => {
      console.log('[WebSocket] Connected');
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('[WebSocket] Disconnected');
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      // Silently fail - server not ready yet
      console.warn('[WebSocket] Connection failed - WebSocket server not running');
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within WebSocketProvider');
  }
  return context;
}