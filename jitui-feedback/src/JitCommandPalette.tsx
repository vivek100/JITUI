import React from 'react';
import { useJitStore } from '@jitui/state';

export const JitCommandPalette: React.FC = () => {
  const [input, setInput] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const { dispatchAction } = useJitStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || !input) return;
    setIsLoading(true);
    dispatchAction('SUBMIT_CHAT_COMMAND', { command: input });
    setIsLoading(false);
    setInput('');
  };

  return (
    <form onSubmit={handleSubmit} className="command-palette p-4 border-t bg-gray-50">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={isLoading}
        className="w-full p-2 border rounded disabled:bg-gray-200"
        placeholder={isLoading ? 'Processing...' : 'Enter command (e.g., Show lead 123)'}
      />
    </form>
  );
};

