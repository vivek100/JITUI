import { useJitStore } from '@jitui/state';

export const useUndoRedo = () => {
  const { undo, redo, actionHistory } = useJitStore();
  return {
    undo,
    redo,
    canUndo: actionHistory.length > 0,
    canRedo: false,
  };
};

