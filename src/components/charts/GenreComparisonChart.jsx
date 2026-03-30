import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';

const DEMO_DATA = [
  { metric: 'DAU', survival: 85, idle: 62, action: 78 },
  { metric: '리텐션', survival: 72, idle: 88, action: 65 },
  { metric: '세션 시간', survival: 90, idle: 45, action: 82 },
  { metric: '이벤트 수', survival: 68, idle: 35, action: 92 },
  { metric: '재방문율', survival: 75, idle: 90, action: 60 },
  { metric: '만족도', survival: 80, idle: 70, action: 85 },
];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-dark-800 border border-dark-600 rounded-lg px-3 py-2 shadow-xl">
      {payload.map((entry, i) => (
        <p key={i} className="text-xs" style={{ color: entry.color }}>
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
};

export default function GenreComparisonChart({ data }) {
  const chartData = data?.length > 0 ? data : DEMO_DATA;

  return (
    <ResponsiveContainer width="100%" height={320}>
      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
        <PolarGrid stroke="#334155" />
        <PolarAngleAxis dataKey="metric" tick={{ fill: '#94a3b8', fontSize: 11 }} />
        <PolarRadiusAxis tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
        <Radar name="서바이벌" dataKey="survival" stroke="#6366f1" fill="#6366f1" fillOpacity={0.15} />
        <Radar name="방치형" dataKey="idle" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.15} />
        <Radar name="액션" dataKey="action" stroke="#10b981" fill="#10b981" fillOpacity={0.15} />
      </RadarChart>
    </ResponsiveContainer>
  );
}
