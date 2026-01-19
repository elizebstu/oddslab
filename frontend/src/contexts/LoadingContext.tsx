import { createContext, useContext, useReducer, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';

interface LoadingState {
  id: string;
  message?: string;
}

interface LoadingStateValue {
  states: Map<string, LoadingState>;
}

interface LoadingContextValue {
  globalLoading: boolean;
  loadingMessage: string | undefined;
  startLoading: (id: string, message?: string) => void;
  stopLoading: (id: string) => void;
  isLoading: (id: string) => boolean;
}

const LoadingContext = createContext<LoadingContextValue | undefined>(undefined);

type LoadingAction =
  | { type: 'START'; payload: { id: string; message?: string } }
  | { type: 'STOP'; payload: { id: string } };

/**
 * Reducer for managing loading states.
 * Using reducer instead of multiple useState for better performance and predictability.
 * Follows Vercel's best practices for state management.
 */
function loadingReducer(state: LoadingStateValue, action: LoadingAction): LoadingStateValue {
  switch (action.type) {
    case 'START': {
      const next = new Map(state.states);
      next.set(action.payload.id, { id: action.payload.id, message: action.payload.message });
      return { states: next };
    }
    case 'STOP': {
      const next = new Map(state.states);
      next.delete(action.payload.id);
      return { states: next };
    }
    default:
      return state;
  }
}

const initialState: LoadingStateValue = {
  states: new Map(),
};

/**
 * Loading Provider with optimized state management using useReducer.
 * - Single reducer dispatch instead of multiple setState calls
 * - Memoized context value to prevent unnecessary re-renders
 * - Efficient state checks using Map.size
 */
export function LoadingProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(loadingReducer, initialState);

  const startLoading = useCallback((id: string, message?: string) => {
    dispatch({ type: 'START', payload: { id, message } });
  }, []);

  const stopLoading = useCallback((id: string) => {
    dispatch({ type: 'STOP', payload: { id } });
  }, []);

  const isLoading = useCallback((id: string) => {
    return state.states.has(id);
  }, [state.states]);

  // Memoize context value to prevent unnecessary re-renders in consumers
  const value = useMemo(() => {
    const statesArray = Array.from(state.states.values());
    return {
      globalLoading: state.states.size > 0,
      loadingMessage: statesArray[0]?.message,
      startLoading,
      stopLoading,
      isLoading,
    };
  }, [state.states, startLoading, stopLoading, isLoading]);

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}
