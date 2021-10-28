import React from 'react';
import { IStatsig, StatsigClient } from 'statsig-js';

export interface TStatsigContext {
  initialized: boolean;
  statsigPromise: React.MutableRefObject<Promise<void>> | null;
  userVersion: number;
  initStarted: boolean;
}

/**
 * The Statsig SDK context used by the StatsigProvider, and consumed by other SDK helper functions
 */
export default React.createContext<TStatsigContext>({
  initialized: false,
  statsigPromise: null,
  userVersion: 0,
  initStarted: false,
});
