import { motion } from 'framer-motion';

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

const mockMetrics = [
  { label: 'DAU (일간 활성 유저)', value: '-', trend: 'neutral' },
  { label: 'MAU (월간 활성 유저)', value: '-', trend: 'neutral' },
  { label: 'D1 리텐션', value: '-', trend: 'neutral' },
  { label: 'D7 리텐션', value: '-', trend: 'neutral' },
  { label: '평균 세션 시간', value: '-', trend: 'neutral' },
  { label: '세션당 이벤트 수', value: '-', trend: 'neutral' },
];

export default function Reports() {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">지표 분석</h1>
        <p className="text-dark-400 mt-1">유저 플레이 데이터를 장르별로 분석합니다</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockMetrics.map((metric) => (
          <motion.div key={metric.label} variants={item} className="card">
            <p className="text-sm text-dark-400">{metric.label}</p>
            <p className="text-3xl font-bold mt-2">{metric.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Chart Placeholder */}
      <motion.div variants={item} className="card">
        <h2 className="text-lg font-semibold mb-4">장르별 유저 반응 비교</h2>
        <div className="h-64 flex items-center justify-center text-dark-500 border border-dashed border-dark-600 rounded-xl">
          <div className="text-center">
            <p className="text-4xl mb-3">📊</p>
            <p>데이터가 수집되면 차트가 표시됩니다</p>
            <p className="text-sm mt-1 text-dark-600">Recharts 기반 시각화</p>
          </div>
        </div>
      </motion.div>

      {/* Genre Comparison Placeholder */}
      <motion.div variants={item} className="card">
        <h2 className="text-lg font-semibold mb-4">주제별 성과 비교</h2>
        <div className="h-48 flex items-center justify-center text-dark-500 border border-dashed border-dark-600 rounded-xl">
          <div className="text-center">
            <p className="text-4xl mb-3">📈</p>
            <p>게임이 배포된 후 비교 데이터가 표시됩니다</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
