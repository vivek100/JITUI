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

