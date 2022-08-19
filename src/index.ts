import type {
  AppState,
  AppStateEvent,
  AppStateStatus,
  StatsigUser,
  StatsigEnvironment,
  StatsigOverrides,
  UUID,
} from 'statsig-js';
import { DynamicConfig, Layer } from 'statsig-js';
import Statsig from './Statsig';
import StatsigContext from './StatsigContext';
import StatsigProvider from './StatsigProvider';
import { staticImplements, StatsigStatic } from './StatsigStatic';
import type { ConfigResult } from './useConfig';
import type { LayerResult } from './useLayer';
import useConfig from './useConfig';
import useExperiment from './useExperiment';
import type { GateResult } from './useGate';
import useGate from './useGate';
import useLayer from './useLayer';
import usePrefetchUsers from './usePrefetchUsers';
import useStatsigLogEffect from './useStatsigLogEffect';
import StatsigSynchronousProvider from './StatsigSynchronousProvider';
import { StatsigOptions } from './StatsigOptions';

export {
  Statsig,
  StatsigContext,
  StatsigProvider,
  useConfig,
  useExperiment,
  useLayer,
  usePrefetchUsers,
  useGate,
  useStatsigLogEffect,
  DynamicConfig,
  staticImplements,
  StatsigStatic,
  Layer,
  StatsigSynchronousProvider,
};
export type {
  ConfigResult,
  LayerResult,
  GateResult,
  StatsigUser,
  StatsigOptions,
  StatsigEnvironment,
  StatsigOverrides,
  UUID,
  AppState,
  AppStateStatus,
  AppStateEvent,
};
