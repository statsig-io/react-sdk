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
import useConfig from './useConfig';
import useExperiment from './useExperiment';
import useGate from './useGate';
import useLayer from './useLayer';
import usePrefetchUsers from './usePrefetchUsers';
import useStatsigLogEffect from './useStatsigLogEffect';
import StatsigSynchronousProvider from './StatsigSynchronousProvider';
import { StatsigOptions } from './StatsigOptions';
import { ConfigResult, LayerResult, GateResult } from './StatsigHooks';
import useConfigWithOptions from './useConfigWithOptions';
import useGateWithOptions from './useGateWithOptions';
import useExperimentWithOptions from './useExperimentWithOptions';
import useLayerWithOptions from './useLayerWithOptions';

export {
  Statsig,
  StatsigContext,
  StatsigProvider,
  useConfig,
  useConfigWithOptions,
  useExperiment,
  useExperimentWithOptions,
  useLayer,
  useLayerWithOptions,
  usePrefetchUsers,
  useGate,
  useGateWithOptions,
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
