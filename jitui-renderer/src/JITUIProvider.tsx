import React from 'react';
import { ComponentRegistryProvider } from '@jitui/components';

export const JITUIProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  return <ComponentRegistryProvider>{children}</ComponentRegistryProvider>;
};

