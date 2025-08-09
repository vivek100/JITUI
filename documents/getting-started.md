## Getting Started

### Prerequisites
- Node.js 18+
- pnpm 8+
- PowerShell on Windows

### Install and Build (PowerShell)
```powershell
# From repo root
pnpm install
pnpm build

# Run the CRM example app
cd examples/crm
pnpm dev
```

Open the app at `http://localhost:5173` (or the port shown in the Vite output).

### Using the Renderer in your App

Add a `div#notification-root` to your HTML and mount the provider and layout:

```tsx
import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { JITUIProvider, JitLayout, NotificationContainer } from '@jitui/renderer';
import { useJitStore } from '@jitui/state';

function App() {
  useEffect(() => {
    useJitStore.getState().setLayout({ mode: 'grid', grid: [
      { id: 'lead_card_1', component: 'JitCard', props: { leadId: '1' } },
    ]});
    useJitStore.getState().registerActionHandler('CALL_LEAD', (ctx) => {
      console.log('Calling lead', ctx);
    });
  }, []);

  return (
    <JITUIProvider>
      <NotificationContainer />
      <JitLayout mode="grid" />
    </JITUIProvider>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
```

### Why React?
- Mature component model and ecosystem (JSX, hooks) ideal for dynamic AI-driven UIs.
- Declarative rendering maps cleanly to state changes produced by agents.
- Huge ecosystem (Shadcn, Tailwind, Zustand) keeps the framework lightweight and familiar.


