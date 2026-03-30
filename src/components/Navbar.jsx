import { useAuth } from '../hooks/useAuth';

export default function Navbar() {
  const { user, signOut } = useAuth();

  return (
    <header className="h-16 border-b border-dark-700/50 bg-dark-900/80 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <h2 className="text-sm text-dark-400">MVP Agent Control Center</h2>
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <>
            <div className="flex items-center gap-3">
              {user.photoURL && (
                <img
                  src={user.photoURL}
                  alt={user.displayName}
                  className="w-8 h-8 rounded-full ring-2 ring-dark-600"
                />
              )}
              <span className="text-sm text-dark-200">{user.displayName}</span>
            </div>
            <button
              onClick={signOut}
              className="text-sm text-dark-400 hover:text-white transition-colors"
            >
              로그아웃
            </button>
          </>
        )}
      </div>
    </header>
  );
}
