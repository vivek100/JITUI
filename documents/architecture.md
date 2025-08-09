## JITUI Framework Architecture

This document explains the overall architecture of the JITUI Framework and how the packages interact.

### Modules and Dependencies

```mermaid
graph TD
  subgraph Tier1[Core]
    C["@jitui/components"]
    S["@jitui/state"]
  end
  subgraph Tier2[UI & Feedback]
    R["@jitui/renderer"]
    F["@jitui/feedback"]
  end
  subgraph Tier3[AI Orchestration]
    A["@jitui/ai"]
    G["@jitui/agent"]
  end

  C -. dispatchAction() .-> S
  F -. dispatchAction()/undo/redo .-> S
  R --> C
  R --> S
  G --> S
  G --> A
  S --> G
  S --> R
  S --> F
```

Key ideas:
- Components are logic-free and use `dispatchAction` to trigger behavior.
- `@jitui/state` is the single source of truth and hosts the Action Registry.
- `@jitui/agent` observes actions via agent listeners and calls `@jitui/ai`.
- `@jitui/renderer` renders state-driven layouts and portal-based notifications.
- `@jitui/feedback` surfaces user controls like command palette, diff view, undo/redo.

### Action Flow: Chat Command to Generative UI

```mermaid
sequenceDiagram
  autonumber
  participant UI as JitCommandPalette
  participant State as @jitui/state
  participant Agent as JitAgent
  participant AI as @jitui/ai
  participant Renderer as JitLayout

  UI->>State: dispatchAction("SUBMIT_CHAT_COMMAND", { command })
  State-->>Agent: notify agentListeners({ actionId, context })
  Agent->>AI: fetchChatResponse({ command })
  AI-->>Agent: { component? | actionId? , context? }
  Agent->>State: addChatMessage(...) | dispatchAction(actionId, context)
  State-->>Renderer: layout/chat state changed
  Renderer->>UI: renders JitChatMessage or component
```

### Notification Flow: Background Agent Result

```mermaid
sequenceDiagram
  autonumber
  participant Agent as JitAgent
  participant State as @jitui/state
  participant Renderer as NotificationContainer

  Agent->>State: storeAgentResult(agentId, result)
  State-->>Renderer: agentResults updated
  Renderer->>Renderer: portal renders JitNotification
```

### Design Principles
- Stateless UI components with explicit props and `aiProps` support.
- Serializable, debuggable state; no functions stored in state.
- Event-driven AI orchestration decoupled from rendering.
- Pluggable sub-agents and external AI services.


