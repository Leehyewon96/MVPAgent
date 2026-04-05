import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import StatusBadge from '../components/StatusBadge';
import { useAgentPipeline } from '../hooks/useAgentPipeline';
import {
  downloadMarkdown,
  downloadJSON,
  downloadHTML,
  trendResultToMarkdown,
  planResultToMarkdown,
} from '../utils/download';

const pipelineSteps = [
  { key: 'trend', title: '시장조사 Agent', description: '트렌드 분석, 경쟁 게임 분석, 장르 결정', icon: '🔍' },
  { key: 'plan', title: '기획 Agent', description: '콘텐츠 기획, 시스템 기획, 기술 스택 검토', icon: '📋' },
  { key: 'dev', title: '개발 Agent', description: '클라이언트, 서버, 에셋 생성, QA/테스트', icon: '💻' },
  { key: 'judge', title: '판단 Agent', description: '지표 수집, Go/No-Go 판단', icon: '⚖️' },
];

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const itemVariant = { hidden: { opacity: 0, x: -16 }, show: { opacity: 1, x: 0 } };

export default function AgentPipeline() {
  const { start, reset, pipelineStatus, agents } = useAgentPipeline();

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Agent 파이프라인</h1>
          <p className="text-dark-400 mt-1">트렌드 분석부터 게임 배포까지 전체 자동화 흐름을 관리합니다</p>
        </div>
        <div className="flex gap-3">
          <button onClick={reset} disabled={pipelineStatus === 'running'} className="btn-secondary disabled:opacity-50">초기화</button>
          <button onClick={start} disabled={pipelineStatus === 'running'} className="btn-primary disabled:opacity-50">
            {pipelineStatus === 'running' ? '실행 중...' : '파이프라인 시작'}
          </button>
        </div>
      </div>

      {/* Banners */}
      <AnimatePresence>
        {pipelineStatus === 'completed' && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <div className="flex-1">
              <p className="font-semibold text-emerald-300">파이프라인 완료</p>
              <p className="text-sm text-emerald-400/70">게임이 성공적으로 생성되었습니다. 대시보드에서 확인하세요.</p>
            </div>
          </motion.div>
        )}
        {pipelineStatus === 'error' && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-center gap-3">
            <span className="text-2xl">❌</span>
            <div><p className="font-semibold text-red-300">파이프라인 오류</p><p className="text-sm text-red-400/70">초기화 후 다시 시도하세요.</p></div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Orchestrator */}
      <motion.div variants={itemVariant} className="card border-primary-500/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎯</span>
            <div><h3 className="font-semibold">Orchestrator</h3><p className="text-sm text-dark-400">전체 파이프라인 흐름 제어</p></div>
          </div>
          <StatusBadge status={agents.orchestrator.status} />
        </div>
        <LogPanel logs={agents.orchestrator.logs} />
      </motion.div>

      {/* Pipeline Steps */}
      <div className="relative">
        <div className="absolute left-8 top-0 bottom-0 w-px bg-dark-700/50" />
        {pipelineSteps.map((step) => {
          const agent = agents[step.key];
          return (
            <motion.div key={step.key} variants={itemVariant} className="relative pl-20 pb-6 last:pb-0">
              <div className="absolute left-6 top-3 w-5 h-5 bg-dark-800 border-2 border-dark-600 rounded-full flex items-center justify-center z-10">
                <motion.div
                  className={`w-2 h-2 rounded-full ${agent.status === 'completed' ? 'bg-emerald-500' : agent.status === 'running' ? 'bg-amber-500' : agent.status === 'error' ? 'bg-red-500' : 'bg-dark-600'}`}
                  animate={agent.status === 'running' ? { scale: [1, 1.4, 1] } : {}}
                  transition={agent.status === 'running' ? { duration: 1, repeat: Infinity } : {}}
                />
              </div>
              <div className="card">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{step.icon}</span>
                    <div><h3 className="font-semibold">{step.title}</h3><p className="text-sm text-dark-400 mt-1">{step.description}</p></div>
                  </div>
                  <StatusBadge status={agent.status} />
                </div>
                <LogPanel logs={agent.logs} />
                <AnimatePresence>
                  {agent.result && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3 pt-3 border-t border-dark-700/50">
                      <ResultPanel agentKey={step.key} result={agent.result} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

function LogPanel({ logs }) {
  if (!logs?.length) return null;
  return (
    <div className="mt-4 bg-dark-900/50 rounded-lg p-3 max-h-32 overflow-y-auto">
      {logs.map((log, i) => (
        <p key={i} className="text-xs font-mono text-dark-400">
          <span className="text-dark-600">{new Date(log.timestamp).toLocaleTimeString('ko-KR')}</span> {log.message}
        </p>
      ))}
    </div>
  );
}

function DownloadButton({ onClick, label }) {
  return (
    <button onClick={onClick} className="inline-flex items-center gap-1.5 text-xs font-medium text-primary-400 hover:text-primary-300 bg-primary-500/10 hover:bg-primary-500/20 px-3 py-1.5 rounded-lg transition-all">
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V3" /></svg>
      {label}
    </button>
  );
}

function ResultPanel({ agentKey, result }) {
  const [expanded, setExpanded] = useState(true);

  if (!result) return null;

  switch (agentKey) {
    case 'trend': return <TrendResult result={result} expanded={expanded} toggle={() => setExpanded(!expanded)} />;
    case 'plan': return <PlanResult result={result} expanded={expanded} toggle={() => setExpanded(!expanded)} />;
    case 'dev': return <DevResult result={result} />;
    case 'judge': return <JudgeResult result={result} />;
    default: return null;
  }
}

// ─── 시장조사 결과 패널 ───
function TrendResult({ result, expanded, toggle }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <button onClick={toggle} className="text-xs font-medium text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
          <span className={`transition-transform ${expanded ? 'rotate-90' : ''}`}>▶</span>
          발견된 트렌드 주제 ({result.topics?.length || 0}개)
        </button>
        <div className="flex gap-2">
          <DownloadButton label="MD 다운로드" onClick={() => downloadMarkdown(trendResultToMarkdown(result), `trend_report_${Date.now()}.md`)} />
          <DownloadButton label="JSON 다운로드" onClick={() => downloadJSON(result, `trend_data_${Date.now()}.json`)} />
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-2">
            {result.topics?.map((t, i) => (
              <div key={i} className="bg-dark-900/60 rounded-xl p-4 border border-dark-700/30">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold">{t.keyword}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-dark-700 text-dark-300">{t.source}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-16 h-1.5 bg-dark-700 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(t.score || 0) * 100}%` }} />
                    </div>
                    <span className="text-xs font-mono text-emerald-400">{t.score}</span>
                  </div>
                </div>
                <p className="text-sm text-dark-300">{t.description}</p>
                {t.gameIdea && (
                  <p className="text-xs text-primary-400 mt-2 bg-primary-500/10 inline-block px-2 py-1 rounded-lg">
                    💡 {t.gameIdea}
                  </p>
                )}
              </div>
            ))}
            {result.analyzedAt && (
              <p className="text-xs text-dark-600">분석 시각: {new Date(result.analyzedAt).toLocaleString('ko-KR')}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── 기획서 결과 패널 ───
function PlanResult({ result, expanded, toggle }) {
  const sys = result.systemDesign || {};
  const con = result.contentDesign || {};

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <button onClick={toggle} className="text-xs font-medium text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
          <span className={`transition-transform ${expanded ? 'rotate-90' : ''}`}>▶</span>
          기획서: {sys.title || '게임 기획서'}
        </button>
        <div className="flex gap-2">
          <DownloadButton label="MD 다운로드" onClick={() => downloadMarkdown(planResultToMarkdown(result), `plan_${Date.now()}.md`)} />
          <DownloadButton label="JSON 다운로드" onClick={() => downloadJSON(result, `plan_data_${Date.now()}.json`)} />
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-3">
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
                    {sys.mechanics.map((m, i) => (
                      <span key={i} className="text-xs px-2.5 py-1 bg-dark-700 rounded-lg text-dark-200">{m}</span>
                    ))}
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
                      {con.enemies.map((e, i) => <span key={i} className="text-xs px-2.5 py-1 bg-red-500/10 text-red-400 rounded-lg">{typeof e === 'object' ? e.name : e}</span>)}
                    </div>
                  </div>
                )}
                {con.items?.length > 0 && (
                  <div>
                    <span className="text-xs text-dark-500">아이템 목록</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {con.items.map((it, i) => <span key={i} className="text-xs px-2.5 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg">{typeof it === 'object' ? it.name : it}</span>)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── 개발 결과 패널 ───
function DevResult({ result }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-emerald-400">게임 빌드 완료</p>
        <div className="flex gap-2">
          {result.code && <DownloadButton label="HTML 다운로드" onClick={() => downloadHTML(result.code, `${result.title || 'game'}.html`)} />}
        </div>
      </div>
      <div className="bg-dark-900/60 rounded-xl p-4 border border-dark-700/30 grid grid-cols-3 gap-4 text-sm">
        <Field label="제목" value={result.title} />
        <Field label="빌드 상태" value={result.buildStatus} />
        <Field label="코드 크기" value={result.code ? `${(result.code.length / 1024).toFixed(1)} KB` : '-'} />
      </div>
      {result.gameId && (
        <Link to={`/game/${result.gameId}`} className="btn-primary inline-flex items-center gap-2 text-sm">
          🎮 게임 플레이하기
        </Link>
      )}
    </div>
  );
}

// ─── 판단 결과 패널 ───
function JudgeResult({ result }) {
  const scores = result.scores || {};
  const scoreItems = [
    { label: '게임플레이', key: 'gameplay', color: 'bg-primary-500' },
    { label: '비주얼', key: 'visual', color: 'bg-amber-500' },
    { label: '리플레이', key: 'replayability', color: 'bg-emerald-500' },
    { label: '시장적합', key: 'marketFit', color: 'bg-cyan-500' },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className={`text-xs font-medium ${result.decision === 'go' ? 'text-emerald-400' : 'text-red-400'}`}>
          판정: {result.decision === 'go' ? '✅ GO — 배포 진행' : '❌ NO-GO — 재검토 필요'}
        </p>
        <DownloadButton label="JSON 다운로드" onClick={() => downloadJSON(result, `evaluation_${Date.now()}.json`)} />
      </div>
      <p className="text-sm text-dark-300">{result.reasoning}</p>

      {Object.keys(scores).length > 0 && (
        <div className="bg-dark-900/60 rounded-xl p-4 border border-dark-700/30 space-y-2.5">
          {scoreItems.map((s) => (
            scores[s.key] != null && (
              <div key={s.key} className="flex items-center gap-3">
                <span className="text-xs text-dark-400 w-20">{s.label}</span>
                <div className="flex-1 h-2 bg-dark-700 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full ${s.color} rounded-full`}
                    initial={{ width: 0 }}
                    animate={{ width: `${scores[s.key]}%` }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                  />
                </div>
                <span className="text-xs font-mono text-dark-300 w-8 text-right">{scores[s.key]}</span>
              </div>
            )
          ))}
        </div>
      )}

      {result.suggestions?.length > 0 && (
        <div>
          <span className="text-xs text-dark-500">개선 제안</span>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {result.suggestions.map((s, i) => <span key={i} className="text-xs px-2.5 py-1 bg-amber-500/10 text-amber-400 rounded-lg">{s}</span>)}
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <span className="text-xs text-dark-500">{label}</span>
      <p className="text-dark-200 mt-0.5">{value || '-'}</p>
    </div>
  );
}
