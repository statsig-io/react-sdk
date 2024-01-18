import { GetConfigOptions } from './Statsig';
import { ConfigResult, useConfigImpl } from './StatsigHooks';

/**
 * A synchronous hook to check the value of a Dynamic Config without exposure logging.
 * To ensure correctness, wait for SDK initialization before calling.
 * @param configName - the name of the DynamicConfig to check
 * @param options - Custom options for the API
 *
 * ignoreOverrides - flag to ignore overrides
 *
 * @returns a ConfigResult indicating the DynamicConfig value, and the loading state of the SDK
 */
export const useConfigWithExposureLoggingDisabled = (
  configName: string,
  options?: GetConfigOptions,
): ConfigResult => {
  return useConfigImpl(
    configName,
    options,
    true /* exposure logging disabled */,
  );
};
