/**
 * @jest-environment jsdom
 */

import { render } from '@testing-library/react';
import React, { useEffect } from 'react';
import { act } from 'react-dom/test-utils';
import StatsigJS from 'statsig-js';
import { Statsig, StatsigProvider, StatsigSynchronousProvider } from '..';

type Props = {
  timeout?: number;
};

const NetworkInit = function (): JSX.Element {
  return (
    <StatsigProvider sdkKey="client-dummy-key" user={{ userID: 'init_user' }}>
      <div />
    </StatsigProvider>
  );
};

const NetworkInitWithPrefetchOption = function ({
  timeout,
}: Props): JSX.Element {
  return (
    <StatsigProvider
      sdkKey="client-dummy-key"
      user={{ userID: 'init_user' }}
      options={{
        prefetchUsers: [{ userID: 'options_prefetched_user' }],
        initTimeoutMs: timeout,
      }}
    >
      <div />
    </StatsigProvider>
  );
};

const NetworkInitCallingPrefetch = function ({ timeout }: Props): JSX.Element {
  useEffect(() => {
    Statsig.prefetchUsers([{ userID: 'prefetched_user' }]);
  }, []);

  return (
    <StatsigProvider
      sdkKey="client-dummy-key"
      user={{ userID: 'init_user' }}
      options={{
        initTimeoutMs: timeout,
      }}
    >
      <div />
    </StatsigProvider>
  );
};

const BootstrapInit = function (): JSX.Element {
  return (
    <StatsigSynchronousProvider
      sdkKey="client-dummy-key"
      user={{ userID: 'init_user' }}
      initializeValues={{}}
    >
      <div />
    </StatsigSynchronousProvider>
  );
};

const BootstrapInitWithPrefetchOption = function ({
  timeout,
}: Props): JSX.Element {
  return (
    <StatsigSynchronousProvider
      sdkKey="client-dummy-key"
      user={{ userID: 'init_user' }}
      initializeValues={{}}
      options={{
        prefetchUsers: [{ userID: 'options_prefetched_user' }],
        initTimeoutMs: timeout,
      }}
    >
      <div />
    </StatsigSynchronousProvider>
  );
};

const BootstrapInitCallingPrefetch = function ({
  timeout,
}: Props): JSX.Element {
  useEffect(() => {
    Statsig.prefetchUsers([{ userID: 'prefetched_user' }]);
  }, []);

  return (
    <StatsigSynchronousProvider
      sdkKey="client-dummy-key"
      user={{ userID: 'init_user' }}
      initializeValues={{}}
      options={{ initTimeoutMs: timeout }}
    >
      <div />
    </StatsigSynchronousProvider>
  );
};

describe('Prefetch Users', () => {
  let requests: { url: RequestInfo | URL; params?: RequestInit }[] = [];

  const expectInitializeRequestAt = (
    index: number,
    userID: string | null,
    prefetchUserID: string | null,
  ) => {
    expect(requests[index].url).toContain('/v1/initialize');

    const body: Record<string, any> = JSON.parse(
      (requests[index].params?.body as any) ?? '{}',
    ) as any;

    expect(body.user?.userID ?? null).toEqual(userID);

    if (prefetchUserID === null) {
      expect(body.prefetchUsers).toBeUndefined();
    } else {
      expect(JSON.stringify(body.prefetchUsers)).toContain(prefetchUserID);
    }
  };

  const expectOnlyOneInitializeRequest = (
    userID: string | null,
    prefetchUserID: string | null,
  ) => {
    expect(
      requests.filter(({ url }) => url.toString().includes('/v1/initialize'))
        .length,
    ).toBe(1);
    expectInitializeRequestAt(0, userID, prefetchUserID);
  };

  (global as any).fetch = jest.fn((url, params) => {
    requests.push({ url, params });
    return Promise.resolve();
  });

  beforeEach(() => {
    (Statsig as any).instance = null;
    jest.useFakeTimers();
    StatsigJS.encodeIntializeCall = false;

    requests = [];
  });

  afterEach(async () => {
    jest.useRealTimers();
  });

  test('Initializing with Network', () => {
    render(<NetworkInit />);

    expectOnlyOneInitializeRequest('init_user', null);
  });

  test('Initializing with Network and Providing Prefetch Option', () => {
    render(<NetworkInitWithPrefetchOption />);

    expectOnlyOneInitializeRequest('init_user', 'options_prefetched_user');
  });

  test('Initializing with Network and Providing Prefetch Option with Timeout', async () => {
    render(<NetworkInitWithPrefetchOption timeout={500} />);
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    expectOnlyOneInitializeRequest('init_user', 'options_prefetched_user');
  });

  test('Initializing with Network and Calling Prefetch', () => {
    render(<NetworkInitCallingPrefetch />);

    expectInitializeRequestAt(0, 'init_user', null);
    expectInitializeRequestAt(1, null, 'prefetched_user');
  });

  test('Initializing with Network and Calling Prefetch with Timeout', async () => {
    render(<NetworkInitCallingPrefetch timeout={500} />);
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    expectInitializeRequestAt(0, 'init_user', null);
    expectInitializeRequestAt(1, null, 'prefetched_user');
  });

  test('Initializing with Bootstrap ', () => {
    render(<BootstrapInit />);

    expect(requests.length).toBe(0);
  });

  test('Initializing with Bootstrap and Calling Prefetch', () => {
    render(<BootstrapInitCallingPrefetch />);

    expectOnlyOneInitializeRequest(null, 'prefetched_user');
  });

  test('Initializing with Bootstrap and Calling Prefetch with Timeout', async () => {
    render(<BootstrapInitCallingPrefetch timeout={500} />);
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    expectOnlyOneInitializeRequest(null, 'prefetched_user');
  });

  test('Initializing with Bootstrap and Providing Prefetch Option', async () => {
    render(<BootstrapInitWithPrefetchOption />);

    expect(requests.length).toBe(0);

    await act(async () => {
      jest.advanceTimersByTime(21);
    });

    expectOnlyOneInitializeRequest(null, 'options_prefetched_user');
  });

  test('Initializing with Bootstrap and Providing Prefetch Option with Timeout', async () => {
    render(<BootstrapInitWithPrefetchOption timeout={500} />);

    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    expectOnlyOneInitializeRequest(null, 'options_prefetched_user');
  });
});
