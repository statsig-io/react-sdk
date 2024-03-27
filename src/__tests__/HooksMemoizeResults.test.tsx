/**
 * @jest-environment jsdom
 */

import React, { useState, useEffect } from 'react';
import { render, act, waitFor } from '@testing-library/react';
import { StatsigProvider, useGate, useConfig, useExperiment, GateResult, ConfigResult } from '..';

const TID_RERENDER = 'rerender';

interface HookReferences {
  gate: GateResult;
  config: ConfigResult;
  experiment: ConfigResult;
}

interface UseAllHooksComponentProps {
  gateName: string;
  configName: string;
  experimentName: string;
  onRender: (hookRefs: HookReferences) => void;
}

const UseAllHooksComponent: React.FC<UseAllHooksComponentProps> = ({ gateName, configName, experimentName, onRender }) => {
  const gate = useGate(gateName);
  const config = useConfig(configName);
  const experiment = useExperiment(experimentName);
  const [trigger, setTrigger] = useState(0);

  // Pass the references back on every render
  useEffect(() => {
    onRender({ gate, config, experiment });
  }, [gate, config, experiment, onRender]);

  return (
    <div>
      <button
        onClick={() => setTrigger(trigger + 1)}
        data-testid={TID_RERENDER}>
          Re-render
      </button>
    </div>
  );
};

describe('useGate, useConfig, and useExperiment hooks memoization test', () => {
  test('Objects returned from hooks are memoized', async () => {
    const refs: { before?: HookReferences, after?: HookReferences } = {};

    const { getByTestId } = render(
      <StatsigProvider sdkKey="client-dummy-key" user={{}} waitForInitialization={true}>
        <UseAllHooksComponent 
          gateName="test_gate"
          configName="test_config"
          experimentName="test_experiment"
          onRender={(hookRefs) => {
            // Capture before and after references
            if (!refs.before) {
              refs.before = hookRefs;
            } else {
              refs.after = hookRefs;
            }
          }}
        />
      </StatsigProvider>,
    );

    const rerender = await waitFor(() => getByTestId(TID_RERENDER));

    act(() => {
      rerender.click();
    });

    await waitFor(() => getByTestId(TID_RERENDER));

    expect(refs.after?.gate).toBe(refs.before?.gate);
    expect(refs.after?.config.config).toBe(refs.before?.config.config);
    expect(refs.after?.experiment.config).toBe(refs.before?.experiment.config);
  });
});
