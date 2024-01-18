/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import StatsigJS from 'statsig-js';
import { Statsig, StatsigProvider, useConfig } from '..';
import * as TestInitializeData from './single_gate_init_response.json';
import { StatsigLazyLoader } from '../StatsigLazyLoader';

StatsigJS.encodeIntializeCall = false;

let renderedUserIDs: string[] = [];

function TestComponent() {
  const { config } = useConfig('a_config');

  const userID = config?.get('result', 'not-found') as string;
  renderedUserIDs.push(userID);

  return <div>{userID}</div>;
}

function createResponseFromExtractedUserID(userID: unknown) {
  return {
    ...TestInitializeData,
    ...{
      dynamic_configs: {
        a_config: {
          name: 'a_config',
          value: {
            result: userID,
          },
          rule_id: 'a_rule_id',
          group: 'a_group',
          is_device_based: false,
          secondary_exposures: [],
        },
      },
    },
  };
}

describe('Caching and Updating Users', () => {
  (global as any).fetch = jest.fn((_url, request) => {
    const response = createResponseFromExtractedUserID(
      JSON.parse(request.body).user.userID,
    );

    return Promise.resolve({
      ok: true,
      status: 200,
      text: () => JSON.stringify(response),
    });
  });

  beforeAll(async () => {
    await StatsigLazyLoader.loadModule();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (Statsig as any).instance = null;
    renderedUserIDs = [];
  });

  it('waits for cache and updates users', async () => {
    render(
      <StatsigProvider
        sdkKey="client-dummy-key"
        user={{ userID: 'a-user' }}
        waitForCache={true}
      >
        <TestComponent />
      </StatsigProvider>,
    );

    render(
      <StatsigProvider
        sdkKey="client-dummy-key"
        user={{ userID: 'b-user' }}
        waitForCache={true}
      >
        <TestComponent />
      </StatsigProvider>,
    );

    await waitFor(() => screen.getByText('b-user'));

    expect(renderedUserIDs).toEqual([
      'not-found', // cache loaded for a-user, no result
      'not-found', // cache loaded for b-user, no result
      'b-user', // network loaded for b-user
    ]);
  });
});
