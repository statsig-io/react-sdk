import { useContext, useMemo } from 'react';
import { DynamicConfig, EvaluationReason, Layer } from 'statsig-js';
import StatsigContext from './StatsigContext';
import Statsig from './Statsig';

/**
 * Returns the initialization state of the SDK and a gate value
 */
export type GateResult = {
  isLoading: boolean;
  value: boolean;
};

export function useGateImpl(
  gateName: string,
  ignoreOverrides?: boolean,
  exposureLoggingDisabled?: boolean,
): GateResult {
  const { initialized, userVersion, initStarted } = useContext(StatsigContext);

  const gate = useMemo(
    () =>
      initStarted
        ? exposureLoggingDisabled
          ? Statsig.checkGateWithExposureLoggingDisabled(
              gateName,
              ignoreOverrides,
            )
          : Statsig.checkGate(gateName, ignoreOverrides)
        : false,
    [initialized, initStarted, gateName, userVersion, ignoreOverrides],
  );
  return {
    isLoading: !initialized,
    value: gate,
  };
}

/**
 * Returns the initialization state of the SDK and a DynamicConfig value
 */
export type ConfigResult = {
  isLoading: boolean;
  config: DynamicConfig;
};

export function useConfigImpl(
  configName: string,
  ignoreOverrides?: boolean,
  exposureLoggingDisabled?: boolean,
): ConfigResult {
  const { initialized, initStarted, userVersion } = useContext(StatsigContext);
  const config = useMemo(
    () =>
      initStarted
        ? exposureLoggingDisabled
          ? Statsig.getConfigWithExposureLoggingDisabled(
              configName,
              ignoreOverrides,
            )
          : Statsig.getConfig(configName, ignoreOverrides)
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

export function useExperimentImpl(
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

/**
 * Returns the initialization state of the SDK and a Layer value
 */
export type LayerResult = {
  isLoading: boolean;
  layer: Layer;
};

export function useLayerImpl(
  layerName: string,
  keepDeviceValue: boolean = false,
  exposureLoggingDisabled?: boolean,
): LayerResult {
  const { initialized, initStarted, userVersion } = useContext(StatsigContext);
  const layer = useMemo(
    () =>
      initStarted
        ? exposureLoggingDisabled
          ? Statsig.getLayerWithExposureLoggingDisabled(
              layerName,
              keepDeviceValue,
            )
          : Statsig.getLayer(layerName, keepDeviceValue)
        : Layer._create(layerName, {}, '', {
            time: Date.now(),
            reason: EvaluationReason.Uninitialized,
          }),
    [initialized, initStarted, layerName, userVersion, keepDeviceValue],
  );
  return {
    isLoading: !initialized,
    layer,
  };
}
