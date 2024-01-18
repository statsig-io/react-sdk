/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render } from '@testing-library/react';
import { StatsigProvider, useGate, Statsig } from '..';
import { act } from 'react-dom/test-utils';
import { StatsigClient } from 'statsig-js';
import { StatsigLazyLoader } from '../StatsigLazyLoader';

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
  jest
    .spyOn(StatsigClient.prototype, 'checkGate')
    .mockImplementation(() => initialized);

  beforeAll(async () => {
    await StatsigLazyLoader.loadModule();
  });

  beforeEach(() => {
    (Statsig as any).instance = undefined;
  });

  test('Verify exceptions when calling methods before initializing', async () => {
    expect(() => {
      Statsig.checkGate('any_gate');
    }).toThrowError('Call and wait for initialize() to finish first.');

    expect(() => {
      new Statsig('client-whatever');
      new Statsig('client-whatever');
    }).toThrowError(
      'Cannot create another instance of the static Statsig class',
    );
  });

  test('Verify when process.env is undefined, it does not get referenced', async () => {
    process = {} as any;

    expect(() => {
      Statsig.checkGate('any_gate_123');
    }).toThrowError('Call and wait for initialize() to finish first.');

    expect(() => {
      new Statsig('client-whatever');
      new Statsig('client-whatever');
    }).toThrowError(
      'Cannot create another instance of the static Statsig class',
    );
  });

  test('Verify when process is undefined, it does not get referenced', async () => {
    process = undefined as any;

    expect(() => {
      Statsig.checkGate('any_gate_1234');
    }).toThrowError('Call and wait for initialize() to finish first.');

    expect(() => {
      new Statsig('client-whatever-process-undef');
      new Statsig('client-whatever-process-undef');
    }).toThrowError(
      'Cannot create another instance of the static Statsig class',
    );
  });

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

  test('Verify silent mode does not throw', async () => {
    process = { env: {} } as any;
    process.env.REACT_APP_STATSIG_SDK_MODE = 'silent';

    expect(() => {
      Statsig.checkGate('any_gate');
    }).not.toThrow();

    expect(() => {
      new Statsig('client-whatever');
    }).not.toThrow();
  });
});
