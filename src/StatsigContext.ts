import React, { createContext, Dispatch, SetStateAction } from 'react';
import type { StatsigUser } from 'statsig-js';

export type UpdateUserFunc = Dispatch<SetStateAction<StatsigUser>>;

export interface TStatsigContext {
  initialized: boolean;
  statsigPromise: React.MutableRefObject<Promise<void>> | null;
  userVersion: number;
  initStarted: boolean;
  updateUser: UpdateUserFunc;
}

/**
 * The Statsig SDK context used by the StatsigProvider, and consumed by other SDK helper functions
 */
export const StatsigContext = createContext<TStatsigContext>({
  initialized: false,
  statsigPromise: null,
  userVersion: 0,
  initStarted: false,
  updateUser: () => {
    // noop
  },
});
