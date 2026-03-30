import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';

const navItems = [
  { to: '/dashboard', label: '대시보드', icon: '📊' },
  { to: '/pipeline', label: 'Agent 파이프라인', icon: '🤖' },
  { to: '/reports', label: '지표 분석', icon: '📈' },
];

export default function Sidebar() {
  return (
    <aside className="w-64 fixed inset-y-0 left-0 bg-dark-900 border-r border-dark-700/50 flex flex-col z-40">
      <div className="h-16 flex items-center px-6 border-b border-dark-700/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center text-white font-bold text-sm">
            MA
          </div>
          <span className="font-semibold text-lg">MVP Agent</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-primary-600/20 text-primary-300'
                  : 'text-dark-300 hover:text-white hover:bg-dark-800'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-indicator"
                    className="ml-auto w-1.5 h-1.5 bg-primary-400 rounded-full"
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-dark-700/50">
        <div className="card !p-3 text-xs text-dark-400">
          <p>MVP Agent v0.1.0</p>
          <p className="mt-1 text-dark-500">멀티 에이전트 게임 파이프라인</p>
        </div>
      </div>
    </aside>
  );
}
