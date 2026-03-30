import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useGameStore } from '../store/gameStore';

export function useGameSync() {
  const user = useAuthStore((s) => s.user);
  const setUid = useGameStore((s) => s.setUid);

  useEffect(() => {
    setUid(user?.uid ?? null);
  }, [user?.uid, setUid]);
}
