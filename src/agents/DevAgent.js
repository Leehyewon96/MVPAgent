/**
 * Dev Agent
 * 기획 문서를 입력으로 받아 실행 가능한 웹 게임을 구현한다.
 * 하위 역할: 클라이언트, 서버, DBA, 에셋 생성, QA/테스트, 보안/어뷰징, 빌드
 */

import { useAgentStore } from '../store/agentStore';
import { isConfigured } from '../firebase/config';

export class DevAgent {
  log(message) {
    useAgentStore.getState().addAgentLog('dev', message);
  }

  async develop(planData) {
    this.log('게임 개발 시작');
    this.log(`장르: ${planData.systemDesign?.genre}`);

    const subTasks = [
      { name: '클라이언트 코드 생성', fn: () => this.generateClient(planData) },
      { name: '서버 로직 생성', fn: () => this.generateServer(planData) },
      { name: '에셋 생성', fn: () => this.generateAssets(planData) },
      { name: 'QA 테스트', fn: () => this.runQA() },
    ];

    const results = {};
    for (const task of subTasks) {
      this.log(`서브태스크: ${task.name}`);
      results[task.name] = await task.fn();
    }

    this.log('게임 개발 완료');
    return {
      gameId: `game_${Date.now()}`,
      title: planData.topic?.keyword || 'Untitled Game',
      genre: planData.systemDesign?.genre || 'Unknown',
      buildStatus: 'success',
      results,
      createdAt: Date.now(),
    };
  }

  async generateClient(planData) {
    if (isConfigured) {
      try {
        const { functions } = await import('../firebase/config');
        const { httpsCallable } = await import('firebase/functions');
        return (await httpsCallable(functions, 'generateGameClient')({ plan: planData })).data;
      } catch { /* fallthrough to mock */ }
    }
    return { status: 'mock', message: '클라이언트 코드 생성됨 (목업)' };
  }

  async generateServer(planData) {
    if (isConfigured) {
      try {
        const { functions } = await import('../firebase/config');
        const { httpsCallable } = await import('firebase/functions');
        return (await httpsCallable(functions, 'generateGameServer')({ plan: planData })).data;
      } catch { /* fallthrough to mock */ }
    }
    return { status: 'mock', message: '서버 로직 생성됨 (목업)' };
  }

  async generateAssets() {
    return { status: 'mock', message: '에셋 생성 완료 (목업)' };
  }

  async runQA() {
    return { status: 'mock', passed: true, message: '테스트 통과 (목업)' };
  }
}
