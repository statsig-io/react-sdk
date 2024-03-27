import { useContext, useMemo } from 'react';
import { DynamicConfig, EvaluationReason, FeatureGate, Layer } from 'statsig-js';
import type { CheckGateOptions as GetFeatureGateOptions } from 'statsig-js';
import StatsigContext from './StatsigContext';
import Statsig, {
  CheckGateOptions,
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
      options?.ignoreOverrides,
      options?.disableExposureLogging,
    ],
  );
  return {
    isLoading: !initialized,
    gate: gate,
  };
}

export function useGateWithExposureLoggingDisabledImpl(
  gateName: string,
  options?: CheckGateOptions,
): GateResult {
  return useGateImpl(gateName, options?.ignoreOverrides ?? false, true);
}

export function useGateImpl(
  gateName: string,
  ignoreOverrides: boolean,
  exposureLoggingDisabled = false,
): GateResult {
  const { initialized, userVersion, initStarted, initValuesTime } = useContext(StatsigContext);

  const gate = useMemo(
    () =>
      initStarted
        ? exposureLoggingDisabled
          ? Statsig.checkGateWithExposureLoggingDisabled(gateName, { ignoreOverrides })
          : Statsig.checkGate(gateName, ignoreOverrides)
        : false,
    [
      initialized,
      initStarted,
      gateName,
      userVersion,
      ignoreOverrides,
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
  ignoreOverrides: boolean,
  exposureLoggingDisabled = false,
): ConfigResult {
  const { initialized, initStarted, userVersion, initValuesTime } = useContext(StatsigContext);
  const config = useMemo(
    () => {
      return initStarted
        ? exposureLoggingDisabled
          ? Statsig.getConfigWithExposureLoggingDisabled(configName, { ignoreOverrides })
          : Statsig.getConfig(configName, ignoreOverrides)
        : new DynamicConfig(configName, {}, '', {
            time: Date.now(),
            reason: EvaluationReason.Uninitialized,
          });
    },
    [
      initialized,
      initStarted,
      configName,
      userVersion,
      ignoreOverrides,
      exposureLoggingDisabled,
      initValuesTime,
    ],
  );
  return {
    isLoading: !initialized,
    config,
  };
}

export function useExperimentWithExposureLoggingDisabledImpl(
  experimentName: string,
  options?: GetExperimentOptions,
): ConfigResult {
  return useExperimentImpl(
    experimentName,
    options?.keepDeviceValue ?? false,
    options?.ignoreOverrides ?? false,
    true,
  );
}

export function useExperimentImpl(
  experimentName: string,
  keepDeviceValue: boolean,
  ignoreOverrides: boolean,
  exposureLoggingDisabled = false,
): ConfigResult {
  const { initialized, initStarted, userVersion, initValuesTime } = useContext(StatsigContext);
  const config = useMemo(
    () =>
      initStarted
        ? exposureLoggingDisabled
          ? Statsig.getExperimentWithExposureLoggingDisabled(
              experimentName,
              {
                keepDeviceValue,
                ignoreOverrides,
              },
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

export function useLayerWithExposureLoggingDisabledImpl(
  layerName: string,
  options?: GetLayerOptions,
): LayerResult {
  return useLayerImpl(
    layerName,
    options?.keepDeviceValue ?? false,
    true,
  );
}

export function useLayerImpl(
  layerName: string,
  keepDeviceValue: boolean,
  exposureLoggingDisabled = false,
): LayerResult {
  const { initialized, initStarted, userVersion, initValuesTime } = useContext(StatsigContext);
  const layer = useMemo(
    () =>
      initStarted
        ? exposureLoggingDisabled
          ? Statsig.getLayerWithExposureLoggingDisabled(layerName, { keepDeviceValue })
          : Statsig.getLayer(layerName, keepDeviceValue)
        : Layer._create(layerName, {}, '', {
            time: Date.now(),
            reason: EvaluationReason.Uninitialized,
          }),
    [
      initialized,
      initStarted,
      layerName,
      userVersion,
      keepDeviceValue,
      exposureLoggingDisabled,
      initValuesTime,
    ],
  );
  return {
    isLoading: !initialized,
    layer,
  };
}
