import { motion, AnimatePresence } from 'framer-motion';
import StatusBadge from '../components/StatusBadge';
import { useAgentPipeline } from '../hooks/useAgentPipeline';

const pipelineSteps = [
  {
    key: 'trend',
    title: '시장조사 Agent',
    description: '트렌드 분석, 경쟁 게임 분석, 장르 결정',
    icon: '🔍',
  },
  {
    key: 'plan',
    title: '기획 Agent',
    description: '콘텐츠 기획, 시스템 기획, 기술 스택 검토',
    icon: '📋',
  },
  {
    key: 'dev',
    title: '개발 Agent',
    description: '클라이언트, 서버, 에셋 생성, QA/테스트',
    icon: '💻',
  },
  {
    key: 'judge',
    title: '판단 Agent',
    description: '지표 수집, Go/No-Go 판단',
    icon: '⚖️',
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariant = {
  hidden: { opacity: 0, x: -16 },
  show: { opacity: 1, x: 0 },
};

export default function AgentPipeline() {
  const { start, reset, pipelineStatus, agents } = useAgentPipeline();

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Agent 파이프라인</h1>
          <p className="text-dark-400 mt-1">
            트렌드 분석부터 게임 배포까지 전체 자동화 흐름을 관리합니다
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={reset}
            disabled={pipelineStatus === 'running'}
            className="btn-secondary disabled:opacity-50"
          >
            초기화
          </button>
          <button
            onClick={start}
            disabled={pipelineStatus === 'running'}
            className="btn-primary disabled:opacity-50"
          >
            {pipelineStatus === 'running' ? '실행 중...' : '파이프라인 시작'}
          </button>
        </div>
      </div>

      {/* Pipeline Complete Banner */}
      <AnimatePresence>
        {pipelineStatus === 'completed' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 flex items-center gap-3"
          >
            <span className="text-2xl">✅</span>
            <div>
              <p className="font-semibold text-emerald-300">파이프라인 완료</p>
              <p className="text-sm text-emerald-400/70">
                게임이 성공적으로 생성되었습니다. 대시보드에서 확인하세요.
              </p>
            </div>
          </motion.div>
        )}
        {pipelineStatus === 'error' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-center gap-3"
          >
            <span className="text-2xl">❌</span>
            <div>
              <p className="font-semibold text-red-300">파이프라인 오류</p>
              <p className="text-sm text-red-400/70">
                오류가 발생했습니다. 초기화 후 다시 시도하세요.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Orchestrator */}
      <motion.div variants={itemVariant} className="card border-primary-500/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎯</span>
            <div>
              <h3 className="font-semibold">Orchestrator</h3>
              <p className="text-sm text-dark-400">전체 파이프라인 흐름 제어</p>
            </div>
          </div>
          <StatusBadge status={agents.orchestrator.status} />
        </div>
        {agents.orchestrator.logs.length > 0 && (
          <div className="mt-4 bg-dark-900/50 rounded-lg p-3 max-h-40 overflow-y-auto">
            {agents.orchestrator.logs.map((log, i) => (
              <p key={i} className="text-xs font-mono text-dark-400">
                <span className="text-dark-600">
                  {new Date(log.timestamp).toLocaleTimeString('ko-KR')}
                </span>{' '}
                {log.message}
              </p>
            ))}
          </div>
        )}
      </motion.div>

      {/* Pipeline Steps */}
      <div className="relative">
        <div className="absolute left-8 top-0 bottom-0 w-px bg-dark-700/50" />

        {pipelineSteps.map((step) => {
          const agent = agents[step.key];
          const hasResult = agent.result !== null;

          return (
            <motion.div
              key={step.key}
              variants={itemVariant}
              className="relative pl-20 pb-6 last:pb-0"
            >
              <div className="absolute left-6 top-3 w-5 h-5 bg-dark-800 border-2 border-dark-600 rounded-full flex items-center justify-center z-10">
                <motion.div
                  className={`w-2 h-2 rounded-full ${
                    agent.status === 'completed'
                      ? 'bg-emerald-500'
                      : agent.status === 'running'
                        ? 'bg-amber-500'
                        : agent.status === 'error'
                          ? 'bg-red-500'
                          : 'bg-dark-600'
                  }`}
                  animate={agent.status === 'running' ? { scale: [1, 1.4, 1] } : {}}
                  transition={agent.status === 'running' ? { duration: 1, repeat: Infinity } : {}}
                />
              </div>

              <div className="card">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{step.icon}</span>
                    <div>
                      <h3 className="font-semibold">{step.title}</h3>
                      <p className="text-sm text-dark-400 mt-1">{step.description}</p>
                    </div>
                  </div>
                  <StatusBadge status={agent.status} />
                </div>

                {/* Logs */}
                {agent.logs.length > 0 && (
                  <div className="mt-4 bg-dark-900/50 rounded-lg p-3 max-h-32 overflow-y-auto">
                    {agent.logs.map((log, i) => (
                      <p key={i} className="text-xs font-mono text-dark-400">
                        <span className="text-dark-600">
                          {new Date(log.timestamp).toLocaleTimeString('ko-KR')}
                        </span>{' '}
                        {log.message}
                      </p>
                    ))}
                  </div>
                )}

                {/* Result Summary */}
                <AnimatePresence>
                  {hasResult && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-3 pt-3 border-t border-dark-700/50"
                    >
                      <ResultSummary agentKey={step.key} result={agent.result} />
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

function ResultSummary({ agentKey, result }) {
  if (!result) return null;

  switch (agentKey) {
    case 'trend':
      return (
        <div className="space-y-1">
          <p className="text-xs font-medium text-emerald-400">발견된 트렌드 주제</p>
          {result.topics?.map((t, i) => (
            <div key={i} className="flex items-center justify-between text-xs">
              <span className="text-dark-300">{t.keyword}</span>
              <span className="text-dark-500">{t.source} · 스코어 {t.score}</span>
            </div>
          ))}
        </div>
      );
    case 'plan':
      return (
        <div className="space-y-1">
          <p className="text-xs font-medium text-emerald-400">기획서 생성 완료</p>
          <p className="text-xs text-dark-300">
            장르: {result.systemDesign?.genre} · 코어 루프: {result.systemDesign?.coreLoop}
          </p>
          <p className="text-xs text-dark-400">
            스테이지 {result.contentDesign?.stages}개
          </p>
        </div>
      );
    case 'dev':
      return (
        <div className="space-y-1">
          <p className="text-xs font-medium text-emerald-400">게임 빌드 완료</p>
          <p className="text-xs text-dark-300">
            {result.title} · 빌드: {result.buildStatus}
          </p>
          <p className="text-xs font-mono text-dark-500">ID: {result.gameId}</p>
        </div>
      );
    case 'judge':
      return (
        <div className="space-y-1">
          <p className={`text-xs font-medium ${result.decision === 'go' ? 'text-emerald-400' : 'text-red-400'}`}>
            판정: {result.decision === 'go' ? '✅ GO — 배포 진행' : '❌ NO-GO — 재검토 필요'}
          </p>
          <p className="text-xs text-dark-400">{result.reasoning}</p>
        </div>
      );
    default:
      return null;
  }
}
