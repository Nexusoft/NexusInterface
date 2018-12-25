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

const ImportPrivKeyWrapper = styled.form({
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
          this.props.OpenModal('Private key imported rescanning now'); // new alert
          RPC.PROMISE('rescan')
            .then(payload => {
              this.props.CloseModal();
            })
            .catch(e => {
              this.props.OpenErrorModal(e);
            });
        })
        .catch(e => {
          this.props.OpenErrorModal(e);
        });
    } else if (!label) {
      acctname.focus();
    } else if (!pk) {
      privateKeyInput.focus();
    }
  }

  render() {
    return (
      <ImportPrivKeyWrapper>
        <FieldSet
          legend={
            <FormattedMessage
              id="Settings.ImportPrivateKey"
              defaultMessage="Import Private Key"
            />
          }
        >
          <FormField
            label={
              <FormattedMessage
                id="Settings.AccountName"
                defaultMessage="Account Name:"
              />
            }
          >
            <FormattedMessage
              id="Settings.AccountName"
              defaultMessage="Account Name"
            >
              {An => (
                <TextField
                  type="Text"
                  placeholder={An}
                  id="acctName"
                  required
                />
              )}
            </FormattedMessage>
          </FormField>
          <FormField
            label={
              <FormattedMessage
                id="Settings.PrivateKey"
                defaultMessage="Account Name:"
              />
            }
          >
            <FormattedMessage
              id="Settings.PrivateKey"
              defaultMessage="Private Key"
            >
              {pk => (
                <TextField
                  type="password"
                  placeholder={pk}
                  id="privateKey"
                  required
                />
              )}
            </FormattedMessage>
          </FormField>
          <Button
            skin="primary"
            wide
            style={{ marginTop: '2em' }}
            disabled={this.props.busyFlag}
            onClick={e => this.importPrivKey(e)}
          >
            <FormattedMessage id="Settings.Submit" defaultMessage="Submit" />
          </Button>
        </FieldSet>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }} />
      </ImportPrivKeyWrapper>
    );
  }
}
