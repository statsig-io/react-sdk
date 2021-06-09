import { useContext } from 'react';
import StatsigContext from './StatsigContext';

export default function (
  eventName: string,
  value?: string | number,
  metadata?: Record<string, string>,
) {
  const { statsig } = useContext(StatsigContext);
  statsig.logEvent(eventName, value, metadata);
}
