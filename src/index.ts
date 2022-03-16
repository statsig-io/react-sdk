import type {
  AppState,
  AppStateEvent,
  AppStateStatus,
  StatsigEnvironment,
  StatsigOptions,
  StatsigOverrides,
  StatsigUser,
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
import useStatsigLogEffect from './useStatsigLogEffect';

export {
  Statsig,
  StatsigContext,
  StatsigProvider,
  useConfig,
  useExperiment,
  useLayer,
  useGate,
  useStatsigLogEffect,
  DynamicConfig,
  staticImplements,
  StatsigStatic,
  Layer,
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
