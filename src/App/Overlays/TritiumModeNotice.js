import React from 'react';
import { connect } from 'react-redux';

import Button from 'components/Button';
import { updateSettings } from 'actions/settings';

import FullScreen from './FullScreen';

const actionCreators = {
  disableTritiumModeNotice: () =>
    updateSettings({ tritiumModeNoticeDisabled: true }),
};

const TritiumModeNotice = ({ disableTritiumModeNotice }) => (
  <FullScreen header={__('Tritium Mode')} width={600} style={{ fontSize: 18 }}>
    <div className="mt1">{__('Your wallet is now in Tritium Mode!')}</div>
    <div className="mt1">
      {__(
        "Tritium Mode is currently in early development, therefore not all Tritium features are supported by the user interface. If you want to access a Tritium feature that hasn't had a user interface yet, you can go to Console/Tritium Console, or use any HTTP client to call Nexus APIs directly."
      )}
    </div>
    <div className="mt1">
      {__(
        'If you need to switch back to Legacy Mode, you can select "%{menu}" menu option at any time.',
        {
          menu: `${
            process.platform === 'darwin' ? 'Nexus' : `${__('File')}`
          }/${__('Switch to Legacy Mode')}`,
        }
      )}
    </div>
    <div className="mt3 flex center space-between">
      <div />
      <Button skin="primary" onClick={disableTritiumModeNotice}>
        {__('Continue to Tritium Mode')}
      </Button>
    </div>
  </FullScreen>
);

export default connect(
  null,
  actionCreators
)(TritiumModeNotice);
