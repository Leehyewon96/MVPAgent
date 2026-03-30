import { motion } from 'framer-motion';
import StatusBadge from '../components/StatusBadge';
import { useAgentStore } from '../store/agentStore';
import { useGameStore } from '../store/gameStore';

const statCards = [
  { label: '활성 게임', value: '0', change: '-', icon: '🎮' },
  { label: '총 사용자', value: '0', change: '-', icon: '👥' },
  { label: '오늘 세션', value: '0', change: '-', icon: '📊' },
  { label: '평균 리텐션', value: '-', change: '-', icon: '📈' },
];

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
  const games = useGameStore((s) => s.games);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">대시보드</h1>
        <p className="text-dark-400 mt-1">MVP Agent 시스템 현황을 한눈에 확인하세요</p>
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
            <p className="text-xs text-dark-500 mt-2">{stat.change}</p>
          </motion.div>
        ))}
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
            <p className="text-sm mt-1">Agent 파이프라인을 실행하여 첫 번째 게임을 만들어보세요</p>
          </div>
        ) : (
          <div className="space-y-2">
            {games.map((game) => (
              <div
                key={game.id}
                className="flex items-center justify-between p-3 bg-dark-900/50 rounded-xl"
              >
                <span className="font-medium">{game.title}</span>
                <span className="text-sm text-dark-400">{game.genre}</span>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
