// External Dependencies
import React, { Component } from 'react';
import { connect } from 'react-redux';

// Internal
import {
  openConfirmDialog,
  openModal,
  openErrorDialog,
} from 'actions/overlays';
import LoginComponent from './LoginComponent';
import CreateUserComponent from './CreateUserComponent';
import LogoutUserComponent from './LogoutUserComponent';
import AttemptRecoveryComponent from './AttemptRecoveryComponent';
import ShowRecoveryComponent from './ShowRecoveryComponent';
import { history } from 'store';

import { updateSettings } from 'actions/settings';

// React-Redux mandatory methods
const mapStateToProps = state => {
  return { ...state.common };
};
const mapDispatchToProps = dispatch => ({
  turnOffTritium: () => dispatch(updateSettings({ tritium: false })),
});

class LoginPage extends Component {
  redirectToOverview() {
    history.push('/');
  }

  openCreateAUser() {
     openModal(CreateUserComponent, {
      fullScreen: true,
      onClose: () => this.redirectToOverview(),
      onCloseLegacy: () => this.switchTolegacy(),
      onCloseBack: () => this.openLoginModal(),
      onFinishCreate: () => this.openShowRecovery(),
    });
  }

  switchTolegacy() {
    //history.push('/');
  }

  openLoginModal() {
    console.log('Open Method');
     openModal(LoginComponent, {
      fullScreen: true,
      goBack: () => this.redirectToOverview(),
      onClose: () => {},
      onCloseCreate: () => this.openCreateAUser(),
      onCloseLegacy: () => this.redirectToOverview(),
      onCloseForgot: () => this.openForgot(),
      onCloseTest: () => this.openShowRecovery(),
    });
  }

  openForgot() {
     openModal(AttemptRecoveryComponent, {
      fullScreen: true,
      onClose: () => this.switchTolegacy(),
      onCloseBack: () => this.openLoginModal(),
    });
  }

  openShowRecovery() {
     openModal(ShowRecoveryComponent, {
      fullScreen: true,
      onClose: () => this.switchTolegacy(),
      onCloseBack: () => this.openLoginModal(),
    });
  }

  componentDidMount() {
    //test
    //this.props.turnOffTritium();

    if (this.props.TEMPLoggedin) {
       openModal(LogoutUserComponent, {
        fullScreen: true,
        onClose: () => this.switchTolegacy(),
        onCloseLogout: () => this.openLoginModal(),
        userInfo: {
          genesisID:
            'GEN ID KAJSDJAUFEJNFLKAMLSJDLKASMDLKASDKNADNLKASNKLDNASLdKSND',
          sessionID: 'SESSION ASDASKDASKLD@299284121',
        },
      });
    } else {
      console.log('open login');
      this.openLoginModal();
    }
  }

  // Mandatory React method
  render() {
    return <div>{'TEST LOGIN'}</div>;
  }
}

// Mandatory React-Redux method
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LoginPage);
