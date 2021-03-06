import React, { useRef, useEffect, useState, useMemo } from 'react';
import StatsigContext from './StatsigContext';
import { StatsigOptions } from './StatsigOptions';
import { StatsigUser, _SDKPackageInfo } from 'statsig-js';
import Statsig from './Statsig';

import type {
  NativeModules,
  Platform,
  DeviceInfo,
  ExpoConstants,
  ExpoDevice,
  AsyncStorage,
  UUID,
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
   * A loading component to render iff waitForInitialization is set to true, and the SDK is initializing
   */
  initializingComponent?: React.ReactNode | React.ReactNode[];

  /**
   * A key for stable mounting/unmounting when updating the user.  If this key is set and changes when the user object changes
   * (or if it is not provided) Then the children of StatsigProvider will unmount/remount with the async update.
   * If this key is set and does not change, then the children of StatsigProvider will continue to be mounted,
   * and it will trigger a rerender after updateUser completes
   */
  mountKey?: string;

  shutdownOnUnmount?: boolean;

  /**
   * DO NOT CALL DIRECTLY. Used to polyfill react native specific dependencies.
   */
  _reactNativeDependencies?: {
    SDKPackageInfo: _SDKPackageInfo;
    AsyncStorage: AsyncStorage | null;
    AppState: any | null;
    NativeModules: NativeModules | null;
    Platform: Platform | null;
    RNDevice: DeviceInfo | null;
    Constants: ExpoConstants | null;
    ExpoDevice: ExpoDevice | null;
    ReactNativeUUID: UUID | null;
  };
};

function usePrevious(value: string | null): string | null {
  const ref = useRef<string | null>(null);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

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
  initializingComponent,
  mountKey,
  shutdownOnUnmount = false,
  _reactNativeDependencies,
}: Props): JSX.Element {
  const [initialized, setInitialized] = useState(false);
  const resolver = useRef<(() => void) | null>(null);
  const [userVersion, setUserVersion] = useState(0);
  let statsigPromise = useRef<Promise<void>>(
    new Promise((resolve, _reject) => {
      resolver.current = resolve;
    }),
  );

  const userMemo = useMemo(() => {
    return user;
  }, [JSON.stringify(user)]);

  const prevMountKey = usePrevious(mountKey ?? null);

  useEffect(() => {
    if (Statsig.initializeCalled()) {
      statsigPromise.current = new Promise((resolve, _reject) => {
        resolver.current = resolve;
      });
      const unmount = mountKey === undefined || prevMountKey !== mountKey;
      if (unmount) {
        setInitialized(false);
      }

      Statsig.updateUser(user).then(() => {
        resolver.current && resolver.current();
        setUserVersion(userVersion + 1);
        if (unmount) {
          setInitialized(true);
        }
      });

      return;
    }

    Statsig.setSDKPackageInfo(
      _reactNativeDependencies?.SDKPackageInfo ?? {
        sdkType: 'react-client',
        sdkVersion: require('../package.json')?.version ?? '',
      },
    );

    // rn
    Statsig.setAppState(_reactNativeDependencies?.AppState ?? null);
    Statsig.setAsyncStorage(_reactNativeDependencies?.AsyncStorage ?? null);
    Statsig.setNativeModules(_reactNativeDependencies?.NativeModules ?? null);
    Statsig.setPlatform(_reactNativeDependencies?.Platform ?? null);
    Statsig.setRNDeviceInfo(_reactNativeDependencies?.RNDevice ?? null);
    Statsig.setReactNativeUUID(
      _reactNativeDependencies?.ReactNativeUUID ?? null,
    );

    // expo
    Statsig.setExpoConstants(_reactNativeDependencies?.Constants ?? null);
    Statsig.setExpoDevice(_reactNativeDependencies?.ExpoDevice ?? null);

    Statsig.initialize(sdkKey, userMemo, options).then(() => {
      setInitialized(true);
      resolver.current && resolver.current();
    });
  }, [userMemo]);

  useEffect(() => {
    return () => {
      if (shutdownOnUnmount) {
        Statsig.shutdown();
      }
    };
  }, []);

  let child = null;
  if (waitForInitialization !== true) {
    child = children;
  } else if (waitForInitialization && initialized) {
    child = children;
  } else if (waitForInitialization && initializingComponent != null) {
    child = initializingComponent;
  }

  return (
    <StatsigContext.Provider
      value={{
        initialized,
        statsigPromise,
        userVersion,
        initStarted: Statsig.initializeCalled(),
      }}
    >
      {child}
    </StatsigContext.Provider>
  );
}
