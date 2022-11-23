import { CheckGateOptions } from './Statsig';
import { GateResult, useGateImpl } from './StatsigHooks';

/**
 * A synchronous hook to check the value of the gate without exposure logging.
 * To ensure correctness, wait for SDK initialization before calling.
 * @param gateName - the name of the gate to check
 * @param options - Custom options for the API
 *
 * ignoreOverrides - flag to ignore overrides
 *
 * @returns a result indicating the boolean value of the gate and loading state of the SDK
 */
export default function (
  gateName: string,
  options?: CheckGateOptions,
): GateResult {
  return useGateImpl(gateName, options, true /* exposure logging disabled */);
}
