import { useContext } from 'react';
import StatsigContext from './StatsigContext';
import statsig from 'statsig-js';

export type statsigSDK = typeof statsig;

/**
 * Returns the StatsigContext's internal statsig-js SDK
 * You can use this to log events, or check gates/configs in loops, rather than using the provided hooks
 * @returns An instance of the statsig-js SDK
 */
export default function (): statsigSDK {
  const { statsig } = useContext(StatsigContext);
  return statsig;
}
