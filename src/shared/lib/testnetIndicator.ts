import { useAtomValue } from 'jotai';

import { useCoreInfo } from 'lib/coreInfo';
import { settingsAtom } from 'lib/settings';

export type TestnetIndicator = 'tag' | 'color' | 'banner' | 'icon';

export const testnetColor = '#f0932b';

/** Which testnet signals to show; nothing is shown on mainnet */
export function useTestnetIndicator() {
  const coreInfo = useCoreInfo();
  const { testnetIndicator } = useAtomValue(settingsAtom);
  const testnet = !!coreInfo?.testnet;
  const label = coreInfo?.private
    ? __('Private testnet %{number}', { number: coreInfo?.testnet })
    : __('Testnet %{number}', { number: coreInfo?.testnet });
  return {
    testnet,
    label,
    show: (kind: TestnetIndicator) =>
      testnet && (testnetIndicator || []).includes(kind),
  };
}
