import { useContext, useEffect } from 'react';
import { StatsigUser } from 'statsig-js';
import { Statsig } from './Statsig';
import { StatsigContext } from './StatsigContext';

export const usePrefetchUsers = (users: StatsigUser[]): void => {
  const { initStarted } = useContext(StatsigContext);

  useEffect(() => {
    if (!initStarted || users.length == 0) {
      return;
    }
    Statsig.prefetchUsers(users).catch(() => {
      // noop
    });
  }, [initStarted, users]);
};
