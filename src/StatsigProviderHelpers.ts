import React, { useEffect, useRef } from 'react';

export function usePrevious(value: string | null): string | null {
  const ref = useRef<string | null>(null);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

export function pickChildToRender(
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
