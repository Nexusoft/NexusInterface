// External Dependencies
import React, { Component } from 'react';
import styled from '@emotion/styled';

import Modal from '../Modal';
import TextField from '../TextField';
import Button from '../Button';
import Text from '../Text';
import * as Backend from 'scripts/backend-com';
import UIController from 'components/UIController';

const floatRegex = /^[0-9]+(.[0-9]*)?$/;

const Container = styled.div(({ theme }) => ({
  margin: '1em',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}));

const EnterButton = styled(Button)(({ theme }) => ({
  margin: '.5em',
}));

const ButtonBox = styled.div(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  margin: '1em',
}));

const SmallModal = styled(Modal)(({ theme }) => ({
  width: 'auto',
}));

export default class PinLogin extends Component {
  constructor() {
    super();
    this.closeModal = null;
    this.state = {
      error: null,
      value: '',
      disable: false,
    };
  }

  handleOnEnter() {
    this.setState({ disable: true });

    const { api, verb, noun, callback, params } = this.props;
    Backend.RunCommand(
      'API',
      {
        api: api,
        verb: verb,
        noun: noun,
      },
      [{ pin: this.state.value, ...params }]
    )
      .then(({ data }) => {
        if (callback) callback(data);
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
        this.setState({ disable: false });
        this.closeModal();
      });
  }

  componentDidMount() {
    this.Input.focus();
  }

  componentWillUnMount() {
    this.setState({ error: null, value: '' });
  }

  render() {
    return (
      <SmallModal assignClose={closeModal => (this.closeModal = closeModal)}>
        <Container>
          <h2>
            <Text id="Pin.Title" />
          </h2>
          <TextField
            // type="password"
            inputRef={input => {
              this.Input = input;
            }}
            onChange={e => {
              this.setState({ value: e.target.value });
            }}
            value={this.state.value}
            onKeyUp={e => {
              if (e.key === 'Enter' && !this.state.disable) {
                this.handleOnEnter();
              }
            }}
          />
          <ButtonBox>
            <EnterButton
              skin="filled-primary"
              onClick={() => this.handleOnEnter()}
              disabled={this.state.disable}
            >
              <Text id="Pin.Enter" />
            </EnterButton>
            <EnterButton
              skin="filled"
              onClick={() => this.closeModal()}
              disabled={this.state.disable}
            >
              <Text id="sendReceive.Cancel" />
            </EnterButton>
          </ButtonBox>
        </Container>
      </SmallModal>
    );
  }
}
