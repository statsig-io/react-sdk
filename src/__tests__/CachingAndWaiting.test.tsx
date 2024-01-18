/**
 * @jest-environment jsdom
 */

import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { Statsig, StatsigProvider, useGate } from '..';
import * as TestInitializeData from './single_gate_init_response.json';
import { StatsigLazyLoader } from '../StatsigLazyLoader';

let checkResults: boolean[] = [];

function GateComponent() {
  const gate = useGate('a_gate');
  checkResults.push(gate.value);
  return <div>GateValue: {String(gate.value)}</div>;
}

describe('Caching and Waiting', () => {
  (global as any).fetch = jest.fn(() => {
    return Promise.resolve({
      ok: true,
      status: 200,
      text: () => JSON.stringify(TestInitializeData),
    });
  });

  beforeAll(async () => {
    await StatsigLazyLoader.loadModule();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (Statsig as any).instance = null;
    checkResults = [];
  });

  test.each([
    {
      description: 'no waiting and there is no cached value',
      waitForCache: false,
      cacheValue: null,
      expectedRenders: [
        false, // default
        false, // cache
        true, // network
      ],
    },
    {
      description: 'no waiting and there is a valid cached value',
      waitForCache: false,
      cacheValue: { '-2125313653': TestInitializeData },
      expectedRenders: [
        false, // default
        true, // cache
        true, // network
      ],
    },
    {
      description: 'wait for cache but no cached value is found',
      waitForCache: true,
      cacheValue: null,
      expectedRenders: [
        false, // cache
        true, // network
      ],
    },
    {
      description: 'wait for cache and there is a valid cached value',
      waitForCache: true,
      cacheValue: { '-2125313653': TestInitializeData },
      expectedRenders: [
        true, // cache
        true, // network
      ],
    },
    {
      description: 'wait for network and no cached value is found',
      waitForInitialization: true,
      cacheValue: null,
      expectedRenders: [
        true, // network
      ],
    },
    {
      description: 'wait for cache and there is a valid cached value',
      waitForInitialization: true,
      cacheValue: { '-2125313653': TestInitializeData },
      expectedRenders: [
        true, // network
      ],
    },
  ])('$description', async (args) => {
    const { waitForCache, waitForInitialization, cacheValue, expectedRenders } =
      args;

    mockLocalStorageWithValue(cacheValue);

    render(
      <StatsigProvider
        sdkKey="client-dummy-key"
        user={{ userID: 'a-user' }}
        waitForCache={waitForCache === true}
        waitForInitialization={waitForInitialization === true}
      >
        <GateComponent />
      </StatsigProvider>,
    );

    await waitFor(() => screen.getByText('GateValue: true'));
    expect(checkResults).toEqual(expectedRenders);
  });
});

function mockLocalStorageWithValue(value: unknown) {
  jest.spyOn(Storage.prototype, 'getItem').mockImplementation((key: string) => {
    if (value && key == 'STATSIG_LOCAL_STORAGE_INTERNAL_STORE_V4') {
      return JSON.stringify(value);
    }

    return null;
  });
}
