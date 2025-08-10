# JITUI Framework

The **JITUI Framework** is a modular, TypeScript-based library for building AI-native, workflow-driven user interfaces with React. It enables just-in-time UI generation, AI-powered workflows, and sub-agent orchestration for dynamic, responsive applications. The framework is designed for scalability, state purity, and seamless integration with AI services (e.g., xAI API), supporting features like generative UI, background agents, and user feedback workflows.

JITUI is structured as a monorepo with six interoperable packages, managed via `pnpm` workspaces and built with `tsup`. It leverages React 18, Zustand for state management, Tailwind CSS for styling, and an Action Registry Pattern for decoupled, workflow-driven interactions.

# DEMO on what JIT UI can do and JUST IN TIME CRM APP

https://preview-ai-generated-next-steps-kzmp1f43o564gbht7khh.vusercontent.net/

<img width="1024" height="1024" alt="ChatGPT Image Aug 9, 2025, 06_14_28 PM" src="https://github.com/user-attachments/assets/28fcaab2-5603-4d0b-853d-b1b69dd6f0c7" />


## Packages

The framework consists of six publishable packages, each with a specific role in enabling AI-driven workflows:

- **@jitui/state**: Zustand-powered state management for shared application state, including layout, context, action registry, and workflow data (e.g., chat messages, agent results).
- **@jitui/components**: Reusable, AI-aware React components (e.g., `JitCard`, `JitChatMessage`, `JitNotification`) that integrate with workflows via the Action Registry.
- **@jitui/renderer**: App-level rendering utilities (e.g., `JitLayout`, `NotificationContainer`) for dynamic layouts and workflow-driven UI updates.
- **@jitui/feedback**: User interaction components (e.g., `JitCommandPalette`, `JitDiffView`) for workflow feedback, such as approving AI suggestions or undoing actions.
- **@jitui/ai**: AI service utilities for fetching suggestions, streaming predictions, and executing background agent workflows.
- **@jitui/agent**: Orchestrates AI-driven workflows by observing state, processing AI responses, and managing sub-agents for app-specific tasks.
- **documents/**: Framework documentation (not a publishable package).

Each package is built with a consistent script set:
- `build`: `tsup src/index.ts --dts --format esm,cjs --out-dir dist`
- `dev`: Watch mode for development: `tsup src/index.ts --dts --format esm,cjs --out-dir dist --watch`
- `lint`: `eslint src --ext .ts,.tsx`
- `test`: `vitest run`

## Documentation

Explore detailed docs and plans:

- Core docs (repo root `documents/`):
  - [JITUI Framework Docs](../documents/JITUI%20Framework%20DOCs.md)
  - [Implementation Plan — Framework](../documents/Implementation%20Plan%20for%20Framework.md)
  - [Implementation Plan — Example CRM App](../documents/Implementation%20plan%20for%20an%20example%20CRM%20App.md)
- Package docs (this folder `packages/documents/`):
  - [Getting Started](./documents/getting-started.md)
  - [Architecture](./documents/architecture.md)
  - [Packages Overview](./documents/packages.md)

## Features

- **Workflow-Driven UI**: Dynamically render components based on AI-driven workflows, supporting grid and chat layouts for dashboards and conversational interfaces.
- **Generative UI**: Render components (e.g., `JitCard`) in a chat interface via `JitCommandPalette` and `JitChatMessage`.
- **Background/Sub-Agents**: Execute app-specific tasks (e.g., lead scoring) with sub-agent workflows, displaying results via `JitNotification` and `JitDiffView`.
- **Action Registry Pattern**: Decouple components and logic through serializable actions (e.g., `{ actionId: "CALL_LEAD", context: { leadId: "123" } }`).
- **User Feedback Workflows**: Approve/reject AI suggestions and undo/redo actions with `JitDiffView` and `useUndoRedo`.
- **AI-Native Design**: JSON-compatible state and responses for seamless integration with AI agents.

## Prerequisites

- Node.js 18+
- pnpm 9+
- A modern browser for WebSocket support (for `@jitui/ai` streaming)

## Quickstart (PowerShell)

Run these commands from the repo root (`JITUIFramework/`):

```powershell
pnpm install
pnpm -r build    # Build all packages
pnpm -r dev      # Watch mode for all packages
pnpm -r lint     # Lint all packages
pnpm -r test     # Run tests for all packages
```

Build or watch a single package:

```powershell
pnpm --filter @jitui/state build
pnpm --filter @jitui/components dev
```

## Using Packages Locally

Packages are linked via `pnpm` workspaces, enabling automatic resolution of internal dependencies. In an app within this monorepo (e.g., `examples/crm`), import packages like:

```typescript
import { JITUIProvider, JitLayout, NotificationContainer } from "@jitui/renderer";
import { JitCard, JitChatMessage } from "@jitui/components";
import { JitCommandPalette, useUndoRedo } from "@jitui/feedback";
import { useJitStore } from "@jitui/state";
import { JitAgent } from "@jitui/agent";
```

Common exports (non-exhaustive):

- **@jitui/components**: `JitCard`, `JitForm`, `JitTable`, `JitButton`, `JitChatMessage`, `JitNotification`, `SuggestionButton`, `ComponentRegistryProvider`, `useComponentRegistry`
- **@jitui/state**: `useJitStore` (with APIs like `setLayout`, `dispatchAction`, `addChatMessage`)
- **@jitui/renderer**: `JITUIProvider`, `JitLayout`, `NotificationContainer`
- **@jitui/feedback**: `JitCommandPalette`, `JitDiffView`, `useUndoRedo`
- **@jitui/ai**: `fetchSuggestions`, `fetchChatResponse`, `runBackgroundAgent`, `streamFieldPredictions`
- **@jitui/agent**: `JitAgent` (with `initialize`, `registerSubAgent`, `triggerSubAgent`)

## Example: Building a Workflow-Driven CRM App

Here’s how to use JITUI to create a CRM app with AI-driven workflows:

```typescript
// examples/crm/src/App.tsx
import React, { useEffect } from "react";
import { JITUIProvider, JitLayout, NotificationContainer } from "@jitui/renderer";
import { JitCommandPalette } from "@jitui/feedback";
import { useJitStore } from "@jitui/state";
import { JitAgent } from "@jitui/agent";

function App() {
  useEffect(() => {
    const store = useJitStore;
    store.getState().setContext({ user: { role: "admin", id: "user-1" }, actions: [] });
    store.getState().setLayout({
      mode: "grid",
      grid: [{ id: "lead_card_123", component: "JitCard", props: { leadId: "123" } }],
    });
    store.getState().registerActionHandler("CALL_LEAD", async (context) => {
      await updateLead(context.leadId, { status: "Contacted" });
    });
    const agent = new JitAgent(store);
    agent.initialize();
    agent.registerSubAgent("lead_scorer", async (context) => {
      const score = await calculateLeadScore(context.leadId);
      return { result: { leadId: context.leadId, score }, actionId: "UPDATE_LEAD_SCORE", context };
    });
    agent.triggerSubAgent("lead_scorer", { leadId: "123" });
  }, []);

  return (
    <JITUIProvider>
      <NotificationContainer />
      <JitLayout mode="grid" />
      <JitCommandPalette />
    </JITUIProvider>
  );
}
```

This app demonstrates:
- **Workflow-Driven UI**: Rendering a lead card in a grid layout.
- **Generative UI**: Typing “Show lead 123” in `JitCommandPalette` to render `JitChatMessage`.
- **Sub-Agent Workflow**: Running a `lead_scorer` agent to update scores, showing `JitNotification`.
- **Feedback Workflow**: Approving score updates via `JitDiffView`.

See `examples/crm` for a complete implementation.

## Conventions

- **TypeScript-First**: Strict types for all packages, ensuring compatibility with AI agents.
- **React 18**: Used for UI packages, with hooks and context for modularity.
- **Single Entry Point**: Each package exports from `src/index.ts`.
- **Build Outputs**: ESM and CJS modules with type declarations in `dist/`.
- **Styling**: Tailwind CSS for consistency with Shadcn UI.
- **Testing**: Vitest and React Testing Library for unit and component tests.
- **State Purity**: All state and actions are JSON-serializable for AI integration.

## Testing

Each package includes tests in `src/__tests__`. Run tests for all packages:

```powershell
pnpm -r test
```

Run tests for a single package:

```powershell
pnpm --filter @jitui/feedback test
```

## Releasing

To publish packages to npm (manual flow):

1. Update `version` in each `package.json` (e.g., `0.1.1`).
2. Build all packages: `pnpm -r build`.
3. Publish each package (requires npm login and access):

```powershell
pnpm --filter @jitui/state exec npm publish --access public
pnpm --filter @jitui/components exec npm publish --access public
pnpm --filter @jitui/renderer exec npm publish --access public
pnpm --filter @jitui/feedback exec npm publish --access public
pnpm --filter @jitui/ai exec npm publish --access public
pnpm --filter @jitui/agent exec npm publish --access public
```

Future releases may use **Changesets** for automated versioning and changelogs. Update this section if implemented.

## Notes for Contributors

- Keep package APIs minimal, explicit, and workflow-focused.
- Ensure all actions and state are JSON-serializable for AI compatibility.
- Update `documents/` with new features or API changes.
- Add tests for all new functionality in `src/__tests__`.
- Maintain Tailwind CSS for styling consistency.
- Document major changes in this README (e.g., new scripts, usage examples).

## Future Improvements

- Add **Changesets** for automated release management.
- Implement advanced undo/redo logic for async actions.
- Explore a dedicated `@jitui/sub-agents` package for complex sub-agent workflows.
- Enhance `@jitui/ai` with retry logic and WebSocket reconnection.

---

### Explanation of Changes
1. **Incorporated "Workflow"**:
   - Used "workflow-driven" and "workflows" throughout to emphasize the framework’s focus on AI-driven processes (e.g., generative UI, sub-agent tasks, user feedback).
   - Highlighted workflow use cases in the example section (e.g., “Workflow-Driven UI”, “Sub-Agent Workflow”).
2. **Improved Clarity**:
   - Added a clear introduction explaining JITUI’s purpose as an AI-native, workflow-driven framework.
   - Included a “Features” section to summarize key capabilities (e.g., generative UI, sub-agents, action registry).
3. **Aligned with Implementation Plan**:
   - Reflected the monorepo structure, package roles, and dependencies from the implementation plan.
   - Included testing and release instructions consistent with Turborepo and `pnpm`.
4. **Enhanced Developer Experience**:
   - Provided a detailed example of a CRM app to show practical usage.
   - Clarified conventions (e.g., TypeScript-first, state purity) for contributors.
   - Added a “Future Improvements” section to outline potential enhancements (e.g., Changesets, advanced undo/redo).

---

### Next Steps
1. **Validate README**:
   - Confirm the updated README meets your expectations, especially the inclusion of “workflow” and alignment with the framework’s goals.
2. **Start Framework Implementation**:
   - Begin coding **Tier 1** packages (`@jitui/components`, `@jitui/state`) using the monorepo structure and provided snippets.
   - Proceed to **Tier 2** and **Tier 3**, ensuring tests pass.
3. **Develop CRM App**:
   - Implement the `examples/crm` app as outlined in the implementation plan, using mock DB, AI, and auth.
   - Test all use cases (generative UI, sub-agents, action registry, feedback).
4. **Iterate and Refine**:
   - Evaluate the need for a `@jitui/sub-agents` package based on CRM app testing.
   - Add advanced features (e.g., retry logic, Changesets) as needed.
