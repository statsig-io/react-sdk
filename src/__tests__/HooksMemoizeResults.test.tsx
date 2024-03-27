/**
 * @jest-environment jsdom
 */

import React, { useState, useEffect } from 'react';
import { render, act, waitFor } from '@testing-library/react';
import { 
  StatsigProvider,
  useGate,
  useConfig,
  useExperiment,
  useLayer,
  GateResult,
  ConfigResult,
  LayerResult
} from '..';

const TID_RERENDER = 'rerender';

interface HookReferences {
  gate: GateResult;
  config: ConfigResult;
  experiment: ConfigResult;
  layer: LayerResult;
}

interface UseAllHooksComponentProps {
  gateName: string;
  configName: string;
  experimentName: string;
  layerName: string;
  onRender: (hookRefs: HookReferences) => void;
}

const UseAllHooksComponent: React.FC<UseAllHooksComponentProps> = ({ gateName, configName, experimentName, onRender }) => {
  const gate = useGate(gateName);
  const config = useConfig(configName);
  const experiment = useExperiment(experimentName);
  const layer = useLayer(experimentName);
  const [trigger, setTrigger] = useState(0);

  // Pass the references back on every render
  useEffect(() => {
    onRender({ gate, config, experiment, layer });
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
          layerName="test_layer"
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

    // we dont want to rerender the provider, because that would actually cause
    // the memoization to break.  So just rerender the sub component
    const rerender = await waitFor(() => getByTestId(TID_RERENDER));

    act(() => {
      rerender.click();
    });

    await waitFor(() => getByTestId(TID_RERENDER));

    // Gate is just a boolean, so the "reference" comparison doesnt apply
    expect(refs.after?.gate).toEqual(refs.before?.gate);

    expect(refs.after?.config.config).toBe(refs.before?.config.config);
    expect(refs.after?.experiment.config).toBe(refs.before?.experiment.config);
    expect(refs.after?.layer.layer).toBe(refs.before?.layer.layer);
  });
});
