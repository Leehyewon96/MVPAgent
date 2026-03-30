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

const COLORS = ['#6366f1', '#f59e0b', '#10b981'];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-dark-800 border border-dark-600 rounded-lg px-3 py-2 shadow-xl">
      {payload.map((entry, i) => (
        <p key={i} className="text-xs" style={{ color: entry.color }}>
          {entry.name}: {entry.value}점
        </p>
      ))}
    </div>
  );
};

export default function GenreComparisonChart({ data, genres }) {
  if (!data?.length || !genres?.length) {
    return (
      <div className="flex items-center justify-center h-[320px] text-dark-500 text-sm">
        <p>여러 장르의 게임을 생성하면 비교 차트가 표시됩니다</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
        <PolarGrid stroke="#334155" />
        <PolarAngleAxis dataKey="metric" tick={{ fill: '#94a3b8', fontSize: 11 }} />
        <PolarRadiusAxis tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} domain={[0, 100]} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
        {genres.map((g, i) => (
          <Radar
            key={g.name}
            name={g.name}
            dataKey={g.radarKey}
            stroke={COLORS[i % COLORS.length]}
            fill={COLORS[i % COLORS.length]}
            fillOpacity={0.15}
          />
        ))}
      </RadarChart>
    </ResponsiveContainer>
  );
}
