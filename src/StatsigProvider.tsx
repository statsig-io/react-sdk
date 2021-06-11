import React, { useRef, useEffect, useState } from 'react';
import statsig from 'statsig-js';
import StatsigContext from './StatsigContext';

type Props = {
  children: React.ReactNode | React.ReactNode[];
  sdkKey: string;
  user: statsig.StatsigUser;
  options?: statsig.StatsigOptions;
  waitForInitialization?: boolean;
};

export default function StatsigProvider({
  children,
  sdkKey,
  user,
  options,
  waitForInitialization,
}: Props): JSX.Element {
  const [initialized, setInitialized] = useState(false);
  const resolver = useRef<(() => void) | null>(null);
  let statsigPromise = useRef<Promise<void>>(
    new Promise((resolve, _reject) => {
      resolver.current = resolve;
    }),
  );

  useEffect(() => {
    if (initialized) {
      statsigPromise.current = new Promise((resolve, _reject) => {
        resolver.current = resolve;
      });
      setInitialized(false);
      statsig.updateUser(user).then(() => {
        setInitialized(true);
        resolver.current && resolver.current();
      });
      return;
    }
    statsig.initialize(sdkKey, user, options).then(() => {
      setInitialized(true);
      resolver.current && resolver.current();
    });
  }, [user]);

  return (
    <StatsigContext.Provider value={{ initialized, statsig, statsigPromise }}>
      {waitForInitialization !== true || initialized ? children : null}
    </StatsigContext.Provider>
  );
}
