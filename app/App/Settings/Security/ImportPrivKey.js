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

const ImportPrivKeyComponent = styled.form({
  flex: 3,
});

export default class ImportPrivKey extends Component {
  importPrivKey(e) {
    e.preventDefault();
    let acctname = document.getElementById('acctName');
    let label = acctname.value.trim();
    let privateKeyInput = document.getElementById('privateKey');
    let pk = privateKeyInput.value.trim();

    if (label && pk) {
      RPC.PROMISE('importprivkey', [pk], [label])
        .then(payload => {
          this.props.ResetForEncryptionRestart();
          UIController.showNotification(
            'Private key imported rescanning now',
            'success'
          ); // new alert
          RPC.PROMISE('rescan')
            .then(payload => {
              this.props.CloseModal();
            })
            .catch(e => {
              UIController.openErrorDialog({ message: e });
            });
        })
        .catch(e => {
          UIController.openErrorDialog({ message: e });
        });
    } else if (!label) {
      acctname.focus();
    } else if (!pk) {
      privateKeyInput.focus();
    }
  }

  render() {
    return (
      <ImportPrivKeyComponent>
        <FieldSet legend={<Text id="Settings.ImportPrivateKey" />}>
          <Text id="Settings.AccountName">
            {An => (
              <FormField
                connectLabel
                label={<Text id="Settings.AccountName" />}
              >
                <TextField
                  type="Text"
                  placeholder={An}
                  id="acctName"
                  required
                />
              </FormField>
            )}
          </Text>
          <Text id="Settings.PrivateKey">
            {pk => (
              <FormField connectLabel label={<Text id="Settings.PrivateKey" />}>
                <TextField
                  type="password"
                  placeholder={pk}
                  id="privateKey"
                  required
                />
              </FormField>
            )}
          </Text>
          <Button
            skin="primary"
            wide
            style={{ marginTop: '2em' }}
            disabled={this.props.busyFlag}
            onClick={e => this.importPrivKey(e)}
          >
            <Text id="Settings.Submit" />
          </Button>
        </FieldSet>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }} />
      </ImportPrivKeyComponent>
    );
  }
}
