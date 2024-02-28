import { FeatureGateResult, useFeatureGateImpl } from './StatsigHooks';
import { GetFeatureGateOptions } from './Statsig';
/**
 * A synchronous hook to check the value and metadata of a FeatureGate.  To ensure correctness, wait for SDK initialization before
 * calling.
 * @param gateName - the name of the FeatureGate to check
 * @param GetFeatureGateOptions - options for this check (disable exposure logging, disable overrides, etc)
 * @returns a FeatureGateResult indicating the FeatureGate metadata and value, and the loading state of the SDK
 */
export default function (
  gateName: string,
  options?: GetFeatureGateOptions,
): FeatureGateResult {
  return useFeatureGateImpl(gateName, options);
}
