import React, { useRef, useEffect, useState, useMemo } from 'react';
import statsig from 'statsig-js';
import StatsigContext from './StatsigContext';

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
  user: statsig.StatsigUser;

  /**
   * Options for initializing the SDK, shared with the statsig-js SDK
   */
  options?: statsig.StatsigOptions;

  /**
   * Waits for the SDK to initialize with updated values before rendering child components
   */
  waitForInitialization?: boolean;

  /**
   * DO NOT CALL DIRECTLY. Used to polyfill react native specific dependencies.
   */
  _reactNativeDependencies?: {
    SDKPackageInfo: statsig._SDKPackageInfo;
    AsyncStorage: object | null;
    AppState: object | null;
    NativeModules: object | null;
    Platform: object | null;
    RNDevice: object | null;
    Constants: object | null;
    ExpoDevice: object | null;
  };
};

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
  const [initialized, setInitialized] = useState(false);
  const resolver = useRef<(() => void) | null>(null);
  let statsigPromise = useRef<Promise<void>>(
    new Promise((resolve, _reject) => {
      resolver.current = resolve;
    }),
  );

  const userMemo = useMemo(() => {
    return user;
  }, [JSON.stringify(user)]);

  useEffect(() => {
    if (initialized) {
      statsigPromise.current = new Promise((resolve, _reject) => {
        resolver.current = resolve;
      });
      setInitialized(false);
      statsig.updateUser(user).then(() => {
        setInitialized(true);
        resolver.current && resolver.current();
      });
      return;
    }

    statsig._setReactNativeDependencies(
      _reactNativeDependencies?.SDKPackageInfo ?? {
        sdkType: 'react-client',
        sdkVersion: require('../package.json')?.version ?? '',
      },
      _reactNativeDependencies?.AsyncStorage ?? null,
      _reactNativeDependencies?.AppState ?? null,
      _reactNativeDependencies?.NativeModules ?? null,
      _reactNativeDependencies?.Platform ?? null,
      _reactNativeDependencies?.RNDevice ?? null,
      _reactNativeDependencies?.Constants ?? null,
      _reactNativeDependencies?.ExpoDevice ?? null,
    );

    statsig.initialize(sdkKey, userMemo, options).then(() => {
      setInitialized(true);
      resolver.current && resolver.current();
    });
  }, [userMemo]);

  return (
    <StatsigContext.Provider
      value={{
        initialized,
        statsig: initialized ? statsig : undefined,
        statsigPromise,
      }}
    >
      {waitForInitialization !== true || initialized ? children : null}
    </StatsigContext.Provider>
  );
}
