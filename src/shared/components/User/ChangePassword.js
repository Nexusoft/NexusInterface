// External Dependencies
import React, { Component } from 'react';
import styled from '@emotion/styled';

// Internal
import Modal from 'components/Modal';
import Button from 'components/Button';
import Text from '../Text';
import Switch from 'components/Switch';
import TextField from 'components/TextField';
import * as Backend from 'scripts/backend-com';
import UIController from 'components/UIController';

import PinLoginModal from 'components/User/PinLoginModal';

const SmallModal = styled(Modal)(({ theme }) => ({
  width: 'auto',
}));

const Container = styled.div(({ theme }) => ({
  margin: '1em',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}));

const OptionLabel = styled.label(({ theme }) => ({
  color: theme.primary,
  marginTop: '1.75em',
}));

const Option = styled.div({
  display: 'flex',
  flexDirection: 'row',
});

const Buttons = styled.div({
  margin: '1em',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
});

export default class ChangePassword extends Component {
  constructor() {
    super();
    this.state = {
      oldPass: '',
      newPass: '',
      confirmNewPass: '',
    };
  }

  tryPasswordChange = () => {
    console.log(this.state);

    UIController.openModal(PinLoginModal, {
      callback: payload => this.pinCallback(payload),
      params: {
        ...this.state,
      },
      api: 'users',
      verb: 'unlock',
      noun: 'user',
    });
  };

  pinCallback = payload => {
    console.log(payload);
    this.closeModal();
  };

  setOldPass = e => {
    console.log(e.target.value);
    this.setState({
      oldPass: e.target.value,
    });
  };

  setNewPass = e => {
    console.log(e.target.value);
    this.setState({
      newPass: e.target.value,
    });
  };
  setConfirmNewPass = e => {
    console.log(e.target.value);
    this.setState({
      confirmNewPass: e.target.value,
    });
  };

  render() {
    return (
      <SmallModal assignClose={closeModal => (this.closeModal = closeModal)}>
        <Container>
          <h2>{'Change Password'}</h2>
          <Option>
            <OptionLabel>{'Current Password'}</OptionLabel>
            <TextField
              style={{ marginTop: '1em', marginLeft: '1em' }}
              onChange={this.setOldPass}
            />
          </Option>
          <Option>
            <OptionLabel>{'New Password'}</OptionLabel>
            <TextField
              style={{ marginTop: '1em', marginLeft: '1em' }}
              onChange={this.setNewPass}
            />
          </Option>
          <Option>
            <OptionLabel>{'Confirm New Password'}</OptionLabel>
            <TextField
              style={{ marginTop: '1em', marginLeft: '1em' }}
              onChange={this.setConfirmNewPass}
            />
          </Option>
          <Buttons>
            <Button
              skin="filled"
              onClick={() => this.closeModal()}
              style={{ margin: '.5em' }}
            >
              <Text id="sendReceive.Cancel" />
            </Button>
            <Button
              skin="filled"
              onClick={this.tryPasswordChange}
              style={{ margin: '.5em' }}
            >
              {'Change Password'}
            </Button>
          </Buttons>
        </Container>
      </SmallModal>
    );
  }
}
