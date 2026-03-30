import { motion } from 'framer-motion';
import StatusBadge from '../components/StatusBadge';
import { useAgentStore } from '../store/agentStore';

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

const item = {
  hidden: { opacity: 0, x: -16 },
  show: { opacity: 1, x: 0 },
};

export default function AgentPipeline() {
  const agents = useAgentStore((s) => s.agents);
  const pipelineStatus = useAgentStore((s) => s.pipelineStatus);
  const setPipelineStatus = useAgentStore((s) => s.setPipelineStatus);
  const resetPipeline = useAgentStore((s) => s.resetPipeline);

  const handleStartPipeline = () => {
    setPipelineStatus('running');
  };

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
          <button onClick={resetPipeline} className="btn-secondary">
            초기화
          </button>
          <button
            onClick={handleStartPipeline}
            disabled={pipelineStatus === 'running'}
            className="btn-primary disabled:opacity-50"
          >
            {pipelineStatus === 'running' ? '실행 중...' : '파이프라인 시작'}
          </button>
        </div>
      </div>

      {/* Orchestrator */}
      <motion.div variants={item} className="card border-primary-500/30">
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
      </motion.div>

      {/* Pipeline Steps */}
      <div className="relative">
        <div className="absolute left-8 top-0 bottom-0 w-px bg-dark-700/50" />

        {pipelineSteps.map((step, index) => {
          const agent = agents[step.key];
          return (
            <motion.div
              key={step.key}
              variants={item}
              className="relative pl-20 pb-6 last:pb-0"
            >
              <div className="absolute left-6 top-3 w-5 h-5 bg-dark-800 border-2 border-dark-600 rounded-full flex items-center justify-center z-10">
                <div
                  className={`w-2 h-2 rounded-full ${
                    agent.status === 'completed'
                      ? 'bg-emerald-500'
                      : agent.status === 'running'
                        ? 'bg-amber-500'
                        : 'bg-dark-600'
                  }`}
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
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
