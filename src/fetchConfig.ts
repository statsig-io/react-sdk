import { useContext } from 'react';
import StatsigContext from './StatsigContext';
import type { ConfigResult } from './useConfig';

/**
 * An asynchronous hook to check the value of a Dynamic Config that waits for SDK initialization before resolving
 * Use this hook if you do not pass waitForInitialization to the StatsigProvider to wait at the specific callsite instead
 * @param configName - the name of the DynamicConfig to check
 * @returns a ConfigResult indicating the DynamicConfig value, and the loading state of the SDK (always false)
 */
export default async function (configName: string): Promise<ConfigResult> {
  const { statsigPromise, statsig } = useContext(StatsigContext);
  statsigPromise && (await statsigPromise);
  return {
    isLoading: false,
    config: statsig.getConfig(configName),
  };
}
