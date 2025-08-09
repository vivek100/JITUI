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


