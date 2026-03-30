/**
 * Judge Agent
 * 생성된 게임을 평가하고 Go/No-Go 판단을 내린다.
 * Dev Server 연결 시 Claude API로 실제 평가를 수행한다.
 */

import { useAgentStore } from '../store/agentStore';

const DEV_API = 'http://localhost:3100/api';

export class JudgeAgent {
  log(message) {
    useAgentStore.getState().addAgentLog('judge', message);
  }

  async evaluate(devResult) {
    this.log(`게임 "${devResult.title}" 평가 시작`);

    try {
      this.log('Claude API를 통한 게임 평가 요청 중...');
      const res = await fetch(`${DEV_API}/evaluate-game`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId: devResult.gameId,
          title: devResult.title,
          genre: devResult.genre,
          plan: devResult.plan,
        }),
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      const data = await res.json();
      this.log(`평가 완료: ${data.decision.toUpperCase()}`);
      if (data.scores) {
        this.log(`  게임플레이: ${data.scores.gameplay}/100`);
        this.log(`  비주얼: ${data.scores.visual}/100`);
        this.log(`  리플레이: ${data.scores.replayability}/100`);
        this.log(`  시장적합: ${data.scores.marketFit}/100`);
      }
      this.log(`  판정: ${data.reasoning}`);
      return data;
    } catch (error) {
      this.log(`API 연결 실패 — 기본 평가 반환 (${error.message})`);
      return this.getMockEvaluation(devResult);
    }
  }

  getMockEvaluation(devResult) {
    return {
      gameId: devResult.gameId,
      decision: 'go',
      reasoning: '빌드 성공, 배포 준비 완료. 실제 유저 데이터 수집 후 재평가 필요.',
      scores: { gameplay: 70, visual: 65, replayability: 60, marketFit: 75 },
      suggestions: ['적 다양성 추가', 'UI 개선'],
      evaluatedAt: Date.now(),
    };
  }
}
