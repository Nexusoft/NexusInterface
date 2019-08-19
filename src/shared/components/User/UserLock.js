// External Dependencies
import React, { Component } from 'react';
import styled from '@emotion/styled';

// Internal
import Modal from 'components/Modal';
import Button from 'components/Button';
import Text from '../Text';
import Switch from 'components/Switch';
import * as Backend from 'scripts/backend-com';
import UIController from 'components/UIController';

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

export default class UserLock extends Component {
  constructor() {
    super();
    this.state = {
      mintingEnabled: true,
      transactionsEnabled: true,
    };
  }

  switchMinting = e => {
    console.log(e);
    console.log(e.target);
    console.log(e.target.value);
    this.setState({
      mintingEnabled: !this.state.mintingEnabled,
    });
  };
  switchTransactions = e => {
    console.log(e);
    console.log(e.target);
    console.log(e.target.value);
    this.setState({
      transactionsEnabled: !this.state.transactionsEnabled,
    });
  };

  tryLogout = () => {
    Backend.RunCommand(
      'API',
      {
        api: 'users',
        verb: 'lock',
        noun: 'user',
      },
      [
        {
          minting: this.state.mintingEnabled,
          transactions: this.state.transactionsEnabled,
        },
      ]
    )
      .then(({ data }) => {
        console.log(data);
        UIController.showNotification(`Acount Locked`, 'success');
        this.closeModal();
      })
      .catch(error => {
        if (error.response) {
          console.log(error.response);
          UIController.showNotification(
            `${error.response.data.error.message}`,
            'error'
          );
          this.closeModal();
        } else if (error.request) {
          console.log(error.request);
        } else {
          console.log('Error', error.message);
        }
      })
      .finally(() => {
        this.closeModal();
      });
  };

  render() {
    const { mintingEnabled, transactionsEnabled } = this.state;
    return (
      <SmallModal assignClose={closeModal => (this.closeModal = closeModal)}>
        <Container>
          <h2>{'User Lock'}</h2>
          <Option>
            <OptionLabel>{'Enable Minting'}</OptionLabel>
            <Switch
              checked={mintingEnabled}
              onChange={this.switchMinting}
              style={{ marginTop: '1.75em' }}
            />
          </Option>
          <Option>
            <OptionLabel>{'Enable Transactions'}</OptionLabel>
            <Switch
              checked={transactionsEnabled}
              onChange={this.switchTransactions}
              style={{ marginTop: '1.75em' }}
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
              onClick={this.tryLogout}
              style={{ margin: '.5em' }}
            >
              <Text id="Settings.LockWallet" />
            </Button>
          </Buttons>
        </Container>
      </SmallModal>
    );
  }
}
