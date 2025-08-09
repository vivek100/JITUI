import React from 'react';
import { useJitStore } from '@jitui/state';
import { useComponentRegistry, JitChatMessage } from '@jitui/components';

interface JitLayoutProps {
  mode?: 'grid' | 'chat';
}

export const JitLayout: React.FC<JitLayoutProps> = ({ mode = 'grid' }) => {
  const { layout, chat } = useJitStore();
  const { renderComponent } = useComponentRegistry();

  if (mode === 'chat' || layout.mode === 'chat') {
    return (
      <div className="chat-container flex flex-col gap-4 p-4 max-w-2xl mx-auto">
        {chat.messages.map((msg) => (
          <JitChatMessage key={msg.id} message={msg.text} component={msg.component} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid-container grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
      {layout.grid?.map((item) => (
        <div key={item.id} className="col-span-1">
          {renderComponent(item.id, item.component, item.props)}
        </div>
      ))}
    </div>
  );
};

