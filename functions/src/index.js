const { onCall } = require('firebase-functions/v2/https');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

initializeApp();
const db = getFirestore();

/**
 * 트렌드 분석 — 외부 소스에서 핫한 주제를 탐지
 */
exports.analyzeTrends = onCall(async (request) => {
  // TODO: LLM 기반 트렌드 분석 로직 구현
  // 외부 API (YouTube, 게임 커뮤니티 등) 연동
  return {
    topics: [
      {
        keyword: '좀비 서바이벌',
        source: 'YouTube',
        score: 0.92,
        description: '좀비 서바이벌 장르 인기 급상승',
      },
    ],
    analyzedAt: Date.now(),
  };
});

/**
 * 게임 기획서 생성 — LLM 기반으로 시스템/콘텐츠 기획서 작성
 */
exports.generateGamePlan = onCall(async (request) => {
  const { topic } = request.data;
  // TODO: LLM 호출하여 기획서 생성
  return {
    topic,
    systemDesign: {
      title: `${topic.keyword} — 시스템 기획서`,
      genre: '서바이벌 액션',
      coreLoop: '탐색 → 전투 → 자원 수집 → 업그레이드',
    },
    contentDesign: {
      title: `${topic.keyword} — 콘텐츠 기획서`,
      stages: 5,
    },
    createdAt: Date.now(),
  };
});

/**
 * 게임 클라이언트 코드 생성
 */
exports.generateGameClient = onCall(async (request) => {
  const { plan } = request.data;
  // TODO: LLM 기반 코드 생성
  return { status: 'generated', message: '클라이언트 코드 생성 완료' };
});

/**
 * 게임 서버 로직 생성
 */
exports.generateGameServer = onCall(async (request) => {
  const { plan } = request.data;
  // TODO: LLM 기반 서버 로직 생성
  return { status: 'generated', message: '서버 로직 생성 완료' };
});

/**
 * 게임 평가 — 유저 지표 기반 Go/No-Go 판단
 */
exports.evaluateGame = onCall(async (request) => {
  const { gameId } = request.data;
  // TODO: Firestore에서 플레이 로그 수집 후 LLM 분석
  return {
    gameId,
    decision: 'go',
    reasoning: '평가 결과 양호',
    evaluatedAt: Date.now(),
  };
});
