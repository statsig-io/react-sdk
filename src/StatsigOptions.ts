import {
  InitCompletionCallback,
  UpdateUserCompletionCallback,
  StatsigEnvironment,
  StatsigUser,
} from 'statsig-js';

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
  disableDiagnosticsLogging?: boolean;
  disableLocalStorage?: boolean;
  disableLocalOverrides?: boolean;
  fetchMode?: 'cache-or-network' | 'network-only';
  disableAllLogging?: boolean;
};
