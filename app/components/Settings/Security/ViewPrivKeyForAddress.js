// External
import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import * as RPC from 'scripts/rpc';

// Internal
import Icon from 'components/common/Icon';
import FormField from 'components/common/FormField';
import TextField from 'components/common/TextField';
import Button from 'components/common/Button';
import FieldSet from 'components/common/FieldSet';
import InputGroup from 'components/common/InputGroup';
import copyIcon from 'images/copy.sprite.svg';

export default class ViewPrivKeyForAddress extends Component {
  showPrivKey(e) {
    e.preventDefault();
    let addressInput = document.getElementById('privKeyAddress');
    let address = addressInput.value;
    let output = document.getElementById('privKeyOutput');
    if (address) {
      RPC.PROMISE('dumpprivkey', [address])
        .then(payload => {
          output.value = payload;
        })
        .catch(e => {
          if (e.includes(address)) {
            e = e.replace(address + ' ', '');
          }
          this.props.OpenErrorModal(e);
        });
    } else {
      addressInput.focus();
    }
  }

  copyPrivkey(e) {
    e.preventDefault();
    let output = document.getElementById('privKeyOutput');
    output.type = 'text';
    output.focus();
    output.select();
    document.execCommand('Copy', false, null);
    output.type = 'password';
    this.props.OpenModal('Copied');
  }

  render() {
    return (
      <form>
        <FieldSet
          legend={
            <FormattedMessage
              id="Settings.ViewPrivateKeyForAddress"
              defaultMessage="View private key for address"
            />
          }
        >
          <FormField
            label={
              <FormattedMessage
                id="Settings.Address"
                defaultMessage="Address"
              />
            }
          >
            <InputGroup>
              <TextField
                id="privKeyAddress"
                placeholder="Enter Address Here"
                required
              />
              <Button
                skin="primary"
                fitHeight
                onClick={e => this.showPrivKey(e)}
              >
                Import
              </Button>
            </InputGroup>
          </FormField>

          <FormField
            label={
              <FormattedMessage
                id="Settings.PrivateKey"
                defaultMessage="Private Key:"
              />
            }
          >
            <InputGroup>
              <TextField type="password" id="privKeyOutput" />
              <Button
                fitHeight
                className="relative"
                onClick={e => {
                  this.copyPrivkey(e);
                }}
              >
                <Icon icon={copyIcon} spaceRight />
                <FormattedMessage id="Settings.Copy" defaultMessage="Copy" />
              </Button>
            </InputGroup>
          </FormField>
        </FieldSet>
      </form>
    );
  }
}
