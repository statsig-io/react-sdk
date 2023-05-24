/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render } from '@testing-library/react';
import { StatsigProvider, useGate, Statsig } from '..';
import { act } from 'react-dom/test-utils';
import { EvaluationReason, StatsigClient } from 'statsig-js';

const GateComponent = function (props: { gateName: string }): JSX.Element {
  const gate = useGate(props.gateName);
  expect(Statsig.getEvaluationDetails()).toEqual({
    reason: EvaluationReason.Network,
    time: 1,
  });
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
  let initStarted = false;
  jest.useFakeTimers();

  jest
    .spyOn(StatsigClient.prototype, 'initializeAsync')
    .mockImplementation(() => {
      initStarted = true;
      return new Promise((resolve) => {
        setTimeout(() => {
          initialized = true;
          jest
            .spyOn(StatsigClient.prototype, 'getEvaluationDetails')
            .mockReturnValue({
              reason: EvaluationReason.Network,
              time: 1,
            });
          resolve();
        }, 2000);
      });
    });

  jest
    .spyOn(StatsigClient.prototype, 'initializeCalled')
    .mockImplementation(() => initStarted);

  jest
    .spyOn(StatsigClient.prototype, 'checkGate')
    .mockImplementation(() => initialized);

  test('Verify waitForInitialization renders nothing then children after init', async () => {
    expect(Statsig.getEvaluationDetails()).toEqual({
      reason: EvaluationReason.Uninitialized,
      time: 0,
    });
    const { getByText } = render(
      <StatsigProvider
        sdkKey="client-dummy-key"
        user={{}}
        waitForInitialization={true}
      >
        <GateComponent gateName={'always_on_gate'} />
      </StatsigProvider>,
    );
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(() => getByText(/ON/)).toThrow();

    await act(async () => {
      jest.advanceTimersByTime(3000);
    });
    expect(() => getByText(/ON/)).not.toThrow();
  });
});
