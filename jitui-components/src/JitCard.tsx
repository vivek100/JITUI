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

