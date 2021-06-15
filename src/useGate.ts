import { useContext } from 'react';
import StatsigContext from './StatsigContext';

export type GateResult = {
  isLoading: boolean;
  value: boolean;
};

/**
 * A synchronous hook to check the value of the gate.  To ensure correctness, wait for SDK initialization before
 * calling.
 * @param gateName - the name of the gate to check
 * @returns a result indicating the boolean value of the gate and loading state of the SDK
 */
export default function (gateName: string): GateResult {
  const { initialized, statsig } = useContext(StatsigContext);
  return {
    isLoading: !initialized,
    value: initialized ? statsig.checkGate(gateName) : false,
  };
}
