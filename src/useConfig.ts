import { useContext } from 'react';
import statsig from 'statsig-js';
import StatsigContext from './StatsigContext';

/**
 * Returns the initialization state of the SDK and a DynamicConfig value
 */
export type ConfigResult = {
  isLoading: boolean;
  config: statsig.DynamicConfig;
};

/**
 * A synchronous hook to check the value of a Dynamic Config.  To ensure correctness, wait for SDK initialization before
 * calling.
 * @param configName - the name of the DynamicConfig to check
 * @returns a ConfigResult indicating the DynamicConfig value, and the loading state of the SDK
 */
export default function (configName: string): ConfigResult {
  const { initialized, statsig } = useContext(StatsigContext);

  return {
    isLoading: !initialized,
    config: initialized
      ? statsig.getConfig(configName)
      : new statsig.DynamicConfig(configName, {}, ''),
  };
}
