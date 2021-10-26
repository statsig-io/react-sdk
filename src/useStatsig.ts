import { useContext } from 'react';
import StatsigContext from './StatsigContext';
import type { IStatsig } from 'statsig-js';

export type statsigSDK = IStatsig | undefined;

/**
 * Returns the StatsigContext's internal statsig-js SDK
 * You can use this to log events, or check gates/configs in loops, rather than using the provided hooks
 * @returns An initilaized reference to the statsigSDK, or undefined if initialization has not completed
 */
export default function (): statsigSDK {
  const { statsig } = useContext(StatsigContext);
  return statsig;
}
