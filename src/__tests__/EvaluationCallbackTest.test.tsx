/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';

import * as TestBootstrapData from './initialize_response.json';

import React, { useState } from 'react';
import StatsigJS, { StatsigUser } from 'statsig-js';
import { render, screen, waitFor } from '@testing-library/react';
import { useConfig, useExperiment, useGate, useLayer } from '../index';

import LocalStorageMock from './LocalStorageMock';
import Statsig from '../Statsig';
import StatsigSynchronousProvider from '../StatsigSynchronousProvider';

const TID_USER_VALUE = 'statsig-user-object';
const TID_CHECK_GATE_VALUE = 'check-gate-value';
const TID_CHECK_CONFIG_VALUE = 'check-config-value';
const TID_CHECK_EXP_VALUE = 'check-exp-value';
const TID_CHECK_LAYER_VALUE = 'check-layer-value'; 
const TID_GATE_VALUE = 'gate-value';
const TID_CONFIG_NAME = 'config-name';
const TID_CONFIG_VAL = 'config-val';

StatsigJS.encodeIntializeCall = false;

function CheckConfigsHookTestComponent() {
  const gate = useGate('on_for_usera_update');
  const config = useConfig('usera_config').config;
  useExperiment('usera_exp').config;
  useLayer('usera_layer').layer;

  return (
    <>
      <div data-testid={TID_GATE_VALUE}>{gate.value ? 'ON' : 'OFF'}</div>
      <div data-testid={TID_CONFIG_VAL}>{config.get('val', 17)}</div>
      <div data-testid={TID_CONFIG_NAME}>{config.get('name', 'default')}</div>
    </>
  );
}

function UserTestComponent(props: {
  userID: string;
  excludeSetUserFunc?: boolean;
}) {
  const [user, setUser] = useState<StatsigUser>({ userID: props.userID });
  const [gateChecked, setGateChecked] = useState('');
  const [configChecked, setConfigChecked] = useState('');
  const [expChecked, setExpChecked] = useState('');
  const [layerChecked, setLayerChecked] = useState('');
  
  return (
    <StatsigSynchronousProvider
      sdkKey="client-sdk-key"
      user={user}
      setUser={props.excludeSetUserFunc === true ? undefined : setUser}
      options={{
        disableDiagnosticsLogging: true,
        overrideStableID: 'override-stable-id',
        evaluationCallback: (args) => {
            if (args.type === 'gate') {
                setGateChecked(args.gate.getName());
            }
            if (args.type === 'config') {
                setConfigChecked(args.config.getName());
            }
            if (args.type === 'experiment') {
                setExpChecked(args.config.getName());
            }
            if (args.type === 'layer') {
                setLayerChecked(args.layer.getName());
            }
        }
      }}
      initializeValues={TestBootstrapData}
    >
      <div data-testid={TID_USER_VALUE}>{user.userID}</div>
      <div data-testid={TID_CHECK_GATE_VALUE}>{gateChecked}</div>
      <div data-testid={TID_CHECK_CONFIG_VALUE}>{configChecked}</div>
      <div data-testid={TID_CHECK_EXP_VALUE}>{expChecked}</div>
      <div data-testid={TID_CHECK_LAYER_VALUE}>{layerChecked}</div>

      <CheckConfigsHookTestComponent />
    </StatsigSynchronousProvider>
  );
}

describe('Evaluation Callback', () => {
  let localStorage = new LocalStorageMock();

  beforeEach(() => {
    localStorage = new LocalStorageMock();
    Object.defineProperty(window, 'localStorage', {
      value: localStorage,
    });

    (Statsig as any).instance = null;

    render(<UserTestComponent userID="a-user" />);
  });

  it('renders children', async () => {
    const child = await waitFor(() => screen.getByTestId(TID_USER_VALUE));
    expect(child).toHaveTextContent('a-user');

    const gateChecked = screen.getByTestId(TID_CHECK_GATE_VALUE);
    expect(gateChecked).toHaveTextContent('on_for_usera_update');

    const configChecked = screen.getByTestId(TID_CHECK_CONFIG_VALUE);
    expect(configChecked).toHaveTextContent('usera_config');

    const expChecked = screen.getByTestId(TID_CHECK_EXP_VALUE);
    expect(expChecked).toHaveTextContent('usera_exp');

    const layerChecked = screen.getByTestId(TID_CHECK_LAYER_VALUE);
    expect(layerChecked).toHaveTextContent('usera_layer');
  });
});
