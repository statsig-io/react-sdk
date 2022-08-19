import { useContext, useEffect, useMemo } from 'react';
import StatsigContext from './StatsigContext';
import Statsig from './Statsig';
import { StatsigUser } from 'statsig-js';

export default function (users: StatsigUser[]): void {
  const { initStarted } = useContext(StatsigContext);

  useEffect(() => {
    if (!initStarted || users.length == 0) {
      return;
    }
    Statsig.prefetchUsers(users);
  }, [initStarted, users]);
}
