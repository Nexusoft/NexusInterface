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
import Modal from 'components/Modal';

const ImportPrivKeyWrapper = styled.form({
  flex: 3,
});

export default class ImportPrivKey extends Component {
  static contextType = Modal.Context;

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
              this.context.openErrorModal({ message: e });
            });
        })
        .catch(e => {
          this.context.openErrorModal({ message: e });
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
          <FormattedMessage
            id="Settings.AccountName"
            defaultMessage="Account Name"
          >
            {An => (
              <FormField
                connectLabel
                label={
                  <FormattedMessage
                    id="Settings.AccountName"
                    defaultMessage="Account Name:"
                  />
                }
              >
                <TextField
                  type="Text"
                  placeholder={An}
                  id="acctName"
                  required
                />
              </FormField>
            )}
          </FormattedMessage>
          <FormattedMessage
            id="Settings.PrivateKey"
            defaultMessage="Private Key"
          >
            {pk => (
              <FormField
                connectLabel
                label={
                  <FormattedMessage
                    id="Settings.PrivateKey"
                    defaultMessage="Account Name:"
                  />
                }
              >
                <TextField
                  type="password"
                  placeholder={pk}
                  id="privateKey"
                  required
                />
              </FormField>
            )}
          </FormattedMessage>
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
