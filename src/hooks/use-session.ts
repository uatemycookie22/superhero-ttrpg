'use client';

import { useEffect, useState } from 'react';
import { useWebSocket } from '@/components/WebSocketProvider/WebSocketProvider';

interface SessionState {
  currentTurn?: string;
  turnOrder?: string[];
  notes?: string;
  [key: string]: any;
}

interface UseSessionOptions {
  sessionId: string;
  onStateUpdate?: (state: SessionState) => void;
  onPlayerJoin?: (playerId: string) => void;
  onPlayerLeave?: (playerId: string) => void;
}

export function useSession({
  sessionId,
  onStateUpdate,
  onPlayerJoin,
  onPlayerLeave,
}: UseSessionOptions) {
  const { socket, isConnected } = useWebSocket();
  const [sessionState, setSessionState] = useState<SessionState | null>(null);
  const [players, setPlayers] = useState<string[]>([]);

  useEffect(() => {
    if (!socket || !isConnected) return;

    // Join the session room
    socket.emit('session:join', sessionId);

    // Listen for session state updates
    socket.on('session:state:updated', (state: SessionState) => {
      setSessionState(state);
      onStateUpdate?.(state);
    });

    // Listen for player join events
    socket.on('player:joined', (playerId: string) => {
      setPlayers((prev) => [...prev, playerId]);
      onPlayerJoin?.(playerId);
    });

    // Listen for player leave events
    socket.on('player:left', (playerId: string) => {
      setPlayers((prev) => prev.filter((id) => id !== playerId));
      onPlayerLeave?.(playerId);
    });

    // Listen for character updates
    socket.on('character:updated', (data: any) => {
      console.log('[Session] Character updated:', data);
    });

    return () => {
      socket.emit('session:leave', sessionId);
      socket.off('session:state:updated');
      socket.off('player:joined');
      socket.off('player:left');
      socket.off('character:updated');
    };
  }, [socket, isConnected, sessionId, onStateUpdate, onPlayerJoin, onPlayerLeave]);

  const updateSessionState = (state: Partial<SessionState>) => {
    if (!socket) return;
    socket.emit('session:update-state', { sessionId, state });
  };

  const updateCharacter = (characterId: string, updates: any) => {
    if (!socket) return;
    socket.emit('character:update', { sessionId, characterId, updates });
  };

  return {
    sessionState,
    players,
    isConnected,
    updateSessionState,
    updateCharacter,
  };
}