import { useContext, useMemo } from 'react';
import { DynamicConfig, EvaluationReason, Layer } from 'statsig-js';
import StatsigContext from './StatsigContext';
import Statsig, {
  CheckGateOptions,
  GetConfigOptions,
  GetExperimentOptions,
  GetLayerOptions,
} from './Statsig';

/**
 * Returns the initialization state of the SDK and a gate value
 */
export type GateResult = {
  isLoading: boolean;
  value: boolean;
};

export function useGateImpl(
  gateName: string,
  options: CheckGateOptions,
  exposureLoggingDisabled: boolean = false,
): GateResult {
  const { initialized, userVersion, initStarted } = useContext(StatsigContext);

  const gate = useMemo(
    () =>
      initStarted
        ? exposureLoggingDisabled
          ? Statsig.checkGateWithExposureLoggingDisabled(gateName, options)
          : Statsig.checkGate(gateName, options.ignoreOverrides)
        : false,
    [
      initialized,
      initStarted,
      gateName,
      userVersion,
      options,
      exposureLoggingDisabled,
    ],
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
  options: GetConfigOptions,
  exposureLoggingDisabled: boolean = false,
): ConfigResult {
  const { initialized, initStarted, userVersion } = useContext(StatsigContext);
  const config = useMemo(
    () =>
      initStarted
        ? exposureLoggingDisabled
          ? Statsig.getConfigWithExposureLoggingDisabled(configName, options)
          : Statsig.getConfig(configName, options.ignoreOverrides)
        : new DynamicConfig(configName, {}, '', {
            time: Date.now(),
            reason: EvaluationReason.Uninitialized,
          }),
    [
      initialized,
      initStarted,
      configName,
      userVersion,
      options,
      exposureLoggingDisabled,
    ],
  );
  return {
    isLoading: !initialized,
    config,
  };
}

export function useExperimentImpl(
  experimentName: string,
  options: GetExperimentOptions,
  exposureLoggingDisabled: boolean = false,
): ConfigResult {
  const { initialized, initStarted, userVersion } = useContext(StatsigContext);
  const config = useMemo(
    () =>
      initStarted
        ? exposureLoggingDisabled
          ? Statsig.getConfigWithExposureLoggingDisabled(
              experimentName,
              options,
            )
          : Statsig.getExperiment(
              experimentName,
              options.keepDeviceValue,
              options.ignoreOverrides,
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
      options,
      exposureLoggingDisabled,
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
  options: GetLayerOptions,
  exposureLoggingDisabled: boolean = false,
): LayerResult {
  const { initialized, initStarted, userVersion } = useContext(StatsigContext);
  const layer = useMemo(
    () =>
      initStarted
        ? exposureLoggingDisabled
          ? Statsig.getLayerWithExposureLoggingDisabled(layerName, options)
          : Statsig.getLayer(layerName, options.keepDeviceValue)
        : Layer._create(layerName, {}, '', {
            time: Date.now(),
            reason: EvaluationReason.Uninitialized,
          }),
    [
      initialized,
      initStarted,
      layerName,
      userVersion,
      options,
      exposureLoggingDisabled,
    ],
  );
  return {
    isLoading: !initialized,
    layer,
  };
}
