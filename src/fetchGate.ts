import { useContext } from 'react';
import StatsigContext from './StatsigContext';
import { GateResult } from './useGate';

export default async function (gateName: string): Promise<GateResult> {
  const { statsigPromise, statsig } = useContext(StatsigContext);
  await statsigPromise;
  return {
    isLoading: false,
    value: statsig?.checkGate(gateName) ?? false,
  };
}
