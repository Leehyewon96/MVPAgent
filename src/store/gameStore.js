import { create } from 'zustand';

export const useGameStore = create((set, get) => ({
  games: [],
  currentGame: null,
  playSession: null,

  setGames: (games) => set({ games }),

  setCurrentGame: (game) => set({ currentGame: game }),

  startPlaySession: (gameId) => {
    set({
      playSession: {
        gameId,
        startedAt: Date.now(),
        events: [],
      },
    });
  },

  addPlayEvent: (event) => {
    const session = get().playSession;
    if (!session) return;
    set({
      playSession: {
        ...session,
        events: [...session.events, { ...event, timestamp: Date.now() }],
      },
    });
  },

  endPlaySession: (reason) => {
    const session = get().playSession;
    if (!session) return null;

    const completedSession = {
      ...session,
      endedAt: Date.now(),
      duration: Date.now() - session.startedAt,
      endReason: reason,
    };

    set({ playSession: null });
    return completedSession;
  },
}));
