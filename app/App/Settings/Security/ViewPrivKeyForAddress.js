// External
import React, { Component } from 'react';
import Text from 'components/Text';
import * as RPC from 'scripts/rpc';

// Internal
import Icon from 'components/Icon';
import FormField from 'components/FormField';
import TextField from 'components/TextField';
import Button from 'components/Button';
import FieldSet from 'components/FieldSet';
import InputGroup from 'components/InputGroup';
import UIController from 'components/UIController';
import copyIcon from 'images/copy.sprite.svg';

export default class ViewPrivKeyForAddress extends Component {
  showPrivKey(e) {
    e.preventDefault();
    let address = this.inputRef.value;
    if (address) {
      RPC.PROMISE('dumpprivkey', [address])
        .then(payload => {
          this.outputRef.value = payload;
        })
        .catch(e => {
          if (e.includes(address)) {
            e = e.replace(address + ' ', '');
          }
          UIController.openErrorDialog({ message: e });
        });
    } else {
      this.inputRef.focus();
    }
  }

  copyPrivkey(e) {
    e.preventDefault();
    this.outputRef.type = 'text';
    this.outputRef.focus();
    this.outputRef.select();
    document.execCommand('Copy', false, null);
    this.outputRef.type = 'password';
    UIController.showNotification(<Text id="Alert.Copied" />, 'success');
  }

  render() {
    return (
      <form>
        <FieldSet legend={<Text id="Settings.ViewPrivateKeyForAddress" />}>
          <FormField connectLabel label={<Text id="Settings.Address" />}>
            {inputId => (
              <InputGroup>
                <TextField
                  id={inputId}
                  ref={el => {
                    this.inputRef = el;
                  }}
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
            )}
          </FormField>

          <FormField connectLabel label={<Text id="Settings.PrivateKey" />}>
            {inputId => (
              <InputGroup>
                <TextField
                  type="password"
                  id={inputId}
                  ref={el => {
                    this.outputRef = el;
                  }}
                />
                <Button
                  fitHeight
                  className="relative"
                  onClick={e => {
                    this.copyPrivkey(e);
                  }}
                >
                  <Icon icon={copyIcon} spaceRight />
                  <Text id="Settings.Copy" />
                </Button>
              </InputGroup>
            )}
          </FormField>
        </FieldSet>
      </form>
    );
  }
}
