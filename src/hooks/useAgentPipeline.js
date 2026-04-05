import { useCallback, useRef } from 'react';
import { useAgentStore } from '../store/agentStore';
import { useGameStore } from '../store/gameStore';
import { OrchestratorAgent } from '../agents/OrchestratorAgent';
import { TrendAgent } from '../agents/TrendAgent';
import { PlanAgent } from '../agents/PlanAgent';
import { ResourceAgent } from '../agents/ResourceAgent';
import { DevAgent } from '../agents/DevAgent';
import { JudgeAgent } from '../agents/JudgeAgent';

const STEP_ORDER = ['trend', 'plan', 'resource', 'dev', 'judge'];

const STEP_DEPS = {
  trend: [],
  plan: ['trend'],
  resource: ['plan'],
  dev: ['plan', 'resource'],
  judge: ['dev'],
};

export function useAgentPipeline() {
  const pipelineStatus = useAgentStore((s) => s.pipelineStatus);
  const agents = useAgentStore((s) => s.agents);
  const runningStep = useAgentStore((s) => s.runningStep);
  const resetPipeline = useAgentStore((s) => s.resetPipeline);
  const addGame = useGameStore((s) => s.addGame);
  const orchestratorRef = useRef(null);
  const agentsRef = useRef({});

  function getAgent(key) {
    if (!agentsRef.current[key]) {
      const map = { trend: TrendAgent, plan: PlanAgent, resource: ResourceAgent, dev: DevAgent, judge: JudgeAgent };
      agentsRef.current[key] = new map[key]();
    }
    return agentsRef.current[key];
  }

  function canRunStep(stepKey) {
    const deps = STEP_DEPS[stepKey] || [];
    const store = useAgentStore.getState();
    return deps.every((dep) => store.agents[dep]?.result != null);
  }

  function getMissingDeps(stepKey) {
    const deps = STEP_DEPS[stepKey] || [];
    const store = useAgentStore.getState();
    return deps.filter((dep) => store.agents[dep]?.result == null);
  }

  const runStep = useCallback(async (stepKey) => {
    const store = useAgentStore.getState();
    if (store.runningStep) return;

    const missing = getMissingDeps(stepKey);
    if (missing.length > 0) {
      throw new Error(`선행 단계가 필요합니다: ${missing.join(', ')}`);
    }

    store.resetAgent(stepKey);
    store.setRunningStep(stepKey);
    store.setAgentStatus(stepKey, 'running');

    try {
      const agent = getAgent(stepKey);
      let result;

      switch (stepKey) {
        case 'trend':
          result = await agent.analyze();
          break;
        case 'plan':
          result = await agent.createPlan(store.agents.trend.result);
          break;
        case 'resource':
          result = await agent.generateResources(store.agents.plan.result);
          break;
        case 'dev':
          result = await agent.develop(store.agents.plan.result, store.agents.resource.result);
          break;
        case 'judge':
          result = await agent.evaluate(store.agents.dev.result);
          break;
      }

      store.setAgentResult(stepKey, result);

      if (stepKey === 'dev' && result) {
        registerGame(result, store.agents.judge?.result);
      }
      if (stepKey === 'judge' && store.agents.dev?.result) {
        registerGame(store.agents.dev.result, result);
      }

      return result;
    } catch (error) {
      useAgentStore.getState().setAgentStatus(stepKey, 'error');
      useAgentStore.getState().addAgentLog(stepKey, `오류: ${error.message}`);
      throw error;
    } finally {
      useAgentStore.getState().setRunningStep(null);
    }
  }, []);

  function registerGame(devResult, judgeResult) {
    if (!devResult?.code) return;
    addGame({
      id: devResult.gameId,
      gameId: devResult.gameId,
      title: devResult.title,
      genre: devResult.genre,
      code: devResult.code,
      buildStatus: devResult.buildStatus,
      createdAt: devResult.createdAt,
      decision: judgeResult?.decision,
      scores: judgeResult?.scores,
      plan: devResult.plan,
      resources: devResult.resources || [],
    });
  }

  const runFrom = useCallback(async (startStep) => {
    const startIdx = STEP_ORDER.indexOf(startStep);
    if (startIdx < 0) return;

    const store = useAgentStore.getState();
    store.setPipelineStatus('running');

    try {
      for (let i = startIdx; i < STEP_ORDER.length; i++) {
        await runStep(STEP_ORDER[i]);
      }
      useAgentStore.getState().setPipelineStatus('completed');
    } catch (error) {
      useAgentStore.getState().setPipelineStatus('error');
      throw error;
    }
  }, [runStep]);

  const start = useCallback(async () => {
    if (pipelineStatus === 'running') return;

    if (!orchestratorRef.current) {
      orchestratorRef.current = new OrchestratorAgent();
    }

    try {
      const result = await orchestratorRef.current.runPipeline();

      if (result?.dev) {
        registerGame(result.dev, result.judge);
      }

      return result;
    } catch (error) {
      console.error('Pipeline failed:', error);
      throw error;
    }
  }, [pipelineStatus, addGame]);

  const reset = useCallback(() => {
    orchestratorRef.current = null;
    agentsRef.current = {};
    resetPipeline();
  }, [resetPipeline]);

  return {
    start,
    reset,
    runStep,
    runFrom,
    canRunStep,
    getMissingDeps,
    pipelineStatus,
    runningStep,
    agents,
    STEP_ORDER,
    STEP_DEPS,
  };
}
