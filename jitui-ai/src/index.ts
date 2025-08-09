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

