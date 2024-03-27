import { GateResult, useGateImpl } from './StatsigHooks';

/**
 * A synchronous hook to check the value of the gate.  To ensure correctness, wait for SDK initialization before
 * calling.
 * @param gateName - the name of the gate to check
 * @param ignoreOverrides - flag to ignore overrides
 * @returns a result indicating the boolean value of the gate and loading state of the SDK
 */
export default function (
  gateName: string,
  ignoreOverrides?: boolean,
): GateResult {
  return useGateImpl(gateName, ignoreOverrides ?? false);
}
