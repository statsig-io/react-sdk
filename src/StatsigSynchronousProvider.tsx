import React, { useEffect, useMemo, useRef, useState } from 'react';
import StatsigContext, { UpdateUserFunc } from './StatsigContext';
import { StatsigOptions } from './StatsigOptions';
import { StatsigUser, _SDKPackageInfo } from 'statsig-js';
import Statsig from './Statsig';

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
};

/**
 * The StatsigSynchronousProvider is the top level component from which all React SDK components derive
 * It initializes the SDK synchronously so child components can use FeatureGate and DynamicConfig values
 * immediately and you can take advantage of server side rendering of react components.
 *
 * The provider accepts the same SDK initialization parameters as the statsig-js SDK.
 *
 * We recommend you place this at the entry point of your app and pass waitForInitialization = true
 * to ensure the SDK is initialized and all values are up to date prior to rendering anything.
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
}: Props): JSX.Element {
  const [userVersion, setUserVersion] = useState(0);
  const [initialized, setInitialized] = useState(true);
  const firstUpdate = useRef(true);
  const userMemo = useMemo(() => {
    return user;
  }, [JSON.stringify(user)]);

  Statsig.bootstrap(sdkKey, initializeValues, userMemo, options);

  useEffect(() => {
    if (firstUpdate.current) {
      // this is the first time the effect ran
      // we dont want to modify state and trigger a rerender
      // and the SDK is already initialized/usable
      firstUpdate.current = false;
      return;
    }
    // subsequent runs should update the user
    setInitialized(false);
    Statsig.updateUser(user).then(() => {
      setUserVersion(userVersion + 1);
      setInitialized(true);
    });
  }, [userMemo]);

  return (
    <StatsigContext.Provider
      value={{
        initialized: initialized,
        statsigPromise: null,
        userVersion: userVersion,
        initStarted: Statsig.initializeCalled(),
        updateUser: setUser ?? (() => {}),
      }}
    >
      {children}
    </StatsigContext.Provider>
  );
}
