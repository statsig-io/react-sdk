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
): GateResult {
  const { ignoreOverrides, exposureLoggingDisabled } = options;
  const { initialized, userVersion, initStarted } = useContext(StatsigContext);

  const gate = useMemo(
    () =>
      initStarted
        ? Statsig.checkGateWithOptions(gateName, {
            ignoreOverrides,
            exposureLoggingDisabled,
          })
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
  options: GetConfigOptions,
): ConfigResult {
  const { ignoreOverrides, exposureLoggingDisabled } = options;
  const { initialized, initStarted, userVersion } = useContext(StatsigContext);
  const config = useMemo(
    () =>
      initStarted
        ? Statsig.getConfigWithOptions(configName, {
            ignoreOverrides,
            exposureLoggingDisabled,
          })
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
  options: GetExperimentOptions,
): ConfigResult {
  const { keepDeviceValue, ignoreOverrides, exposureLoggingDisabled } = options;
  const { initialized, initStarted, userVersion } = useContext(StatsigContext);
  const config = useMemo(
    () =>
      initStarted
        ? Statsig.getExperimentWithOptions(experimentName, {
            keepDeviceValue,
            ignoreOverrides,
            exposureLoggingDisabled,
          })
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
  options: GetLayerOptions,
): LayerResult {
  const { keepDeviceValue, exposureLoggingDisabled } = options;
  const { initialized, initStarted, userVersion } = useContext(StatsigContext);
  const layer = useMemo(
    () =>
      initStarted
        ? Statsig.getLayerWithOptions(layerName, {
            keepDeviceValue,
            exposureLoggingDisabled,
          })
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
