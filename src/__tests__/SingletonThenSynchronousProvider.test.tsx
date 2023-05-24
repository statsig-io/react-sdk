/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { useEffect, useState } from 'react';
import StatsigJS, { StatsigClient, StatsigUser } from 'statsig-js';
import StatsigSynchronousProvider from '../StatsigSynchronousProvider';
import Statsig from '../Statsig';
import useUpdateUser from '../useUpdateUser';
import * as TestBootstrapData from './initialize_response.json';
import { useGate, useConfig } from '../index';
import * as TestInitializeData from './other_initialize_response.json';

StatsigJS.encodeIntializeCall = false;

let initCallbacks = 0;
let updateUserCallbacks = 0;

const TID_USER_VALUE = 'statsig-user-object';
const TID_SET_USER_STATE = 'update-via-set-state';
const TID_UPDATE_USER_HOOK = 'update-via-hook';
const TID_PARTIAL_UPDATE_USER_HOOK = 'partial-update-via-hook';
const TID_GATE_VALUE = 'gate-value';
const TID_CONFIG_NAME = 'config-name';
const TID_CONFIG_VAL = 'config-val';

function UpdateUserHookTestComponent(props: { userID: string }) {
  const updateUser = useUpdateUser();
  const gate = useGate('on_for_usera_update');
  const config = useConfig('usera_config').config;

  return (
    <>
      <div data-testid={TID_GATE_VALUE}>{gate.value ? 'ON' : 'OFF'}</div>
      <div data-testid={TID_CONFIG_VAL}>{config.get('val', 17)}</div>
      <div data-testid={TID_CONFIG_NAME}>{config.get('name', 'default')}</div>
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
  const [initialized, setInitialized] = useState(false);
  const [initializeValues] =
    useState<Record<string, unknown>>(TestBootstrapData);
  useEffect(() => {
    Statsig.initialize('client-sdk-key', user, {
      disableDiagnosticsLogging: true,
      initCompletionCallback: () => {
        initCallbacks++;
      },
    }).then(() => {
      setInitialized(true);
    });
  }, []);

  if (!initialized) {
    return <div>Initialize Singleton</div>;
  }

  return (
    <StatsigSynchronousProvider
      sdkKey="client-sdk-key'"
      user={user}
      setUser={props.excludeSetUserFunc === true ? undefined : setUser}
      initializeValues={initializeValues}
      options={{
        disableDiagnosticsLogging: true,
        initCompletionCallback: () => {
          initCallbacks++;
        },
        updateUserCompletionCallback: () => {
          updateUserCallbacks++;
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
    </StatsigSynchronousProvider>
  );
}

describe('Singleton then StatsigSynchronousProvider', () => {
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

  (global as any).fetch = jest.fn((url, params) => {
    const body = String(params?.body ?? '{}');
    const reqBody = JSON.parse(body);
    if (String(url).includes('initialize')) {
      requestsMade.push({ url, body: reqBody });
      const user = reqBody.user;
      if (
        user.userID === 'a-user-update-via-useState' ||
        user.userID === 'a-user-partial-update-via-useUpdateUser' ||
        user.userID === 'a-user-full-update-via-useUpdateUser'
      ) {
        return Promise.resolve({
          ok: true,
          status: 200,
          text: () => JSON.stringify(TestInitializeData),
        });
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        text: () => JSON.stringify({}),
      });
    }
  });
  beforeEach(() => {
    requestsMade = [];
    initCallbacks = 0;
    updateUserCallbacks = 0;

    (Statsig as any).instance = null;
  });

  it('renders children', async () => {
    const updateUserSpy = jest.spyOn(StatsigClient.prototype, 'updateUser');
    render(<UserTestComponent userID="a-user" />);
    requestsMade = [];
    const child = await waitFor(() => screen.getByTestId(TID_USER_VALUE));
    expect(child).toHaveTextContent('a-user');
    expect(initCallbacks).toEqual(1);

    const gate = screen.getByTestId(TID_GATE_VALUE);
    const configVal = screen.getByTestId(TID_CONFIG_VAL);
    const configPos = screen.getByTestId(TID_CONFIG_NAME);
    expect(gate).toHaveTextContent('OFF');
    expect(configVal).toHaveTextContent('17');
    expect(configPos).toHaveTextContent('default');
    expect(requestsMade).toEqual([]);
    expect(updateUserSpy).not.toHaveBeenCalled();
    expect(updateUserCallbacks).toEqual(0);

    await userEvent.click(screen.getByTestId(TID_SET_USER_STATE));

    await VerifyInitializeForUserWithRender('a-user-update-via-useState');
    expect(initCallbacks).toEqual(1);
    expect(updateUserSpy).toHaveBeenCalled();
    expect(gate).toHaveTextContent('ON');
    expect(configVal).toHaveTextContent('12');
    expect(configPos).toHaveTextContent('jet');
    expect(updateUserCallbacks).toEqual(0);
  });
});
