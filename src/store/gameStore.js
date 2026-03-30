import { create } from 'zustand';
import { db, isConfigured } from '../firebase/config';

const DEV_API = 'http://localhost:3100';

async function registerGameOnServer(game) {
  try {
    await fetch(`${DEV_API}/api/games`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(game),
    });
  } catch {
    // server may not be running
  }
}

let firestoreModules = null;

async function getFirestoreModules() {
  if (!firestoreModules) {
    firestoreModules = await import('firebase/firestore');
  }
  return firestoreModules;
}

function localKey(uid) {
  return `mvpagent_games_${uid}`;
}

function saveToLocal(uid, games) {
  try {
    localStorage.setItem(localKey(uid), JSON.stringify(games));
  } catch (e) {
    console.warn('localStorage save failed:', e);
  }
}

function loadFromLocal(uid) {
  try {
    const raw = localStorage.getItem(localKey(uid));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function saveToFirestore(uid, game) {
  if (!isConfigured || !db) return;
  try {
    const { doc, setDoc, collection } = await getFirestoreModules();
    const gameId = game.id || game.gameId;
    await setDoc(doc(collection(db, 'users', uid, 'games'), gameId), {
      ...game,
      updatedAt: Date.now(),
    });
  } catch (e) {
    console.warn('Firestore save failed, falling back to localStorage:', e);
  }
}

async function loadFromFirestore(uid) {
  if (!isConfigured || !db) return null;
  try {
    const { collection, getDocs, query, orderBy } = await getFirestoreModules();
    const q = query(collection(db, 'users', uid, 'games'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (e) {
    console.warn('Firestore load failed:', e);
    return null;
  }
}

async function deleteFromFirestore(uid, gameId) {
  if (!isConfigured || !db) return;
  try {
    const { doc, deleteDoc } = await getFirestoreModules();
    await deleteDoc(doc(db, 'users', uid, 'games', gameId));
  } catch (e) {
    console.warn('Firestore delete failed:', e);
  }
}

export const useGameStore = create((set, get) => ({
  games: [],
  currentGame: null,
  playSession: null,
  uid: null,
  loaded: false,

  setUid: async (uid) => {
    if (!uid) {
      set({ uid: null, games: [], loaded: false });
      return;
    }

    set({ uid, loaded: false });

    const firestoreGames = await loadFromFirestore(uid);
    const localGames = loadFromLocal(uid);

    let loadedGames = [];
    if (firestoreGames && firestoreGames.length > 0) {
      loadedGames = firestoreGames;
      saveToLocal(uid, firestoreGames);
    } else if (localGames.length > 0) {
      loadedGames = localGames;
      if (isConfigured && db) {
        for (const game of localGames) {
          saveToFirestore(uid, game);
        }
      }
    }

    set({ games: loadedGames, loaded: true });

    for (const game of loadedGames) {
      registerGameOnServer(game);
    }
  },

  setGames: (games) => set({ games }),

  addGame: (game) => {
    const { uid, games } = get();
    const updated = [game, ...games];
    set({ games: updated });

    if (uid) {
      saveToLocal(uid, updated);
      saveToFirestore(uid, game);
    }

    registerGameOnServer(game);
  },

  removeGame: (gameId) => {
    const { uid, games } = get();
    const updated = games.filter((g) => (g.id || g.gameId) !== gameId);
    set({ games: updated });

    if (uid) {
      saveToLocal(uid, updated);
      deleteFromFirestore(uid, gameId);
    }
  },

  setCurrentGame: (game) => set({ currentGame: game }),

  getGameById: (gameId) => get().games.find((g) => g.id === gameId || g.gameId === gameId),

  startPlaySession: (gameId) => {
    const game = get().getGameById(gameId);
    set({
      currentGame: game || null,
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
