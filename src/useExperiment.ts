import type { ConfigResult } from './useConfig';
import { useContext, useMemo } from 'react';
import { DynamicConfig, EvaluationReason } from 'statsig-js';
import StatsigContext from './StatsigContext';
import Statsig from './Statsig';

/**
 * A synchronous hook to check the value of an experiment.  To ensure correctness, wait for SDK initialization before
 * calling.
 * @param experimentName - the name of the experiment to check
 * @param keepDeviceValue - whether the value returned should be kept for the user on the device for the duration of the experiment
 * @param ignoreOverrides -
 * @param exposureLoggingDisabled - flag to disable exposure logging
 * @returns a ConfigResult indicating the DynamicConfig backing the experiment, and the loading state of the SDK
 */
export default function (
  experimentName: string,
  keepDeviceValue: boolean = false,
  ignoreOverrides?: boolean,
  exposureLoggingDisabled?: boolean,
): ConfigResult {
  const { initialized, initStarted, userVersion } = useContext(StatsigContext);
  const config = useMemo(
    () =>
      initStarted
        ? exposureLoggingDisabled
          ? Statsig.getExperimentWithExposureLoggingDisabled(
              experimentName,
              keepDeviceValue,
              ignoreOverrides,
            )
          : Statsig.getExperiment(
              experimentName,
              keepDeviceValue,
              ignoreOverrides,
            )
        : new DynamicConfig(experimentName, {}, '', {
            time: Date.now(),
            reason: EvaluationReason.Uninitialized,
          }),
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
