import { useContext, useMemo } from 'react';
import { DynamicConfig } from 'statsig-js';
import StatsigContext from './StatsigContext';
import Statsig from 'statsig-js';

/**
 * Returns the initialization state of the SDK and a DynamicConfig value
 */
export type ConfigResult = {
  isLoading: boolean;
  config: DynamicConfig;
};

/**
 * A synchronous hook to check the value of a Dynamic Config.  To ensure correctness, wait for SDK initialization before
 * calling.
 * @param configName - the name of the DynamicConfig to check
 * @returns a ConfigResult indicating the DynamicConfig value, and the loading state of the SDK
 */
export default function (configName: string): ConfigResult {
  const { initialized, initStarted, userVersion } = useContext(StatsigContext);
  const config = useMemo(
    () =>
      initStarted
        ? Statsig.getConfig(configName)
        : new DynamicConfig(configName),
    [initialized, initStarted, configName, userVersion],
  );
  return {
    isLoading: !initialized,
    config,
  };
}
