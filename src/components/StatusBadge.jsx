import { motion } from 'framer-motion';

const statusConfig = {
  idle: { color: 'bg-dark-600', text: '대기', pulse: false },
  running: { color: 'bg-amber-500', text: '실행 중', pulse: true },
  completed: { color: 'bg-emerald-500', text: '완료', pulse: false },
  error: { color: 'bg-red-500', text: '오류', pulse: false },
};

export default function StatusBadge({ status }) {
  const config = statusConfig[status] || statusConfig.idle;

  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium">
      <span className="relative flex h-2 w-2">
        {config.pulse && (
          <motion.span
            className={`absolute inline-flex h-full w-full rounded-full ${config.color} opacity-75`}
            animate={{ scale: [1, 1.5, 1], opacity: [0.75, 0, 0.75] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${config.color}`} />
      </span>
      {config.text}
    </span>
  );
}
