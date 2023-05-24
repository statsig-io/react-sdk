import { useContext, useEffect } from 'react';
import Statsig from './Statsig';
import StatsigContext from './StatsigContext';

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
