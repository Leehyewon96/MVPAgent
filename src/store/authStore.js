import { create } from 'zustand';
import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from '../firebase/config';

const googleProvider = new GoogleAuthProvider();

export const useAuthStore = create((set) => {
  onAuthStateChanged(auth, (user) => {
    set({
      user: user
        ? { uid: user.uid, email: user.email, displayName: user.displayName, photoURL: user.photoURL }
        : null,
      initialized: true,
    });
  });

  return {
    user: null,
    initialized: false,
    loading: false,
    error: null,

    signInWithGoogle: async () => {
      set({ loading: true, error: null });
      try {
        await signInWithPopup(auth, googleProvider);
      } catch (error) {
        set({ error: error.message });
      } finally {
        set({ loading: false });
      }
    },

    signOut: async () => {
      set({ loading: true });
      try {
        await firebaseSignOut(auth);
      } catch (error) {
        set({ error: error.message });
      } finally {
        set({ loading: false });
      }
    },
  };
});
