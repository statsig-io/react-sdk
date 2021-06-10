import React, { useRef, MutableRefObject } from 'react';
import statsig from 'statsig-js';

export interface TStatsigContext {
  initialized: boolean;
  statsigPromise: MutableRefObject<Promise<void>>;
  statsig: typeof statsig;
}

export default React.createContext<TStatsigContext>({
  initialized: false,
  statsig: statsig,
  statsigPromise: useRef<Promise<void>>(
    new Promise((resolve) => {
      resolve();
    }),
  ),
});
