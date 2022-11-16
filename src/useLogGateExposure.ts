import { useContext } from 'react';
import StatsigContext from './StatsigContext';
import Statsig from './Statsig';

type LogGateExposureResult = {
  isLoading: boolean;
};

/**
 * A synchronous hook to log expsoure of a gate. 
 * To ensure correctness, wait for SDK initialization before calling.
 * @param gateName - the name of the gate to check
 */
export default function (
  gateName: string,
): LogGateExposureResult {
  const { initialized, initStarted } = useContext(StatsigContext);

  if (initStarted) {
    Statsig.logGateExpsoure(gateName)
  }

  return {
    isLoading: !initialized,
  };
}
