import statsig from 'statsig-js';
export default {
  initialize(
    _sdkKey: string,
    _user?: statsig.StatsigUser | null,
    _options?: statsig.StatsigOptions | null,
  ): Promise<void> {
    return new Promise(() => {});
  },
  checkGate(_gateName: string): boolean {
    return false;
  },
  getConfig(configName: string): statsig.DynamicConfig {
    return new statsig.DynamicConfig(configName, {}, '');
  },
  logEvent(
    _eventName: string,
    _value?: string | number | null,
    _metadata?: object,
  ) {
    // noop
  },
  shutdown() {
    // noop
  },
  isReady(): boolean {
    return false;
  },
  updateUser(_user: statsig.StatsigUser): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      resolve(false);
    });
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
    //noop
  },

  DynamicConfig: statsig.DynamicConfig,
};
