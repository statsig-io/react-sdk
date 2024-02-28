import type {
  StatsigUser,
  StatsigEnvironment,
  StatsigOverrides,
  UUID,
  CheckGateOptions as GetFeatureGateOptions,
} from 'statsig-js';
import { DynamicConfig, Layer, FeatureGate } from 'statsig-js';
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
import { ConfigResult, LayerResult, GateResult, FeatureGateResult } from './StatsigHooks';
import useConfigWithExposureLoggingDisabled from './useConfigWithExposureLoggingDisabled';
import useGateWithExposureLoggingDisabled from './useGateWithExposureLoggingDisabled';
import useExperimentWithExposureLoggingDisabled from './useExperimentWithExposureLoggingDisabled';
import useLayerWithExposureLoggingDisabled from './useLayerWithExposureLoggingDisabled';
import useUpdateUser from './useUpdateUser';
import useFeatureGate from './useFeatureGate';

export {
  Statsig,
  StatsigContext,
  StatsigProvider,
  useConfig,
  useConfigWithExposureLoggingDisabled,
  useExperiment,
  useExperimentWithExposureLoggingDisabled,
  useLayer,
  useLayerWithExposureLoggingDisabled,
  usePrefetchUsers,
  useGate,
  useGateWithExposureLoggingDisabled,
  useStatsigLogEffect,
  useUpdateUser,
  useFeatureGate,
  DynamicConfig,
  FeatureGate,
  staticImplements,
  StatsigStatic,
  Layer,
  StatsigSynchronousProvider,
};
export type {
  ConfigResult,
  LayerResult,
  GateResult,
  FeatureGateResult,
  StatsigUser,
  StatsigOptions,
  StatsigEnvironment,
  StatsigOverrides,
  UUID,
  GetFeatureGateOptions,
};
