import StatsigContext from './StatsigContext';
import StatsigProvider from './StatsigProvider';
import useConfig from './useConfig';
import useExperiment from './useExperiment';
import useGate from './useGate';
import type { ConfigResult } from './useConfig';
import type { GateResult } from './useGate';
import useStatsigLogEffect from './useStatsigLogEffect';
import { DynamicConfig } from 'statsig-js';

import type {
  StatsigUser,
  StatsigOptions,
  StatsigEnvironment,
  StatsigOverrides,
} from 'statsig-js';
import Statsig from './Statsig';

export {
  Statsig,
  StatsigContext,
  StatsigProvider,
  useConfig,
  useExperiment,
  useGate,
  useStatsigLogEffect,
  DynamicConfig,
};

export type {
  ConfigResult,
  GateResult,
  StatsigUser,
  StatsigOptions,
  StatsigEnvironment,
  StatsigOverrides,
};
