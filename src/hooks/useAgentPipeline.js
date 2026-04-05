import { useCallback, useRef } from 'react';
import { useAgentStore } from '../store/agentStore';
import { useGameStore } from '../store/gameStore';
import { OrchestratorAgent } from '../agents/OrchestratorAgent';

export function useAgentPipeline() {
  const pipelineStatus = useAgentStore((s) => s.pipelineStatus);
  const agents = useAgentStore((s) => s.agents);
  const resetPipeline = useAgentStore((s) => s.resetPipeline);
  const addGame = useGameStore((s) => s.addGame);
  const orchestratorRef = useRef(null);

  const start = useCallback(async () => {
    if (pipelineStatus === 'running') return;

    if (!orchestratorRef.current) {
      orchestratorRef.current = new OrchestratorAgent();
    }

    try {
      const result = await orchestratorRef.current.runPipeline();

      if (result?.dev) {
        addGame({
          id: result.dev.gameId,
          gameId: result.dev.gameId,
          title: result.dev.title,
          genre: result.dev.genre,
          code: result.dev.code,
          buildStatus: result.dev.buildStatus,
          createdAt: result.dev.createdAt,
          decision: result.judge?.decision,
          scores: result.judge?.scores,
          plan: result.dev.plan,
          resources: result.dev.resources || [],
        });
      }

      return result;
    } catch (error) {
      console.error('Pipeline failed:', error);
      throw error;
    }
  }, [pipelineStatus, addGame]);

  const reset = useCallback(() => {
    orchestratorRef.current = null;
    resetPipeline();
  }, [resetPipeline]);

  return { start, reset, pipelineStatus, agents };
}
