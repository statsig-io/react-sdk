import { useContext, useEffect, useMemo } from 'react';
import StatsigContext from './StatsigContext';
import Statsig from './Statsig';

export default function (
  eventName: string,
  value?: string | number | null,
  metadata?: Record<string, string> | null,
): void {
  const { initStarted } = useContext(StatsigContext);

  useEffect(() => {
    if (!initStarted) {
      return;
    }
    Statsig.logEvent(eventName, value, metadata);
  }, [initStarted]);
}
