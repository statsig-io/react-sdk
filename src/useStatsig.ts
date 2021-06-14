import { useContext } from 'react';
import StatsigContext from './StatsigContext';
import statsig from 'statsig-js';

export type statsigSDK = typeof statsig;

export default function (): statsigSDK {
  const { statsig } = useContext(StatsigContext);
  return statsig;
}
