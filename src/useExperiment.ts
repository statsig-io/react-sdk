import type { ConfigResult } from './useConfig';
import { useContext, useMemo } from 'react';
import { DynamicConfig } from 'statsig-js';
import StatsigContext from './StatsigContext';
import Statsig from './Statsig';

/**
 * A synchronous hook to check the value of an experiment.  To ensure correctness, wait for SDK initialization before
 * calling.
 * @param experimentName - the name of the experiment to check
 * @param keepDeviceValue -
 * @param ignoreOverrides -
 * @returns a ConfigResult indicating the DynamicConfig backing the experiment, and the loading state of the SDK
 */
export default function (
  experimentName: string,
  keepDeviceValue: boolean = false,
  ignoreOverrides?: boolean,
): ConfigResult {
  const { initialized, initStarted, userVersion } = useContext(StatsigContext);
  const config = useMemo(
    () =>
      initStarted
        ? Statsig.getExperiment(
            experimentName,
            keepDeviceValue,
            ignoreOverrides,
          )
        : new DynamicConfig(experimentName),
    [
      initialized,
      initStarted,
      experimentName,
      userVersion,
      keepDeviceValue,
      ignoreOverrides,
    ],
  );
  return {
    isLoading: !initialized,
    config,
  };
}
