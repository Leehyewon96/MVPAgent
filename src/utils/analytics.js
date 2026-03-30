/**
 * 유저 지표 계산 유틸리티
 */

export function calculateRetention(sessions, day) {
  if (!sessions || sessions.length === 0) return 0;

  const firstDaySessions = sessions.filter((s) => {
    const daysSinceFirst = Math.floor((s.startedAt - sessions[0].startedAt) / (1000 * 60 * 60 * 24));
    return daysSinceFirst === 0;
  });

  const returnedSessions = sessions.filter((s) => {
    const daysSinceFirst = Math.floor((s.startedAt - sessions[0].startedAt) / (1000 * 60 * 60 * 24));
    return daysSinceFirst === day;
  });

  const firstDayUsers = new Set(firstDaySessions.map((s) => s.userId));
  const returnedUsers = new Set(returnedSessions.map((s) => s.userId));

  const retained = [...returnedUsers].filter((u) => firstDayUsers.has(u));
  return firstDayUsers.size > 0 ? retained.length / firstDayUsers.size : 0;
}

export function calculateDAU(sessions, date = new Date()) {
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  const daySessions = sessions.filter(
    (s) => s.startedAt >= dayStart.getTime() && s.startedAt <= dayEnd.getTime(),
  );

  return new Set(daySessions.map((s) => s.userId)).size;
}

export function calculateAvgSessionDuration(sessions) {
  if (!sessions || sessions.length === 0) return 0;
  const totalDuration = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
  return totalDuration / sessions.length;
}

export function formatDuration(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) return `${hours}시간 ${minutes % 60}분`;
  if (minutes > 0) return `${minutes}분 ${seconds % 60}초`;
  return `${seconds}초`;
}

export function groupByGenre(games, sessions) {
  const genreMap = {};

  for (const game of games) {
    const genre = game.genre || 'Unknown';
    if (!genreMap[genre]) {
      genreMap[genre] = { games: [], sessions: [], totalUsers: 0 };
    }
    genreMap[genre].games.push(game);
  }

  for (const session of sessions) {
    const game = games.find((g) => g.id === session.gameId);
    const genre = game?.genre || 'Unknown';
    if (genreMap[genre]) {
      genreMap[genre].sessions.push(session);
    }
  }

  for (const genre of Object.keys(genreMap)) {
    genreMap[genre].totalUsers = new Set(
      genreMap[genre].sessions.map((s) => s.userId),
    ).size;
  }

  return genreMap;
}
