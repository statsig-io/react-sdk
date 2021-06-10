import React from 'react';
import statsig from 'statsig-js';

export interface TStatsigContext {
  initialized: boolean;
  statsigPromise: React.MutableRefObject<Promise<void>> | null;
  statsig: typeof statsig;
}

export default React.createContext<TStatsigContext>({
  initialized: false,
  statsig: statsig,
  statsigPromise: null,
});
