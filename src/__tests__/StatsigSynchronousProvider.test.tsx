/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { useState } from 'react';
import StatsigJS, { StatsigUser } from 'statsig-js';
import Statsig from '../Statsig';
import StatsigSynchronousProvider from '../StatsigSynchronousProvider';
import { useConfig, useGate } from '../index';
import useUpdateUser from '../useUpdateUser';
import LocalStorageMock from './LocalStorageMock';
import * as TestBootstrapData from './initialize_response.json';
import * as TestInitializeData from './other_initialize_response.json';
import * as UpdatedInitializeData from './updated_initialize_values.json';

const TID_USER_VALUE = 'statsig-user-object';
const TID_SET_USER_STATE = 'update-via-set-state';
const TID_UPDATE_USER_HOOK = 'update-via-hook';
const TID_PARTIAL_UPDATE_USER_HOOK = 'partial-update-via-hook';
const TID_GATE_VALUE = 'gate-value';
const TID_CONFIG_NAME = 'config-name';
const TID_CONFIG_VAL = 'config-val';
const TID_UPDATE_INITIALIZE_VALUES = 'update-initialize-values';

StatsigJS.encodeIntializeCall = false;
let initTime = 0;
let initCallbacks = 0;

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
  const [initializeValues, setInitializeValues] =
    useState<Record<string, unknown>>(TestBootstrapData);

  return (
    <StatsigSynchronousProvider
      sdkKey="client-sdk-key"
      user={user}
      setUser={props.excludeSetUserFunc === true ? undefined : setUser}
      options={{
        disableDiagnosticsLogging: true,
        initCompletionCallback: (duration) => {
          initTime = duration;
          initCallbacks++;
        },
        overrideStableID: 'override-stable-id',
      }}
      initializeValues={initializeValues}
    >
      <div data-testid={TID_USER_VALUE}>{user.userID}</div>

      <button
        onClick={() =>
          setUser({ userID: props.userID + '-update-via-useState' })
        }
        data-testid={TID_SET_USER_STATE}
      />

      <button
        onClick={() => {
          setInitializeValues(UpdatedInitializeData);
        }}
        data-testid={TID_UPDATE_INITIALIZE_VALUES}
      />

      <UpdateUserHookTestComponent userID={props.userID} />
    </StatsigSynchronousProvider>
  );
}

describe('StatsigSynchronousProvider', () => {
  let requestsMade: {
    url: RequestInfo | URL;
    body: Record<string, unknown>;
  }[] = [];

  let localStorage = new LocalStorageMock();

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
          json: () => TestInitializeData,
        });
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        text: () => JSON.stringify({}),
      });
    }
  });

  let setTimeout = jest.spyOn(global, 'setTimeout');

  beforeEach(() => {
    requestsMade = [];
    initTime = 0;
    initCallbacks = 0;
    localStorage = new LocalStorageMock();
    setTimeout = jest.spyOn(global, 'setTimeout');
    Object.defineProperty(window, 'localStorage', {
      value: localStorage,
    });

    (Statsig as any).instance = null;

    render(<UserTestComponent userID="a-user" />);
  });

  it('renders children', async () => {
    expect.assertions(9);

    const spyOnSet = jest.spyOn(localStorage, 'setItem');
    const spyOnGet = jest.spyOn(localStorage, 'getItem');

    const child = await waitFor(() => screen.getByTestId(TID_USER_VALUE));
    expect(child).toHaveTextContent('a-user');

    const gate = screen.getByTestId(TID_GATE_VALUE);
    expect(gate).toHaveTextContent('OFF');

    expect(initTime).toBeGreaterThan(0);
    expect(initTime).toBeLessThan(100);
    expect(initCallbacks).toEqual(1);
    expect(requestsMade).toEqual([]);
    expect(spyOnSet).toHaveBeenCalledTimes(0);
    expect(spyOnGet).toHaveBeenCalledTimes(0);
    expect(setTimeout).toHaveBeenCalledWith(expect.anything(), 20);
  });

  it('calls updateUser when user object changes', async () => {
    expect.assertions(10);

    await waitFor(() => screen.getByTestId(TID_USER_VALUE));
    expect(requestsMade.length).toEqual(0);
    expect(initCallbacks).toEqual(1);

    requestsMade = [];

    const gate = screen.getByTestId(TID_GATE_VALUE);
    const configVal = screen.getByTestId(TID_CONFIG_VAL);
    const configPos = screen.getByTestId(TID_CONFIG_NAME);
    expect(gate).toHaveTextContent('OFF');
    expect(configVal).toHaveTextContent('17');
    expect(configPos).toHaveTextContent('default');

    await userEvent.click(screen.getByTestId(TID_SET_USER_STATE));

    await VerifyInitializeForUserWithRender('a-user-update-via-useState');
    expect(initCallbacks).toEqual(1);
    expect(gate).toHaveTextContent('ON');
    expect(configVal).toHaveTextContent('12');
    expect(configPos).toHaveTextContent('jet');
  });

  it('Updates values when initializeValues change', async () => {
    await waitFor(() => screen.getByTestId(TID_USER_VALUE));
    expect(requestsMade.length).toEqual(0);
    expect(initCallbacks).toEqual(1);
    requestsMade = [];

    const gate = screen.getByTestId(TID_GATE_VALUE);
    const configVal = screen.getByTestId(TID_CONFIG_VAL);
    const configPos = screen.getByTestId(TID_CONFIG_NAME);
    expect(gate).toHaveTextContent('OFF');
    expect(configVal).toHaveTextContent('17');
    expect(configPos).toHaveTextContent('default');

    await userEvent.click(screen.getByTestId(TID_UPDATE_INITIALIZE_VALUES));
    await waitFor(() => screen.getByText('a-user'));
    expect(initCallbacks).toEqual(1);

    expect(gate).toHaveTextContent('OFF');
    expect(configVal).toHaveTextContent('4');
    expect(configPos).toHaveTextContent('viking');
  });

  it('updates the user via the useUpdateUser hook', async () => {
    await waitFor(() => screen.getByTestId(TID_USER_VALUE));
    const gate = screen.getByTestId(TID_GATE_VALUE);
    const configVal = screen.getByTestId(TID_CONFIG_VAL);
    const configPos = screen.getByTestId(TID_CONFIG_NAME);
    expect(gate).toHaveTextContent('OFF');
    expect(configVal).toHaveTextContent('17');
    expect(configPos).toHaveTextContent('default');

    expect(requestsMade).toEqual([]);

    await userEvent.click(screen.getByTestId(TID_UPDATE_USER_HOOK));

    await VerifyInitializeForUserWithRender(
      'a-user-full-update-via-useUpdateUser',
    );
    expect(gate).toHaveTextContent('ON');
    expect(configVal).toHaveTextContent('12');
    expect(configPos).toHaveTextContent('jet');
  });

  it('partially updates the user via the useUpdateUser hook', async () => {
    await waitFor(() => screen.getByTestId(TID_USER_VALUE));

    expect(requestsMade).toEqual([]);

    await userEvent.click(screen.getByTestId(TID_PARTIAL_UPDATE_USER_HOOK));

    await VerifyInitializeForUserWithRender(
      'a-user-partial-update-via-useUpdateUser',
    );
  });
});
