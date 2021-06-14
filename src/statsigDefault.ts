import statsig from 'statsig-js';
export default {
  initialize(
    _sdkKey: string,
    _user?: statsig.StatsigUser | null,
    _options?: statsig.StatsigOptions | null,
  ): Promise<void> {
    throw 'You must wrap this component in a StatsigProvider in order to call Statsig SDK functions';
  },
  checkGate(_gateName: string): boolean {
    throw 'You must wrap this component in a StatsigProvider in order to call Statsig SDK functions';
  },
  getConfig(configName: string): statsig.DynamicConfig {
    throw 'You must wrap this component in a StatsigProvider in order to call Statsig SDK functions';
  },
  logEvent(
    _eventName: string,
    _value?: string | number | null,
    _metadata?: object,
  ) {
    throw 'You must wrap this component in a StatsigProvider in order to call Statsig SDK functions';
  },
  shutdown() {
    throw 'You must wrap this component in a StatsigProvider in order to call Statsig SDK functions';
  },
  isReady(): boolean {
    throw 'You must wrap this component in a StatsigProvider in order to call Statsig SDK functions';
  },
  updateUser(_user: statsig.StatsigUser): Promise<boolean> {
    throw 'You must wrap this component in a StatsigProvider in order to call Statsig SDK functions';
  },
  _setReactNativeDependencies(
    _sdkPackageInfo: statsig._SDKPackageInfo,
    _asyncStorage: object | null,
    _appState: object | null,
    _nativeModules: object | null,
    _platform: object | null,
    _rnDevice: object | null,
    _constants: object | null,
    _expoDevice: object | null,
  ) {
    throw 'You must wrap this component in a StatsigProvider in order to call Statsig SDK functions';
  },

  DynamicConfig: statsig.DynamicConfig,
};
