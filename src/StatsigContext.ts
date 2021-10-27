import React from 'react';
import { IStatsig, StatsigClient } from 'statsig-js';

export interface TStatsigContext {
  initialized: boolean;
  statsigPromise: React.MutableRefObject<Promise<void>> | null;
  statsig: IStatsig;
  userVersion: number;
}

/**
 * The Statsig SDK context used by the StatsigProvider, and consumed by other SDK helper functions
 */
export default React.createContext<TStatsigContext>({
  initialized: false,
  statsig: new StatsigClient('client-default'),
  statsigPromise: null,
  userVersion: 0,
});
