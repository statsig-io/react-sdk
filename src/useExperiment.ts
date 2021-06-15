import type { ConfigResult } from './useConfig';
import useConfig from './useConfig';

/**
 * A synchronous hook to check the value of an experiment.  To ensure correctness, wait for SDK initialization before
 * calling.
 * @param experimentName - the name of the experiment to check
 * @returns a ConfigResult indicating the DynamicConfig backing the experiment, and the loading state of the SDK
 */
export default function (experimentName: string): ConfigResult {
  return useConfig(experimentName);
}
