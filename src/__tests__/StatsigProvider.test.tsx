/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';

import React, { useState } from 'react';
import StatsigJS, { StatsigUser } from 'statsig-js';
import { render, screen, waitFor } from '@testing-library/react';

import Statsig from '../Statsig';
import StatsigProvider from '../StatsigProvider';
import useUpdateUser from '../useUpdateUser';
import userEvent from '@testing-library/user-event';

const TID_USER_VALUE = 'statsig-user-object';
const TID_SET_USER_STATE = 'update-via-set-state';
const TID_UPDATE_USER_HOOK = 'update-via-hook';
const TID_PARTIAL_UPDATE_USER_HOOK = 'partial-update-via-hook';

StatsigJS.encodeIntializeCall = false;

let initCallbacks = 0;

function UpdateUserHookTestComponent(props: { userID: string }) {
  const updateUser = useUpdateUser();

  return (
    <>
      <button
        onClick={() =>
          updateUser((old) => {
            return {
              ...old,
              userID: props.userID + '-partial-update-via-useUpdateUser',
            };
          })
        }
        data-testid={TID_PARTIAL_UPDATE_USER_HOOK}
      />
      <button
        onClick={() =>
          updateUser({
            userID: props.userID + '-full-update-via-useUpdateUser',
          })
        }
        data-testid={TID_UPDATE_USER_HOOK}
      />
    </>
  );
}

function UserTestComponent(props: {
  userID: string;
  excludeSetUserFunc?: boolean;
}) {
  const [user, setUser] = useState<StatsigUser>({ userID: props.userID });

  return (
    <StatsigProvider
      sdkKey="client-sdk-key'"
      user={user}
      setUser={props.excludeSetUserFunc === true ? undefined : setUser}
      waitForInitialization={true}
      options={{
        disableDiagnosticsLogging: true,
        initCompletionCallback: () => {
          initCallbacks++;
        },
      }}
    >
      <div data-testid={TID_USER_VALUE}>{user.userID}</div>

      <button
        onClick={() =>
          setUser({ userID: props.userID + '-update-via-useState' })
        }
        data-testid={TID_SET_USER_STATE}
      />

      <UpdateUserHookTestComponent userID={props.userID} />
    </StatsigProvider>
  );
}

describe('Singleton then StatsigProvider', () => {
  let requestsMade: {
    url: RequestInfo | URL;
    body: Record<string, unknown>;
  }[] = [];

  async function VerifyInitializeForUserWithRender(userID: string) {
    await waitFor(() => screen.getByText(userID));

    expect(requestsMade).toContainEqual(
      {
        url: 'https://featuregates.org/v1/initialize',
        body: expect.objectContaining({ user: { userID: userID } }),
      },
    );
  }

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

    (Statsig as any).instance = null;
  });

  it('renders children', async () => {
    render(<UserTestComponent userID="a-user" />);

    const child = await waitFor(() => screen.getByTestId(TID_USER_VALUE));
    expect(child).toHaveTextContent('a-user');
    expect(initCallbacks).toEqual(1);

    await VerifyInitializeForUserWithRender('a-user');
  });

  it('calls updateUser when user object changes', async () => {
    render(<UserTestComponent userID="a-user" />);
    await waitFor(
      () => screen.getByTestId(TID_USER_VALUE) && requestsMade.length === 1,
    );
    expect(initCallbacks).toEqual(1);
    requestsMade = [];

    await userEvent.click(screen.getByTestId(TID_SET_USER_STATE));

    await VerifyInitializeForUserWithRender('a-user-update-via-useState');
    expect(initCallbacks).toEqual(1);
  });

  it('updates the user via the useUpdateUser hook', async () => {
    render(<UserTestComponent userID="a-user" />);
    await waitFor(
      () => screen.getByTestId(TID_USER_VALUE) && requestsMade.length === 1,
    );

    requestsMade = [];

    await userEvent.click(screen.getByTestId(TID_UPDATE_USER_HOOK));

    await VerifyInitializeForUserWithRender(
      'a-user-full-update-via-useUpdateUser',
    );
  });

  it('partially updates the user via the useUpdateUser hook', async () => {
    render(<UserTestComponent userID="a-user" />);
    await waitFor(
      () => screen.getByTestId(TID_USER_VALUE) && requestsMade.length === 1,
    );

    requestsMade = [];

    await userEvent.click(screen.getByTestId(TID_PARTIAL_UPDATE_USER_HOOK));

    await VerifyInitializeForUserWithRender(
      'a-user-partial-update-via-useUpdateUser',
    );
  });
});
