import type {
  AppState,
  AsyncStorage,
  DeviceInfo,
  ExpoConstants,
  ExpoDevice,
  NativeModules,
  Platform,
  UUID,
  EvaluationDetails,
  StatsigOptions,
  StatsigOverrides,
  StatsigUser,
  _SDKPackageInfo,
} from 'statsig-js';
import StatsigJS, {
  StatsigClient,
  StatsigAsyncStorage,
  DynamicConfig,
  EvaluationReason,
  Layer,
} from 'statsig-js';
import { StatsigStatic, staticImplements } from './StatsigStatic';

import { version as SDKVersion } from './SDKVersion';

declare global {
  interface Window {
    __STATSIG_WN_SDK__: StatsigWN;
    __STATSIG_WN_JS_SDK__: StatsigJS;
    __STATSIG_WN_RERENDER_OVERRIDE__: () => void;
  }
}

export type CheckGateOptions = {
  ignoreOverrides?: boolean;
};
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

/**
 *
 */
@staticImplements<StatsigStatic>()
export class StatsigWN {
  private static instance: StatsigClient | undefined;

  private static sdkPackageInfo?: _SDKPackageInfo;
  // RN static dependencies
  private static appState?: AppState;
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
      if (!StatsigWN.instance) {
        StatsigWN.instance = new StatsigClient(sdkKey, user, options);
        StatsigWN.instance.setSDKPackageInfo(this.sdkPackageInfo);
        StatsigWN.instance.setAppState(this.appState);
        StatsigWN.instance.setNativeModules(this.nativeModules);
        StatsigWN.instance.setPlatform(this.platform);
        StatsigWN.instance.setRNDeviceInfo(this.deviceInfo);
        StatsigWN.instance.setExpoConstants(this.expoConstants);
        StatsigWN.instance.setExpoDevice(this.expoDevice);
        StatsigWN.instance.setOnCacheLoadedReactCallback(
          this.onCacheLoadedCallback,
        );
      }
      return StatsigWN.instance.initializeAsync();
    } catch (e) {
      if (StatsigWN.canThrow()) {
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
    if (StatsigWN.instance != null) {
      StatsigWN.setInitializeValues(initializeValues);
      return;
    }
    if (options == null) {
      options = {};
    }
    options.initializeValues = initializeValues;
    StatsigWN.instance = new StatsigClient(sdkKey, user, options);
    StatsigWN.instance.setSDKPackageInfo({
      sdkType: 'react-client',
      sdkVersion: SDKVersion,
    });
  }

  public static flushEvents() {
    return this.capture(() => StatsigWN.getClientX().flushEvents(), undefined);
  }

  public static reenableAllLogging() {
    return this.capture(
      () => StatsigWN.getClientX().reenableAllLogging(),
      undefined,
    );
  }

  public static async prefetchUsers(users: StatsigUser[]): Promise<void> {
    return this.capture(
      () => StatsigWN.getClientX().prefetchUsers(users),
      Promise.resolve(),
    );
  }

  public static setInitializeValues(
    initializeValues: Record<string, unknown>,
  ): void {
    this.capture(
      () => StatsigWN.getClientX().setInitializeValues(initializeValues),
      undefined,
    );
  }

  public static getCurrentUser(): StatsigUser | null {
    return this.capture(() => StatsigWN.getClientX().getCurrentUser(), null);
  }

  public static checkGate(gateName: string, ignoreOverrides = false): boolean {
    return this.capture(
      () => StatsigWN.getClientX().checkGate(gateName, ignoreOverrides),
      false,
    );
  }

  public static checkGateWithExposureLoggingDisabled(
    gateName: string,
    options?: CheckGateOptions,
  ): boolean {
    return this.capture(
      () =>
        StatsigWN.getClientX().checkGateWithExposureLoggingDisabled(
          gateName,
          options?.ignoreOverrides,
        ),
      false,
    );
  }

  public static manuallyLogGateExposure(gateName: string): void {
    this.capture(
      () => StatsigWN.getClientX().logGateExposure(gateName),
      undefined,
    );
  }

  public static getConfig(
    configName: string,
    ignoreOverrides = false,
  ): DynamicConfig {
    return this.capture(
      () => StatsigWN.getClientX().getConfig(configName, ignoreOverrides),
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
        StatsigWN.getClientX().getConfigWithExposureLoggingDisabled(
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
      () => StatsigWN.getClientX().logConfigExposure(configName),
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
        StatsigWN.getClientX().getExperiment(
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
        StatsigWN.getClientX().getExperimentWithExposureLoggingDisabled(
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
        StatsigWN.getClientX().logExperimentExposure(
          experimentName,
          keepDeviceValue,
        ),
      undefined,
    );
  }

  public static getLayer(layerName: string, keepDeviceValue = false): Layer {
    return this.capture(
      () => StatsigWN.getClientX().getLayer(layerName, keepDeviceValue),
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
        StatsigWN.getClientX().getLayerWithExposureLoggingDisabled(
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
        StatsigWN.getClientX().logLayerParameterExposure(
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
      () => StatsigWN.getClientX().logEvent(eventName, value, metadata),
      undefined,
    );
  }

  public static updateUser(user: StatsigUser | null): Promise<boolean> {
    return this.capture(
      () => StatsigWN.getClientX().updateUser(user),
      Promise.resolve(false),
    );
  }

  public static updateUserWithValues(
    user: StatsigUser | null,
    values: Record<string, unknown>,
  ): boolean {
    return this.capture(
      () => StatsigWN.getClientX().updateUserWithValues(user, values),
      false,
    );
  }

  public static shutdown() {
    this.capture(() => StatsigWN.getClientX().shutdown(), undefined);
    StatsigWN.instance = undefined;
  }

  /**
   * Overrides the given gate locally with the given value
   * @param gateName - name of the gate to override
   * @param value - value to assign to the gate
   */
  public static overrideGate(gateName: string, value: boolean): void {
    this.capture(() => {
      if (StatsigWN.getAllOverrides()['gates']?.[gateName] === value) {
        return;
      }
      StatsigWN.getClientX().overrideGate(gateName, value);
      StatsigWN.updateContext();
    }, undefined);
  }

  /**
   * Overrides the given config locally with the given value
   * @param configName - name of the config to override
   * @param value - value to assign to the config
   */
  public static overrideConfig(configName: string, value: object): void {
    this.capture(() => {
      if (StatsigWN.getAllOverrides()['configs']?.[configName] === value) {
        return;
      }
      StatsigWN.getClientX().overrideConfig(configName, value);
      StatsigWN.updateContext();
    }, undefined);
  }

  /**
   * Overrides the given layer locally with the given value
   * @param layerName - name of the layer to override
   * @param value - value to assign to the layer
   */
  public static overrideLayer(layerName: string, value: object): void {
    this.capture(() => {
      if (StatsigWN.getAllOverrides()['layers']?.[layerName] === value) {
        return;
      }
      StatsigWN.getClientX().overrideLayer(layerName, value);
      StatsigWN.updateContext();
    }, undefined);
  }

  /**
   * @param name the gate override to remove
   */
  public static removeGateOverride(name?: string): void {
    this.capture(() => {
      StatsigWN.getClientX().removeGateOverride(name);
      StatsigWN.updateContext();
    }, undefined);
  }

  /**
   * @param name the config override to remove
   */
  public static removeConfigOverride(name?: string): void {
    this.capture(() => {
      StatsigWN.getClientX().removeConfigOverride(name);
      StatsigWN.updateContext();
    }, undefined);
  }

  /**
   * @param name the config override to remove
   */
  public static removeLayerOverride(name?: string): void {
    this.capture(() => {
      StatsigWN.getClientX().removeLayerOverride(name);
      StatsigWN.updateContext();
    }, undefined);
  }

  /**
   * @returns The local gate and config overrides
   */
  public static getAllOverrides(): StatsigOverrides {
    return this.capture(() => StatsigWN.getClientX().getAllOverrides(), {
      gates: {},
      configs: {},
      layers: {},
    });
  }

  public static getEvaluationDetails(): EvaluationDetails {
    return (
      StatsigWN.instance?.getEvaluationDetails() ?? {
        reason: EvaluationReason.Uninitialized,
        time: 0,
      }
    );
  }

  /**
   * @returns The StatsigWN stable ID used for device level experiments
   */
  public static getStableID(): string {
    return this.capture(() => StatsigWN.getClientX().getStableID(), '');
  }

  public static initializeCalled(): boolean {
    return StatsigWN.instance != null && StatsigWN.instance.initializeCalled();
  }

  // All methods below are for the statsig react native SDK internal usage only!
  public static setSDKPackageInfo(sdkPackageInfo: _SDKPackageInfo) {
    StatsigWN.sdkPackageInfo = sdkPackageInfo;
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

  public static setAppState(appState?: AppState | null): void {
    if (appState != null) {
      StatsigWN.appState = appState;
    }
  }

  public static setNativeModules(nativeModules?: NativeModules | null): void {
    if (nativeModules != null) {
      StatsigWN.nativeModules = nativeModules;
    }
  }

  public static setPlatform(platform?: Platform | null): void {
    if (platform != null) {
      StatsigWN.platform = platform;
    }
  }

  public static setRNDeviceInfo(deviceInfo?: DeviceInfo | null): void {
    if (deviceInfo != null) {
      StatsigWN.deviceInfo = deviceInfo;
    }
  }

  public static setExpoConstants(expoConstants?: ExpoConstants | null): void {
    if (expoConstants != null) {
      StatsigWN.expoConstants = expoConstants;
    }
  }

  public static setExpoDevice(expoDevice?: ExpoDevice | null): void {
    if (expoDevice != null) {
      StatsigWN.expoDevice = expoDevice;
    }
  }

  public static setReactContextUpdater(fn: (() => void) | null) {
    StatsigWN.reactContextUpdater = fn;
  }

  public static setOnCacheLoadedCallback(fn: () => void) {
    StatsigWN.onCacheLoadedCallback = fn;
  }

  private static getClientX(): StatsigClient {
    if (!StatsigWN.instance) {
      throw new Error('Call and wait for initialize() to finish first.');
    }
    return StatsigWN.instance;
  }

  private static capture<T>(task: () => T, recover: T): T {
    try {
      return task();
    } catch (e) {
      if (StatsigWN.canThrow()) {
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
    if (StatsigWN.instance != null && StatsigWN.canThrow()) {
      throw new Error(
        'Cannot create another instance of the static StatsigWN class',
      );
    }
    StatsigWN.instance = new StatsigClient(sdkKey, user, options);
  }

  private static updateContext() {
    if (StatsigWN.reactContextUpdater != null) {
      StatsigWN.reactContextUpdater();
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
