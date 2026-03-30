/**
 * Trend Agent
 * 게임 커뮤니티, 유튜브, OTT 등 외부 소스에서 핫한 키워드·주제를 탐지하고
 * 게임 소재 후보 목록으로 정리한다.
 */

import { useAgentStore } from '../store/agentStore';
import { isConfigured } from '../firebase/config';

export class TrendAgent {
  log(message) {
    useAgentStore.getState().addAgentLog('trend', message);
  }

  async analyze() {
    this.log('외부 소스 탐색 시작');

    if (isConfigured) {
      try {
        const { functions } = await import('../firebase/config');
        const { httpsCallable } = await import('firebase/functions');
        const analyzeTrends = httpsCallable(functions, 'analyzeTrends');
        const result = await analyzeTrends();
        this.log(`${result.data.topics.length}개 트렌드 주제 발견`);
        return result.data;
      } catch (error) {
        this.log('Cloud Function 호출 실패 — 목업 데이터 반환');
      }
    } else {
      this.log('Dev Mode — 목업 데이터 사용');
    }

    return this.getMockData();
  }

  getMockData() {
    return {
      topics: [
        {
          keyword: '좀비 서바이벌',
          source: 'YouTube',
          score: 0.92,
          description: '좀비 아포칼립스 생존 게임 트렌드',
        },
        {
          keyword: '뱀파이어 서바이벌',
          source: '게임 커뮤니티',
          score: 0.88,
          description: '뱀파이어 서바이벌 장르 인기 급상승',
        },
        {
          keyword: '이세계 방치형',
          source: 'OTT',
          score: 0.85,
          description: '이세계물 기반 방치형 RPG 트렌드',
        },
      ],
      analyzedAt: Date.now(),
    };
  }
}
