import {
  DynamicConfig,
  FeatureGate,
  GateEvaluationCallback,
  InitCompletionCallback,
  Layer,
  StatsigEnvironment,
  StatsigUser,
  UpdateUserCompletionCallback,
} from 'statsig-js';

type EvaluationCallbackParams =
  | { type: 'gate'; gate: FeatureGate }
  | { type: 'config' | 'experiment'; config: DynamicConfig }
  | { type: 'layer'; layer: Layer };

type EvaluationCallback = (args: EvaluationCallbackParams) => void;

// The options for the react SDK and JS SDK have diverged
// Because initializeValues is not compatible with the StatsigProvider
export type StatsigOptions = {
  api?: string;
  disableCurrentPageLogging?: boolean;
  environment?: StatsigEnvironment;
  loggingIntervalMillis?: number;
  loggingBufferMaxSize?: number;
  disableNetworkKeepalive?: boolean;
  overrideStableID?: string;
  localMode?: boolean;
  initTimeoutMs?: number;
  disableErrorLogging?: boolean;
  disableAutoMetricsLogging?: boolean;
  eventLoggingApi?: string;
  prefetchUsers?: StatsigUser[];
  initCompletionCallback?: InitCompletionCallback | null;
  updateUserCompletionCallback?: UpdateUserCompletionCallback | null;
  gateEvaluationCallback?: GateEvaluationCallback;
  disableDiagnosticsLogging?: boolean;
  disableLocalStorage?: boolean;
  disableLocalOverrides?: boolean;
  fetchMode?: 'cache-or-network' | 'network-only';
  disableAllLogging?: boolean;
  evaluationCallback?: EvaluationCallback;
};
