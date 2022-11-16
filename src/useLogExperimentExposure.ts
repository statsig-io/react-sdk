import { useContext } from 'react';
import StatsigContext from './StatsigContext';
import Statsig from './Statsig';

type LogExperimentExposureResult = {
  isLoading: boolean;
};

/**
 * A synchronous hook to log expsoure of an experiment. 
 * To ensure correctness, wait for SDK initialization before calling.
 * @param experimentName - the name of the experiment to check
 * @param keepDeviceValue - whether the value returned should be kept for the user on the device for the duration of the experiment
 */
export default function (
  experimentName: string,
  keepDeviceValue: boolean,
): LogExperimentExposureResult {
  const { initialized, initStarted } = useContext(StatsigContext);

  if (initStarted) {
    Statsig.logExperimentExposure(experimentName, keepDeviceValue)
  }

  return {
    isLoading: !initialized,
  };
}
