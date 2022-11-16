import { useContext } from 'react';
import StatsigContext from './StatsigContext';
import Statsig from './Statsig';

type LogLayerParameterExposureResult = {
  isLoading: boolean;
};

/**
 * A synchronous hook to log expsoure of a layer. 
 * To ensure correctness, wait for SDK initialization before calling.
 * @param layerName - the name of the layer that has been setup in the Statsig console.
 * @param parameterName - the name of the parameter within the layer
 * @param keepDeviceValue - whether the value returned should be kept for the user on the device for the duration of the experiment
 */
export default function (
  layerName: string,
  parameterName: string,
  keepDeviceValue: boolean,
): LogLayerParameterExposureResult {
  const { initialized, initStarted } = useContext(StatsigContext);

  if (initStarted) {
    Statsig.logLayerParameterExposure(layerName, parameterName, keepDeviceValue)
  }

  return {
    isLoading: !initialized,
  };
}
