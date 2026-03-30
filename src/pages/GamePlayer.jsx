import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGameSession } from '../hooks/useGameSession';
import { useGameStore } from '../store/gameStore';

export default function GamePlayer() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { playSession, start, logEvent, end } = useGameSession();
  const currentGame = useGameStore((s) => s.currentGame);

  useEffect(() => {
    if (gameId) {
      start(gameId);
    }

    return () => {
      if (playSession) {
        end('navigated_away');
      }
    };
  }, [gameId]);

  const handleEndGame = async (reason) => {
    await end(reason);
    navigate('/dashboard');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {currentGame?.title || '게임 플레이어'}
          </h1>
          <p className="text-dark-400 mt-1">게임 ID: {gameId}</p>
        </div>
        <button onClick={() => handleEndGame('user_quit')} className="btn-secondary">
          게임 종료
        </button>
      </div>

      {/* Game Canvas Area */}
      <div className="card min-h-[60vh] flex items-center justify-center">
        <div className="text-center text-dark-500">
          <p className="text-6xl mb-4">🎮</p>
          <p className="text-xl font-medium">게임 렌더링 영역</p>
          <p className="text-sm mt-2">
            Agent 파이프라인에서 생성된 게임이 이 영역에 렌더링됩니다
          </p>
        </div>
      </div>

      {/* Play Session Info */}
      {playSession && (
        <div className="card">
          <h3 className="text-sm font-medium text-dark-400 mb-2">세션 정보</h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-dark-500">게임 ID</span>
              <p className="font-mono mt-1">{playSession.gameId}</p>
            </div>
            <div>
              <span className="text-dark-500">시작 시간</span>
              <p className="font-mono mt-1">
                {new Date(playSession.startedAt).toLocaleTimeString('ko-KR')}
              </p>
            </div>
            <div>
              <span className="text-dark-500">이벤트 수</span>
              <p className="font-mono mt-1">{playSession.events.length}</p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
