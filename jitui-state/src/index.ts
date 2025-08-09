import { create } from 'zustand';

export interface AiSuggestion {
  label: string;
  actionId: string;
  // Keeping context as unknown to enforce serializable usage
  context: unknown;
}

export interface AiProps {
  suggestions?: AiSuggestion[];
  insight?: string;
  highlight?: { field: string; style: string };
}

export interface JitLayoutConfig {
  mode: 'grid' | 'chat';
  grid?: { id: string; component: string; props?: unknown }[];
}

export interface JitState {
  layout: JitLayoutConfig;
  components: Record<string, { data: unknown; aiProps?: AiProps }>;
  context: { user?: { role: string; id: string }; actions: { type: string; data: unknown }[] };
  actionRegistry: Map<string, (context: unknown) => void>;
  actionHistory: { actionId: string; context: unknown; timestamp: string }[];
  chat: { messages: { id: string; text: string; component?: { id: string; type: string; props: unknown } }[] };
  agentResults: Record<string, { result: unknown; timestamp: string }>;
  agentListeners: ((action: { actionId: string; context: unknown }) => void)[];
  setLayout: (config: JitLayoutConfig) => void;
  updateComponentProps: (id: string, props: Record<string, unknown>) => void;
  setContext: (context: Partial<JitState['context']>) => void;
  registerActionHandler: (actionId: string, handler: (context: unknown) => void) => void;
  dispatchAction: (actionId: string, context: unknown) => void;
  undo: () => void;
  redo: () => void;
  addChatMessage: (id: string, text: string, component?: { id: string; type: string; props: unknown }) => void;
  storeAgentResult: (agentId: string, result: unknown) => void;
  addAgentListener: (listener: (action: { actionId: string; context: unknown }) => void) => void;
}

export const useJitStore = create<JitState>((set, get) => ({
  layout: { mode: 'grid', grid: [] },
  components: {},
  context: { actions: [] },
  actionRegistry: new Map(),
  actionHistory: [],
  chat: { messages: [] },
  agentResults: {},
  agentListeners: [],
  setLayout: (config) => set({ layout: config }),
  updateComponentProps: (id, props) =>
    set((state) => ({ components: { ...state.components, [id]: { ...state.components[id], ...props } } })),
  setContext: (context) => set((state) => ({ context: { ...state.context, ...context } })),
  registerActionHandler: (actionId, handler) => {
    const registry = new Map(get().actionRegistry);
    registry.set(actionId, handler);
    set({ actionRegistry: registry });
  },
  dispatchAction: (actionId, context) => {
    const handler = get().actionRegistry.get(actionId);
    if (handler) {
      handler(context);
      set((state) => ({
        actionHistory: [...state.actionHistory, { actionId, context, timestamp: new Date().toISOString() }],
      }));
    } else {
      // eslint-disable-next-line no-console
      console.warn(`No handler for actionId: ${actionId}`);
    }
    get().agentListeners.forEach((listener) => listener({ actionId, context }));
  },
  undo: () => set((state) => ({ actionHistory: state.actionHistory.slice(0, -1) })),
  redo: () => {},
  addChatMessage: (id, text, component) =>
    set((state) => ({ chat: { messages: [...state.chat.messages, { id, text, component }] } })),
  storeAgentResult: (agentId, result) =>
    set((state) => ({ agentResults: { ...state.agentResults, [agentId]: { result, timestamp: new Date().toISOString() } } })),
  addAgentListener: (listener) => set((state) => ({ agentListeners: [...state.agentListeners, listener] })),
}));

export type { StoreApi } from 'zustand';

