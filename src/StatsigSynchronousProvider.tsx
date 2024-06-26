import React, { useEffect, useMemo, useRef, useState } from 'react';
import StatsigContext, { UpdateUserFunc } from './StatsigContext';
import StatsigJS, { StatsigUser } from 'statsig-js';

import Statsig from './Statsig';
import { StatsigOptions } from './StatsigOptions';

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
   * The values to initialize the SDK with.  Required for this provider.  For non server side rendered use cases,
   * @see StatsigProvider.tsx
   */
  initializeValues: Record<string, unknown>;

  /**
   * Options for initializing the SDK, shared with the statsig-js SDK
   *
   */
  options?: StatsigOptions;

  shutdownOnUnmount?: boolean;
};

/**
 * The StatsigSynchronousProvider is the top level component from which all React SDK components derive
 * It initializes the SDK synchronously so child components can use FeatureGate and DynamicConfig values
 * immediately and you can take advantage of server side rendering of react components.
 *
 * The provider accepts the same SDK initialization parameters as the statsig-js SDK.
 * @param props
 * @returns
 */
export default function StatsigSynchronousProvider({
  children,
  sdkKey,
  user,
  options,
  initializeValues,
  setUser,
  shutdownOnUnmount,
}: Props): JSX.Element {
  const [userVersion, setUserVersion] = useState(0);
  const [initialized, setInitialized] = useState(true);
  const firstUpdate = useRef(true);
  const userMemo = useMemo(() => {
    return user;
  }, [JSON.stringify(user)]);
  const stringifiedValues = JSON.stringify(initializeValues);
  useMemo(() => {
    Statsig.bootstrap(sdkKey, initializeValues, userMemo, options);
    return initializeValues;
  }, [stringifiedValues]);

  useEffect(() => {
    if (firstUpdate.current) {
      // this is the first time the effect ran
      // we dont want to modify state and trigger a rerender
      // and the SDK is already initialized/usable
      firstUpdate.current = false;

      if (typeof window !== 'undefined') {
        window.__STATSIG_SDK__ = Statsig;
        window.__STATSIG_JS_SDK__ = StatsigJS;
        window.__STATSIG_RERENDER_OVERRIDE__ = () => {
          setUserVersion(userVersion + 1);
        };
      }
      return;
    }
    // subsequent runs should update the user
    setInitialized(false);
    Statsig.updateUser(user).then(() => {
      setUserVersion(userVersion + 1);
      setInitialized(true);
    });
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

  const contextValue = useMemo(() => {
    return {
      initialized: initialized,
      statsigPromise: null,
      userVersion: userVersion,
      initStarted: Statsig.initializeCalled(),
      updateUser:
        setUser ??
        (() => {
          // noop
        }),
      hooksMemoKey: stringifiedValues,
    };
  }, [initialized, userVersion, Statsig.initializeCalled(), setUser, stringifiedValues]);
  return (
    <StatsigContext.Provider value={contextValue}>
      {children}
    </StatsigContext.Provider>
  );
}
