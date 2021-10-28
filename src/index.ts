import StatsigContext from './StatsigContext';
import StatsigProvider from './StatsigProvider';
import useConfig from './useConfig';
import useExperiment from './useExperiment';
import useGate from './useGate';
import type { ConfigResult } from './useConfig';
import type { GateResult } from './useGate';

import type {
  StatsigUser,
  StatsigOptions,
  StatsigEnvironment,
} from 'statsig-js';

export { StatsigContext, StatsigProvider, useConfig, useExperiment, useGate };

export type {
  ConfigResult,
  GateResult,
  StatsigUser,
  StatsigOptions,
  StatsigEnvironment,
};
