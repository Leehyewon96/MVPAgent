import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
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

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">게임 라이브러리</h1>
        <p className="text-dark-400 mt-1">파이프라인에서 생성된 게임 목록을 관리합니다</p>
      </div>

      {games.length === 0 ? (
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
              <GameCard game={game} index={idx} />
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
];

function GameCard({ game, index }) {
  const [activeTab, setActiveTab] = useState('topic');

  const plan = game.plan || {};
  const topic = plan.topic || {};
  const sys = plan.systemDesign || {};
  const con = plan.contentDesign || {};

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
            </div>
          </div>
        </div>
        <Link to={`/game/${game.id || game.gameId}`} className="btn-primary text-sm">
          플레이
        </Link>
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
          {activeTab === 'play' && <PlayTab game={game} />}
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
function PlayTab({ game }) {
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
