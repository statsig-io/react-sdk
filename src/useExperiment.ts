import { ConfigResult, useExperimentImpl } from './StatsigHooks';

/**
 * A synchronous hook to check the value of an experiment.  To ensure correctness, wait for SDK initialization before
 * calling.
 * @param experimentName - the name of the experiment to check
 * @param keepDeviceValue - whether the value returned should be kept for the user on the device for the duration of the experiment
 * @param ignoreOverrides - flag to ignore overrides
 * @returns a ConfigResult indicating the DynamicConfig backing the experiment, and the loading state of the SDK
 */
export default function (
  experimentName: string,
  keepDeviceValue = false,
  ignoreOverrides?: boolean,
): ConfigResult {
  return useExperimentImpl(experimentName, {
    keepDeviceValue,
    ignoreOverrides,
  });
}
