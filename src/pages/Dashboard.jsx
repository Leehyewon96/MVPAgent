import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import StatusBadge from '../components/StatusBadge';
import DauChart from '../components/charts/DauChart';
import SessionChart from '../components/charts/SessionChart';
import { useAgentStore } from '../store/agentStore';
import { useGameStore } from '../store/gameStore';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

export default function Dashboard() {
  const agents = useAgentStore((s) => s.agents);
  const pipelineStatus = useAgentStore((s) => s.pipelineStatus);
  const games = useGameStore((s) => s.games);

  const statCards = useMemo(() => [
    { label: '활성 게임', value: games.length, icon: '🎮' },
    { label: '파이프라인', value: pipelineStatus === 'idle' ? '대기' : pipelineStatus === 'running' ? '실행 중' : pipelineStatus === 'completed' ? '완료' : '오류', icon: '🤖' },
    { label: '완료된 Agent', value: Object.values(agents).filter((a) => a.status === 'completed').length + ' / 5', icon: '📊' },
    { label: '총 로그', value: Object.values(agents).reduce((sum, a) => sum + a.logs.length, 0), icon: '📝' },
  ], [agents, games, pipelineStatus]);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">대시보드</h1>
          <p className="text-dark-400 mt-1">MVP Agent 시스템 현황을 한눈에 확인하세요</p>
        </div>
        <Link to="/pipeline" className="btn-primary">
          파이프라인 실행
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <motion.div key={stat.label} variants={item} className="card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-dark-400">{stat.label}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </div>
              <span className="text-2xl">{stat.icon}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div variants={item} className="card">
          <h2 className="text-lg font-semibold mb-4">일간 활성 유저 (DAU)</h2>
          <DauChart />
          <p className="text-xs text-dark-500 mt-2">* 데모 데이터 — Firebase 연결 후 실제 데이터로 전환됩니다</p>
        </motion.div>

        <motion.div variants={item} className="card">
          <h2 className="text-lg font-semibold mb-4">일간 세션 수</h2>
          <SessionChart />
          <p className="text-xs text-dark-500 mt-2">* 데모 데이터 — Firebase 연결 후 실제 데이터로 전환됩니다</p>
        </motion.div>
      </div>

      {/* Agent Status */}
      <motion.div variants={item} className="card">
        <h2 className="text-lg font-semibold mb-4">Agent 상태</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {Object.entries(agents).map(([name, agent]) => (
            <div
              key={name}
              className="bg-dark-900/50 rounded-xl p-4 border border-dark-700/30"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium capitalize">{name}</span>
                <StatusBadge status={agent.status} />
              </div>
              <p className="text-xs text-dark-500">
                로그 {agent.logs.length}건
              </p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Recent Games */}
      <motion.div variants={item} className="card">
        <h2 className="text-lg font-semibold mb-4">최근 생성된 게임</h2>
        {games.length === 0 ? (
          <div className="text-center py-12 text-dark-500">
            <p className="text-4xl mb-3">🎮</p>
            <p>아직 생성된 게임이 없습니다</p>
            <p className="text-sm mt-1">
              <Link to="/pipeline" className="text-primary-400 hover:text-primary-300">
                Agent 파이프라인
              </Link>
              을 실행하여 첫 번째 게임을 만들어보세요
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {games.map((game) => (
              <Link
                key={game.id}
                to={`/game/${game.id}`}
                className="flex items-center justify-between p-3 bg-dark-900/50 rounded-xl hover:bg-dark-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">🎮</span>
                  <div>
                    <span className="font-medium">{game.title}</span>
                    <p className="text-xs text-dark-500">
                      {new Date(game.createdAt).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-dark-400">{game.genre}</span>
                  {game.decision && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      game.decision === 'go'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {game.decision.toUpperCase()}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
