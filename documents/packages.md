## Package Guides

This document summarizes each package with real code references.

### @jitui/state

State store and Action Registry. Agent listeners enable event-driven orchestration.

```startLine:endLine:JITUIFramework/packages/jitui-state/src/index.ts
1:84
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
```

### @jitui/components

UI primitives with `aiProps` and a runtime `ComponentRegistry`.

```startLine:endLine:JITUIFramework/packages/jitui-components/src/registry.tsx
1:35
import React, { ComponentType, createContext, useContext, useMemo } from 'react';

type ComponentEntry = ComponentType<any>;

interface ComponentRegistryValue {
  components: Map<string, ComponentEntry>;
  registerComponent: (type: string, component: ComponentEntry) => void;
  renderComponent: (id: string, type: string, props?: any) => React.ReactNode;
}

const RegistryContext = createContext<ComponentRegistryValue | null>(null);

export const ComponentRegistryProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const mapRef = useMemo(() => new Map<string, ComponentEntry>(), []);

  const value: ComponentRegistryValue = {
    components: mapRef,
    registerComponent: (type, component) => {
      mapRef.set(type, component);
    },
    renderComponent: (id, type, props) => {
      const Component = mapRef.get(type);
      if (!Component) throw new Error(`Component ${type} not registered`);
      return <Component {...props} id={id} />;
    },
  };

  return <RegistryContext.Provider value={value}>{children}</RegistryContext.Provider>;
};

export function useComponentRegistry() {
  const ctx = useContext(RegistryContext);
  if (!ctx) throw new Error('useComponentRegistry must be used within ComponentRegistryProvider');
  return ctx;
}
```

```startLine:endLine:JITUIFramework/packages/jitui-components/src/JitCard.tsx
1:32
import React from 'react';
import { AiProps, useJitStore } from '@jitui/state';
import { SuggestionButton } from './SuggestionButton';

interface JitCardProps {
  id: string;
  data: any;
  aiProps?: AiProps;
}

export const JitCard: React.FC<JitCardProps> = ({ id, data, aiProps }) => {
  const { dispatchAction } = useJitStore();
  return (
    <div data-testid={id} className="p-4 border rounded bg-white shadow">
      <h3 className="font-bold mb-2">{data?.name ?? 'Card'}</h3>
      {aiProps?.insight && <p className="text-sm text-gray-600">{aiProps.insight}</p>}
      <div className="mt-2 flex flex-wrap gap-2">
        {aiProps?.suggestions?.map((s) => (
          <SuggestionButton
            key={s.actionId}
            label={s.label}
            actionId={s.actionId}
            context={s.context}
            onClick={() => dispatchAction(s.actionId, s.context)}
          />
        ))}
      </div>
    </div>
  );
};
```

### @jitui/renderer

Provider and layout that renders based on `@jitui/state`.

```startLine:endLine:JITUIFramework/packages/jitui-renderer/src/JitLayout.tsx
1:34
import React from 'react';
import { useJitStore } from '@jitui/state';
import { useComponentRegistry, JitChatMessage } from '@jitui/components';

interface JitLayoutProps {
  mode?: 'grid' | 'chat';
}

export const JitLayout: React.FC<JitLayoutProps> = ({ mode = 'grid' }) => {
  const { layout, chat } = useJitStore();
  const { renderComponent } = useComponentRegistry();

  if (mode === 'chat' || layout.mode === 'chat') {
    return (
      <div className="chat-container flex flex-col gap-4 p-4 max-w-2xl mx-auto">
        {chat.messages.map((msg) => (
          <JitChatMessage key={msg.id} message={msg.text} component={msg.component} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid-container grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
      {layout.grid?.map((item) => (
        <div key={item.id} className="col-span-1">
          {renderComponent(item.id, item.component, item.props)}
        </div>
      ))}
    </div>
  );
};
```

```startLine:endLine:JITUIFramework/packages/jitui-renderer/src/NotificationContainer.tsx
1:27
import React from 'react';
import ReactDOM from 'react-dom';
import { useJitStore } from '@jitui/state';
import { JitNotification } from '@jitui/components';

export const NotificationContainer: React.FC = () => {
  const { agentResults } = useJitStore();

  if (typeof window === 'undefined') return null;

  const root = document.getElementById('notification-root');
  if (!root) return null;

  return ReactDOM.createPortal(
    <div className="notification-wrapper fixed top-4 right-4 z-50 flex flex-col gap-2">
      {Object.entries(agentResults).map(([agentId, { result, timestamp }]) => (
        <JitNotification
          key={`${agentId}-${timestamp}`}
          message={`Agent ${agentId} result: ${JSON.stringify(result)}`}
          actionId={(result as any)?.actionId}
          context={(result as any)?.context}
        />
      ))}
    </div>,
    root,
  );
};
```

### @jitui/feedback

Command palette dispatches actions, diff view approves/rejects.

```startLine:endLine:JITUIFramework/packages/jitui-feedback/src/JitCommandPalette.tsx
1:32
import React from 'react';
import { useJitStore } from '@jitui/state';

export const JitCommandPalette: React.FC = () => {
  const [input, setInput] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const { dispatchAction } = useJitStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || !input) return;
    setIsLoading(true);
    dispatchAction('SUBMIT_CHAT_COMMAND', { command: input });
    setIsLoading(false);
    setInput('');
  };

  return (
    <form onSubmit={handleSubmit} className="command-palette p-4 border-t bg-gray-50">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={isLoading}
        className="w-full p-2 border rounded disabled:bg-gray-200"
        placeholder={isLoading ? 'Processing...' : 'Enter command (e.g., Show lead 123)'}
      />
    </form>
  );
};
```

### @jitui/ai

Thin adapter layer around HTTP/WS for suggestions, chat, agents.

```startLine:endLine:JITUIFramework/packages/jitui-ai/src/index.ts
1:75
export interface AiSuggestionResponse {
  suggestions?: { label: string; actionId: string; context: unknown }[];
  insight?: string;
  error?: string;
}

export interface ChatResponse {
  message: string;
  component?: { id: string; type: string; props: unknown };
  actionId?: string;
  context?: unknown;
  error?: string;
}

export interface AgentResponse {
  result: unknown;
  actionId?: string;
  context?: unknown;
  error?: string;
}

function getApiBase(): string {
  const anyGlobal = globalThis as any;
  return (anyGlobal?.XAI_API_URL as string) || 'https://x.ai/api';
}

function getWsBase(): string {
  const anyGlobal = globalThis as any;
  return (anyGlobal?.XAI_WS_URL as string) || 'wss://x.ai/ws';
}

async function makeApiRequest<T>(endpoint: string, body: unknown): Promise<T | { error: string }> {
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return (await response.json()) as T;
  } catch (e: any) {
    return { error: e?.message ?? 'Unknown error' };
  }
}

export function fetchSuggestions(context: unknown): Promise<AiSuggestionResponse> {
  const url = `${getApiBase()}/suggestions`;
  return makeApiRequest<AiSuggestionResponse>(url, context) as Promise<AiSuggestionResponse>;
}

export function fetchChatResponse(args: { command: string }): Promise<ChatResponse> {
  const url = `${getApiBase()}/chat`;
  return makeApiRequest<ChatResponse>(url, args) as Promise<ChatResponse>;
}

export function runBackgroundAgent(agentId: string, context: unknown): Promise<AgentResponse> {
  const url = `${getApiBase()}/agents/${agentId}`;
  return makeApiRequest<AgentResponse>(url, context) as Promise<AgentResponse>;
}

export function streamFieldPredictions(
  input: unknown,
  onData: (data: { value: string; context: unknown }) => void,
  onError: (error: string) => void,
) {
  if (typeof window === 'undefined') return;
  const wsUrl = `${getWsBase()}/stream`;
  const ws = new (window as any).WebSocket(wsUrl);
  ws.onopen = () => ws.send(JSON.stringify(input));
  ws.onmessage = (event: MessageEvent) => onData(JSON.parse((event as MessageEvent).data));
  ws.onerror = () => onError('WebSocket error');
  return () => ws.close();
}
```

### @jitui/agent

Event-driven orchestrator reacting to actions.

```startLine:endLine:JITUIFramework/packages/jitui-agent/src/index.ts
1:56
import { fetchChatResponse, fetchSuggestions, runBackgroundAgent } from '@jitui/ai';
import { useJitStore } from '@jitui/state';

type StoreType = typeof useJitStore;

export class JitAgent {
  private subAgentRegistry = new Map<string, (context: unknown) => Promise<any>>();

  constructor(private store: StoreType = useJitStore) {}

  initialize() {
    this.store.getState().addAgentListener(this.handleAction);
  }

  private handleAction = async ({ actionId, context }: { actionId: string; context: unknown }) => {
    if (actionId === 'ADD_COMMENT') {
      const response = await fetchSuggestions({ comment: (context as any)?.comment });
      if (response?.suggestions || response?.insight) {
        const componentId = (context as any)?.componentId as string;
        if (componentId) this.store.getState().updateComponentProps(componentId, { aiProps: response });
      }
      return;
    }

    if (actionId === 'SUBMIT_CHAT_COMMAND') {
      const response = await fetchChatResponse({ command: (context as any)?.command as string });
      if ((response as any)?.component) {
        this.store
          .getState()
          .addChatMessage(`msg_${Date.now()}`, (response as any).message, (response as any).component);
      } else if ((response as any)?.actionId) {
        this.store.getState().dispatchAction((response as any).actionId, (response as any).context);
      }
      return;
    }
  };

  registerSubAgent(agentId: string, handler: (context: unknown) => Promise<any>) {
    this.subAgentRegistry.set(agentId, handler);
  }

  async triggerSubAgent(agentId: string, context: unknown) {
    const handler = this.subAgentRegistry.get(agentId);
    if (handler) {
      const result = await handler(context);
      this.store.getState().storeAgentResult(agentId, result);
      if (result?.actionId) this.store.getState().dispatchAction(result.actionId, result.context);
      return;
    }
    const response = await runBackgroundAgent(agentId, context);
    this.store.getState().storeAgentResult(agentId, response.result);
    if (response?.actionId) this.store.getState().dispatchAction(response.actionId, response.context);
  }
}
```


