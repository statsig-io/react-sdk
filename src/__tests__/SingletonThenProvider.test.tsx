/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import React, { useEffect, useState } from 'react';
import StatsigJS, { StatsigClient, StatsigUser } from 'statsig-js';
import { StatsigProvider } from '../StatsigProvider';
import { Statsig } from '../Statsig';
import { StatsigLazyLoader } from '../StatsigLazyLoader';

const TID_USER_VALUE = 'statsig-user-object';

StatsigJS.encodeIntializeCall = false;

let initCallbacks = 0;
let updateUserCallbacks = 0;

function UserTestComponent(props: {
  userID: string;
  excludeSetUserFunc?: boolean;
}) {
  const [user, setUser] = useState<StatsigUser>({ userID: props.userID });
  const [initialized, setInitialized] = useState(false);
  useEffect(() => {
    Statsig.initialize('client-sdk-key', user, {
      disableDiagnosticsLogging: true,
      initCompletionCallback: () => {
        initCallbacks++;
      },
      updateUserCompletionCallback: () => {
        updateUserCallbacks++;
      },
    }).then(() => {
      setInitialized(true);
    });
  }, []);

  if (!initialized) {
    return <div>Initialize Singleton</div>;
  }

  return (
    <StatsigProvider
      sdkKey="client-sdk-key'"
      user={user}
      setUser={props.excludeSetUserFunc === true ? undefined : setUser}
      waitForInitialization={false}
      options={{
        disableDiagnosticsLogging: true,
        initCompletionCallback: () => {
          initCallbacks++;
        },
      }}
    >
      <div data-testid={TID_USER_VALUE}>{user.userID}</div>
    </StatsigProvider>
  );
}

describe('StatsigProvider', () => {
  let requestsMade: {
    url: RequestInfo | URL;
    body: Record<string, unknown>;
  }[] = [];

  (global as any).fetch = jest.fn((url, params) => {
    const body = String(params?.body ?? '{}');
    requestsMade.push({ url, body: JSON.parse(body) });
    return Promise.resolve({
      ok: true,
      text: () => Promise.resolve('{}'),
    });
  });

  beforeEach(() => {
    requestsMade = [];
    initCallbacks = 0;
    updateUserCallbacks = 0;

    (Statsig as any).instance = null;
  });

  it('renders children', async () => {
    const userID = 'a-user';
    const updateUserSpy = jest.spyOn(StatsigClient.prototype, 'updateUser');
    render(<UserTestComponent userID={userID} />);

    const child = await waitFor(() => screen.getByTestId(TID_USER_VALUE));
    expect(child).toHaveTextContent(userID);
    expect(initCallbacks).toEqual(1);
    // The SDK is initialized via the singleton first, so when the provider
    // renders, it calls update user.
    expect(updateUserSpy).toHaveBeenCalledTimes(1);
    expect(updateUserCallbacks).toEqual(1);

    expect(requestsMade).toEqual([
      {
        url: 'https://featuregates.org/v1/initialize',
        body: expect.objectContaining({ user: { userID: userID } }),
      },
      // when the provider renders, it calls update user
      {
        url: 'https://featuregates.org/v1/initialize',
        body: expect.objectContaining({ user: { userID: userID } }),
      },
    ]);
  });
});
