import React, { useRef, useEffect, useState } from 'react';
import statsig from 'statsig-js';
import StatsigContext from './StatsigContext';

type Props = {
  children: React.ReactNode | React.ReactNode[];
  sdkKey: string;
  user: statsig.StatsigUser;
  options: statsig.StatsigOptions | null;
};

export default function StatsigProvider({
  children,
  sdkKey,
  user,
  options,
}: Props): JSX.Element {
  const [initialized, setInitialized] = useState(false);
  const resolver = useRef<(() => void) | null>(null);
  const statsigPromise = useRef<Promise<void>>(
    new Promise((resolve, _reject) => {
      resolver.current = resolve;
    }),
  );

  useEffect(() => {
    statsig.initialize(sdkKey, user, options).then(() => {
      setInitialized(true);
      resolver.current && resolver.current();
    });
  });

  return (
    <StatsigContext.Provider value={{ initialized, statsig, statsigPromise }}>
      {children}
    </StatsigContext.Provider>
  );
}
