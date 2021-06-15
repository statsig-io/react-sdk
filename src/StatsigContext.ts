import React from 'react';
import statsig from 'statsig-js';
import statsigDefault from './statsigDefault';

export interface TStatsigContext {
  initialized: boolean;
  statsigPromise: React.MutableRefObject<Promise<void>> | null;
  statsig: typeof statsig;
}

/**
 * The Statsig SDK context used by the StatsigProvider, and consumed by other SDK helper functions
 */
export default React.createContext<TStatsigContext>({
  initialized: false,
  statsig: statsigDefault,
  statsigPromise: null,
});
