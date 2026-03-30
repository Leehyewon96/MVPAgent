import { useAuthStore } from '../store/authStore';

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);
  const error = useAuthStore((s) => s.error);
  const signInWithGoogle = useAuthStore((s) => s.signInWithGoogle);
  const signOut = useAuthStore((s) => s.signOut);

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    signInWithGoogle,
    signOut,
  };
}
