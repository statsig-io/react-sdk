import { ConfigResult, useConfigImpl } from './StatsigHooks';

/**
 * A synchronous hook to check the value of a Dynamic Config.  To ensure correctness, wait for SDK initialization before
 * calling.
 * @param configName - the name of the DynamicConfig to check
 * @param ignoreOverrides - flag to ignore overrides
 * @returns a ConfigResult indicating the DynamicConfig value, and the loading state of the SDK
 */
export const useConfig = (
  configName: string,
  ignoreOverrides?: boolean,
): ConfigResult => {
  return useConfigImpl(configName, {
    ignoreOverrides,
  });
};
