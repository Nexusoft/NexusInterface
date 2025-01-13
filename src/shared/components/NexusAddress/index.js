// External
import { useAtomValue } from 'jotai';

// Internal
import { settingAtoms } from 'lib/settings';
import SegmentedAddress from './SegmentedAddress';
import TruncateMiddleAddress from './TruncateMiddleAddress';
import RawAddress from './RawAddress';

export default function NexusAddress({ type, ...rest }) {
  const addressStyle = useAtomValue(settingAtoms.addressStyle);

  switch (type || addressStyle) {
    case 'raw':
      return <RawAddress {...rest} />;
    case 'truncateMiddle':
      return <TruncateMiddleAddress {...rest} />;
    default:
      return <SegmentedAddress {...rest} />;
  }
}
