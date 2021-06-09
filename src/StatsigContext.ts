import React, { useRef, MutableRefObject } from 'react';
import statsig from 'statsig-js';

interface StatsigContext {
  initialized: boolean;
  statsigPromise: MutableRefObject<Promise<void>>;
  statsig: typeof statsig;
}

export default React.createContext<StatsigContext>({
  initialized: false,
  statsig: statsig,
  statsigPromise: useRef<Promise<void>>(
    new Promise((resolve) => {
      resolve();
    }),
  ),
});
