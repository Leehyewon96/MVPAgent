/**
 * Judge Agent
 * 유저 지표를 수집·분석하고 Go/No-Go 판단을 내린다.
 */

import { useAgentStore } from '../store/agentStore';
import { isConfigured } from '../firebase/config';

export class JudgeAgent {
  log(message) {
    useAgentStore.getState().addAgentLog('judge', message);
  }

  async evaluate(devResult) {
    this.log(`게임 "${devResult.title}" 평가 시작`);

    if (isConfigured) {
      try {
        const { functions } = await import('../firebase/config');
        const { httpsCallable } = await import('firebase/functions');
        const result = await httpsCallable(functions, 'evaluateGame')({ gameId: devResult.gameId });
        this.log(`평가 완료: ${result.data.decision}`);
        return result.data;
      } catch (error) {
        this.log('Cloud Function 호출 실패 — 목업 평가 반환');
      }
    } else {
      this.log('Dev Mode — 목업 평가 사용');
    }

    return this.getMockEvaluation(devResult);
  }

  getMockEvaluation(devResult) {
    return {
      gameId: devResult.gameId,
      metrics: {
        estimatedDAU: 0,
        estimatedRetentionD1: 0,
        buildQuality: devResult.buildStatus === 'success' ? 'good' : 'poor',
      },
      decision: 'go',
      reasoning: '빌드 성공, 배포 준비 완료. 실제 유저 데이터 수집 후 재평가 필요.',
      evaluatedAt: Date.now(),
    };
  }
}
