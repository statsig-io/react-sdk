import React, { FC, useEffect, useMemo, useRef, useState } from 'react';
import { version as SDKVersion } from './SDKVersion';
import { StatsigContext, UpdateUserFunc } from './StatsigContext';
import { StatsigLazyLoader } from './StatsigLazyLoader';
import { StatsigOptions } from './StatsigOptions';
import { pickChildToRender, usePrevious } from './StatsigProviderHelpers';
import type { StatsigUser } from 'statsig-js';

// TODO  will be migrated to @linktr.ee/sessionId lib
function getBrowserId(): string | undefined {
  const root = typeof window === 'undefined' ? globalThis : window;
  return root.localStorage?.getItem('browserId') || undefined;
}

const getEnvironment = (stage: string): string => {
  switch (stage) {
    case 'local':
      return 'development';
    case 'qa':
      return 'staging';
    default:
      return stage;
  }
};

/**
 * Properties required to initialize the Statsig React SDK
 */
export type StatsigLazyProviderProps = {
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

  stage: string;

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
};

/**
 * The StatsigLazyProvider is the top level component from which all React SDK components derive
 * It initializes the SDK so child components can use FeatureGate and DynamicConfig values
 * The main difference between StatsigLazyProvider and StatsigProvider that is uses lazy load approach of loading
 * Statsig.ts with statsig-js.
 *
 * The provider accepts the same SDK initialization parameters as the statsig-js SDK.
 *
 * @param props
 * @returns
 */
export const StatsigLazyProvider: FC<StatsigLazyProviderProps> = ({
  children,
  sdkKey,
  user,
  setUser,
  options,
  waitForCache,
  waitForInitialization,
  initializingComponent,
  mountKey,
  stage,
  shutdownOnUnmount = false,
}) => {
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

  const optionsMemo = useMemo<StatsigOptions>(() => {
    return {
      overrideStableID: options?.overrideStableID || getBrowserId(),
      environment: { tier: getEnvironment(stage) },
      ...options,
    };
  }, [JSON.stringify(options)]);

  const prevMountKey = usePrevious(mountKey ?? null);

  useEffect(() => {
    if (StatsigLazyLoader.initializeCalled()) {
      statsigPromise.current = new Promise((resolve) => {
        resolver.current = resolve;
      });
      const unmount = mountKey === undefined || prevMountKey !== mountKey;
      if (unmount) {
        setHasNetworkValues(false);
        setHasCacheValues(false);
      }

      StatsigLazyLoader.getStatsigAPI()
        .Statsig.updateUser(user)
        .then(() => {
          resolver.current && resolver.current();
          setUserVersion((version) => version + 1);
          if (unmount) {
            setHasNetworkValues(true);
            setHasCacheValues(true);
          }
        });

      return;
    }

    StatsigLazyLoader.loadModule().then(({ Statsig }) => {
      Statsig.setSDKPackageInfo({
        sdkType: 'react-client',
        sdkVersion: SDKVersion,
      });

      Statsig.setOnCacheLoadedCallback(() => {
        setHasCacheValues(true);
      });

      Statsig.initialize(sdkKey, userMemo, optionsMemo).then(() => {
        setHasNetworkValues(true);
        resolver.current && resolver.current();
      });

      if (typeof window !== 'undefined') {
        window.__STATSIG_RERENDER_OVERRIDE__ = () => {
          setUserVersion(userVersion + 1);
        };
      }
    });
  }, [userMemo]);

  useEffect(() => {
    StatsigLazyLoader.setReactContextUpdater(() =>
      setUserVersion((version) => version + 1),
    );
    return () => {
      if (shutdownOnUnmount) {
        StatsigLazyLoader.shutdown();
      }
      StatsigLazyLoader.setReactContextUpdater(null);
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
      initStarted: StatsigLazyLoader.initializeCalled(),
      updateUser:
        setUser ??
        (() => {
          // noop
        }),
    }),
    [
      hasNetworkValues,
      statsigPromise,
      userVersion,
      StatsigLazyLoader.initializeCalled(),
      setUser,
    ],
  );
  return (
    <StatsigContext.Provider value={contextValue}>
      {child}
    </StatsigContext.Provider>
  );
};
