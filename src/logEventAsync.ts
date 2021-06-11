import { useContext } from 'react';
import StatsigContext from './StatsigContext';

export default async function (
  eventName: string,
  value?: string | number,
  metadata?: Record<string, string>,
) {
  const { statsigPromise, statsig } = useContext(StatsigContext);
  statsigPromise && (await statsigPromise);
  statsig.logEvent(eventName, value, metadata);
}
