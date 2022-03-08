import {
  DynamicConfig,
  StatsigOptions,
  StatsigOverrides,
  StatsigUser,
  UUID,
  _SDKPackageInfo,
} from 'statsig-js';

export interface StatsigStatic {
  initialize(
    sdkKey: string,
    user?: StatsigUser | null,
    options?: StatsigOptions | null,
  ): Promise<void>;

  checkGate(gateName: string, ignoreOverrides: boolean): boolean;

  getConfig(configName: string, ignoreOverrides: boolean): DynamicConfig;

  getExperiment(
    experimentName: string,
    keepDeviceValue: boolean,
    ignoreOverrides: boolean,
  ): DynamicConfig;

  logEvent(
    eventName: string,
    value: string | number | null,
    metadata: Record<string, string> | null,
  ): void;

  updateUser(user: StatsigUser | null): Promise<boolean>;

  shutdown(): void;

  overrideGate(gateName: string, value: boolean): void;

  overrideConfig(configName: string, value: object): void;

  removeGateOverride(name?: string): void;

  removeConfigOverride(name?: string): void;

  getAllOverrides(): StatsigOverrides;

  getStableID(): string;

  initializeCalled(): boolean;
}

/* class decorator */
export function staticImplements<T>() {
  return <U extends T>(constructor: U) => {
    constructor;
  };
}
