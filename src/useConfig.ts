import { useContext, useMemo } from 'react';
import { DynamicConfig, EvaluationReason } from 'statsig-js';
import StatsigContext from './StatsigContext';
import Statsig from './Statsig';

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
export default function (
  configName: string,
  ignoreOverrides?: boolean,
): ConfigResult {
  const { initialized, initStarted, userVersion } = useContext(StatsigContext);
  const config = useMemo(
    () =>
      initStarted
        ? Statsig.getConfig(configName, ignoreOverrides)
        : new DynamicConfig(configName, {}, '', {
            time: Date.now(),
            reason: EvaluationReason.Uninitialized,
          }),
    [initialized, initStarted, configName, userVersion, ignoreOverrides],
  );
  return {
    isLoading: !initialized,
    config,
  };
}
