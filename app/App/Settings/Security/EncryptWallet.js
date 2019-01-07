// External
import React, { Component } from 'react';
import Text from 'components/Text';
import * as RPC from 'scripts/rpc';
import styled from '@emotion/styled';

// Internal
import FormField from 'components/FormField';
import TextField from 'components/TextField';
import Button from 'components/Button';
import FieldSet from 'components/FieldSet';
import UIController from 'components/UIController';
import { consts } from 'styles';

const EncryptWalletComponent = styled.form({
  flex: 2,
  marginRight: '1em',
});

const Note = styled.div(({ theme }) => ({
  padding: '1em',
  border: `2px dashed ${theme.gray}`,
  color: theme.gray,
}));

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
                UIController.showNotification(
                  <Text id="Alert.WalletHasBeenEncrypted" />,
                  'success'
                ); // new alert
                this.props.ResetForEncryptionRestart();

                // Start the daemon again... give it maybe 5 seconds.
                setTimeout(() => {
                  remote.getGlobal('core').start();
                  this.props.history.replace('/');
                }, 5000);
              })
              .catch(e => {
                UIController.openErrorDialog({ message: e });
              });
          } else {
            UIController.openErrorDialog({
              message: 'Password cannot start or end with spaces',
            }); // new alert
            passChk.focus();
          }
        } else {
          UIController.openErrorDialog({ message: 'Passwords do not match' }); // new alert
          passChk.focus();
        }
      } else {
        UIController.openErrorDialog({
          message: 'Passwords cannot contain -$/&*|<>',
        }); // new alert
        passChk.focus();
      }
    } else {
      passChk.focus();
    }
  }

  render() {
    return (
      <EncryptWalletComponent>
        <FieldSet legend={<Text id="Settings.EncryptWallet" />}>
          <Note>
            <Text id="Settings.CannotContain" />
            :<br />
            <Characters>{' -$/&*|<>'}</Characters>
          </Note>
          <Text id="Settings.NewPassword">
            {p => (
              <FormField connectLabel label={<Text id="Settings.Password" />}>
                <TextField
                  type="password"
                  placeholder={p}
                  id="newPass"
                  required
                />
              </FormField>
            )}
          </Text>
          <Text id="Settings.Re-Enter">
            {rep => (
              <FormField connectLabel label={<Text id="Settings.Re-Enter" />}>
                <TextField
                  type="password"
                  placeholder={rep}
                  id="passChk"
                  onChange={e => this.reEnterValidator(e)}
                />
              </FormField>
            )}
          </Text>
          {/* Temporary workaround to avoid error */}
          <span id="passHint" style={{ display: 'none' }} />
          {/* <span
            id="passHint"
            style={{ visibility: 'hidden' }}
            className="err invalid"
          >
            <Text
              id="Settings.Re-Enter"
            />
          </span> */}

          <Button
            skin="primary"
            wide
            style={{ marginTop: '2em' }}
            disabled={this.props.busyFlag}
            onClick={e => this.encrypt(e)}
          >
            <Text id="Settings.EncryptRestart" />
          </Button>
        </FieldSet>
      </EncryptWalletComponent>
    );
  }
}
