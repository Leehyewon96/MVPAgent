import { create } from 'zustand';

/**
 * @typedef {'idle' | 'running' | 'completed' | 'error'} AgentStatus
 * @typedef {'trend' | 'plan' | 'dev' | 'judge' | 'orchestrator'} AgentType
 */

export const useAgentStore = create((set, get) => ({
  agents: {
    orchestrator: { status: 'idle', logs: [], result: null },
    trend: { status: 'idle', logs: [], result: null },
    plan: { status: 'idle', logs: [], result: null },
    resource: { status: 'idle', logs: [], result: null },
    dev: { status: 'idle', logs: [], result: null },
    judge: { status: 'idle', logs: [], result: null },
  },
  pipelineStatus: 'idle',

  setAgentStatus: (agentType, status) => {
    const agents = get().agents;
    set({
      agents: {
        ...agents,
        [agentType]: { ...agents[agentType], status },
      },
    });
  },

  addAgentLog: (agentType, message) => {
    const agents = get().agents;
    const agent = agents[agentType];
    set({
      agents: {
        ...agents,
        [agentType]: {
          ...agent,
          logs: [...agent.logs, { message, timestamp: Date.now() }],
        },
      },
    });
  },

  setAgentResult: (agentType, result) => {
    const agents = get().agents;
    set({
      agents: {
        ...agents,
        [agentType]: { ...agents[agentType], result, status: 'completed' },
      },
    });
  },

  setPipelineStatus: (status) => set({ pipelineStatus: status }),

  resetPipeline: () => {
    set({
      pipelineStatus: 'idle',
      agents: {
        orchestrator: { status: 'idle', logs: [], result: null },
        trend: { status: 'idle', logs: [], result: null },
        plan: { status: 'idle', logs: [], result: null },
        resource: { status: 'idle', logs: [], result: null },
        dev: { status: 'idle', logs: [], result: null },
        judge: { status: 'idle', logs: [], result: null },
      },
    });
  },
}));
