import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import DauChart from '../components/charts/DauChart';
import RetentionChart from '../components/charts/RetentionChart';
import GenreComparisonChart from '../components/charts/GenreComparisonChart';
import SessionChart from '../components/charts/SessionChart';
import { useRealMetrics } from '../hooks/useRealMetrics';
import { usePlayMetrics } from '../hooks/usePlayMetrics';
import { useGameStore } from '../store/gameStore';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

const tabs = [
  { key: 'overview', label: '전체 개요' },
  { key: 'players', label: '유저 분석' },
  { key: 'scores', label: '게임별 점수' },
  { key: 'genre', label: '장르별 비교' },
];

function fmtDur(sec) {
  if (!sec) return '0초';
  if (sec < 60) return `${sec}초`;
  if (sec < 3600) return `${Math.floor(sec / 60)}분 ${sec % 60}초`;
  return `${Math.floor(sec / 3600)}시간 ${Math.floor((sec % 3600) / 60)}분`;
}

export default function Reports() {
  const [activeTab, setActiveTab] = useState('overview');
  const {
    hasData,
    statCards: agentStatCards,
    dauData: agentDauData,
    sessionData: agentSessionData,
    retentionData,
    retentionGameNames,
    genreRadarData,
    genreList,
    gameScoreComparison,
  } = useRealMetrics();
  const { global, getGameStats, connected } = usePlayMetrics();
  const games = useGameStore((s) => s.games);

  const playerDauData = useMemo(() => {
    const dailyMap = {};
    games.forEach((g) => {
      const gs = getGameStats(g.id || g.gameId);
      (gs.dailyStats || []).forEach((d) => {
        if (!dailyMap[d.date]) dailyMap[d.date] = 0;
        dailyMap[d.date] += d.visitors;
      });
    });
    return Object.entries(dailyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-7)
      .map(([date, dau]) => ({ date: date.slice(5).replace('-', '/'), dau }));
  }, [games, getGameStats]);

  const playerSessionData = useMemo(() => {
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

  const statCards = useMemo(() => {
    const base = [...agentStatCards];
    if (base.length >= 4) {
      base[3] = { label: '전체 플레이어', value: global.uniqueVisitors, unit: '명', change: `${global.totalSessions} 세션`, positive: global.uniqueVisitors > 0 };
      base[4] = { label: '총 플레이 시간', value: global.totalPlayTime > 0 ? fmtDur(global.totalPlayTime) : '0초', unit: '', change: '', positive: global.totalPlayTime > 0 };
    }
    return base;
  }, [agentStatCards, global]);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">지표 분석</h1>
        <p className="text-dark-400 mt-1">생성된 게임의 평가 지표를 분석합니다</p>
      </div>

      {!hasData ? (
        <motion.div variants={item} className="card text-center py-16">
          <p className="text-5xl mb-4">📊</p>
          <p className="text-lg font-medium text-dark-300">분석할 데이터가 없습니다</p>
          <p className="text-sm text-dark-500 mt-2 mb-6">파이프라인을 실행하여 게임을 생성하면 실제 지표가 여기에 표시됩니다</p>
          <Link to="/pipeline" className="btn-primary">파이프라인으로 이동</Link>
        </motion.div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {statCards.map((m) => (
              <motion.div key={m.label} variants={item} className="card !p-4">
                <p className="text-xs text-dark-400">{m.label}</p>
                <p className="text-2xl font-bold mt-1">
                  {m.value}
                  <span className="text-sm font-normal text-dark-500 ml-0.5">{m.unit}</span>
                </p>
                <p className={`text-xs mt-1 ${m.positive ? 'text-emerald-400' : 'text-red-400'}`}>
                  {m.change}
                </p>
              </motion.div>
            ))}
          </div>

          <div className="flex gap-1 bg-dark-800/50 p-1 rounded-xl w-fit">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.key ? 'bg-primary-600 text-white' : 'text-dark-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <motion.div variants={item} className="card">
                <h2 className="text-lg font-semibold mb-4">일별 방문 유저 (DAU)</h2>
                <DauChart data={playerDauData} />
              </motion.div>
              <motion.div variants={item} className="card">
                <h2 className="text-lg font-semibold mb-4">일별 플레이 세션</h2>
                <SessionChart data={playerSessionData} />
              </motion.div>
            </div>
          )}

          {activeTab === 'players' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <motion.div variants={item} className="card !p-4 text-center">
                  <p className="text-3xl font-bold text-primary-400">{global.uniqueVisitors}</p>
                  <p className="text-xs text-dark-500 mt-1">전체 고유 방문자</p>
                </motion.div>
                <motion.div variants={item} className="card !p-4 text-center">
                  <p className="text-3xl font-bold text-amber-400">{global.totalSessions}</p>
                  <p className="text-xs text-dark-500 mt-1">전체 세션 수</p>
                </motion.div>
                <motion.div variants={item} className="card !p-4 text-center">
                  <p className="text-3xl font-bold text-emerald-400">{fmtDur(global.totalPlayTime)}</p>
                  <p className="text-xs text-dark-500 mt-1">총 플레이 시간</p>
                </motion.div>
                <motion.div variants={item} className="card !p-4 text-center">
                  <p className="text-3xl font-bold text-cyan-400">{global.totalGames}</p>
                  <p className="text-xs text-dark-500 mt-1">서버 등록 게임</p>
                </motion.div>
              </div>

              <motion.div variants={item} className="card">
                <h2 className="text-lg font-semibold mb-4">게임별 유저 지표</h2>
                {games.length === 0 ? (
                  <p className="text-center text-dark-500 py-8">게임이 없습니다</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-dark-700">
                          <th className="text-left py-2 px-3 text-dark-400 font-medium">게임</th>
                          <th className="text-right py-2 px-3 text-dark-400 font-medium">방문자</th>
                          <th className="text-right py-2 px-3 text-dark-400 font-medium">세션</th>
                          <th className="text-right py-2 px-3 text-dark-400 font-medium">평균 플레이</th>
                          <th className="text-right py-2 px-3 text-dark-400 font-medium">현재 접속</th>
                        </tr>
                      </thead>
                      <tbody>
                        {games.map((g) => {
                          const gid = g.id || g.gameId;
                          const gs = getGameStats(gid);
                          return (
                            <tr key={gid} className="border-b border-dark-800 hover:bg-dark-800/30">
                              <td className="py-2.5 px-3">
                                <span className="font-medium">{g.title}</span>
                                <span className="text-xs text-dark-500 ml-2">{g.genre}</span>
                              </td>
                              <td className="text-right py-2.5 px-3 font-mono">{gs.uniqueVisitors}</td>
                              <td className="text-right py-2.5 px-3 font-mono">{gs.totalSessions}</td>
                              <td className="text-right py-2.5 px-3 font-mono">{fmtDur(gs.avgDuration)}</td>
                              <td className="text-right py-2.5 px-3">
                                {gs.activeSessions > 0 ? (
                                  <span className="text-emerald-400 font-mono animate-pulse">{gs.activeSessions}명</span>
                                ) : (
                                  <span className="text-dark-600">-</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            </div>
          )}

          {activeTab === 'scores' && (
            <div className="space-y-4">
              <motion.div variants={item} className="card">
                <h2 className="text-lg font-semibold mb-2">게임별 평가 점수 비교</h2>
                <p className="text-sm text-dark-400 mb-4">
                  각 게임의 4개 평가 항목 점수를 비교합니다
                </p>
                <RetentionChart data={retentionData} gameNames={retentionGameNames} />
              </motion.div>

              {gameScoreComparison.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {gameScoreComparison.map((g) => (
                    <motion.div key={g.id} variants={item} className="bg-dark-900/50 rounded-xl p-4 border border-dark-700/30">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{g.title?.slice(0, 15)}</span>
                        {g.decision && (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${g.decision === 'go' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                            {g.decision.toUpperCase()}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-dark-500 mb-3">{g.genre}</p>
                      <div className="space-y-1.5">
                        {[
                          { label: '게임플레이', key: 'gameplay', color: 'bg-primary-500' },
                          { label: '비주얼', key: 'visual', color: 'bg-amber-500' },
                          { label: '리플레이', key: 'replayability', color: 'bg-emerald-500' },
                          { label: '시장적합', key: 'marketFit', color: 'bg-cyan-500' },
                        ].map((s) => (
                          <div key={s.key} className="flex items-center gap-2">
                            <span className="text-xs text-dark-500 w-14">{s.label}</span>
                            <div className="flex-1 h-1.5 bg-dark-700 rounded-full overflow-hidden">
                              <div className={`h-full ${s.color} rounded-full`} style={{ width: `${g.scores[s.key]}%` }} />
                            </div>
                            <span className="text-xs font-mono text-dark-300 w-6 text-right">{g.scores[s.key]}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 pt-2 border-t border-dark-700/30 flex items-center justify-between">
                        <span className="text-xs text-dark-500">평균</span>
                        <span className="text-sm font-bold text-primary-400">{g.total}점</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'genre' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <motion.div variants={item} className="card">
                <h2 className="text-lg font-semibold mb-2">장르별 지표 레이더</h2>
                <p className="text-sm text-dark-400 mb-4">4개 평가 항목을 장르별로 비교합니다</p>
                <GenreComparisonChart data={genreRadarData} genres={genreList} />
              </motion.div>
              <motion.div variants={item} className="card">
                <h2 className="text-lg font-semibold mb-4">장르별 요약</h2>
                {genreList.length === 0 ? (
                  <div className="text-center py-12 text-dark-500">
                    <p>여러 장르의 게임을 생성하면 비교 요약이 표시됩니다</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {genreList.map((genre) => (
                      <div key={genre.name} className="bg-dark-900/50 rounded-xl p-4 border border-dark-700/30">
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`w-2 h-2 rounded-full bg-${genre.color}-500`} />
                          <span className="font-medium">{genre.name}</span>
                          <span className="text-xs text-dark-500 ml-auto">{genre.count}개 게임 · 평균 {genre.avgScore}점</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-dark-500">강점</span>
                            <p className="text-emerald-400 mt-0.5">{genre.strength}</p>
                          </div>
                          <div>
                            <span className="text-dark-500">약점</span>
                            <p className="text-red-400 mt-0.5">{genre.weakness}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}
