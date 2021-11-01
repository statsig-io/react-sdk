import StatsigContext from './StatsigContext';
import StatsigProvider from './StatsigProvider';
import useConfig from './useConfig';
import useExperiment from './useExperiment';
import useGate from './useGate';
import type { ConfigResult } from './useConfig';
import type { GateResult } from './useGate';
import useStatsigLogEffect from './useStatsigLogEffect';

import type {
  StatsigUser,
  StatsigOptions,
  StatsigEnvironment,
} from 'statsig-js';
import Statsig from 'statsig-js';

export {
  Statsig,
  StatsigContext,
  StatsigProvider,
  useConfig,
  useExperiment,
  useGate,
  useStatsigLogEffect,
};

export type {
  ConfigResult,
  GateResult,
  StatsigUser,
  StatsigOptions,
  StatsigEnvironment,
};
