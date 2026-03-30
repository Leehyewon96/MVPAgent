import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-dark-800 border border-dark-600 rounded-lg px-3 py-2 shadow-xl">
      <p className="text-xs text-dark-400">{label}</p>
      <p className="text-sm font-semibold text-amber-300">{payload[0].value} 게임</p>
      {payload[1]?.value > 0 && (
        <p className="text-xs text-dark-400">평균 점수 {payload[1].value}점</p>
      )}
    </div>
  );
};

export default function SessionChart({ data }) {
  if (!data?.length || data.every((d) => d.sessions === 0)) {
    return <EmptyChart label="게임을 생성하면 일별 생성 현황이 표시됩니다" />;
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="sessions" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={24} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function EmptyChart({ label }) {
  return (
    <div className="flex items-center justify-center h-[240px] text-dark-500 text-sm">
      <p>{label}</p>
    </div>
  );
}
