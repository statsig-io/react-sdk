import React from 'react';
import statsig from 'statsig-js';

export interface TStatsigContext {
  initialized: boolean;
  statsigPromise: React.MutableRefObject<Promise<void>> | null;
  statsig: typeof statsig | undefined;
}

/**
 * The Statsig SDK context used by the StatsigProvider, and consumed by other SDK helper functions
 */
export default React.createContext<TStatsigContext>({
  initialized: false,
  statsig: undefined,
  statsigPromise: null,
});
