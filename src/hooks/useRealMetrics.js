import { useMemo } from 'react';
import { useGameStore } from '../store/gameStore';

function dayKey(ts) {
  const d = new Date(ts);
  return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
}

function last7Days() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(dayKey(d.getTime()));
  }
  return days;
}

export function useRealMetrics() {
  const games = useGameStore((s) => s.games);

  return useMemo(() => {
    if (!games.length) {
      return {
        hasData: false,
        statCards: [],
        dauData: [],
        sessionData: [],
        retentionData: [],
        retentionGameNames: [],
        genreRadarData: [],
        genreList: [],
        gameScoreComparison: [],
      };
    }

    // ── 기본 통계 ──
    const goGames = games.filter((g) => g.decision === 'go');
    const allScores = games.filter((g) => g.scores).map((g) => g.scores);
    const avgScore = allScores.length > 0
      ? Math.round(allScores.reduce((s, sc) => s + (sc.gameplay + sc.visual + sc.replayability + sc.marketFit) / 4, 0) / allScores.length)
      : 0;
    const bestGame = allScores.length > 0
      ? games.reduce((best, g) => {
          if (!g.scores) return best;
          const total = g.scores.gameplay + g.scores.visual + g.scores.replayability + g.scores.marketFit;
          return total > (best._total || 0) ? { ...g, _total: total } : best;
        }, { _total: 0 })
      : null;

    const genreCount = {};
    games.forEach((g) => { genreCount[g.genre] = (genreCount[g.genre] || 0) + 1; });
    const topGenre = Object.entries(genreCount).sort((a, b) => b[1] - a[1])[0];

    const now = Date.now();
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const weekGames = games.filter((g) => g.createdAt >= weekAgo);

    const statCards = [
      { label: '총 게임 수', value: games.length, unit: '개', change: weekGames.length > 0 ? `+${weekGames.length} 이번 주` : '-', positive: weekGames.length > 0 },
      { label: 'GO 판정률', value: games.length > 0 ? Math.round((goGames.length / games.length) * 100) : 0, unit: '%', change: `${goGames.length}/${games.length}`, positive: goGames.length > games.length / 2 },
      { label: '평균 점수', value: avgScore, unit: '점', change: bestGame?.title ? `최고: ${bestGame.title.slice(0, 8)}` : '-', positive: avgScore >= 60 },
      { label: '평균 게임플레이', value: allScores.length > 0 ? Math.round(allScores.reduce((s, sc) => s + sc.gameplay, 0) / allScores.length) : 0, unit: '점', change: '', positive: true },
      { label: '평균 비주얼', value: allScores.length > 0 ? Math.round(allScores.reduce((s, sc) => s + sc.visual, 0) / allScores.length) : 0, unit: '점', change: '', positive: true },
      { label: '최다 장르', value: topGenre ? topGenre[0].slice(0, 6) : '-', unit: topGenre ? `${topGenre[1]}개` : '', change: `${Object.keys(genreCount).length}개 장르`, positive: true },
    ];

    // ── DAU 차트 (일별 게임 생성 수) ──
    const days = last7Days();
    const gamesByDay = {};
    games.forEach((g) => {
      const dk = dayKey(g.createdAt);
      gamesByDay[dk] = (gamesByDay[dk] || 0) + 1;
    });
    const dauData = days.map((d) => ({ date: d, dau: gamesByDay[d] || 0 }));

    // ── 세션 차트 (일별 생성 + 평균 점수) ──
    const scoresByDay = {};
    games.forEach((g) => {
      if (!g.scores) return;
      const dk = dayKey(g.createdAt);
      if (!scoresByDay[dk]) scoresByDay[dk] = [];
      scoresByDay[dk].push((g.scores.gameplay + g.scores.visual + g.scores.replayability + g.scores.marketFit) / 4);
    });
    const sessionData = days.map((d) => ({
      date: d,
      sessions: gamesByDay[d] || 0,
      avgDuration: scoresByDay[d]?.length > 0
        ? Math.round(scoresByDay[d].reduce((a, b) => a + b, 0) / scoresByDay[d].length)
        : 0,
    }));

    // ── 게임별 점수 비교 (RetentionChart 대체) ──
    const scored = games.filter((g) => g.scores).slice(0, 5);
    const scoreKeys = ['gameplay', 'visual', 'replayability', 'marketFit'];
    const scoreLabels = ['게임플레이', '비주얼', '리플레이', '시장적합'];
    const retentionData = scoreLabels.map((label, i) => {
      const entry = { day: label };
      scored.forEach((g, gi) => { entry[`game${gi + 1}`] = g.scores[scoreKeys[i]]; });
      return entry;
    });
    const retentionGameNames = scored.map((g) => g.title?.slice(0, 10) || `Game ${g.id}`);

    // ── 장르별 레이더 차트 ──
    const genreScores = {};
    games.forEach((g) => {
      if (!g.scores || !g.genre) return;
      if (!genreScores[g.genre]) genreScores[g.genre] = { gameplay: [], visual: [], replayability: [], marketFit: [], count: 0 };
      const gs = genreScores[g.genre];
      gs.gameplay.push(g.scores.gameplay);
      gs.visual.push(g.scores.visual);
      gs.replayability.push(g.scores.replayability);
      gs.marketFit.push(g.scores.marketFit);
      gs.count++;
    });
    const avg = (arr) => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;
    const genres = Object.keys(genreScores).slice(0, 3);
    const radarMetrics = ['게임플레이', '비주얼', '리플레이', '시장적합'];
    const radarKeys = ['gameplay', 'visual', 'replayability', 'marketFit'];
    const genreRadarData = radarMetrics.map((metric, i) => {
      const entry = { metric };
      genres.forEach((genre, gi) => {
        const key = ['genreA', 'genreB', 'genreC'][gi];
        entry[key] = avg(genreScores[genre][radarKeys[i]]);
      });
      return entry;
    });

    const genreList = genres.map((name, i) => {
      const gs = genreScores[name];
      const avgAll = avg([...gs.gameplay, ...gs.visual, ...gs.replayability, ...gs.marketFit]);
      const best = radarKeys.reduce((b, k) => avg(gs[k]) > avg(gs[b] || [0]) ? k : b, radarKeys[0]);
      const worst = radarKeys.reduce((w, k) => avg(gs[k]) < avg(gs[w] || [100]) ? k : w, radarKeys[0]);
      const keyMap = { gameplay: '게임플레이', visual: '비주얼', replayability: '리플레이', marketFit: '시장적합' };
      return {
        name,
        color: ['primary', 'amber', 'emerald'][i],
        radarKey: ['genreA', 'genreB', 'genreC'][i],
        avgScore: avgAll,
        strength: `높은 ${keyMap[best]} (${avg(gs[best])})`,
        weakness: `낮은 ${keyMap[worst]} (${avg(gs[worst])})`,
        count: gs.count,
      };
    });

    // ── 게임별 점수 비교 카드용 ──
    const gameScoreComparison = scored.map((g) => ({
      id: g.id || g.gameId,
      title: g.title,
      genre: g.genre,
      decision: g.decision,
      scores: g.scores,
      total: Math.round((g.scores.gameplay + g.scores.visual + g.scores.replayability + g.scores.marketFit) / 4),
      createdAt: g.createdAt,
    }));

    return {
      hasData: true,
      statCards,
      dauData,
      sessionData,
      retentionData,
      retentionGameNames,
      genreRadarData,
      genreList,
      gameScoreComparison,
    };
  }, [games]);
}
