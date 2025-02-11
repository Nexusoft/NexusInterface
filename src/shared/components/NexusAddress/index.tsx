// External
import { useAtomValue } from 'jotai';

// Internal
import { settingsAtom } from 'lib/settings';
import SegmentedAddress from './SegmentedAddress';
import TruncateMiddleAddress from './TruncateMiddleAddress';
import RawAddress from './RawAddress';
import { HTMLAttributes, ReactNode } from 'react';

export type NexusAddressType = 'segmented' | 'truncateMiddle' | 'raw';

export interface NexusAddressProps extends HTMLAttributes<HTMLDivElement> {
  type?: NexusAddressType;
  address: string;
  label?: ReactNode;
  copyable?: boolean;
}

export default function NexusAddress({ type, ...rest }: NexusAddressProps) {
  const { addressStyle } = useAtomValue(settingsAtom);

  switch (type || addressStyle) {
    case 'raw':
      return <RawAddress {...rest} />;
    case 'truncateMiddle':
      return <TruncateMiddleAddress {...rest} />;
    default:
      return <SegmentedAddress {...rest} />;
  }
}
