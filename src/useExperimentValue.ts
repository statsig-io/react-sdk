import { ValueResult, useExperimentValueImpl } from './StatsigHooks';

/**
 * A synchronous hook to check the value of an experiment.  To ensure correctness, wait for SDK initialization before
 * calling.
 * @param experimentName - the name of the experiment to check
 * @param key - the name of the key
 * @param defaultValue - the default value if the key doesn't exist
 * @param keepDeviceValue - whether the value returned should be kept for the user on the device for the duration of the experiment
 * @param ignoreOverrides - flag to ignore overrides
 * @returns a ValueResult with the value of that key, and the loading state of the SDK
 */
export const useExperimentValue = <TValue>(
  experimentName: string,
  key: string,
  defaultValue: TValue,
  keepDeviceValue = false,
  ignoreOverrides?: boolean,
): ValueResult<TValue> => {
  return useExperimentValueImpl(experimentName, key, defaultValue, {
    keepDeviceValue,
    ignoreOverrides,
  });
};
