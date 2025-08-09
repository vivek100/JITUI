import React from 'react';
import { useJitStore } from '@jitui/state';

interface SuggestionButtonProps {
  label: string;
  actionId: string;
  context: unknown;
  onClick?: () => void;
}

export const SuggestionButton: React.FC<SuggestionButtonProps> = ({ label, actionId, context, onClick }) => {
  const { dispatchAction } = useJitStore();
  const handleClick = () => {
    dispatchAction(actionId, context);
    onClick?.();
  };
  return (
    <button className="px-3 py-1 rounded bg-blue-600 text-white text-sm" onClick={handleClick}>
      {label}
    </button>
  );
};

