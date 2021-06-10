import { useContext } from 'react';
import StatsigContext from './StatsigContext';
import { ConfigResult } from './useConfig';

export default async function (configName: string): Promise<ConfigResult> {
  const { statsigPromise, statsig } = useContext(StatsigContext);
  statsigPromise && (await statsigPromise);
  return {
    isLoading: false,
    dynamicConfig: statsig.getConfig(configName),
  };
}
