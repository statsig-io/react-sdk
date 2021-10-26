/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render } from '@testing-library/react';
import { StatsigProvider, useGate } from '..';
import { act } from 'react-dom/test-utils';
import { StatsigClient } from 'statsig-js';

const GateComponent = function (props: { gateName: string }): JSX.Element {
  const gate = useGate(props.gateName);
  if (gate.value) {
    return <div>ON</div>;
  }
  return <div>OFF</div>;
};

describe('Tests the StatsigProvider with mocked network responses', () => {
  const mGetRandomValues = jest.fn().mockReturnValueOnce(new Uint32Array(16));
  Object.defineProperty(window, 'crypto', {
    value: { getRandomValues: mGetRandomValues },
  });

  let initialized = false;
  jest.useFakeTimers();

  jest
    .spyOn(StatsigClient.prototype, 'initializeAsync')
    .mockImplementation(() => {
      return new Promise((resolve) => {
        setTimeout(() => {
          initialized = true;
          resolve();
        }, 2000);
      });
    });

  jest
    .spyOn(StatsigClient.prototype, 'checkGate')
    .mockImplementation((gate: string) => initialized);

  test('Verify not waiting for init renders immediately', async () => {
    const { getByText } = render(
      <StatsigProvider
        sdkKey="client-dummy-key"
        user={{}}
        waitForInitialization={false}
      >
        <GateComponent gateName={'always_on_gate'} />
      </StatsigProvider>,
    );
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(() => getByText(/OFF/)).not.toThrow();

    await act(async () => {
      jest.advanceTimersByTime(3000);
    });
    expect(() => getByText(/ON/)).not.toThrow();
  });
});
