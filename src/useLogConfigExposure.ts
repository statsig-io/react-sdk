import { useContext } from 'react';
import StatsigContext from './StatsigContext';
import Statsig from './Statsig';

type LogConfigExposureResult = {
  isLoading: boolean;
};

/**
 * A synchronous hook to log expsoure of a Dynamic Config. 
 * To ensure correctness, wait for SDK initialization before calling.
 * @param configName - the name of the DynamicConfig to check
 */
export default function (
  configName: string,
): LogConfigExposureResult {
  const { initialized, initStarted } = useContext(StatsigContext);

  if (initStarted) {
    Statsig.logConfigExposure(configName)
  }

  return {
    isLoading: !initialized,
  };
}
