import { Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import GamePlayer from './pages/GamePlayer';
import Reports from './pages/Reports';
import AgentPipeline from './pages/AgentPipeline';
import GameLibrary from './pages/GameLibrary';
import { useAuthStore } from './store/authStore';
import { useGameSync } from './hooks/useGameSync';

export default function App() {
  const initialized = useAuthStore((s) => s.initialized);
  useGameSync();

  if (!initialized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-3 border-primary-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-dark-400 text-sm">초기화 중...</p>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/game/:gameId" element={<GamePlayer />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/pipeline" element={<AgentPipeline />} />
              <Route path="/games" element={<GameLibrary />} />
            </Route>
          </Route>
        </Routes>
      </AnimatePresence>
    </ErrorBoundary>
  );
}
