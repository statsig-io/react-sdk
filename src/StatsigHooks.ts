import { useContext, useMemo } from 'react';
import { DynamicConfig, EvaluationReason, FeatureGate, Layer } from 'statsig-js';
import type { CheckGateOptions as GetFeatureGateOptions } from 'statsig-js';
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

/**
 * Returns the initialization state of the SDK and a gate object
 */
export type FeatureGateResult = {
  isLoading: boolean;
  gate: FeatureGate;
}

export function useFeatureGateImpl(
  gateName: string,
  options?: GetFeatureGateOptions,
): FeatureGateResult {
  const { initialized, userVersion, initStarted } = useContext(StatsigContext);

  const gate = useMemo(
    () =>
      initStarted
        ? Statsig.getFeatureGate(gateName, options)
        : new FeatureGate(gateName, false, '', {
          time: Date.now(),
          reason: EvaluationReason.Uninitialized,
        }),
    [
      initialized,
      initStarted,
      gateName,
      userVersion,
      options,
      options?.disableExposureLogging,
    ],
  );
  return {
    isLoading: !initialized,
    gate: gate,
  };
}


export function useGateImpl(
  gateName: string,
  options?: CheckGateOptions,
  exposureLoggingDisabled = false,
): GateResult {
  const { initialized, userVersion, initStarted, initValuesTime } = useContext(StatsigContext);

  const gate = useMemo(
    () =>
      initStarted
        ? exposureLoggingDisabled
          ? Statsig.checkGateWithExposureLoggingDisabled(gateName, options)
          : Statsig.checkGate(gateName, options?.ignoreOverrides)
        : false,
    [
      initialized,
      initStarted,
      gateName,
      userVersion,
      options,
      exposureLoggingDisabled,
      initValuesTime,
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
  options?: GetConfigOptions,
  exposureLoggingDisabled = false,
): ConfigResult {
  const { initialized, initStarted, userVersion, initValuesTime } = useContext(StatsigContext);
  const config = useMemo(
    () =>
      initStarted
        ? exposureLoggingDisabled
          ? Statsig.getConfigWithExposureLoggingDisabled(configName, options)
          : Statsig.getConfig(configName, options?.ignoreOverrides)
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
      initValuesTime,
    ],
  );
  return {
    isLoading: !initialized,
    config,
  };
}

export function useExperimentImpl(
  experimentName: string,
  options?: GetExperimentOptions,
  exposureLoggingDisabled = false,
): ConfigResult {
  const { initialized, initStarted, userVersion, initValuesTime } = useContext(StatsigContext);
  const config = useMemo(
    () =>
      initStarted
        ? exposureLoggingDisabled
          ? Statsig.getExperimentWithExposureLoggingDisabled(
              experimentName,
              options,
            )
          : Statsig.getExperiment(
              experimentName,
              options?.keepDeviceValue,
              options?.ignoreOverrides,
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
      initValuesTime,
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
  options?: GetLayerOptions,
  exposureLoggingDisabled = false,
): LayerResult {
  const { initialized, initStarted, userVersion, initValuesTime } = useContext(StatsigContext);
  const layer = useMemo(
    () =>
      initStarted
        ? exposureLoggingDisabled
          ? Statsig.getLayerWithExposureLoggingDisabled(layerName, options)
          : Statsig.getLayer(layerName, options?.keepDeviceValue)
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
      initValuesTime,
    ],
  );
  return {
    isLoading: !initialized,
    layer,
  };
}
