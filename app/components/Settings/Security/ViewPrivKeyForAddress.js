// External
import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import * as RPC from 'scripts/rpc';

// Internal
import Icon from 'components/common/Icon';
import FormField from 'components/common/FormField';
import TextBox from 'components/common/TextBox';
import Button from 'components/common/Button';
import FieldSet from 'components/common/FieldSet';
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
            <div className="flex stretch">
              <TextBox
                grouped="left"
                id="privKeyAddress"
                placeholder="Enter Address Here"
                required
              />
              <Button
                filled
                primary
                freeHeight
                grouped="right"
                onClick={e => this.showPrivKey(e)}
              >
                Import
              </Button>
            </div>
          </FormField>

          <FormField
            label={
              <FormattedMessage
                id="Settings.PrivateKey"
                defaultMessage="Private Key:"
              />
            }
          >
            <div className="flex stretch">
              <TextBox grouped="left" type="password" id="privKeyOutput" />
              <Button
                filled
                light
                freeHeight
                grouped="right"
                className="relative"
                onClick={e => {
                  this.copyPrivkey(e);
                }}
              >
                <Icon icon={copyIcon} />
                <div className="tooltip bottom">
                  <FormattedMessage id="Settings.Copy" defaultMessage="Copy" />
                </div>
              </Button>
            </div>
          </FormField>
        </FieldSet>
      </form>
    );
  }
}
