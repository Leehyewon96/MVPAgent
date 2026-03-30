import { useState } from 'react';
import { motion } from 'framer-motion';
import DauChart from '../components/charts/DauChart';
import RetentionChart from '../components/charts/RetentionChart';
import GenreComparisonChart from '../components/charts/GenreComparisonChart';
import SessionChart from '../components/charts/SessionChart';

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

const metricCards = [
  { label: 'DAU', value: '71', unit: '명', change: '+29%', positive: true },
  { label: 'MAU', value: '342', unit: '명', change: '+15%', positive: true },
  { label: 'D1 리텐션', value: '42', unit: '%', change: '+3%', positive: true },
  { label: 'D7 리텐션', value: '18', unit: '%', change: '-2%', positive: false },
  { label: '평균 세션', value: '9.6', unit: '분', change: '+12%', positive: true },
  { label: '세션/유저', value: '1.8', unit: '회', change: '+5%', positive: true },
];

const tabs = [
  { key: 'overview', label: '전체 개요' },
  { key: 'retention', label: '리텐션 분석' },
  { key: 'genre', label: '장르별 비교' },
];

export default function Reports() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">지표 분석</h1>
        <p className="text-dark-400 mt-1">유저 플레이 데이터를 장르별로 분석합니다</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {metricCards.map((m) => (
          <motion.div key={m.label} variants={item} className="card !p-4">
            <p className="text-xs text-dark-400">{m.label}</p>
            <p className="text-2xl font-bold mt-1">
              {m.value}
              <span className="text-sm font-normal text-dark-500 ml-0.5">{m.unit}</span>
            </p>
            <p className={`text-xs mt-1 ${m.positive ? 'text-emerald-400' : 'text-red-400'}`}>
              {m.change}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-dark-800/50 p-1 rounded-xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-primary-600 text-white'
                : 'text-dark-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <motion.div variants={item} className="card">
            <h2 className="text-lg font-semibold mb-4">일간 활성 유저 추이</h2>
            <DauChart />
          </motion.div>
          <motion.div variants={item} className="card">
            <h2 className="text-lg font-semibold mb-4">일간 세션 수 추이</h2>
            <SessionChart />
          </motion.div>
        </div>
      )}

      {activeTab === 'retention' && (
        <motion.div variants={item} className="card">
          <h2 className="text-lg font-semibold mb-2">게임별 리텐션 곡선</h2>
          <p className="text-sm text-dark-400 mb-4">
            D0부터 D30까지 유저 잔존율을 게임별로 비교합니다
          </p>
          <RetentionChart />
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="bg-dark-900/50 rounded-lg p-3 border-l-2 border-primary-500">
              <p className="text-xs text-dark-400">좀비 서바이벌</p>
              <p className="text-lg font-bold">D1: 42%</p>
              <p className="text-xs text-dark-500">D7: 18% · D30: 8%</p>
            </div>
            <div className="bg-dark-900/50 rounded-lg p-3 border-l-2 border-amber-500">
              <p className="text-xs text-dark-400">뱀파이어 서바이벌</p>
              <p className="text-lg font-bold">D1: 38%</p>
              <p className="text-xs text-dark-500">D7: 12% · D30: 4%</p>
            </div>
            <div className="bg-dark-900/50 rounded-lg p-3 border-l-2 border-emerald-500">
              <p className="text-xs text-dark-400">이세계 방치형</p>
              <p className="text-lg font-bold">D1: 55%</p>
              <p className="text-xs text-dark-500">D7: 24% · D30: 13%</p>
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'genre' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <motion.div variants={item} className="card">
            <h2 className="text-lg font-semibold mb-2">장르별 지표 레이더</h2>
            <p className="text-sm text-dark-400 mb-4">
              6개 핵심 지표를 장르별로 비교합니다
            </p>
            <GenreComparisonChart />
          </motion.div>
          <motion.div variants={item} className="card">
            <h2 className="text-lg font-semibold mb-4">장르별 요약</h2>
            <div className="space-y-3">
              {[
                { name: '서바이벌', color: 'primary', strength: '높은 세션 시간', weakness: '이벤트 다양성 부족' },
                { name: '방치형', color: 'amber', strength: '높은 재방문율/리텐션', weakness: '낮은 세션 시간' },
                { name: '액션', color: 'emerald', strength: '높은 이벤트 수/만족도', weakness: '리텐션 유지 어려움' },
              ].map((genre) => (
                <div key={genre.name} className="bg-dark-900/50 rounded-xl p-4 border border-dark-700/30">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-2 h-2 rounded-full bg-${genre.color}-500`} />
                    <span className="font-medium">{genre.name}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-dark-500">강점</span>
                      <p className="text-emerald-400 mt-0.5">{genre.strength}</p>
                    </div>
                    <div>
                      <span className="text-dark-500">약점</span>
                      <p className="text-red-400 mt-0.5">{genre.weakness}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      <motion.div variants={item} className="text-xs text-dark-600 text-center">
        * 현재 표시된 데이터는 데모 데이터입니다. Firebase 연결 후 실제 유저 데이터로 전환됩니다.
      </motion.div>
    </motion.div>
  );
}
