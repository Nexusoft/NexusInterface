// External
import { useSelector } from 'react-redux';

// Internal
import SegmentedAddress from './SegmentedAddress';
import TruncateMiddleAddress from './TruncateMiddleAddress';
import RawAddress from './RawAddress';

export default function NexusAddress(props) {
  const addressStyle = useSelector((state) => state.settings.addressStyle);

  switch (addressStyle) {
    case 'raw':
      return <RawAddress {...props} />;
    case 'truncateMiddle':
      return <TruncateMiddleAddress {...props} />;
    default:
      return <SegmentedAddress {...props} />;
  }
}
