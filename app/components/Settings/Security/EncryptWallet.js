// External
import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import * as RPC from 'scripts/rpc';
import styled from '@emotion/styled';

// Internal
import FormField from 'components/FormField';
import TextField from 'components/TextField';
import Button from 'components/Button';
import FieldSet from 'components/FieldSet';
import { colors, consts } from 'styles';

const EncryptWalletWrapper = styled.form({
  flex: 2,
  marginRight: '1em',
});

const Note = styled.div({
  padding: '1em',
  border: `2px dashed ${colors.gray}`,
  color: colors.gray,
});

const Characters = styled.span({
  fontFamily: consts.monoFontFamily,
  letterSpacing: 4,
});

export default class EncryptWallet extends Component {
  reEnterValidator(e) {
    let newPass = document.getElementById('newPass');
    let passHint = document.getElementById('passHint');

    if (e.target.value === newPass.value) {
      e.preventDefault();
      passHint.style.visibility = 'hidden';
    } else if (e.target.value.length === newPass.value.length) {
      if (passHint.innerText !== 'Passwords do not match') {
        passHint.innerText = 'Passwords do not match';
      }
      passHint.style.visibility = 'visible';
    } else {
      passHint.style.visibility = 'hidden';
    }
  }

  encrypt(e) {
    e.preventDefault();
    let newPass = document.getElementById('newPass');
    let passChk = document.getElementById('passChk');
    let passHint = document.getElementById('passHint');

    passHint.innerText = 'Passwords do not match';
    if (newPass.value.trim()) {
      if (!/[-$/&*|<>]/.test(newPass.value)) {
        if (newPass.value === passChk.value) {
          if (!(newPass.value.endsWith(' ') || newPass.value.startsWith(' '))) {
            RPC.PROMISE('encryptwallet', [newPass.value])
              .then(payload => {
                newPass.value = '';
                passChk.value = '';
                this.props.busy(false);
                this.props.OpenModal('Wallet has been encrypted'); // new alert
                this.props.ResetForEncryptionRestart();

                // Start the daemon again... give it maybe 5 seconds.
                setTimeout(() => {
                  remote.getGlobal('core').start();
                  this.props.history.replace('/');
                }, 5000);
              })
              .catch(e => {
                this.props.OpenErrorModal(e);
              });
          } else {
            this.props.OpenErrorModal(
              'Password cannot start or end with spaces'
            ); // new alert
            passChk.focus();
          }
        } else {
          this.props.OpenErrorModal('Passwords do not match'); // new alert
          passChk.focus();
        }
      } else {
        this.props.OpenErrorModal('Passwords cannot contain -$/&*|<>'); // new alert
        passChk.focus();
      }
    } else {
      passChk.focus();
    }
  }

  render() {
    return (
      <EncryptWalletWrapper>
        <FieldSet
          legend={
            <FormattedMessage
              id="Settings.EncryptWallet"
              defaultMessage="Encrypt Wallet"
            />
          }
        >
          <Note>
            <FormattedMessage
              id="Settings.CannotContain"
              defaultMessage="Password cannot contain these characters"
            />
            :<br />
            <Characters>{' -$/&*|<>'}</Characters>
          </Note>
          <FormattedMessage
            id="Settings.NewPassword"
            defaultMessage="New Password:"
          >
            {p => (
              <FormField
                connectLabel
                label={
                  <FormattedMessage
                    id="Settings.Password"
                    defaultMessage="Password:"
                  />
                }
              >
                <TextField
                  type="password"
                  placeholder={p}
                  id="newPass"
                  required
                />
              </FormField>
            )}
          </FormattedMessage>
          <FormattedMessage
            id="Settings.Re-Enter"
            defaultMessage="Re-Enter Password"
          >
            {rep => (
              <FormField
                connectLabel
                label={
                  <FormattedMessage
                    id="Settings.Re-Enter"
                    defaultMessage="Re-Enter Password"
                  />
                }
              >
                <TextField
                  type="password"
                  placeholder={rep}
                  id="passChk"
                  onChange={e => this.reEnterValidator(e)}
                />
              </FormField>
            )}
          </FormattedMessage>
          {/* Temporary workaround to avoid error */}
          <span id="passHint" style={{ display: 'none' }} />
          {/* <span
            id="passHint"
            style={{ visibility: 'hidden' }}
            className="err invalid"
          >
            <FormattedMessage
              id="Settings.Re-Enter"
              defaultMessage="Re-Enter Password"
            />
          </span> */}

          <Button
            skin="primary"
            wide
            style={{ marginTop: '2em' }}
            disabled={this.props.busyFlag}
            onClick={e => this.encrypt(e)}
          >
            <FormattedMessage
              id="Settings.EncryptRestart"
              defaultMessage="Encrypt and Restart"
            />
          </Button>
        </FieldSet>
      </EncryptWalletWrapper>
    );
  }
}
