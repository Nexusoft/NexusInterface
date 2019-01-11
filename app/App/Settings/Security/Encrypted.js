// External
import React, { Component } from 'react';
import { connect } from 'react-redux';

// Internal
import SecuritySettingsLayout from 'components/SecuritySettingsLayout';
import * as TYPE from 'actions/actiontypes';
import ChangePassword from './ChangePassword';
import ImportPrivKey from './ImportPrivKey';
import ViewPrivKeyForAddress from './ViewPrivKeyForAddress';

const mapStateToProps = state => {
  return {
    ...state.common,
    ...state.login,
  };
};

const mapDispatchToProps = dispatch => ({
  wipe: () => dispatch({ type: TYPE.WIPE_LOGIN_INFO }),
  busy: () => dispatch({ type: TYPE.TOGGLE_BUSY_FLAG }),
  OpenModal: type => dispatch({ type: TYPE.SHOW_MODAL, payload: type }),
  getInfo: payload => dispatch({ type: TYPE.GET_INFO_DUMP, payload: payload }),
});

class Encrypted extends Component {
  componentWillUnmount() {
    this.props.wipe();
  }
  render() {
    return (
      <div>
        <SecuritySettingsLayout>
          <ChangePassword />
          <ImportPrivKey />
        </SecuritySettingsLayout>
        <ViewPrivKeyForAddress />
      </div>
    );
  }
}
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Encrypted);
