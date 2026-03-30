import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import StatusBadge from '../components/StatusBadge';
import DauChart from '../components/charts/DauChart';
import SessionChart from '../components/charts/SessionChart';
import { useAgentStore } from '../store/agentStore';
import { useGameStore } from '../store/gameStore';
import { usePlayMetrics } from '../hooks/usePlayMetrics';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

function formatDuration(sec) {
  if (sec < 60) return `${sec}초`;
  if (sec < 3600) return `${Math.floor(sec / 60)}분 ${sec % 60}초`;
  return `${Math.floor(sec / 3600)}시간 ${Math.floor((sec % 3600) / 60)}분`;
}

export default function Dashboard() {
  const agents = useAgentStore((s) => s.agents);
  const pipelineStatus = useAgentStore((s) => s.pipelineStatus);
  const games = useGameStore((s) => s.games);
  const { global, connected, getGameStats, getPlayUrl } = usePlayMetrics();

  const statCards = useMemo(() => [
    { label: '활성 게임', value: games.length, icon: '🎮' },
    { label: '전체 플레이어', value: global.uniqueVisitors, icon: '👥' },
    { label: '총 세션 수', value: global.totalSessions, icon: '🎯' },
    { label: '총 플레이 시간', value: global.totalPlayTime > 0 ? formatDuration(global.totalPlayTime) : '0초', icon: '⏱️' },
  ], [games, global]);

  const dauData = useMemo(() => {
    const allDailyMap = {};
    games.forEach((g) => {
      const gs = getGameStats(g.id || g.gameId);
      (gs.dailyStats || []).forEach((d) => {
        if (!allDailyMap[d.date]) allDailyMap[d.date] = 0;
        allDailyMap[d.date] += d.visitors;
      });
    });
    return Object.entries(allDailyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-7)
      .map(([date, dau]) => ({ date: date.slice(5).replace('-', '/'), dau }));
  }, [games, getGameStats]);

  const sessionData = useMemo(() => {
    const dailyMap = {};
    games.forEach((g) => {
      const gs = getGameStats(g.id || g.gameId);
      (gs.dailyStats || []).forEach((d) => {
        if (!dailyMap[d.date]) dailyMap[d.date] = { sessions: 0 };
        dailyMap[d.date].sessions += d.sessions;
      });
    });
    return Object.entries(dailyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-7)
      .map(([date, d]) => ({ date: date.slice(5).replace('-', '/'), sessions: d.sessions, avgDuration: 0 }));
  }, [games, getGameStats]);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold">대시보드</h1>
            <p className="text-dark-400 mt-1">MVP Agent 시스템 현황을 한눈에 확인하세요</p>
          </div>
          <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full ${connected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-dark-700 text-dark-400'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-emerald-400 animate-pulse' : 'bg-dark-500'}`} />
            {connected ? '실시간 연결' : '오프라인'}
          </span>
        </div>
        <Link to="/pipeline" className="btn-primary">파이프라인 실행</Link>
      </div>

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div variants={item} className="card">
          <h2 className="text-lg font-semibold mb-4">일별 방문 유저 (DAU)</h2>
          <DauChart data={dauData} />
        </motion.div>
        <motion.div variants={item} className="card">
          <h2 className="text-lg font-semibold mb-4">일별 플레이 세션</h2>
          <SessionChart data={sessionData} />
        </motion.div>
      </div>

      <motion.div variants={item} className="card">
        <h2 className="text-lg font-semibold mb-4">Agent 상태</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {Object.entries(agents).map(([name, agent]) => (
            <div key={name} className="bg-dark-900/50 rounded-xl p-4 border border-dark-700/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium capitalize">{name}</span>
                <StatusBadge status={agent.status} />
              </div>
              <p className="text-xs text-dark-500">로그 {agent.logs.length}건</p>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div variants={item} className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">게임별 유저 현황</h2>
          {games.length > 0 && (
            <Link to="/games" className="text-sm text-primary-400 hover:text-primary-300">전체 보기</Link>
          )}
        </div>
        {games.length === 0 ? (
          <div className="text-center py-12 text-dark-500">
            <p className="text-4xl mb-3">🎮</p>
            <p>아직 생성된 게임이 없습니다</p>
            <p className="text-sm mt-1">
              <Link to="/pipeline" className="text-primary-400 hover:text-primary-300">Agent 파이프라인</Link>을 실행하여 첫 번째 게임을 만들어보세요
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {games.slice(0, 5).map((game) => {
              const gid = game.id || game.gameId;
              const gs = getGameStats(gid);
              return (
                <div
                  key={gid}
                  className="flex items-center justify-between p-3 bg-dark-900/50 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">🎮</span>
                    <div>
                      <span className="font-medium">{game.title}</span>
                      <p className="text-xs text-dark-500">{game.genre}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-mono">{gs.uniqueVisitors} <span className="text-dark-500 text-xs">명</span></p>
                      <p className="text-xs text-dark-500">{gs.totalSessions}세션 · 평균 {formatDuration(gs.avgDuration)}</p>
                    </div>
                    {gs.activeSessions > 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 animate-pulse">
                        {gs.activeSessions}명 접속 중
                      </span>
                    )}
                    <a
                      href={getPlayUrl(gid)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary-400 hover:text-primary-300 bg-primary-500/10 px-2.5 py-1 rounded-lg"
                    >
                      공유 링크
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
