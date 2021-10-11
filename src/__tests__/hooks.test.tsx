/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, RenderResult } from '@testing-library/react';
import useGate from '../useGate';
import StatsigContext from '../StatsigContext';
import DynamicConfig from '../DynamicConfig';
import statsig from 'statsig-js';
import useConfig from '../useConfig';
import { useExperiment } from '..';

const waitForInitializationProvider = function (
  _children: React.ReactNode | React.ReactNode[],
): RenderResult {
  return render(
    <StatsigContext.Provider
      value={{
        initialized: false,
        statsig: undefined,
        statsigPromise: null,
      }}
    ></StatsigContext.Provider>,
  );
};

const mockProvider = function (
  ui: React.ReactNode | React.ReactNode[],
): RenderResult {
  return render(
    <StatsigContext.Provider
      value={{
        initialized: true,
        statsig: {
          initialize: (
            _sdkKey: string,
            _user?: statsig.StatsigUser | null | undefined,
            _options?: statsig.StatsigOptions | null | undefined,
          ) => {
            return new Promise(() => {
              return Promise.resolve();
            });
          },
          getExperiment: (experiment: string) => {
            return new DynamicConfig(experiment, {});
          },
          logEvent: () => {},
          checkGate: (gateName: string) => {
            if (gateName === 'always_on_gate') {
              return true;
            }
            return false;
          },
          getConfig: (config: string) => {
            if (config == 'always_on_config') {
              return new DynamicConfig(config, {
                text: 'Dynamic Text',
              });
            }
            // The react SDK useExperiment just calls useConfig
            if (config == 'always_on_experiment') {
              return new DynamicConfig(config, {
                number: 42,
              });
            }
            return new DynamicConfig(config, {});
          },
          updateUser: (_user?: statsig.StatsigUser | null | undefined) => {
            return new Promise(() => {
              return Promise.resolve();
            });
          },
          shutdown: () => {},
          overrideGate: (_gate: string, _val: boolean) => {},
          removeOverride: (_name?: string | undefined) => {},
          getOverrides: () => {
            return {};
          },
          _setDependencies: () => {},
          DynamicConfig: DynamicConfig,
        },
        statsigPromise: null,
      }}
    >
      {ui}
    </StatsigContext.Provider>,
  );
};

const GateComponent = function (props: { gateName: string }): JSX.Element {
  const gate = useGate(props.gateName);
  if (gate.value) {
    return <div>ON</div>;
  }
  return <div>OFF</div>;
};

const ConfigComponent = function (props: { configName: string }): JSX.Element {
  const config = useConfig(props.configName);
  const text = config.config.get<string>('text', 'Fallback Text');
  return <div>{text}</div>;
};

const ExperimentComponent = function (props: {
  experimentName: string;
}): JSX.Element {
  const config = useExperiment(props.experimentName);
  const num = config.config.get<number>('number', 17);
  return <div>{num}</div>;
};

test('Waiting for initialization renders nothing regardless of gate', () => {
  const { getByText } = waitForInitializationProvider(
    <GateComponent gateName={'always_on_gate'} />,
  );
  expect(() => getByText(/OFF/)).toThrow();
  expect(() => getByText(/ON/)).toThrow();
});

test('Waiting for initialization renders nothing regardless of config', () => {
  const { getByText } = waitForInitializationProvider(
    <GateComponent gateName={'always_on_config'} />,
  );
  expect(() => getByText(/Fallback Text/)).toThrow();
  expect(() => getByText(/Dynamic Text/)).toThrow();
});

test('After initialization, the gate value is on', () => {
  const { getByText } = mockProvider(
    <GateComponent gateName={'always_on_gate'} />,
  );
  expect(() => getByText(/OFF/)).toThrow();
  expect(() => getByText(/ON/)).not.toThrow();
});

test('After initialization, the gate value is off', () => {
  const { getByText } = mockProvider(
    <GateComponent gateName={'always_off_gate'} />,
  );
  expect(() => getByText(/OFF/)).not.toThrow();
  expect(() => getByText(/ON/)).toThrow();
});

test('After initialization, the config value is set', () => {
  const { getByText } = mockProvider(
    <ConfigComponent configName={'always_on_config'} />,
  );
  expect(() => getByText(/Fallback Text/)).toThrow();
  expect(() => getByText(/Dynamic Text/)).not.toThrow();
});

test('After initialization, the config default is set', () => {
  const { getByText } = mockProvider(
    <ConfigComponent configName={'always_off_config'} />,
  );
  expect(() => getByText(/Fallback Text/)).not.toThrow();
  expect(() => getByText(/Dynamic Text/)).toThrow();
});

test('After initialization, the config value is set', () => {
  const { getByText } = mockProvider(
    <ExperimentComponent experimentName={'always_on_experiment'} />,
  );
  expect(() => getByText(/42/)).not.toThrow();
  expect(() => getByText(/17/)).toThrow();
});

test('After initialization, the config default is set', () => {
  const { getByText } = mockProvider(
    <ExperimentComponent experimentName={'always_off_experiment'} />,
  );
  expect(() => getByText(/17/)).not.toThrow();
  expect(() => getByText(/42/)).toThrow();
});
