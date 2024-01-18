import { GetExperimentOptions } from './Statsig';
import { ConfigResult, useExperimentImpl } from './StatsigHooks';

/**
 * A synchronous hook to check the value of an experiment without exposure logging.
 * To ensure correctness, wait for SDK initialization before calling.
 * @param experimentName - the name of the experiment to check
 * @param options - Custom options for the API
 *
 * keepDeviceValue - whether the value returned should be kept for the user on the device for the duration of the experiment
 *
 * ignoreOverrides - flag to ignore overrides
 *
 * @returns a ConfigResult indicating the DynamicConfig backing the experiment, and the loading state of the SDK
 */
export const useExperimentWithExposureLoggingDisabled = (
  experimentName: string,
  options?: GetExperimentOptions,
): ConfigResult => {
  return useExperimentImpl(
    experimentName,
    options,
    true /* exposure logging disabled */,
  );
};
