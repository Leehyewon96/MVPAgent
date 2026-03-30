import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const DEMO_DATA = [
  { date: '03/24', sessions: 34, avgDuration: 8.2 },
  { date: '03/25', sessions: 56, avgDuration: 7.5 },
  { date: '03/26', sessions: 89, avgDuration: 9.1 },
  { date: '03/27', sessions: 72, avgDuration: 8.8 },
  { date: '03/28', sessions: 110, avgDuration: 10.3 },
  { date: '03/29', sessions: 95, avgDuration: 9.6 },
  { date: '03/30', sessions: 128, avgDuration: 11.1 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-dark-800 border border-dark-600 rounded-lg px-3 py-2 shadow-xl">
      <p className="text-xs text-dark-400">{label}</p>
      <p className="text-sm font-semibold text-amber-300">{payload[0].value} 세션</p>
      {payload[1] && (
        <p className="text-xs text-dark-400">평균 {payload[1].value}분</p>
      )}
    </div>
  );
};

export default function SessionChart({ data }) {
  const chartData = data?.length > 0 ? data : DEMO_DATA;

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="sessions" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={24} />
      </BarChart>
    </ResponsiveContainer>
  );
}
