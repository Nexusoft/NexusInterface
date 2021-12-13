// External
import { useSelector } from 'react-redux';

// Internal
import SegmentedAddress from './SegmentedAddress';
import TruncateMiddleAddress from './TruncateMiddleAddress';
import RawAddress from './RawAddress';

export default function NexusAddress() {
  const addressStyle = useSelector((state) => state.settings.addressStyle);

  switch (addressStyle) {
    case 'raw':
      return <RawAddress {...rest} />;
    case 'truncateMiddle':
      return <TruncateMiddleAddress {...rest} />;
    default:
      return <SegmentedAddress {...rest} />;
  }
}
