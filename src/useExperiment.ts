import type { ConfigResult } from './useConfig';
import useConfig from './useConfig';

export default function (experimentName: string): ConfigResult {
  return useConfig(experimentName);
}
