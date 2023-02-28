/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { useState } from 'react';
import StatsigJS, { StatsigUser } from 'statsig-js';
import StatsigSynchronousProvider from '../StatsigSynchronousProvider';
import useUpdateUser from '../useUpdateUser';
import * as TestData from './initialize_response.json';

const TID_USER_VALUE = 'statsig-user-object';
const TID_SET_USER_STATE = 'update-via-set-state';
const TID_UPDATE_USER_HOOK = 'update-via-hook';
const TID_PARTIAL_UPDATE_USER_HOOK = 'partial-update-via-hook';

StatsigJS.encodeIntializeCall = false;
let initTime = 0;

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
    <StatsigSynchronousProvider
      sdkKey="client-sdk-key'"
      user={user}
      setUser={props.excludeSetUserFunc === true ? undefined : setUser}
      options={{
        disableDiagnosticsLogging: true,
        initCompletionCallback: (duration, success, message) => {
          initTime = duration
        }
      }}
      initializeValues={TestData}
    >
      <div data-testid={TID_USER_VALUE}>{user.userID}</div>

      <button
        onClick={() =>
          setUser({ userID: props.userID + '-update-via-useState' })
        }
        data-testid={TID_SET_USER_STATE}
      />

      <UpdateUserHookTestComponent userID={props.userID} />
    </StatsigSynchronousProvider>
  );
}

describe('StatsigProvider', () => {
  let requestsMade: {
    url: RequestInfo | URL;
    body: Record<string, unknown>;
  }[] = [];

  async function VerifyInitializeForUserWithRender(userID: string) {
    await waitFor(() => screen.getByText(userID));

    expect(requestsMade).toEqual([
      {
        url: 'https://featuregates.org/v1/initialize',
        body: expect.objectContaining({ user: { userID: userID } }),
      },
    ]);
  }

  // @ts-ignore
  global.fetch = jest.fn((url, params) => {
    const body = String(params?.body ?? '{}');
    requestsMade.push({ url, body: JSON.parse(body) });
  });

  beforeEach(() => {
    requestsMade = [];
    initTime = 0;
  });

  it('renders children', async () => {
    expect.assertions(4);
    render(<UserTestComponent userID="a-user" />);

    const child = await waitFor(() => screen.getByTestId(TID_USER_VALUE));
    expect(child).toHaveTextContent('a-user');

    expect(initTime).toBeGreaterThan(0);
    expect(initTime).toBeLessThan(100);

    expect(requestsMade).toEqual([]);
  });

  it('calls updateUser when user object changes', async () => {
    render(<UserTestComponent userID="a-user" />);
    await waitFor(
      () => screen.getByTestId(TID_USER_VALUE) && requestsMade.length === 1,
    );

    requestsMade = [];

    await userEvent.click(screen.getByTestId(TID_SET_USER_STATE));

    await VerifyInitializeForUserWithRender('a-user-update-via-useState');
  });

  it('updates the user via the useUpdateUser hook', async () => {
    render(<UserTestComponent userID="a-user" />);
    await waitFor(
      () => screen.getByTestId(TID_USER_VALUE) && requestsMade.length === 1,
    );

    expect(requestsMade).toEqual([]);

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

    expect(requestsMade).toEqual([]);

    await userEvent.click(screen.getByTestId(TID_PARTIAL_UPDATE_USER_HOOK));

    await VerifyInitializeForUserWithRender(
      'a-user-partial-update-via-useUpdateUser',
    );
  });
});
