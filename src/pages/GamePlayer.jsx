import { useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGameSession } from '../hooks/useGameSession';
import { useGameStore } from '../store/gameStore';

export default function GamePlayer() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { playSession, start, end } = useGameSession();
  const game = useGameStore((s) => s.getGameById(gameId));
  const currentGame = useGameStore((s) => s.currentGame);

  useEffect(() => {
    if (gameId) start(gameId);
    return () => { if (playSession) end('navigated_away'); };
  }, [gameId]);

  const gameBlobUrl = useMemo(() => {
    const code = game?.code || currentGame?.code;
    if (!code) return null;
    const blob = new Blob([code], { type: 'text/html' });
    return URL.createObjectURL(blob);
  }, [game?.code, currentGame?.code]);

  useEffect(() => {
    return () => { if (gameBlobUrl) URL.revokeObjectURL(gameBlobUrl); };
  }, [gameBlobUrl]);

  const handleEndGame = async (reason) => {
    await end(reason);
    navigate('/dashboard');
  };

  const displayGame = game || currentGame;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{displayGame?.title || '게임 플레이어'}</h1>
          <p className="text-dark-400 mt-1 text-sm">
            {displayGame?.genre && <span className="mr-3">{displayGame.genre}</span>}
            <span className="font-mono text-dark-500">{gameId}</span>
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate('/dashboard')} className="btn-secondary">
            대시보드로
          </button>
          <button onClick={() => handleEndGame('user_quit')} className="btn-secondary">
            게임 종료
          </button>
        </div>
      </div>

      {/* Game Render Area */}
      {gameBlobUrl ? (
        <div className="rounded-2xl overflow-hidden border border-dark-700/50 bg-black">
          <iframe
            src={gameBlobUrl}
            title={displayGame?.title || 'Game'}
            className="w-full"
            style={{ height: '620px' }}
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      ) : (
        <div className="card min-h-[60vh] flex items-center justify-center">
          <div className="text-center text-dark-500">
            <p className="text-6xl mb-4">🎮</p>
            <p className="text-xl font-medium">게임 코드를 찾을 수 없습니다</p>
            <p className="text-sm mt-2">Agent 파이프라인을 먼저 실행해주세요</p>
          </div>
        </div>
      )}

      {/* Session Info */}
      {playSession && (
        <div className="card !p-4">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-dark-500">시작 시간</span>
              <p className="font-mono mt-0.5">{new Date(playSession.startedAt).toLocaleTimeString('ko-KR')}</p>
            </div>
            <div>
              <span className="text-dark-500">이벤트 수</span>
              <p className="font-mono mt-0.5">{playSession.events.length}</p>
            </div>
            <div>
              <span className="text-dark-500">빌드 상태</span>
              <p className="font-mono mt-0.5">{displayGame?.buildStatus || '-'}</p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
