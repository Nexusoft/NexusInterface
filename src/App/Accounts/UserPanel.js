// External
import React, { Component } from 'react';
import styled from '@emotion/styled';

// Internal
import TextField from 'components/TextField';
import * as color from 'utils/color';
import userIcon from 'images/user.sprite.svg';
import Button from 'components/Button';
import Icon from 'components/Icon';
import NexusAddress from 'components/NexusAddress';
import {
  openConfirmDialog,
  openModal,
  openErrorDialog,
} from 'actions/overlays';
import * as Tritium from 'lib/tritium-api';

import UserLock from 'components/User/UserLock';
import UserUnlock from 'components/User/UserUnlock';
import ChangePassword from 'components/User/ChangePassword';
import ChangePin from 'components/User/ChangePin';
//import ChangeRecovery from 'components/User/ChangeRecovery';

import { listAccounts } from 'lib/UserApi';

const PanelHolder = styled.div(({ theme }) => ({
  background: color.lighten(theme.background, 0.2),
  flex: '1',
  padding: '0rem 0rem 1rem 0rem',
  position: 'relative',
  maxWidth: '25%',
  display: 'flex',
  alignItems: 'center',
  flexDirection: 'column',
}));
const Title = styled.div(({ theme }) => ({
  background: color.lighten(theme.background, 0.4),
  color: theme.primary,
  fontSize: '1.5em',
  width: '100%',
  paddingLeft: '0.25em',
}));

const UserImage = styled(Icon)({
  width: '200px',
  height: '200px',
});

const ChangeButton = styled(Button)({
  zIndex: '10',
  marginTop: '1em',
  maxWidth: '100px',
  fontSize: '0.5em',
});

const UsersName = styled.h3({
  padding: '.5em .5em 0 .5em',
  margin: '0px',
});

const SigChain = styled(NexusAddress)({
  fontSize: '0.50em',
  margin: '0 auto 0 auto',
});

const BottomButtons = styled.div({
  margin: 'auto auto 0px auto',
  padding: '0px 1em 0px 1em',
});

class UserPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      testLock: true,
    };
  }

  componentDidMount() {}

  LockUnLock(isLocked) {
    console.log(isLocked);
    this.setState({
      testLock: !isLocked,
    });

    if (isLocked) {
       openModal(UserUnlock);
    } else {
       openModal(UserLock);
    }
  }

  userChangePin = () => {
    console.log('ChangePin');
     openModal(ChangePin);
  };

  userChangePassword = () => {
    console.log('ChangePassword');
     openModal(ChangePassword);
  };

  userChangeRecovery = () => {
    console.log('ChangeRecovery');
  };

  userLogout = () => {
    console.log('Logout');
     openConfirmDialog({
      question: 'Are you sure you want to log out?',
      skinYes: 'danger',
      callbackYes: () => {
        Tritium.PROMISE(
          'API',
          {
            api: 'user',
            verb: 'logout',
            noun: 'user',
          },
          []
        );
      },
    });
  };

  render() {
    //const {username, locked, sigchain} = this.props;
    const username = this.props.userName;
    const sigchain = this.props.userGen;
    const locked = this.state.testLock;

    return (
      <PanelHolder>
        <Title>{'User'}</Title>
        <br />
        <UserImage icon={userIcon} />
        <ChangeButton>{'Change'}</ChangeButton>
        <UsersName>{username}</UsersName>
        <SigChain key={sigchain} address={sigchain} />
        <BottomButtons>
          <Button
            style={{ maxWidth: '100px', margin: '0.25em' }}
            onClick={() => this.LockUnLock(locked)}
          >
            {locked == true ? 'Unlock' : 'Lock'}
          </Button>
          <Button
            style={{ maxWidth: '150px', margin: '0.25em' }}
            onClick={this.userChangePin}
          >
            {'Change Pin'}
          </Button>
          <Button
            style={{ maxWidth: '150px', margin: '0.25em' }}
            onClick={this.userChangePassword}
          >
            {'Change Password'}
          </Button>
          <Button
            style={{ maxWidth: '150px', margin: '0.25em' }}
            onClick={this.userChangeRecovery}
          >
            {'Recovery'}
          </Button>
          <br />
          <Button
            style={{ maxWidth: '150px', margin: '0.25em' }}
            onClick={this.userLogout}
          >
            {'Logout'}
          </Button>
        </BottomButtons>
      </PanelHolder>
    );
  }
}

export default UserPanel;
