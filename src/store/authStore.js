import { create } from 'zustand';
import { isConfigured, auth } from '../firebase/config';
import { onAuthStateChanged } from 'firebase/auth';

function createDevStore(set) {
  setTimeout(() => set({ initialized: true }), 100);

  return {
    user: null,
    initialized: false,
    loading: false,
    error: null,
    devMode: true,

    signInWithGoogle: async () => {
      set({ loading: true, error: null });
      await new Promise((r) => setTimeout(r, 500));
      set({
        user: {
          uid: 'dev-user-001',
          email: 'dev@mvpagent.local',
          displayName: 'Dev User',
          photoURL: null,
        },
        loading: false,
      });
    },

    signOut: async () => {
      set({ loading: true });
      await new Promise((r) => setTimeout(r, 300));
      set({ user: null, loading: false });
    },
  };
}

function createFirebaseStore(set) {
  let resolved = false;

  const resolve = () => {
    if (!resolved) {
      resolved = true;
      set((state) => (state.initialized ? state : { initialized: true }));
    }
  };

  // Auth 상태 감지가 3초 안에 안 되면 강제로 initialized 처리
  setTimeout(resolve, 3000);

  if (auth) {
    try {
      onAuthStateChanged(auth, (user) => {
        resolved = true;
        set({
          user: user
            ? { uid: user.uid, email: user.email, displayName: user.displayName, photoURL: user.photoURL }
            : null,
          initialized: true,
        });
      });
    } catch (error) {
      console.error('Auth listener failed:', error);
      resolve();
    }
  } else {
    resolve();
  }

  return {
    user: null,
    initialized: false,
    loading: false,
    error: null,
    devMode: false,

    signInWithGoogle: async () => {
      set({ loading: true, error: null });
      try {
        const { signInWithPopup, GoogleAuthProvider } = await import('firebase/auth');
        await signInWithPopup(auth, new GoogleAuthProvider());
      } catch (error) {
        set({ error: error.message });
      } finally {
        set({ loading: false });
      }
    },

    signOut: async () => {
      set({ loading: true });
      try {
        const { signOut: firebaseSignOut } = await import('firebase/auth');
        await firebaseSignOut(auth);
      } catch (error) {
        set({ error: error.message });
      } finally {
        set({ loading: false });
      }
    },
  };
}

export const useAuthStore = create((set) =>
  isConfigured ? createFirebaseStore(set) : createDevStore(set),
);
