import { GetLayerOptions } from './Statsig';
import { LayerResult, useLayerWithExposureLoggingDisabledImpl } from './StatsigHooks';

/**
 * A synchronous hook to check the value of an layer without exposure logging.
 * To ensure correctness, wait for SDK initialization before calling.
 * @param layerName - the name of the layer that has been setup in the Statsig console.
 * @param options - Custom options for the API
 *
 * keepDeviceValue - whether the value returned should be kept for the user on the device for the duration of the experiment
 *
 * exposureLoggingDisabled - flag to disable exposure logging
 *
 * @returns an object containing a isLoading flag and the Layer object itself
 */
export default function (
  layerName: string,
  options?: GetLayerOptions,
): LayerResult {
  return useLayerWithExposureLoggingDisabledImpl(layerName, options);
}
