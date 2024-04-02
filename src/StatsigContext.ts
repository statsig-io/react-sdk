import React from 'react';
import { StatsigUser } from 'statsig-js';

export type UpdateUserFunc = React.Dispatch<React.SetStateAction<StatsigUser>>;

export interface TStatsigContext {
  initialized: boolean;
  statsigPromise: React.MutableRefObject<Promise<void>> | null;
  userVersion: number;
  initStarted: boolean;
  updateUser: UpdateUserFunc;
  hooksMemoKey: string | null; // For now, only used by the synchronous provider to break hook memoization when initializeValues changes
}

/**
 * The Statsig SDK context used by the StatsigProvider, and consumed by other SDK helper functions
 */
export default React.createContext<TStatsigContext>({
  initialized: false,
  statsigPromise: null,
  userVersion: 0,
  initStarted: false,
  updateUser: () => {
    // noop
  },
  hooksMemoKey: null,
});
