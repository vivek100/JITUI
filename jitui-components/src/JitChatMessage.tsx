import React from 'react';
import { useComponentRegistry } from './registry';

interface JitChatMessageProps {
  message: string;
  component?: { id: string; type: string; props: any };
}

export const JitChatMessage: React.FC<JitChatMessageProps> = ({ message, component }) => {
  const { renderComponent } = useComponentRegistry();
  return (
    <div className="chat-message space-y-2">
      <p>{message}</p>
      {component && renderComponent(component.id, component.type, component.props)}
    </div>
  );
};

