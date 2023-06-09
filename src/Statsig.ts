import StatsigJS, {
  DynamicConfig,
  StatsigClient,
  StatsigOverrides,
  _SDKPackageInfo,
  StatsigOptions,
  StatsigUser,
  StatsigAsyncStorage,
  Layer,
  EvaluationReason,
  EvaluationDetails,
} from 'statsig-js';

import type {
  NativeModules,
  Platform,
  DeviceInfo,
  ExpoConstants,
  ExpoDevice,
  AsyncStorage,
  UUID,
  AppState,
} from 'statsig-js';
import { staticImplements, StatsigStatic } from './StatsigStatic';

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
  private static instance: StatsigClient;

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
      if (!Statsig.instance) {
        Statsig.instance = new StatsigClient(sdkKey, user, options);
        Statsig.instance.setSDKPackageInfo(this.sdkPackageInfo);
        Statsig.instance.setAppState(this.appState);
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

  public static async prefetchUsers(users: StatsigUser[]): Promise<void> {
    if (!this.isInitialized()) {
      return;
    }
    return Statsig.instance.prefetchUsers(users);
  }

  public static setInitializeValues(
    initializeValues: Record<string, unknown>,
  ): void {
    if (!this.isInitialized()) {
      return;
    }
    Statsig.instance.setInitializeValues(initializeValues);
  }

  public static checkGate(gateName: string, ignoreOverrides = false): boolean {
    if (!this.isInitialized()) {
      return false;
    }
    return Statsig.instance.checkGate(gateName, ignoreOverrides);
  }

  public static checkGateWithExposureLoggingDisabled(
    gateName: string,
    options?: CheckGateOptions,
  ): boolean {
    if (!this.isInitialized()) {
      return false;
    }
    return Statsig.instance.checkGateWithExposureLoggingDisabled(
      gateName,
      options?.ignoreOverrides,
    );
  }

  public static manuallyLogGateExposure(gateName: string): void {
    if (!this.isInitialized()) {
      return;
    }
    Statsig.instance.logGateExposure(gateName);
  }

  public static getConfig(
    configName: string,
    ignoreOverrides = false,
  ): DynamicConfig {
    if (!this.isInitialized()) {
      return new DynamicConfig(configName, {}, '', {
        time: Date.now(),
        reason: EvaluationReason.Uninitialized,
      });
    }
    return Statsig.instance.getConfig(configName, ignoreOverrides);
  }

  public static getConfigWithExposureLoggingDisabled(
    configName: string,
    options?: GetConfigOptions,
  ): DynamicConfig {
    if (!this.isInitialized()) {
      return new DynamicConfig(configName, {}, '', {
        time: Date.now(),
        reason: EvaluationReason.Uninitialized,
      });
    }
    return Statsig.instance.getConfigWithExposureLoggingDisabled(
      configName,
      options?.ignoreOverrides,
    );
  }

  public static manuallyLogConfigExposure(configName: string): void {
    if (!this.isInitialized()) {
      return;
    }
    Statsig.instance.logConfigExposure(configName);
  }

  public static getExperiment(
    experimentName: string,
    keepDeviceValue = false,
    ignoreOverrides = false,
  ): DynamicConfig {
    if (!this.isInitialized()) {
      return new DynamicConfig(experimentName, {}, '', {
        time: Date.now(),
        reason: EvaluationReason.Uninitialized,
      });
    }
    return Statsig.instance.getExperiment(
      experimentName,
      keepDeviceValue,
      ignoreOverrides,
    );
  }

  public static getExperimentWithExposureLoggingDisabled(
    experimentName: string,
    options?: GetExperimentOptions,
  ): DynamicConfig {
    if (!this.isInitialized()) {
      return new DynamicConfig(experimentName, {}, '', {
        time: Date.now(),
        reason: EvaluationReason.Uninitialized,
      });
    }
    return Statsig.instance.getExperimentWithExposureLoggingDisabled(
      experimentName,
      options?.keepDeviceValue,
      options?.ignoreOverrides,
    );
  }

  public static manuallyLogExperimentExposure(
    experimentName: string,
    keepDeviceValue: boolean,
  ): void {
    if (!this.isInitialized()) {
      return;
    }
    Statsig.instance.logExperimentExposure(experimentName, keepDeviceValue);
  }

  public static getLayer(layerName: string, keepDeviceValue = false): Layer {
    if (!this.isInitialized()) {
      return Layer._create(layerName, {}, '', {
        time: Date.now(),
        reason: EvaluationReason.Uninitialized,
      });
    }
    return Statsig.instance.getLayer(layerName, keepDeviceValue);
  }

  public static getLayerWithExposureLoggingDisabled(
    layerName: string,
    options?: GetLayerOptions,
  ): Layer {
    if (!this.isInitialized()) {
      return Layer._create(layerName, {}, '', {
        time: Date.now(),
        reason: EvaluationReason.Uninitialized,
      });
    }
    return Statsig.instance.getLayerWithExposureLoggingDisabled(
      layerName,
      options?.keepDeviceValue,
    );
  }

  public static manuallyLogLayerParameterExposure(
    layerName: string,
    parameterName: string,
    keepDeviceValue = false,
  ): void {
    if (!this.isInitialized()) {
      return;
    }
    Statsig.instance.logLayerParameterExposure(
      layerName,
      parameterName,
      keepDeviceValue,
    );
  }

  public static logEvent(
    eventName: string,
    value: string | number | null = null,
    metadata: Record<string, string> | null = null,
  ): void {
    if (!this.isInitialized()) {
      return;
    }
    Statsig.instance.logEvent(eventName, value, metadata);
  }

  public static updateUser(user: StatsigUser | null): Promise<boolean> {
    if (!this.isInitialized()) {
      return Promise.resolve(false);
    }
    return Statsig.instance.updateUser(user);
  }

  public static shutdown() {
    if (!this.isInitialized()) {
      return;
    }
    Statsig.instance.shutdown();
  }

  /**
   * Overrides the given gate locally with the given value
   * @param gateName - name of the gate to override
   * @param value - value to assign to the gate
   */
  public static overrideGate(gateName: string, value: boolean): void {
    if (!this.isInitialized()) {
      return;
    }
    if (Statsig.getAllOverrides()['gates']?.[gateName] === value) {
      return;
    }
    Statsig.instance.overrideGate(gateName, value);
    Statsig.updateContext();
  }

  /**
   * Overrides the given config locally with the given value
   * @param configName - name of the config to override
   * @param value - value to assign to the config
   */
  public static overrideConfig(configName: string, value: object): void {
    if (!this.isInitialized()) {
      return;
    }
    if (Statsig.getAllOverrides()['configs']?.[configName] === value) {
      return;
    }
    Statsig.instance.overrideConfig(configName, value);
    Statsig.updateContext();
  }

  /**
   * Overrides the given layer locally with the given value
   * @param layerName - name of the layer to override
   * @param value - value to assign to the layer
   */
  public static overrideLayer(layerName: string, value: object): void {
    if (!this.isInitialized()) {
      return;
    }
    if (Statsig.getAllOverrides()['layers']?.[layerName] === value) {
      return;
    }
    Statsig.instance.overrideLayer(layerName, value);
    Statsig.updateContext();
  }

  /**
   * @param name the gate override to remove
   */
  public static removeGateOverride(name?: string): void {
    if (!this.isInitialized()) {
      return;
    }
    Statsig.instance.removeGateOverride(name);
    Statsig.updateContext();
  }

  /**
   * @param name the config override to remove
   */
  public static removeConfigOverride(name?: string): void {
    if (!this.isInitialized()) {
      return;
    }
    Statsig.instance.removeConfigOverride(name);
    Statsig.updateContext();
  }

  /**
   * @param name the config override to remove
   */
  public static removeLayerOverride(name?: string): void {
    if (!this.isInitialized()) {
      return;
    }
    Statsig.instance.removeLayerOverride(name);
    Statsig.updateContext();
  }

  /**
   * @returns The local gate and config overrides
   */
  public static getAllOverrides(): StatsigOverrides {
    if (!this.isInitialized()) {
      return {
        gates: {},
        configs: {},
        layers: {},
      };
    }
    return Statsig.instance.getAllOverrides();
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
    if (!this.isInitialized()) {
      return '';
    }
    return Statsig.instance.getStableID();
  }

  public static initializeCalled(): boolean {
    return Statsig.instance != null && Statsig.instance.initializeCalled();
  }

  // All methods below are for the statsig react native SDK internal usage only!
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

  public static setAppState(appState?: AppState | null): void {
    if (appState != null) {
      Statsig.appState = appState;
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

  private static isInitialized(): boolean {
    if (Statsig.instance) {
      return true;
    }
    if (Statsig.canThrow()) {
      throw new Error('Call and wait for initialize() to finish first.');
    }
    return false;
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
