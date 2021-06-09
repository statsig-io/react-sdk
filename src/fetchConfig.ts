import { useContext } from 'react';
import StatsigContext from './StatsigContext';
import { ConfigResult } from './useConfig';

export default async function (configName: string): Promise<ConfigResult> {
  const { updateContext, statsig } = useContext(StatsigContext);
  await updateContext;
  return {
    isLoading: false,
    dynamicConfig: statsig.getConfig(configName),
  };
}
