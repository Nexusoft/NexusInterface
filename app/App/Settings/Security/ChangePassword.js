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

const ChangePasswordComponent = styled.form({
  flex: 2,
  marginRight: '1em',
});

export default class ChangePassword extends Component {
  changePassword(e) {
    e.preventDefault();
    let pass, newPass, passChk, passHint;
    pass = document.getElementById('oldPass');
    newPass = document.getElementById('newPass');
    passChk = document.getElementById('passChk');
    passHint = document.getElementById('passHint');
    if (pass.value.trim()) {
      if (/[-$&/*|<>]/.test(newPass.value)) {
        if (newPass.value === passChk.value) {
          if (!(newPass.value.endsWith(' ') || newPass.value.startsWith(' '))) {
            RPC.PROMISE('walletpassphrasechange', [
              pass.value,
              newPass.value,
            ]).then(payload => {
              if (payload === null) {
                pass.value = '';
                newPass.value = '';
                passChk.value = '';
                UIController.showNotification(
                  <Text id="Alert.PasswordHasBeenChanged" />,
                  'success'
                );
              }
            });
          } else {
            passChk.value = '';
            passHint.innerText = 'Password cannot start or end with spaces';
            passChk.focus();
          }
        } else {
          passChk.value = '';
          passHint.innerText = 'Passwords do not match';
          passChk.focus();
        }
      } else {
        passChk.value = '';
        passHint.style.visibility = 'visible';
        passHint.innerText = 'Passwords cannot contain -$&/*|<>';
        passChk.focus();
      }
    } else {
      passHint.innerText = 'Passwords do not match';
      pass.focus();
    }
  }

  reEnterValidator(e) {
    let newPass = document.getElementById('newPass');
    let passHint = document.getElementById('passHint');
    if (e.target.value === newPass.value) {
      e.preventDefault();
      passHint.style.visibility = 'hidden';
    } else {
      passHint.style.visibility = 'visible';
    }
  }

  lockWallet() {
    this.props.busy();
    RPC.PROMISE('walletlock', [])
      .then(payload => {
        this.props.wipe();
        this.props.busy();
        RPC.PROMISE('getinfo', [])
          .then(payload => {
            delete payload.timestamp;
            return payload;
          })
          .then(payload => {
            this.props.getInfo(payload);
          });
      })
      .catch(e => {
        UIController.openErrorDialog({ message: e });
      });
  }

  render() {
    return (
      <ChangePasswordComponent>
        <FieldSet legend={<Text id="Settings.ChangePassword" />}>
          <Text id="Settings.Password">
            {p => (
              <FormField
                connectLabel
                label={<Text id="Settings.PreviousPassword" />}
                hint={<Text id="Settings.PasswordRequired" />}
              >
                <TextField
                  type="password"
                  placeholder={p}
                  id="oldPass"
                  required
                />
              </FormField>
            )}
          </Text>
          <Text id="Settings.NewPassword">
            {np => (
              <FormField
                connectLabel
                label={<Text id="Settings.NewPassword" />}
                hint={<Text id="Settings.PasswordRequired" />}
              >
                <TextField
                  type="password"
                  placeholder={np}
                  id="newPass"
                  required
                />
              </FormField>
            )}
          </Text>
          <Text id="Settings.ReEnterPassword">
            {rep => (
              <FormField
                connectLabel
                label={<Text id="Settings.ReEnterPassword" />}
                hint={<Text id="Settings.NoMatch" />}
              >
                <TextField
                  type="password"
                  placeholder={rep}
                  id="passChk"
                  onChange={e => this.reEnterValidator(e)}
                />
              </FormField>
            )}
          </Text>
          {/* temporary workaround to avoid error */}
          <span id="passHint" style={{ display: 'none' }} />
          {/* <span id="passHint" className="err invalid">
                <Text
                  id="Settings.NoMatch"
                />
              </span> */}

          <Button
            skin="primary"
            wide
            style={{ marginTop: '2em' }}
            onClick={() => this.changePassword(e)}
          >
            <Text id="Settings.Submit" />
          </Button>
        </FieldSet>

        <Button
          wide
          onClick={e => {
            e.preventDefault();
            this.lockWallet();
          }}
        >
          <Text id="Settings.LockWallet" />
        </Button>
      </ChangePasswordComponent>
    );
  }
}
