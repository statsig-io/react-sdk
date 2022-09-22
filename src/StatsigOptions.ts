import { InitCompletionCallback, StatsigEnvironment, StatsigUser } from 'statsig-js';

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
};
