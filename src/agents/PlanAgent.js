/**
 * Plan Agent
 * 선정된 주제를 기반으로 게임 시스템 기획서 및 게임 콘텐츠 기획서를 자동 작성한다.
 * 출력: .md 형식의 기획 문서
 */

import { useAgentStore } from '../store/agentStore';
import { isConfigured } from '../firebase/config';

export class PlanAgent {
  log(message) {
    useAgentStore.getState().addAgentLog('plan', message);
  }

  async createPlan(trendData) {
    this.log('기획 문서 작성 시작');

    const bestTopic = trendData.topics?.sort((a, b) => b.score - a.score)[0];
    if (!bestTopic) {
      throw new Error('선정된 주제가 없습니다');
    }

    this.log(`선정 주제: ${bestTopic.keyword} (스코어: ${bestTopic.score})`);

    if (isConfigured) {
      try {
        const { functions } = await import('../firebase/config');
        const { httpsCallable } = await import('firebase/functions');
        const generatePlan = httpsCallable(functions, 'generateGamePlan');
        const result = await generatePlan({ topic: bestTopic });
        this.log('기획 문서 생성 완료');
        return result.data;
      } catch (error) {
        this.log('Cloud Function 호출 실패 — 목업 기획서 반환');
      }
    } else {
      this.log('Dev Mode — 목업 기획서 사용');
    }

    return this.getMockPlan(bestTopic);
  }

  getMockPlan(topic) {
    return {
      topic,
      systemDesign: {
        title: `${topic.keyword} — 시스템 기획서`,
        genre: '서바이벌 액션',
        coreLoop: '탐색 → 전투 → 자원 수집 → 업그레이드',
        mechanics: ['자원 관리', '스킬 트리', '웨이브 기반 전투', '랜덤 이벤트'],
      },
      contentDesign: {
        title: `${topic.keyword} — 콘텐츠 기획서`,
        stages: 5,
        enemies: ['일반 좀비', '돌연변이', '보스'],
        items: ['무기', '방어구', '소비 아이템', '설치물'],
      },
      createdAt: Date.now(),
    };
  }
}
