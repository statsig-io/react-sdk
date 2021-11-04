import { useContext, useMemo } from 'react';
import StatsigContext from './StatsigContext';
import Statsig from './Statsig';

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
export default function (
  gateName: string,
  ignoreOverrides?: boolean,
): GateResult {
  const { initialized, userVersion, initStarted } = useContext(StatsigContext);

  const gate = useMemo(
    () => (initStarted ? Statsig.checkGate(gateName, ignoreOverrides) : false),
    [initialized, initStarted, gateName, userVersion, ignoreOverrides],
  );
  return {
    isLoading: !initialized,
    value: gate,
  };
}
