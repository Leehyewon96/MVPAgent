import { useCallback } from 'react';
import { useGameStore } from '../store/gameStore';
import { pushRealtimeData } from '../firebase/queries';
import { useAuthStore } from '../store/authStore';

export function useGameSession() {
  const { playSession, startPlaySession, addPlayEvent, endPlaySession } = useGameStore();
  const user = useAuthStore((s) => s.user);

  const start = useCallback(
    (gameId) => {
      startPlaySession(gameId);
    },
    [startPlaySession],
  );

  const logEvent = useCallback(
    (event) => {
      addPlayEvent(event);
    },
    [addPlayEvent],
  );

  const end = useCallback(
    async (reason) => {
      const session = endPlaySession(reason);
      if (session && user) {
        try {
          await pushRealtimeData(`playLogs/${session.gameId}`, {
            userId: user.uid,
            ...session,
          });
        } catch (err) {
          console.error('Failed to save play session:', err);
        }
      }
      return session;
    },
    [endPlaySession, user],
  );

  return { playSession, start, logEvent, end };
}
