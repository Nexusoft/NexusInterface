// External
import React, { Component } from 'react';
import { reduxForm, Field, change } from 'redux-form';
import { clipboard } from 'electron';

// Internal
import Icon from 'components/Icon';
import FormField from 'components/FormField';
import TextField from 'components/TextField';
import Button from 'components/Button';
import FieldSet from 'components/FieldSet';
import InputGroup from 'components/InputGroup';
import UIController from 'components/UIController';
import Text from 'components/Text';
import * as RPC from 'scripts/rpc';
import copyIcon from 'images/copy.sprite.svg';
import { rpcErrorHandler } from 'utils/form';

const formName = 'viewPrivateKey';

@reduxForm({
  form: formName,
  initialValues: {
    address: '',
    privateKey: '',
  },
  validate: ({ address }) => {
    const errors = {};
    if (!address) {
      errors.address = 'Address cannot be empty';
    }
    return errors;
  },
  onSubmit: ({ address }) => RPC.PROMISE('dumpprivkey', [address]),
  onSubmitSuccess: (result, dispatch) => {
    dispatch(change(formName, 'privateKey', result));
  },
  onSubmitFail: rpcErrorHandler('Error getting private key'),
})
export default class ViewPrivKeyForAddress extends Component {
  privKeyRef = React.createRef();

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

  copyPrivkey = () => {
    const privKey = this.privKeyRef.current.value;
    clipboard.writeText(privKey);
    UIController.showNotification(<Text id="Alert.Copied" />, 'success');
  };

  resetPrivateKey = () => {
    this.props.change('privateKey', '');
  };

  render() {
    const { handleSubmit, submitting } = this.props;
    return (
      <form onSubmit={handleSubmit}>
        <FieldSet legend={<Text id="Settings.ViewPrivateKeyForAddress" />}>
          <FormField connectLabel label={<Text id="Settings.Address" />}>
            {inputId => (
              <InputGroup>
                <Field
                  component={TextField.RF}
                  name="address"
                  id={inputId}
                  placeholder="Enter address here"
                  onChange={this.resetPrivateKey}
                />
                <Button
                  type="submit"
                  skin="primary"
                  fitHeight
                  disabled={submitting}
                  waiting={submitting}
                >
                  View Private Key
                </Button>
              </InputGroup>
            )}
          </FormField>

          <FormField label={<Text id="Settings.PrivateKey" />}>
            <InputGroup>
              <Field
                component={TextField.RF}
                name="privateKey"
                readOnly
                type="password"
                placeholder="Private key will be displayed here"
                ref={this.privKeyRef}
              />
              <Button fitHeight className="relative" onClick={this.copyPrivkey}>
                <Icon icon={copyIcon} spaceRight />
                <Text id="Settings.Copy" />
              </Button>
            </InputGroup>
          </FormField>
        </FieldSet>
      </form>
    );
  }
}
