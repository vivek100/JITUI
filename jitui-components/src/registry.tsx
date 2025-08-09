import React, { ComponentType, createContext, useContext, useMemo } from 'react';

type ComponentEntry = ComponentType<any>;

interface ComponentRegistryValue {
  components: Map<string, ComponentEntry>;
  registerComponent: (type: string, component: ComponentEntry) => void;
  renderComponent: (id: string, type: string, props?: any) => React.ReactNode;
}

const RegistryContext = createContext<ComponentRegistryValue | null>(null);

export const ComponentRegistryProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const mapRef = useMemo(() => new Map<string, ComponentEntry>(), []);

  const value: ComponentRegistryValue = {
    components: mapRef,
    registerComponent: (type, component) => {
      mapRef.set(type, component);
    },
    renderComponent: (id, type, props) => {
      const Component = mapRef.get(type);
      if (!Component) throw new Error(`Component ${type} not registered`);
      return <Component {...props} id={id} />;
    },
  };

  return <RegistryContext.Provider value={value}>{children}</RegistryContext.Provider>;
};

export function useComponentRegistry() {
  const ctx = useContext(RegistryContext);
  if (!ctx) throw new Error('useComponentRegistry must be used within ComponentRegistryProvider');
  return ctx;
}

