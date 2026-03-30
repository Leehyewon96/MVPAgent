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
import { useAuthStore } from './store/authStore';

export default function App() {
  const initialized = useAuthStore((s) => s.initialized);

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
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
            </Route>
          </Route>
        </Routes>
      </AnimatePresence>
    </ErrorBoundary>
  );
}
