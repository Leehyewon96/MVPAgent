/**
 * Orchestrator Agent
 * 전체 파이프라인 흐름을 제어하는 메인 Agent.
 * 시장조사 → 기획 → 개발 → 판단 순서로 각 Agent를 호출하고 결과를 전달한다.
 */

import { useAgentStore } from '../store/agentStore';
import { TrendAgent } from './TrendAgent';
import { PlanAgent } from './PlanAgent';
import { ResourceAgent } from './ResourceAgent';
import { DevAgent } from './DevAgent';
import { JudgeAgent } from './JudgeAgent';

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class OrchestratorAgent {
  constructor() {
    this.agents = {
      trend: new TrendAgent(),
      plan: new PlanAgent(),
      resource: new ResourceAgent(),
      dev: new DevAgent(),
      judge: new JudgeAgent(),
    };
  }

  log(message) {
    useAgentStore.getState().addAgentLog('orchestrator', message);
  }

  async runPipeline() {
    const store = useAgentStore.getState();
    store.setPipelineStatus('running');
    store.setAgentStatus('orchestrator', 'running');
    this.log('파이프라인 시작');

    try {
      // Phase 1: 시장조사
      await delay(500);
      this.log('Phase 1: 시장조사 Agent 실행');
      store.setAgentStatus('trend', 'running');
      await delay(800);
      const trendResult = await this.agents.trend.analyze();
      store.setAgentResult('trend', trendResult);
      this.log(`시장조사 완료: ${trendResult.topics?.length || 0}개 주제 발견`);

      // Phase 2: 기획
      await delay(600);
      this.log('Phase 2: 기획 Agent 실행');
      store.setAgentStatus('plan', 'running');
      await delay(1000);
      const planResult = await this.agents.plan.createPlan(trendResult);
      store.setAgentResult('plan', planResult);
      this.log('기획 문서 생성 완료');

      // Phase 3: 리소스 생성
      await delay(600);
      this.log('Phase 3: 리소스 Agent 실행 (Stable Diffusion)');
      store.setAgentStatus('resource', 'running');
      await delay(800);
      const resourceResult = await this.agents.resource.generateResources(planResult);
      store.setAgentResult('resource', resourceResult);
      this.log(`리소스 생성 완료: ${resourceResult.resources?.length || 0}개 에셋`);

      // Phase 4: 개발
      await delay(600);
      this.log('Phase 4: 개발 Agent 실행');
      store.setAgentStatus('dev', 'running');
      await delay(1200);
      const devResult = await this.agents.dev.develop(planResult, resourceResult);
      store.setAgentResult('dev', devResult);
      this.log('게임 개발 완료');

      // Phase 5: 판단
      await delay(600);
      this.log('Phase 5: 판단 Agent 실행');
      store.setAgentStatus('judge', 'running');
      await delay(800);
      const judgeResult = await this.agents.judge.evaluate(devResult);
      store.setAgentResult('judge', judgeResult);
      this.log(`판단 완료: ${judgeResult.decision}`);

      await delay(400);
      store.setAgentStatus('orchestrator', 'completed');
      store.setPipelineStatus('completed');
      this.log('파이프라인 완료');

      return {
        trend: trendResult,
        plan: planResult,
        resource: resourceResult,
        dev: devResult,
        judge: judgeResult,
      };
    } catch (error) {
      store.setAgentStatus('orchestrator', 'error');
      store.setPipelineStatus('error');
      this.log(`파이프라인 오류: ${error.message}`);
      throw error;
    }
  }
}
