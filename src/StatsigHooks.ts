import { useContext, useMemo } from 'react';
import type { DynamicConfig, Layer } from 'statsig-js';
import { StatsigContext } from './StatsigContext';
import type {
  CheckGateOptions,
  GetConfigOptions,
  GetExperimentOptions,
  GetLayerOptions,
} from './Statsig';
import { StatsigLazyLoader } from './StatsigLazyLoader';

/**
 * Returns the initialization state of the SDK and a gate value
 */
export type GateResult = {
  isLoading: boolean;
  value: boolean | null;
};

export function useGateImpl(
  gateName: string,
  options?: CheckGateOptions,
  exposureLoggingDisabled = false,
): GateResult {
  const { initialized, userVersion, initStarted } = useContext(StatsigContext);

  const gate = useMemo(() => {
    if (!StatsigLazyLoader.moduleLoaded) {
      return null;
    }

    const { Statsig } = StatsigLazyLoader.getStatsigAPI();

    return initStarted
      ? exposureLoggingDisabled
        ? Statsig.checkGateWithExposureLoggingDisabled(gateName, options)
        : Statsig.checkGate(gateName, options?.ignoreOverrides)
      : false;
  }, [
    initialized,
    initStarted,
    gateName,
    userVersion,
    options,
    exposureLoggingDisabled,
  ]);
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
  config: DynamicConfig | null;
};

export function useConfigImpl(
  configName: string,
  options?: GetConfigOptions,
  exposureLoggingDisabled = false,
): ConfigResult {
  const { initialized, initStarted, userVersion } = useContext(StatsigContext);

  const config = useMemo(() => {
    if (!StatsigLazyLoader.moduleLoaded) {
      return null;
    }

    const { Statsig } = StatsigLazyLoader.getStatsigAPI();
    const { EvaluationReason, DynamicConfig } =
      StatsigLazyLoader.getStatsigJSAPI();

    return initStarted
      ? exposureLoggingDisabled
        ? Statsig.getConfigWithExposureLoggingDisabled(configName, options)
        : Statsig.getConfig(configName, options?.ignoreOverrides)
      : new DynamicConfig(configName, {}, '', {
          time: Date.now(),
          reason: EvaluationReason.Uninitialized,
        });
  }, [
    initialized,
    initStarted,
    configName,
    userVersion,
    options,
    exposureLoggingDisabled,
    StatsigLazyLoader.moduleLoaded,
  ]);

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
  const { initialized, initStarted, userVersion } = useContext(StatsigContext);

  const config = useMemo(() => {
    if (!StatsigLazyLoader.moduleLoaded) {
      return null;
    }

    const { Statsig } = StatsigLazyLoader.getStatsigAPI();
    const { EvaluationReason, DynamicConfig } =
      StatsigLazyLoader.getStatsigJSAPI();

    return initStarted
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
        });
  }, [
    initialized,
    initStarted,
    experimentName,
    userVersion,
    options,
    exposureLoggingDisabled,
    StatsigLazyLoader.moduleLoaded,
  ]);
  return {
    isLoading: !initialized,
    config,
  };
}

/**
 * Returns the value of the experiment alongside isLoading flag
 */
export type ValueResult<TValue> = {
  isLoading: boolean;
  value: TValue;
};

export function useExperimentValueImpl<TValue>(
  experimentName: string,
  key: string,
  defaultValue: TValue,
  options?: GetExperimentOptions,
  exposureLoggingDisabled = false,
): ValueResult<TValue> {
  const { initialized, initStarted, userVersion } = useContext(StatsigContext);

  const value = useMemo(() => {
    if (!StatsigLazyLoader.moduleLoaded) {
      return defaultValue;
    }

    const { Statsig } = StatsigLazyLoader.getStatsigAPI();
    const { EvaluationReason, DynamicConfig } =
      StatsigLazyLoader.getStatsigJSAPI();

    const config = initStarted
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
        });
    return config.get(key, defaultValue);
  }, [
    initialized,
    initStarted,
    experimentName,
    userVersion,
    options,
    exposureLoggingDisabled,
    StatsigLazyLoader.moduleLoaded,
  ]);

  return {
    isLoading: !initialized,
    value,
  };
}

/**
 * Returns the initialization state of the SDK and a Layer value
 */
export type LayerResult = {
  isLoading: boolean;
  layer: Layer | null;
};

export function useLayerImpl(
  layerName: string,
  options?: GetLayerOptions,
  exposureLoggingDisabled = false,
): LayerResult {
  const { initialized, initStarted, userVersion } = useContext(StatsigContext);

  const layer = useMemo(() => {
    if (!StatsigLazyLoader.moduleLoaded) {
      return null;
    }

    const { Statsig } = StatsigLazyLoader.getStatsigAPI();
    const { EvaluationReason, Layer } = StatsigLazyLoader.getStatsigJSAPI();

    return initStarted
      ? exposureLoggingDisabled
        ? Statsig.getLayerWithExposureLoggingDisabled(layerName, options)
        : Statsig.getLayer(layerName, options?.keepDeviceValue)
      : Layer._create(layerName, {}, '', {
          time: Date.now(),
          reason: EvaluationReason.Uninitialized,
        });
  }, [
    initialized,
    initStarted,
    layerName,
    userVersion,
    options,
    exposureLoggingDisabled,
    StatsigLazyLoader.moduleLoaded,
  ]);
  return {
    isLoading: !initialized,
    layer,
  };
}
