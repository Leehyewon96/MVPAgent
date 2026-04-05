import { create } from 'zustand';

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
  runningStep: null,

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

  resetAgent: (agentType) => {
    const agents = get().agents;
    set({
      agents: {
        ...agents,
        [agentType]: { status: 'idle', logs: [], result: null },
      },
    });
  },

  setPipelineStatus: (status) => set({ pipelineStatus: status }),
  setRunningStep: (step) => set({ runningStep: step }),

  resetPipeline: () => {
    set({
      pipelineStatus: 'idle',
      runningStep: null,
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
