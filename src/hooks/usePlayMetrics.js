import { useState, useEffect, useCallback, useRef } from 'react';
import { useGameStore } from '../store/gameStore';

const DEV_API = 'http://localhost:3100';

async function syncGamesToServer(games) {
  for (const game of games) {
    try {
      await fetch(`${DEV_API}/api/games`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(game),
      });
    } catch { break; }
  }
}

export function usePlayMetrics() {
  const [stats, setStats] = useState({});
  const [global, setGlobal] = useState({ totalGames: 0, totalSessions: 0, uniqueVisitors: 0, totalPlayTime: 0 });
  const [connected, setConnected] = useState(false);
  const eventSourceRef = useRef(null);
  const syncedRef = useRef(false);
  const gamesRef = useRef([]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${DEV_API}/api/game-stats`);
      if (!res.ok) return;
      const data = await res.json();
      const { _global, ...gameStats } = data;
      setStats(gameStats);
      if (_global) setGlobal(_global);
    } catch {
      // server not reachable
    }
  }, []);

  const doSync = useCallback(() => {
    const games = gamesRef.current;
    if (games.length > 0) {
      syncGamesToServer(games).then(fetchStats);
    }
  }, [fetchStats]);

  useEffect(() => {
    const unsub = useGameStore.subscribe((state) => {
      gamesRef.current = state.games;
      if (state.games.length > 0 && !syncedRef.current) {
        syncedRef.current = true;
        syncGamesToServer(state.games).then(fetchStats);
      }
    });
    gamesRef.current = useGameStore.getState().games;
    return unsub;
  }, [fetchStats]);

  useEffect(() => {
    fetchStats();

    let es;
    try {
      es = new EventSource(`${DEV_API}/api/play-stream`);
      eventSourceRef.current = es;

      es.onopen = () => {
        setConnected(true);
      };
      es.onerror = () => setConnected(false);

      es.addEventListener('play_event', () => {
        fetchStats();
      });

      es.addEventListener('game_registered', () => {
        fetchStats();
      });
    } catch {
      // SSE not supported or server down
    }

    const interval = setInterval(fetchStats, 30000);

    return () => {
      if (es) es.close();
      clearInterval(interval);
      setConnected(false);
    };
  }, [fetchStats]);

  const getGameStats = useCallback(
    (gameId) => stats[gameId] || { totalSessions: 0, uniqueVisitors: 0, avgDuration: 0, activeSessions: 0, dailyStats: [] },
    [stats],
  );

  const getPlayUrl = useCallback(
    (gameId) => `${DEV_API}/play/${gameId}`,
    [],
  );

  return { stats, global, connected, getGameStats, getPlayUrl, refresh: fetchStats };
}
