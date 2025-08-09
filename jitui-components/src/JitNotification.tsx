import React from 'react';
import { useJitStore } from '@jitui/state';

interface JitNotificationProps {
  message: string;
  actionId?: string;
  context?: unknown;
}

export const JitNotification: React.FC<JitNotificationProps> = ({ message, actionId, context }) => {
  const { dispatchAction } = useJitStore();
  return (
    <div className="px-4 py-2 rounded bg-gray-900 text-white shadow">
      <div className="flex items-center gap-3">
        <span>{message}</span>
        {actionId && (
          <button
            className="ml-auto text-sm underline"
            onClick={() => dispatchAction(actionId, context)}
          >
            View
          </button>
        )}
      </div>
    </div>
  );
};

