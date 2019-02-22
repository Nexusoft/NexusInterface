// External
import React from 'react';
import { connect } from 'react-redux';

// Internal
import SegmentedAddress from './SegmentedAddress';
import TruncateMiddleAddress from './TruncateMiddleAddress';
import RawAddress from './RawAddress';

@connect(({ settings: { addressStyle } }) => ({
  addressStyle,
}))
class NexusAddress extends React.Component {
  render() {
    const { addressStyle, ...rest } = this.props;
    switch (addressStyle) {
      case 'raw':
        return <RawAddress {...rest} />;
      case 'truncateMiddle':
        return <TruncateMiddleAddress {...rest} />;
      default:
        return <SegmentedAddress {...rest} />;
    }
  }
}

export default NexusAddress;
