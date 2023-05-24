import { LayerResult, useLayerImpl } from './StatsigHooks';

/**
 * A synchronous hook to check the value of an layer.  To ensure correctness, wait for SDK initialization before
 * calling.
 * @param layerName - the name of the layer that has been setup in the Statsig console.
 * @param keepDeviceValue - whether the value returned should be kept for the user on the device for the duration of the experiment
 * @returns an object containing a isLoading flag and the Layer object itself
 */
export default function (
  layerName: string,
  keepDeviceValue = false,
): LayerResult {
  return useLayerImpl(layerName, {
    keepDeviceValue,
  });
}
