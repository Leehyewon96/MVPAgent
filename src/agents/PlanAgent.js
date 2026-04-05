/**
 * Plan Agent
 * 선정된 주제를 기반으로 게임 시스템 기획서 및 게임 콘텐츠 기획서를 자동 작성한다.
 * Dev Server 연결 시 Claude API로 실제 기획서를 생성한다.
 */

import { useAgentStore } from '../store/agentStore';

const DEV_API = 'http://localhost:3100/api';

export class PlanAgent {
  log(message) {
    useAgentStore.getState().addAgentLog('plan', message);
  }

  async createPlan(trendData) {
    this.log('기획 문서 작성 시작');

    const bestTopic = trendData.topics?.sort((a, b) => b.score - a.score)[0];
    if (!bestTopic) throw new Error('선정된 주제가 없습니다');

    this.log(`선정 주제: ${bestTopic.keyword} (스코어: ${bestTopic.score})`);

    try {
      this.log('Claude API를 통한 기획서 생성 요청 중...');
      const res = await fetch(`${DEV_API}/generate-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: bestTopic }),
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      const data = await res.json();
      const title = data.gameTitle || data.systemDesign?.title || 'Untitled';
      const genre = data.genreName || data.systemDesign?.genre || 'Unknown';
      this.log(`기획서 생성 완료: "${title}"`);
      this.log(`  장르: ${genre}`);
      this.log(`  코어 루프: ${data.systemDesign?.coreLoop || ''}`);
      this.log(`  조작: ${data.systemDesign?.controls || ''}`);
      return data;
    } catch (error) {
      this.log(`API 연결 실패 — 목업 기획서 반환 (${error.message})`);
      return this.getMockPlan(bestTopic);
    }
  }

  getMockPlan(topic) {
    return {
      topic,
      systemDesign: {
        title: `${topic.keyword} — 서바이벌`,
        genre: '서바이벌 액션',
        coreLoop: '탐색 → 전투 → 자원 수집 → 업그레이드',
        controls: '방향키 이동, 스페이스 공격',
        mechanics: ['자원 관리', '스킬 트리', '웨이브 기반 전투'],
        winCondition: '모든 웨이브 클리어',
        difficulty: '웨이브마다 적 수 증가',
      },
      contentDesign: {
        title: `${topic.keyword} — 콘텐츠 기획서`,
        theme: '다크 판타지',
        stages: 5,
        enemies: ['일반 좀비', '돌연변이', '보스'],
        items: ['무기', '방어구', '회복 아이템'],
        colorScheme: '어두운 톤, 빨간 악센트',
      },
      createdAt: Date.now(),
    };
  }
}
