import { useContext } from 'react';
import StatsigContext from './StatsigContext';
import type { GateResult } from './useGate';

/**
 * An asynchronous hook to check the value of the gate that waits for SDK initialization before resolving.
 * Use this hook if you do not pass waitForInitialization to the StatsigProvider to wait at the specific callsite instead
 * @param gateName - the name of the gate to check
 * @returns a result indicating the boolean value of the gate and loading state of the SDK (always false)
 */
export default async function (gateName: string): Promise<GateResult> {
  const { statsigPromise, statsig } = useContext(StatsigContext);
  statsigPromise && (await statsigPromise);
  return {
    isLoading: false,
    value: statsig.checkGate(gateName),
  };
}
