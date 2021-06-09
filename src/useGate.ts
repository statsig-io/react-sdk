import { useContext } from 'react';
import StatsigContext from './StatsigContext';

export type GateResult = {
  isLoading: boolean;
  value: boolean;
};

export default function (gateName: string): GateResult {
  const { initialized, statsig } = useContext(StatsigContext);
  return {
    isLoading: !initialized,
    value: statsig.checkGate(gateName),
  };
}
