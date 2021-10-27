import React, { useRef, useEffect, useState, useMemo } from 'react';
import StatsigContext from './StatsigContext';
import {
  StatsigUser,
  StatsigOptions,
  _SDKPackageInfo,
  StatsigClient,
  AppState,
  AsyncStorage,
  DeviceInfo,
  ExpoConstants,
  ExpoDevice,
  NativeModules,
  Platform,
} from 'statsig-js';

/**
 * Properties required to initialize the Statsig React SDK
 */
type Props = {
  children: React.ReactNode | React.ReactNode[];

  /**
   * A client SDK key from the Statsig Console
   */
  sdkKey: string;

  /**
   * A Statsig User object.  Changing this will update the user and Gate values, causing a re-initialization
   */
  user: StatsigUser;

  /**
   * Options for initializing the SDK, shared with the statsig-js SDK
   */
  options?: StatsigOptions;

  /**
   * Waits for the SDK to initialize with updated values before rendering child components
   */
  waitForInitialization?: boolean;

  /**
   * DO NOT CALL DIRECTLY. Used to polyfill react native specific dependencies.
   */
  _reactNativeDependencies?: {
    SDKPackageInfo: _SDKPackageInfo;
    AsyncStorage: AsyncStorage | null;
    AppState: AppState | null;
    NativeModules: NativeModules | null;
    Platform: Platform | null;
    RNDevice: DeviceInfo | null;
    Constants: ExpoConstants | null;
    ExpoDevice: ExpoDevice | null;
  };
};

let initStarted = false;

/**
 * The StatsigProvider is the top level component from which all React SDK components derive
 * It initializes the SDK so child components can use FeatureGate and DynamicConfig values
 *
 * The provider accepts the same SDK initialization parameters as the statsig-js SDK.
 *
 * We recommend you place this at the entry point of your app and pass waitForInitialization = true
 * to ensure the SDK is initialized and all values are up to date prior to rendering anything.
 * @param props
 * @returns
 */
export default function StatsigProvider({
  children,
  sdkKey,
  user,
  options,
  waitForInitialization,
  _reactNativeDependencies,
}: Props): JSX.Element {
  const statsig = useMemo(() => {
    return new StatsigClient();
  }, []);
  const [initialized, setInitialized] = useState(false);
  const resolver = useRef<(() => void) | null>(null);
  const initStarted = useRef<boolean>(false);
  const [userVersion, setUserVersion] = useState(0);
  let statsigPromise = useRef<Promise<void>>(
    new Promise((resolve, _reject) => {
      resolver.current = resolve;
    }),
  );

  const userMemo = useMemo(() => {
    return user;
  }, [JSON.stringify(user)]);

  useEffect(() => {
    if (initStarted.current) {
      statsigPromise.current = new Promise((resolve, _reject) => {
        resolver.current = resolve;
      });
      setInitialized(false);
      statsig.updateUser(user).then(() => {
        resolver.current && resolver.current();
        setUserVersion(userVersion + 1);
        setInitialized(true);
      });
      return;
    }

    statsig.setSDKPackageInfo(
      _reactNativeDependencies?.SDKPackageInfo ?? {
        sdkType: 'react-client',
        sdkVersion: require('../package.json')?.version ?? '',
      },
    );

    statsig.setAsyncStorage(_reactNativeDependencies?.AsyncStorage);
    statsig.setAppState(_reactNativeDependencies?.AppState);
    statsig.setNativeModules(_reactNativeDependencies?.NativeModules);
    statsig.setPlatform(_reactNativeDependencies?.Platform);
    statsig.setRNDeviceInfo(_reactNativeDependencies?.RNDevice);
    statsig.setExpoConstants(_reactNativeDependencies?.Constants);
    statsig.setExpoDevice(_reactNativeDependencies?.ExpoDevice);

    statsig.initializeAsync(sdkKey, userMemo, options).then(() => {
      setInitialized(true);
      resolver.current && resolver.current();
    });
    initStarted.current = true;
  }, [userMemo]);

  let child = null;
  if (waitForInitialization !== true && initStarted) {
    child = children;
  } else if (waitForInitialization && initialized) {
    child = children;
  }

  return (
    <StatsigContext.Provider
      value={{
        initialized,
        statsig,
        statsigPromise,
        userVersion,
      }}
    >
      {child}
    </StatsigContext.Provider>
  );
}
