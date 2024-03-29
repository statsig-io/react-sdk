import { StatsigClient } from "statsig-js";
import Statsig from "../Statsig";
import { act } from "react-dom/test-utils";

let logEventSpy: jest.SpyInstance<void, [eventName: string, value?: string | number | null, metadata?: Record<string, string> | null]>;

describe('Event Queueing in Statsig before SDK Initialization', () => {

  beforeEach(() => {
    (Statsig as any).instance = undefined;
    jest.clearAllMocks();
    jest.clearAllTimers();

    logEventSpy = jest
      .spyOn(StatsigClient.prototype, 'logEvent')
      .mockImplementation((eventName, value, metadata) => {
        console.log(`Event logged: ${eventName}`, value, metadata);
      });
  });

  afterEach(() => {
    Statsig.shutdown();
  });

  test('Events are queued and logged after SDK initialization', async () => {
    Statsig.logEvent('event_before_init_1', 'value1', { key: 'meta1' });
    Statsig.logEvent('event_before_init_2', 'value2', { key: 'meta2' });

    expect(logEventSpy).not.toHaveBeenCalled();

    await act(async () => {
      Statsig.initialize('client-dummy-key', {}, {});
    });

    expect(logEventSpy).toHaveBeenCalledTimes(2);
    expect(logEventSpy).toHaveBeenCalledWith('event_before_init_1', 'value1', { key: 'meta1' });
    expect(logEventSpy).toHaveBeenCalledWith('event_before_init_2', 'value2', { key: 'meta2' });
  });

  test('Events are queued up to a limit and logged after SDK initialization', async () => {
    for (let i = 1; i <= 25; i++) {
      Statsig.logEvent(`event_before_init_${i}`, `value${i}`, { key: `meta${i}` });
    }

    expect(logEventSpy).not.toHaveBeenCalled();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    expect(Statsig.eventQueue).toHaveLength(20);

    await act(async () => {
      Statsig.initialize('client-dummy-key', {}, {});
    });

    expect(logEventSpy).toHaveBeenCalledTimes(20);

    // started dropping at the limit
    expect(logEventSpy.mock.calls[19][0]).toBe('event_before_init_20');
  });
});
