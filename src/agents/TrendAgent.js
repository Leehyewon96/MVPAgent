/**
 * Trend Agent
 * 게임 커뮤니티, 유튜브, OTT 등 외부 소스에서 핫한 키워드·주제를 탐지하고
 * 게임 소재 후보 목록으로 정리한다.
 * Dev Server 연결 시 Claude API로 실제 트렌드 분석을 수행한다.
 */

import { useAgentStore } from '../store/agentStore';

const DEV_API = 'http://localhost:3100/api';

export class TrendAgent {
  log(message) {
    useAgentStore.getState().addAgentLog('trend', message);
  }

  async analyze() {
    this.log('외부 소스 탐색 시작');

    try {
      this.log('Claude API를 통한 트렌드 분석 요청 중...');
      const res = await fetch(`${DEV_API}/analyze-trends`, { method: 'POST' });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      const data = await res.json();
      this.log(`${data.topics.length}개 트렌드 주제 발견 (LLM 분석 완료)`);

      data.topics.forEach((t) => {
        this.log(`  → ${t.keyword} (${t.source}, 스코어: ${t.score})`);
      });

      return data;
    } catch (error) {
      this.log(`API 연결 실패 — 목업 데이터 반환 (${error.message})`);
      return this.getMockData();
    }
  }

  getMockData() {
    return {
      topics: [
        { keyword: '좀비 서바이벌', source: 'YouTube', score: 0.92, description: '좀비 아포칼립스 생존 게임 트렌드', gameIdea: '웨이브 기반 좀비 슈터' },
        { keyword: '뱀파이어 서바이벌', source: '게임 커뮤니티', score: 0.88, description: '뱀파이어 서바이벌 장르 인기 급상승', gameIdea: '자동 공격 서바이벌' },
        { keyword: '이세계 방치형', source: 'OTT', score: 0.85, description: '이세계물 기반 방치형 RPG 트렌드', gameIdea: '클릭형 방치 RPG' },
      ],
      analyzedAt: Date.now(),
    };
  }
}
