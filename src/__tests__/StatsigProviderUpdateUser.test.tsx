/**
 * @jest-environment jsdom
 */

import React, { useEffect, useCallback, useState, useMemo } from 'react';
import { render } from '@testing-library/react';
import { StatsigProvider, useGate, StatsigUser } from '..';
import { act } from 'react-dom/test-utils';
import { StatsigClient } from 'statsig-js';

describe('Tests the StatsigProvider with an updated user', () => {
  const mGetRandomValues = jest.fn().mockReturnValueOnce(new Uint32Array(16));
  Object.defineProperty(window, 'crypto', {
    value: { getRandomValues: mGetRandomValues },
  });

  let initialized = false;
  let updatedUser = false;
  let initStarted = false;
  jest.useFakeTimers();

  jest
    .spyOn(StatsigClient.prototype, 'initializeAsync')
    .mockImplementation(() => {
      initStarted = true;
      return new Promise((resolve) => {
        setTimeout(() => {
          initialized = true;
          resolve();
        }, 2000);
      });
    });

  jest
    .spyOn(StatsigClient.prototype, 'initializeCalled')
    .mockImplementation(() => initStarted);

  jest.spyOn(StatsigClient.prototype, 'updateUser').mockImplementation(() => {
    return new Promise((resolve) => {
      setTimeout(() => {
        updatedUser = true;
        resolve(true);
      }, 2000);
    });
  });

  jest
    .spyOn(StatsigClient.prototype, 'checkGate')
    .mockImplementation((gate: string) => initialized && updatedUser);

  const GateComponent = function (props: {
    gateName: string;
    updateUser: (StatsigUser: any) => void;
  }): JSX.Element {
    const gate = useGate(props.gateName);
    const cb = useCallback(() => {
      setTimeout(() => {
        props.updateUser({
          userID: '123',
        });
      }, 2000);
    }, [props.updateUser]);
    useEffect(() => {
      setTimeout(() => {
        props.updateUser({
          userID: '123',
        });
      }, 2000);
    }, [cb]);
    if (gate.value) {
      return <div>ON</div>;
    }
    return <div>OFF</div>;
  };

  const TestApp = function (): JSX.Element {
    const [user, updateUser] = useState({});
    return (
      <StatsigProvider
        sdkKey="client-dummy-key"
        user={user}
        waitForInitialization={true}
      >
        <GateComponent gateName={'always_on_gate'} updateUser={updateUser} />
      </StatsigProvider>
    );
  };

  test('Verify waitForInitialization renders nothing then children after init', async () => {
    const { getByText } = render(<TestApp />);
    // TIMELINE
    // 0 -> Provider renders with waitForInitialization=true, gates shouldnt even be checked
    // 2000 -> Initialize resolves(), child component renders, gates return false
    // 4000 -> Child component triggers updateUser()
    // 6000 -> updateUser() resolves, gates pass now
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    // Still waiting for initialization
    expect(() => getByText(/OFF/)).toThrow();

    await act(async () => {
      jest.advanceTimersByTime(2000);
    });
    // Initialized, but user hasn't updated yet
    expect(() => getByText(/OFF/)).not.toThrow();

    // Update user is in progress
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });
    expect(() => getByText(/OFF/)).toThrow();
    expect(() => getByText(/ON/)).toThrow();

    // Update user complete, gate should be on now
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });
    expect(() => getByText(/ON/)).not.toThrow();
    expect(() => getByText(/OFF/)).toThrow();

    await act(async () => {
      jest.advanceTimersByTime(2000);
    });
  });
});
