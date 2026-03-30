import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { usePlayMetrics } from '../hooks/usePlayMetrics';
import {
  downloadMarkdown,
  downloadJSON,
  downloadHTML,
  planResultToMarkdown,
} from '../utils/download';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

export default function GameLibrary() {
  const games = useGameStore((s) => s.games);
  const loaded = useGameStore((s) => s.loaded);
  const playMetrics = usePlayMetrics();

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">게임 라이브러리</h1>
          <p className="text-dark-400 mt-1">파이프라인에서 생성된 게임 목록을 관리합니다</p>
        </div>
        <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full ${playMetrics.connected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-dark-700 text-dark-400'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${playMetrics.connected ? 'bg-emerald-400 animate-pulse' : 'bg-dark-500'}`} />
          {playMetrics.connected ? '실시간' : '오프라인'}
        </span>
      </div>

      {!loaded ? (
        <div className="card text-center py-16">
          <div className="w-8 h-8 border-2 border-primary-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-dark-400">게임 데이터 불러오는 중…</p>
        </div>
      ) : games.length === 0 ? (
        <motion.div variants={item} className="card text-center py-16">
          <p className="text-5xl mb-4">🎮</p>
          <p className="text-lg font-medium text-dark-300">생성된 게임이 없습니다</p>
          <p className="text-sm text-dark-500 mt-2 mb-6">Agent 파이프라인을 실행하여 첫 번째 게임을 만들어보세요</p>
          <Link to="/pipeline" className="btn-primary">파이프라인으로 이동</Link>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {games.map((game, idx) => (
            <motion.div key={game.id || game.gameId || idx} variants={item}>
              <GameCard game={game} index={idx} playMetrics={playMetrics} />
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

const tabs = [
  { key: 'topic', label: '주제', icon: '🔍' },
  { key: 'plan', label: '기획서', icon: '📋' },
  { key: 'play', label: '게임', icon: '🎮' },
  { key: 'metrics', label: '유저 지표', icon: '📊' },
];

function fmtDur(sec) {
  if (!sec) return '0초';
  if (sec < 60) return `${sec}초`;
  if (sec < 3600) return `${Math.floor(sec / 60)}분`;
  return `${Math.floor(sec / 3600)}시간 ${Math.floor((sec % 3600) / 60)}분`;
}

function GameCard({ game, index, playMetrics }) {
  const [activeTab, setActiveTab] = useState('topic');
  const [copied, setCopied] = useState(false);

  const plan = game.plan || {};
  const topic = plan.topic || {};
  const sys = plan.systemDesign || {};
  const con = plan.contentDesign || {};
  const gid = game.id || game.gameId;
  const gs = playMetrics.getGameStats(gid);
  const playUrl = playMetrics.getPlayUrl(gid);

  const handleCopy = () => {
    navigator.clipboard.writeText(playUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center text-white font-bold text-sm">
            {index + 1}
          </div>
          <div>
            <h2 className="text-lg font-semibold">{game.title || 'Untitled'}</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-dark-400">{game.genre}</span>
              <span className="text-xs text-dark-600">·</span>
              <span className="text-xs text-dark-500">{new Date(game.createdAt).toLocaleString('ko-KR')}</span>
              {game.decision && (
                <>
                  <span className="text-xs text-dark-600">·</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${game.decision === 'go' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                    {game.decision.toUpperCase()}
                  </span>
                </>
              )}
              {gs.activeSessions > 0 && (
                <>
                  <span className="text-xs text-dark-600">·</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 animate-pulse">
                    {gs.activeSessions}명 플레이 중
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleCopy} className="text-xs text-dark-400 hover:text-white bg-dark-800 hover:bg-dark-700 px-2.5 py-1.5 rounded-lg transition-all" title="공유 링크 복사">
            {copied ? '✓ 복사됨' : '🔗 공유 링크'}
          </button>
          <Link to={`/game/${gid}`} className="btn-primary text-sm">
            플레이
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        <div className="bg-dark-900/50 rounded-lg p-2.5 text-center">
          <p className="text-lg font-bold">{gs.uniqueVisitors}</p>
          <p className="text-xs text-dark-500">방문자</p>
        </div>
        <div className="bg-dark-900/50 rounded-lg p-2.5 text-center">
          <p className="text-lg font-bold">{gs.totalSessions}</p>
          <p className="text-xs text-dark-500">세션</p>
        </div>
        <div className="bg-dark-900/50 rounded-lg p-2.5 text-center">
          <p className="text-lg font-bold">{fmtDur(gs.avgDuration)}</p>
          <p className="text-xs text-dark-500">평균 플레이</p>
        </div>
        <div className="bg-dark-900/50 rounded-lg p-2.5 text-center">
          <p className="text-lg font-bold">{gs.activeSessions}</p>
          <p className="text-xs text-dark-500">현재 접속</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-dark-900/50 p-1 rounded-xl mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all flex-1 justify-center ${
              activeTab === tab.key ? 'bg-primary-600 text-white' : 'text-dark-400 hover:text-white'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.15 }}
        >
          {activeTab === 'topic' && <TopicTab topic={topic} />}
          {activeTab === 'plan' && <PlanTab plan={plan} sys={sys} con={con} />}
          {activeTab === 'play' && <PlayTab game={game} playUrl={playUrl} />}
          {activeTab === 'metrics' && <MetricsTab gs={gs} playUrl={playUrl} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─── 주제 탭 ───
function TopicTab({ topic }) {
  if (!topic?.keyword) {
    return <Empty text="주제 정보가 없습니다" />;
  }

  return (
    <div className="space-y-3">
      <div className="bg-dark-900/60 rounded-xl p-4 border border-dark-700/30">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-base font-semibold">{topic.keyword}</h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-dark-700 text-dark-300">{topic.source}</span>
        </div>
        <p className="text-sm text-dark-300">{topic.description}</p>
        {topic.gameIdea && (
          <p className="text-sm text-primary-400 mt-3 bg-primary-500/10 px-3 py-2 rounded-lg">
            💡 게임 아이디어: {topic.gameIdea}
          </p>
        )}
        <div className="flex items-center gap-2 mt-3">
          <span className="text-xs text-dark-500">트렌드 스코어</span>
          <div className="flex-1 h-2 bg-dark-700 rounded-full overflow-hidden max-w-[200px]">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(topic.score || 0) * 100}%` }} />
          </div>
          <span className="text-xs font-mono text-emerald-400">{topic.score}</span>
        </div>
      </div>
      <DlButton label="주제 JSON 다운로드" onClick={() => downloadJSON(topic, `topic_${topic.keyword}.json`)} />
    </div>
  );
}

// ─── 기획서 탭 ───
function PlanTab({ plan, sys, con }) {
  if (!sys?.title && !con?.title) {
    return <Empty text="기획서 정보가 없습니다" />;
  }

  return (
    <div className="space-y-3">
      {/* 시스템 기획서 */}
      <div className="bg-dark-900/60 rounded-xl p-4 border border-dark-700/30">
        <h4 className="text-sm font-semibold text-primary-300 mb-3">📐 시스템 기획서</h4>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
          <Field label="장르" value={sys.genre} />
          <Field label="코어 루프" value={sys.coreLoop} />
          <Field label="조작 방법" value={sys.controls} />
          <Field label="승리/게임오버" value={sys.winCondition} />
          <Field label="난이도" value={sys.difficulty} />
        </div>
        {sys.mechanics?.length > 0 && (
          <div className="mt-3">
            <span className="text-xs text-dark-500">핵심 메카닉</span>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {sys.mechanics.map((m, i) => <span key={i} className="text-xs px-2.5 py-1 bg-dark-700 rounded-lg text-dark-200">{m}</span>)}
            </div>
          </div>
        )}
      </div>

      {/* 콘텐츠 기획서 */}
      <div className="bg-dark-900/60 rounded-xl p-4 border border-dark-700/30">
        <h4 className="text-sm font-semibold text-amber-300 mb-3">🎨 콘텐츠 기획서</h4>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
          <Field label="테마" value={con.theme} />
          <Field label="스테이지 수" value={con.stages} />
          <Field label="색상 팔레트" value={con.colorScheme} />
        </div>
        <div className="grid grid-cols-2 gap-4 mt-3">
          {con.enemies?.length > 0 && (
            <div>
              <span className="text-xs text-dark-500">적 목록</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {con.enemies.map((e, i) => <span key={i} className="text-xs px-2.5 py-1 bg-red-500/10 text-red-400 rounded-lg">{e}</span>)}
              </div>
            </div>
          )}
          {con.items?.length > 0 && (
            <div>
              <span className="text-xs text-dark-500">아이템 목록</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {con.items.map((it, i) => <span key={i} className="text-xs px-2.5 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg">{it}</span>)}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <DlButton label="기획서 MD 다운로드" onClick={() => downloadMarkdown(planResultToMarkdown(plan), `plan_${sys.title || 'game'}.md`)} />
        <DlButton label="기획서 JSON 다운로드" onClick={() => downloadJSON(plan, `plan_${sys.title || 'game'}.json`)} />
      </div>
    </div>
  );
}

// ─── 게임 탭 ───
function PlayTab({ game, playUrl }) {
  return (
    <div className="space-y-3">
      <div className="bg-dark-900/60 rounded-xl p-4 border border-dark-700/30">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <Field label="게임 ID" value={<span className="font-mono text-xs">{game.id || game.gameId}</span>} />
          <Field label="빌드 상태" value={
            <span className={game.buildStatus === 'success' ? 'text-emerald-400' : 'text-amber-400'}>
              {game.buildStatus}
            </span>
          } />
          <Field label="코드 크기" value={game.code ? `${(game.code.length / 1024).toFixed(1)} KB` : '-'} />
        </div>

        <div className="mt-3 pt-3 border-t border-dark-700/30">
          <span className="text-xs text-dark-500">공유 링크 (외부 유저 플레이용)</span>
          <div className="flex items-center gap-2 mt-1">
            <input
              readOnly
              value={playUrl}
              className="flex-1 bg-dark-800 border border-dark-600 rounded-lg px-3 py-1.5 text-xs font-mono text-dark-300"
              onClick={(e) => e.target.select()}
            />
            <a href={playUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary-400 hover:text-primary-300 whitespace-nowrap">
              열기 ↗
            </a>
          </div>
        </div>

        {game.scores && (
          <div className="mt-4 pt-3 border-t border-dark-700/30 space-y-2">
            <span className="text-xs text-dark-500">평가 점수</span>
            {[
              { label: '게임플레이', key: 'gameplay', color: 'bg-primary-500' },
              { label: '비주얼', key: 'visual', color: 'bg-amber-500' },
              { label: '리플레이', key: 'replayability', color: 'bg-emerald-500' },
              { label: '시장적합', key: 'marketFit', color: 'bg-cyan-500' },
            ].map((s) => (
              game.scores[s.key] != null && (
                <div key={s.key} className="flex items-center gap-3">
                  <span className="text-xs text-dark-400 w-16">{s.label}</span>
                  <div className="flex-1 h-1.5 bg-dark-700 rounded-full overflow-hidden">
                    <div className={`h-full ${s.color} rounded-full`} style={{ width: `${game.scores[s.key]}%` }} />
                  </div>
                  <span className="text-xs font-mono text-dark-300 w-7 text-right">{game.scores[s.key]}</span>
                </div>
              )
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Link to={`/game/${game.id || game.gameId}`} className="btn-primary text-sm inline-flex items-center gap-2">
          🎮 게임 플레이하기
        </Link>
        {game.code && (
          <DlButton label="HTML 다운로드" onClick={() => downloadHTML(game.code, `${game.title || 'game'}.html`)} />
        )}
      </div>
    </div>
  );
}

// ─── 유저 지표 탭 ───
function MetricsTab({ gs, playUrl }) {
  const daily = gs.dailyStats || [];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatBox label="총 방문자" value={gs.uniqueVisitors} unit="명" color="text-primary-400" />
        <StatBox label="총 세션" value={gs.totalSessions} unit="회" color="text-amber-400" />
        <StatBox label="평균 플레이" value={fmtDur(gs.avgDuration)} color="text-emerald-400" />
        <StatBox label="현재 접속" value={gs.activeSessions} unit="명" color="text-cyan-400" active={gs.activeSessions > 0} />
      </div>

      {daily.length > 0 && (
        <div className="bg-dark-900/60 rounded-xl p-4 border border-dark-700/30">
          <h4 className="text-sm font-semibold mb-3">일별 유저 추이</h4>
          <div className="space-y-1.5">
            {daily.slice(-7).map((d) => (
              <div key={d.date} className="flex items-center gap-3 text-xs">
                <span className="text-dark-500 w-20 font-mono">{d.date}</span>
                <div className="flex-1 h-2 bg-dark-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-500 rounded-full transition-all"
                    style={{ width: `${Math.min(100, (d.visitors / Math.max(1, ...daily.map((x) => x.visitors))) * 100)}%` }}
                  />
                </div>
                <span className="text-dark-300 w-16 text-right">{d.visitors}명 / {d.sessions}회</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-dark-900/60 rounded-xl p-4 border border-dark-700/30">
        <h4 className="text-sm font-semibold mb-2">공유 링크</h4>
        <p className="text-xs text-dark-400 mb-2">이 링크를 공유하면 누구나 게임을 플레이할 수 있고, 플레이 데이터가 자동 수집됩니다</p>
        <div className="flex items-center gap-2">
          <input
            readOnly
            value={playUrl}
            className="flex-1 bg-dark-800 border border-dark-600 rounded-lg px-3 py-1.5 text-xs font-mono text-dark-300"
            onClick={(e) => e.target.select()}
          />
          <a href={playUrl} target="_blank" rel="noopener noreferrer" className="btn-primary text-xs">열기 ↗</a>
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value, unit, color, active }) {
  return (
    <div className={`bg-dark-900/60 rounded-xl p-3 border ${active ? 'border-emerald-500/30' : 'border-dark-700/30'} text-center`}>
      <p className={`text-xl font-bold ${color}`}>{value}{unit && <span className="text-xs font-normal text-dark-500 ml-0.5">{unit}</span>}</p>
      <p className="text-xs text-dark-500 mt-0.5">{label}</p>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <span className="text-xs text-dark-500">{label}</span>
      <p className="text-dark-200 mt-0.5">{typeof value === 'string' || typeof value === 'number' ? value || '-' : value}</p>
    </div>
  );
}

function DlButton({ label, onClick }) {
  return (
    <button onClick={onClick} className="inline-flex items-center gap-1.5 text-xs font-medium text-primary-400 hover:text-primary-300 bg-primary-500/10 hover:bg-primary-500/20 px-3 py-1.5 rounded-lg transition-all">
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V3" /></svg>
      {label}
    </button>
  );
}

function Empty({ text }) {
  return (
    <div className="text-center py-8 text-dark-500">
      <p>{text}</p>
    </div>
  );
}
