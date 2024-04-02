/**
 * @jest-environment jsdom
 */
import React, { useEffect } from 'react';
import { act, render } from '@testing-library/react';
import StatsigSynchronousProvider from '../StatsigSynchronousProvider';
import { useConfig } from '..';

import * as TestInitializeData from './bootstrapped_values.json';

const TID_RERENDER = 'rerender';

interface HookReferences {
  config: any;
}

interface TestComponentProps {
  onRender: (hookRefs: HookReferences) => void;
}
const TestComponent: React.FC<TestComponentProps> = ({ onRender }) => {
  const config = useConfig('usera_config');

  useEffect(() => {
    onRender({ config });
  }, [config, onRender]);

  return <div data-testid={TID_RERENDER}>Test Content</div>;
};

describe('Config not memoized on initializeValues change', () => {
  it('should provide different config references when initializeValues change', async () => {
    const refs: { first?: HookReferences; second?: HookReferences } = {};

    const { getByTestId, rerender } = render(
      <StatsigSynchronousProvider
        sdkKey="client-sdk-key"
        user={{ userID: 'test-user' }}
        initializeValues={TestInitializeData}
      >
        <TestComponent
          onRender={(hookRefs) => {
            if (!refs.first) {
              refs.first = hookRefs;
            }
          }}
        />
      </StatsigSynchronousProvider>,
    );

    
    TestInitializeData.dynamic_configs["2069983659"].value = {test: 123}
    act(() => {
      rerender(
        <StatsigSynchronousProvider
          sdkKey="client-sdk-key"
          user={{ userID: 'test-user' }}
          initializeValues={TestInitializeData}
        >
          <TestComponent
            onRender={(hookRefs) => {
              if (refs.first && !refs.second) {
                refs.second = hookRefs;
              }
            }}
          />
        </StatsigSynchronousProvider>,
      );
    });

    await act(async () => {
      getByTestId(TID_RERENDER).click();
    });

    expect(refs.first?.config.config).not.toBe(refs.second?.config.config);
  });
});
