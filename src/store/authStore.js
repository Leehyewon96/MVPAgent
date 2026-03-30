import { create } from 'zustand';

const isFirebaseConfigured = Boolean(import.meta.env.VITE_FIREBASE_API_KEY);

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
  import('../firebase/config').then(({ auth }) => {
    import('firebase/auth').then(({ onAuthStateChanged }) => {
      onAuthStateChanged(auth, (user) => {
        set({
          user: user
            ? { uid: user.uid, email: user.email, displayName: user.displayName, photoURL: user.photoURL }
            : null,
          initialized: true,
        });
      });
    });
  });

  return {
    user: null,
    initialized: false,
    loading: false,
    error: null,
    devMode: false,

    signInWithGoogle: async () => {
      set({ loading: true, error: null });
      try {
        const { auth } = await import('../firebase/config');
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
        const { auth } = await import('../firebase/config');
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
  isFirebaseConfigured ? createFirebaseStore(set) : createDevStore(set),
);
