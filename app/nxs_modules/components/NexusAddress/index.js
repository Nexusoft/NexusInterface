// External
import React from 'react';
import { connect } from 'react-redux';

// Internal
import SegmentedAddress from './SegmentedAddress';
import HideMiddleAddress from './HideMiddleAddress';
import SimpleAddress from './SimpleAddress';

@connect(({ settings: { addressStyle } }) => ({
  addressStyle,
}))
class NexusAddress extends React.Component {
  render() {
    const { addressStyle, ...rest } = this.props;
    switch (addressStyle) {
      case 'simple':
        return <SimpleAddress {...rest} />;
      case 'hideMiddle':
        return <HideMiddleAddress {...rest} />;
      default:
        return <SegmentedAddress {...rest} />;
    }
  }
}

export default NexusAddress;
