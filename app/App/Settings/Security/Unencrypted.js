// External
import React, { Component } from 'react';
import { connect } from 'react-redux';
// Internal
import Text from 'components/Text';
import SecuritySettingsLayout from 'components/SecuritySettingsLayout';
import WaitingMessage from 'components/WaitingMessage';
import EncryptWallet from './EncryptWallet';
import ImportPrivKey from './ImportPrivKey';
import ViewPrivKeyForAddress from './ViewPrivKeyForAddress';

@connect(state => ({
  connections: state.overview.connections,
}))
class Unencrypted extends Component {
  render() {
    if (this.props.connections === undefined) {
      return (
        <WaitingMessage>
          <Text id="transactions.Loading" />
          ...
        </WaitingMessage>
      );
    } else {
      return (
        <div>
          <SecuritySettingsLayout>
            <EncryptWallet />
            <ImportPrivKey />
          </SecuritySettingsLayout>
          <ViewPrivKeyForAddress />
        </div>
      );
    }
  }
}
export default Unencrypted;
