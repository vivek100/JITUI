import React from 'react';
import { useJitStore } from '@jitui/state';

interface JitDiffViewProps {
  changes: { old: unknown; new: unknown };
  actionId: string;
  context: unknown;
}

export const JitDiffView: React.FC<JitDiffViewProps> = ({ changes, actionId, context }) => {
  const { dispatchAction } = useJitStore();
  return (
    <div className="diff-view p-4 border rounded bg-white shadow">
      <p className="font-bold">Proposed Change:</p>
      <p>Old: {JSON.stringify(changes.old)}</p>
      <p>New: {JSON.stringify(changes.new)}</p>
      <div className="flex gap-2 mt-2">
        <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={() => dispatchAction(actionId, context)}>
          Approve
        </button>
        <button className="bg-red-600 text-white px-4 py-2 rounded" onClick={() => dispatchAction('REJECT_CHANGE', context)}>
          Reject
        </button>
      </div>
    </div>
  );
};

