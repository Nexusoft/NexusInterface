import React from 'react';
import { connect } from 'react-redux';

import WaitingMessage from 'components/WaitingMessage';
import CoreStatus from 'components/CoreStatus';
import { isCoreConnected } from 'selectors';

const mapStateToProps = state => ({
  coreConnected: isCoreConnected(state),
});

const RequireCoreConnected = ({ coreConnected, children }) =>
  coreConnected ? (
    children
  ) : (
    <WaitingMessage>
      <CoreStatus />
    </WaitingMessage>
  );

export default connect(mapStateToProps)(RequireCoreConnected);
