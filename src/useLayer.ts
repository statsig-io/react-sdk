import { useContext, useMemo } from 'react';
import { EvaluationReason, Layer } from 'statsig-js';
import Statsig from './Statsig';
import StatsigContext from './StatsigContext';

/**
 * Returns the initialization state of the SDK and a Layer value
 */
export type LayerResult = {
  isLoading: boolean;
  layer: Layer;
};

/**
 * A synchronous hook to check the value of an layer.  To ensure correctness, wait for SDK initialization before
 * calling.
 * @param layerName - the name of the layer that has been setup in the Statsig console.
 * @param keepDeviceValue - whether the value returned should be kept for the user on the device for the duration of the experiment
 * @param exposureLoggingDisabled - flag to disable exposure logging
 * @returns an object containing a isLoading flag and the Layer object itself
 */
export default function (
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
