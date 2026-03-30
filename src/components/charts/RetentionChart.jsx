import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const DEMO_DATA = [
  { day: 'D0', game1: 100, game2: 100, game3: 100 },
  { day: 'D1', game1: 42, game2: 38, game3: 55 },
  { day: 'D3', game1: 28, game2: 22, game3: 35 },
  { day: 'D7', game1: 18, game2: 12, game3: 24 },
  { day: 'D14', game1: 12, game2: 7, game3: 18 },
  { day: 'D30', game1: 8, game2: 4, game3: 13 },
];

const COLORS = ['#6366f1', '#f59e0b', '#10b981'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-dark-800 border border-dark-600 rounded-lg px-3 py-2 shadow-xl">
      <p className="text-xs text-dark-400 mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-xs" style={{ color: entry.color }}>
          {entry.name}: {entry.value}%
        </p>
      ))}
    </div>
  );
};

export default function RetentionChart({ data, gameNames }) {
  const chartData = data?.length > 0 ? data : DEMO_DATA;
  const names = gameNames || ['좀비 서바이벌', '뱀파이어 서바이벌', '이세계 방치형'];

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis
          tick={{ fill: '#64748b', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${v}%`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: 11, color: '#94a3b8' }}
        />
        <Line type="monotone" dataKey="game1" name={names[0]} stroke={COLORS[0]} strokeWidth={2} dot={{ r: 3 }} />
        <Line type="monotone" dataKey="game2" name={names[1]} stroke={COLORS[1]} strokeWidth={2} dot={{ r: 3 }} />
        <Line type="monotone" dataKey="game3" name={names[2]} stroke={COLORS[2]} strokeWidth={2} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
