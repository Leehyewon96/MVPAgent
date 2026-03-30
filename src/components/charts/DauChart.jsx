import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const DEMO_DATA = [
  { date: '03/24', dau: 12 },
  { date: '03/25', dau: 28 },
  { date: '03/26', dau: 45 },
  { date: '03/27', dau: 38 },
  { date: '03/28', dau: 62 },
  { date: '03/29', dau: 55 },
  { date: '03/30', dau: 71 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-dark-800 border border-dark-600 rounded-lg px-3 py-2 shadow-xl">
      <p className="text-xs text-dark-400">{label}</p>
      <p className="text-sm font-semibold text-primary-300">{payload[0].value} 명</p>
    </div>
  );
};

export default function DauChart({ data }) {
  const chartData = data?.length > 0 ? data : DEMO_DATA;

  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="dauGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="dau"
          stroke="#6366f1"
          strokeWidth={2}
          fill="url(#dauGrad)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
