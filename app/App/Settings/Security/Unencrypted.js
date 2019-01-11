// External
import React, { Component } from 'react';
import { connect } from 'react-redux';
import Text from 'components/Text';

// Internal
import SecuritySettingsLayout from 'components/SecuritySettingsLayout';
import * as TYPE from 'actions/actiontypes';
import WaitingMessage from 'components/WaitingMessage';
import EncryptWallet from './EncryptWallet';
import ImportPrivKey from './ImportPrivKey';
import ViewPrivKeyForAddress from './ViewPrivKeyForAddress';

const mapStateToProps = state => {
  return {
    ...state.common,
    ...state.login,
    ...state.overview,
  };
};
const mapDispatchToProps = dispatch => ({
  wipe: () => dispatch({ type: TYPE.WIPE_LOGIN_INFO }),
  busy: setting => dispatch({ type: TYPE.TOGGLE_BUSY_FLAG, payload: setting }),
  OpenModal: type => {
    dispatch({ type: TYPE.SHOW_MODAL, payload: type });
  },
  CloseModal: () => dispatch({ type: TYPE.HIDE_MODAL }),
  ResetForEncryptionRestart: () => dispatch({ type: TYPE.CLEAR_FOR_RESTART }),
});

class Unencrypted extends Component {
  componentWillUnmount() {
    this.props.wipe();
  }

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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Unencrypted);
