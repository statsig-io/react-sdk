import { useContext } from 'react';
import DynamicConfig from './DynamicConfig';
import StatsigContext from './StatsigContext';

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
  const { initialized, statsig } = useContext(StatsigContext);

  if (initialized && statsig) {
    const config = statsig.getConfig(configName);
    return {
      isLoading: !initialized,
      config: new DynamicConfig(configName, config.value),
    };
  }
  return {
    isLoading: !initialized,
    config: new DynamicConfig(configName, {}),
  };
}
