import type {
  AsyncStorage,
  DeviceInfo,
  ExpoConstants,
  ExpoDevice,
  NativeModules,
  Platform,
  UUID,
  CheckGateOptions as GetGateOptions,
} from 'statsig-js';
import StatsigJS, {
  DynamicConfig,
  EvaluationDetails,
  EvaluationReason,
  FeatureGate,
  Layer,
  StatsigAsyncStorage,
  StatsigClient,
  StatsigOptions,
  StatsigOverrides,
  StatsigUser,
  _SDKPackageInfo,
} from 'statsig-js';
import { StatsigStatic, staticImplements } from './StatsigStatic';

import { version as SDKVersion } from './SDKVersion';

declare global {
  interface Window {
    __STATSIG_SDK__: Statsig;
    __STATSIG_JS_SDK__: StatsigJS;
    __STATSIG_RERENDER_OVERRIDE__: () => void;
  }
}

export type CheckGateOptions = {
  ignoreOverrides?: boolean;
};
export { CheckGateOptions as GetFeatureGateOptions } from 'statsig-js';
export type GetConfigOptions = {
  ignoreOverrides?: boolean;
};
export type GetExperimentOptions = {
  keepDeviceValue?: boolean;
  ignoreOverrides?: boolean;
};
export type GetLayerOptions = {
  keepDeviceValue?: boolean;
};

export type StatsigReactContextUpdater = () => void;

@staticImplements<StatsigStatic>()
export default class Statsig {
  private static instance: StatsigClient | undefined;

  private static sdkPackageInfo?: _SDKPackageInfo;
  // RN static dependencies
  private static appState?: unknown;
  private static nativeModules?: NativeModules;
  private static platform?: Platform;
  private static deviceInfo?: DeviceInfo;
  private static onCacheLoadedCallback?: () => void;
  // RN Expo static dependencies
  private static expoConstants?: ExpoConstants;
  private static expoDevice?: ExpoDevice;
  private static uuid?: UUID;
  private static reactContextUpdater: StatsigReactContextUpdater | null = null;

  public static async initialize(
    sdkKey: string,
    user?: StatsigUser | null,
    options?: StatsigOptions | null,
  ): Promise<void> {
    try {
      if (!Statsig.instance) {
        Statsig.instance = new StatsigClient(sdkKey, user, options);
        Statsig.instance.setAppState(this.appState);
        Statsig.instance.setSDKPackageInfo(this.sdkPackageInfo);
        Statsig.instance.setNativeModules(this.nativeModules);
        Statsig.instance.setPlatform(this.platform);
        Statsig.instance.setRNDeviceInfo(this.deviceInfo);
        Statsig.instance.setExpoConstants(this.expoConstants);
        Statsig.instance.setExpoDevice(this.expoDevice);
        Statsig.instance.setOnCacheLoadedReactCallback(
          this.onCacheLoadedCallback,
        );
      }
      return Statsig.instance.initializeAsync();
    } catch (e) {
      if (Statsig.canThrow()) {
        throw e;
      }
    }
    return Promise.resolve();
  }

  public static bootstrap(
    sdkKey: string,
    initializeValues: Record<string, unknown>,
    user?: StatsigUser | null,
    options?: StatsigOptions | null,
  ): void {
    if (Statsig.instance != null) {
      Statsig.setInitializeValues(initializeValues);
      return;
    }
    if (options == null) {
      options = {};
    }
    options.initializeValues = initializeValues;
    Statsig.instance = new StatsigClient(sdkKey, user, options);
    Statsig.instance.setSDKPackageInfo({
      sdkType: 'react-client',
      sdkVersion: SDKVersion,
    });
  }

  public static flushEvents() {
    return this.capture(() => Statsig.getClientX().flushEvents(), undefined);
  }

  public static reenableAllLogging() {
    return this.capture(
      () => Statsig.getClientX().reenableAllLogging(),
      undefined,
    );
  }

  public static async prefetchUsers(users: StatsigUser[]): Promise<void> {
    return this.capture(
      () => Statsig.getClientX().prefetchUsers(users),
      Promise.resolve(),
    );
  }

  public static setInitializeValues(
    initializeValues: Record<string, unknown>,
  ): void {
    this.capture(
      () => Statsig.getClientX().setInitializeValues(initializeValues),
      undefined,
    );
  }

  public static getCurrentUser(): StatsigUser | null {
    return this.capture(() => Statsig.getClientX().getCurrentUser(), null);
  }

  public static checkGate(gateName: string, ignoreOverrides = false): boolean {
    return this.capture(
      () => Statsig.getClientX().checkGate(gateName, ignoreOverrides),
      false,
    );
  }

  public static getFeatureGate(gateName: string, options?: GetGateOptions) {
    return this.capture(
      () => Statsig.getClientX().getFeatureGate(gateName, options),
      new FeatureGate(gateName, false, '', {
        time: Date.now(),
        reason: EvaluationReason.Uninitialized,
      }),
    );
  }

  public static checkGateWithExposureLoggingDisabled(
    gateName: string,
    options?: CheckGateOptions,
  ): boolean {
    return this.capture(
      () =>
        Statsig.getClientX().checkGateWithExposureLoggingDisabled(
          gateName,
          options?.ignoreOverrides,
        ),
      false,
    );
  }

  public static manuallyLogGateExposure(gateName: string): void {
    this.capture(
      () => Statsig.getClientX().logGateExposure(gateName),
      undefined,
    );
  }

  public static getConfig(
    configName: string,
    ignoreOverrides = false,
  ): DynamicConfig {
    return this.capture(
      () => Statsig.getClientX().getConfig(configName, ignoreOverrides),
      new DynamicConfig(configName, {}, '', {
        time: Date.now(),
        reason: EvaluationReason.Uninitialized,
      }),
    );
  }

  public static getConfigWithExposureLoggingDisabled(
    configName: string,
    options?: GetConfigOptions,
  ): DynamicConfig {
    return this.capture(
      () =>
        Statsig.getClientX().getConfigWithExposureLoggingDisabled(
          configName,
          options?.ignoreOverrides,
        ),
      new DynamicConfig(configName, {}, '', {
        time: Date.now(),
        reason: EvaluationReason.Uninitialized,
      }),
    );
  }

  public static manuallyLogConfigExposure(configName: string): void {
    this.capture(
      () => Statsig.getClientX().logConfigExposure(configName),
      undefined,
    );
  }

  public static getExperiment(
    experimentName: string,
    keepDeviceValue = false,
    ignoreOverrides = false,
  ): DynamicConfig {
    return this.capture(
      () =>
        Statsig.getClientX().getExperiment(
          experimentName,
          keepDeviceValue,
          ignoreOverrides,
        ),
      new DynamicConfig(experimentName, {}, '', {
        time: Date.now(),
        reason: EvaluationReason.Uninitialized,
      }),
    );
  }

  public static getExperimentWithExposureLoggingDisabled(
    experimentName: string,
    options?: GetExperimentOptions,
  ): DynamicConfig {
    return this.capture(
      () =>
        Statsig.getClientX().getExperimentWithExposureLoggingDisabled(
          experimentName,
          options?.keepDeviceValue,
          options?.ignoreOverrides,
        ),
      new DynamicConfig(experimentName, {}, '', {
        time: Date.now(),
        reason: EvaluationReason.Uninitialized,
      }),
    );
  }

  public static manuallyLogExperimentExposure(
    experimentName: string,
    keepDeviceValue: boolean,
  ): void {
    this.capture(
      () =>
        Statsig.getClientX().logExperimentExposure(
          experimentName,
          keepDeviceValue,
        ),
      undefined,
    );
  }

  public static getLayer(layerName: string, keepDeviceValue = false): Layer {
    return this.capture(
      () => Statsig.getClientX().getLayer(layerName, keepDeviceValue),
      Layer._create(layerName, {}, '', {
        time: Date.now(),
        reason: EvaluationReason.Uninitialized,
      }),
    );
  }

  public static getLayerWithExposureLoggingDisabled(
    layerName: string,
    options?: GetLayerOptions,
  ): Layer {
    return this.capture(
      () =>
        Statsig.getClientX().getLayerWithExposureLoggingDisabled(
          layerName,
          options?.keepDeviceValue,
        ),
      Layer._create(layerName, {}, '', {
        time: Date.now(),
        reason: EvaluationReason.Uninitialized,
      }),
    );
  }

  public static manuallyLogLayerParameterExposure(
    layerName: string,
    parameterName: string,
    keepDeviceValue = false,
  ): void {
    this.capture(
      () =>
        Statsig.getClientX().logLayerParameterExposure(
          layerName,
          parameterName,
          keepDeviceValue,
        ),
      undefined,
    );
  }

  public static logEvent(
    eventName: string,
    value: string | number | null = null,
    metadata: Record<string, string> | null = null,
  ): void {
    this.capture(
      () => Statsig.getClientX().logEvent(eventName, value, metadata),
      undefined,
    );
  }

  public static updateUser(user: StatsigUser | null): Promise<boolean> {
    return this.capture(
      () => Statsig.getClientX().updateUser(user),
      Promise.resolve(false),
    );
  }

  public static updateUserWithValues(
    user: StatsigUser | null,
    values: Record<string, unknown>,
  ): boolean {
    return this.capture(
      () => Statsig.getClientX().updateUserWithValues(user, values),
      false,
    );
  }

  public static shutdown() {
    this.capture(() => Statsig.getClientX().shutdown(), undefined);
    Statsig.instance = undefined;
  }

  /**
   * Overrides the given gate locally with the given value
   * @param gateName - name of the gate to override
   * @param value - value to assign to the gate
   */
  public static overrideGate(gateName: string, value: boolean): void {
    this.capture(() => {
      if (Statsig.getAllOverrides()['gates']?.[gateName] === value) {
        return;
      }
      Statsig.getClientX().overrideGate(gateName, value);
      Statsig.updateContext();
    }, undefined);
  }

  /**
   * Overrides the given config locally with the given value
   * @param configName - name of the config to override
   * @param value - value to assign to the config
   */
  public static overrideConfig(configName: string, value: object): void {
    this.capture(() => {
      if (Statsig.getAllOverrides()['configs']?.[configName] === value) {
        return;
      }
      Statsig.getClientX().overrideConfig(configName, value);
      Statsig.updateContext();
    }, undefined);
  }

  /**
   * Overrides the given layer locally with the given value
   * @param layerName - name of the layer to override
   * @param value - value to assign to the layer
   */
  public static overrideLayer(layerName: string, value: object): void {
    this.capture(() => {
      if (Statsig.getAllOverrides()['layers']?.[layerName] === value) {
        return;
      }
      Statsig.getClientX().overrideLayer(layerName, value);
      Statsig.updateContext();
    }, undefined);
  }

  /**
   * @param name the gate override to remove
   */
  public static removeGateOverride(name?: string): void {
    this.capture(() => {
      Statsig.getClientX().removeGateOverride(name);
      Statsig.updateContext();
    }, undefined);
  }

  /**
   * @param name the config override to remove
   */
  public static removeConfigOverride(name?: string): void {
    this.capture(() => {
      Statsig.getClientX().removeConfigOverride(name);
      Statsig.updateContext();
    }, undefined);
  }

  /**
   * @param name the config override to remove
   */
  public static removeLayerOverride(name?: string): void {
    this.capture(() => {
      Statsig.getClientX().removeLayerOverride(name);
      Statsig.updateContext();
    }, undefined);
  }

  /**
   * @returns The local gate and config overrides
   */
  public static getAllOverrides(): StatsigOverrides {
    return this.capture(() => Statsig.getClientX().getAllOverrides(), {
      gates: {},
      configs: {},
      layers: {},
    });
  }

  public static getEvaluationDetails(): EvaluationDetails {
    return (
      Statsig.instance?.getEvaluationDetails() ?? {
        reason: EvaluationReason.Uninitialized,
        time: 0,
      }
    );
  }

  /**
   * @returns The Statsig stable ID used for device level experiments
   */
  public static getStableID(): string {
    return this.capture(() => Statsig.getClientX().getStableID(), '');
  }

  public static initializeCalled(): boolean {
    return Statsig.instance != null && Statsig.instance.initializeCalled();
  }

  // All methods below are for the statsig react native SDK internal usage only!
  public static setAppState(appState?: unknown | null): void {
    if (appState != null) {
      Statsig.appState = appState;
    }
  }

  public static setSDKPackageInfo(sdkPackageInfo: _SDKPackageInfo) {
    Statsig.sdkPackageInfo = sdkPackageInfo;
  }

  public static setReactNativeUUID(uuid?: UUID | null): void {
    if (uuid != null) {
      StatsigClient.setReactNativeUUID(uuid);
    }
  }

  public static setAsyncStorage(asyncStorage?: AsyncStorage | null): void {
    if (asyncStorage != null) {
      StatsigAsyncStorage.asyncStorage = asyncStorage;
    }
  }

  public static setNativeModules(nativeModules?: NativeModules | null): void {
    if (nativeModules != null) {
      Statsig.nativeModules = nativeModules;
    }
  }

  public static setPlatform(platform?: Platform | null): void {
    if (platform != null) {
      Statsig.platform = platform;
    }
  }

  public static setRNDeviceInfo(deviceInfo?: DeviceInfo | null): void {
    if (deviceInfo != null) {
      Statsig.deviceInfo = deviceInfo;
    }
  }

  public static setExpoConstants(expoConstants?: ExpoConstants | null): void {
    if (expoConstants != null) {
      Statsig.expoConstants = expoConstants;
    }
  }

  public static setExpoDevice(expoDevice?: ExpoDevice | null): void {
    if (expoDevice != null) {
      Statsig.expoDevice = expoDevice;
    }
  }

  public static setReactContextUpdater(fn: (() => void) | null) {
    Statsig.reactContextUpdater = fn;
  }

  public static setOnCacheLoadedCallback(fn: () => void) {
    Statsig.onCacheLoadedCallback = fn;
  }

  private static getClientX(): StatsigClient {
    if (!Statsig.instance) {
      throw new Error('Call and wait for initialize() to finish first.');
    }
    return Statsig.instance;
  }

  private static capture<T>(task: () => T, recover: T): T {
    try {
      return task();
    } catch (e) {
      if (Statsig.canThrow()) {
        throw e;
      }
      return recover;
    }
  }

  // Exposed for RN sdks to override this class - an instance of this class
  // is undefined
  public constructor(
    sdkKey: string,
    user?: StatsigUser | null,
    options?: StatsigOptions | null,
  ) {
    if (Statsig.instance != null && Statsig.canThrow()) {
      throw new Error(
        'Cannot create another instance of the static Statsig class',
      );
    }
    Statsig.instance = new StatsigClient(sdkKey, user, options);
  }

  private static updateContext() {
    if (Statsig.reactContextUpdater != null) {
      Statsig.reactContextUpdater();
    }
  }

  private static canThrow() {
    return (
      typeof process === 'undefined' ||
      typeof process.env === 'undefined' ||
      process?.env?.REACT_APP_STATSIG_SDK_MODE !== 'silent'
    );
  }
}
