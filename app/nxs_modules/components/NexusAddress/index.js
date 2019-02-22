// External
import React from 'react';
import { connect } from 'react-redux';

// Internal
import SegmentedAddress from './SegmentedAddress';
import TruncateMiddleAddress from './TruncateMiddleAddress';
import SimpleAddress from './SimpleAddress';

@connect(({ settings: { addressStyle } }) => ({
  addressStyle,
}))
class NexusAddress extends React.Component {
  render() {
    const { addressStyle, ...rest } = this.props;
    console.log(addressStyle);
    switch (addressStyle) {
      case 'simple':
        console.log(1);
        return <SimpleAddress {...rest} />;
      case 'truncateMiddle':
        console.log(2);
        return <TruncateMiddleAddress {...rest} />;
      default:
        return <SegmentedAddress {...rest} />;
    }
  }
}

export default NexusAddress;
