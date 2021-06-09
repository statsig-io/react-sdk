import { useContext } from 'react';
import statsig from 'statsig-js';
import DynamicConfig from 'statsig-js';
import StatsigContext from './StatsigContext';

export type ConfigResult = {
  isLoading: boolean;
  dynamicConfig: statsig.DynamicConfig | null;
};

export default function (configName: string): ConfigResult {
  const { initialized, statsig } = useContext(StatsigContext);

  return {
    isLoading: !initialized,
    dynamicConfig: statsig.getConfig(configName),
  };
}
