import fetchConfig from './fetchConfig';
import type { ConfigResult } from './useConfig';

export default async function (experimentName: string): Promise<ConfigResult> {
  return fetchConfig(experimentName);
}
