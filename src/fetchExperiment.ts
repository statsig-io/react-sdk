import fetchConfig from './fetchConfig';
import type { ConfigResult } from './useConfig';

/**
 * An asynchronous hook to check the value of an experiment that waits for SDK initialization before resolving
 * Use this hook if you do not pass waitForInitialization to the StatsigProvider to wait at the specific callsite instead
 * @param experimentName - the name of the experiment to check
 * @returns a ConfigResult indicating the DynamicConfig backing the experiment, and the loading state of the SDK (always false)
 */
export default async function (experimentName: string): Promise<ConfigResult> {
  return fetchConfig(experimentName);
}
