import type {
  AsyncStorage,
  DeviceInfo,
  ExpoConstants,
  ExpoDevice,
  NativeModules,
  Platform,
  UUID,
} from 'statsig-js';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import StatsigContext, { UpdateUserFunc } from './StatsigContext';
import StatsigJS, { StatsigUser, _SDKPackageInfo } from 'statsig-js';

import Statsig from './Statsig';
import { StatsigOptions } from './StatsigOptions';

import { version as SDKVersion } from './SDKVersion';

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
   * A function to keep your reference to a StatsigUser in-sync with Statsig's reference.
   * This is required if you want to use the useUpdateUser hook.
   */
  setUser?: UpdateUserFunc;

  /**
   * Options for initializing the SDK, shared with the statsig-js SDK
   */
  options?: StatsigOptions;

  /**
   * Waits for the SDK to load any cached values before rendering child components
   */
  waitForCache?: boolean;

  /**
   * Waits for the SDK to initialize with updated values from the network before rendering child components
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
    AppState: unknown | null;
    AsyncStorage: AsyncStorage | null;
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
  setUser,
  options,
  waitForCache,
  waitForInitialization,
  initializingComponent,
  mountKey,
  shutdownOnUnmount = false,
  _reactNativeDependencies: rnDeps,
}: Props): JSX.Element {
  const isReactNative = !!rnDeps;
  const [hasCacheValues, setHasCacheValues] = useState(false);
  const [hasNetworkValues, setHasNetworkValues] = useState(false);
  const resolver = useRef<(() => void) | null>(null);
  const [userVersion, setUserVersion] = useState(0);

  const statsigPromise = useRef<Promise<void>>(
    new Promise((resolve) => {
      resolver.current = resolve;
    }),
  );

  const userMemo = useMemo(() => {
    return user;
  }, [JSON.stringify(user)]);

  const prevMountKey = usePrevious(mountKey ?? null);

  useEffect(() => {
    if (Statsig.initializeCalled()) {
      statsigPromise.current = new Promise((resolve) => {
        resolver.current = resolve;
      });
      const unmount = mountKey === undefined || prevMountKey !== mountKey;
      if (unmount) {
        setHasNetworkValues(false);
        setHasCacheValues(false);
      }

      Statsig.updateUser(user).then(() => {
        resolver.current && resolver.current();
        setUserVersion((version) => version + 1);
        if (unmount) {
          setHasNetworkValues(true);
          setHasCacheValues(true);
        }
      });

      return;
    }

    Statsig.setSDKPackageInfo({
      sdkType: 'react-client',
      sdkVersion: SDKVersion,
    });

    if (isReactNative) {
      Statsig.setSDKPackageInfo(rnDeps.SDKPackageInfo);
      Statsig.setAppState(rnDeps.AppState);
      Statsig.setAsyncStorage(rnDeps.AsyncStorage);
      Statsig.setNativeModules(rnDeps.NativeModules);
      Statsig.setPlatform(rnDeps.Platform);
      Statsig.setRNDeviceInfo(rnDeps.RNDevice);
      Statsig.setReactNativeUUID(rnDeps.ReactNativeUUID);

      // expo
      Statsig.setExpoConstants(rnDeps.Constants);
      Statsig.setExpoDevice(rnDeps.ExpoDevice);
    }

    Statsig.setOnCacheLoadedCallback(() => {
      setHasCacheValues(true);
    });

    Statsig.initialize(sdkKey, userMemo, options).then(() => {
      setHasNetworkValues(true);
      resolver.current && resolver.current();
    });

    if (typeof window !== 'undefined') {
      window.__STATSIG_SDK__ = Statsig;
      window.__STATSIG_JS_SDK__ = StatsigJS;
      window.__STATSIG_RERENDER_OVERRIDE__ = () => {
        setUserVersion(userVersion + 1);
      };
    }
  }, [userMemo]);

  useEffect(() => {
    Statsig.setReactContextUpdater(() =>
      setUserVersion((version) => version + 1),
    );
    return () => {
      if (shutdownOnUnmount) {
        Statsig.shutdown();
      }
      Statsig.setReactContextUpdater(null);
    };
  }, []);

  const child = pickChildToRender(
    waitForCache === true,
    waitForInitialization === true,
    hasNetworkValues,
    hasCacheValues,
    children,
    initializingComponent,
  );

  const contextValue = useMemo(
    () => ({
      initialized: hasNetworkValues,
      statsigPromise,
      userVersion,
      initStarted: Statsig.initializeCalled(),
      updateUser:
        setUser ??
        (() => {
          // noop
        }),
      hooksMemoKey: null,
    }),
    [
      hasNetworkValues,
      statsigPromise,
      userVersion,
      Statsig.initializeCalled(),
    ],
  );
  return (
    <StatsigContext.Provider value={contextValue}>
      {child}
    </StatsigContext.Provider>
  );
}

function pickChildToRender(
  waitForCache: boolean,
  waitForInitialization: boolean,
  hasNetworkValues: boolean,
  hasCacheValues: boolean,
  children: React.ReactNode | React.ReactNode[],
  initializingComponent?: React.ReactNode | React.ReactNode[],
): React.ReactNode | React.ReactNode[] | null {
  // No Need to Wait
  if (hasNetworkValues) {
    return children;
  }

  // Has to wait, but don't want to
  if (waitForInitialization !== true && waitForCache !== true) {
    return children;
  }

  // Wait until cache is ready
  if (waitForCache && hasCacheValues) {
    return children;
  }

  // Wait until initialized from network
  if (waitForInitialization && hasNetworkValues) {
    return children;
  }

  // Wait until initialized and I have a custom loading component
  if (
    (waitForInitialization || waitForCache) &&
    initializingComponent != null
  ) {
    return initializingComponent;
  }

  // Cannot render yet
  return null;
}
