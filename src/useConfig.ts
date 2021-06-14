import { useContext } from 'react';
import statsig from 'statsig-js';
import StatsigContext from './StatsigContext';

export type ConfigResult = {
  isLoading: boolean;
  config: statsig.DynamicConfig;
};

export default function (configName: string): ConfigResult {
  const { initialized, statsig } = useContext(StatsigContext);

  return {
    isLoading: !initialized,
    config: initialized
      ? statsig.getConfig(configName)
      : new statsig.DynamicConfig(configName, {}, ''),
  };
}
