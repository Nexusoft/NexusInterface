// External
import React, { Component } from 'react';
import { reduxForm, Field } from 'redux-form';
import { clipboard } from 'electron';

// Internal
import Icon from 'components/Icon';
import FormField from 'components/FormField';
import TextField from 'components/TextField';
import Button from 'components/Button';
import FieldSet from 'components/FieldSet';
import InputGroup from 'components/InputGroup';
import { openErrorDialog, showNotification } from 'lib/ui';
import rpc from 'lib/rpc';
import copyIcon from 'images/copy.sprite.svg';
import { errorHandler } from 'utils/form';

/**
 * View Private Keys for Address JSX
 *
 * @class ViewPrivKeyForAddress
 * @extends {Component}
 */
@reduxForm({
  form: 'viewPrivateKey',
  destroyOnUnmount: false,
  initialValues: {
    address: '',
    privateKey: '',
  },
  validate: ({ address }) => {
    const errors = {};
    if (!address) {
      errors.address = __('Address cannot be empty');
    }
    return errors;
  },
  onSubmit: ({ address }) => rpc('dumpprivkey', [address]),
  onSubmitSuccess: (result, dispatch, props) => {
    props.change('privateKey', result);
  },
  onSubmitFail: errorHandler(__('Error getting private key')),
})
class ViewPrivKeyForAddress extends Component {
  privKeyRef = React.createRef();

  /**
   * Show Private Keys
   *
   * @param {*} e
   * @memberof ViewPrivKeyForAddress
   */
  showPrivKey(e) {
    e.preventDefault();
    let address = this.inputRef.value;
    if (address) {
      rpc('dumpprivkey', [address])
        .then(payload => {
          this.outputRef.value = payload;
        })
        .catch(e => {
          if (e.includes(address)) {
            e = e.replace(address + ' ', '');
          }
          openErrorDialog({ message: e });
        });
    } else {
      this.inputRef.focus();
    }
  }

  /**
   * Copy Private Keys
   *
   * @memberof ViewPrivKeyForAddress
   */
  copyPrivkey = () => {
    const privKey = this.privKeyRef.current.value;
    clipboard.writeText(privKey);
    showNotification(__('Copied to clipboard'), 'success');
  };

  /**
   * Reset Private Keys
   *
   * @memberof ViewPrivKeyForAddress
   */
  resetPrivateKey = () => {
    this.props.change('privateKey', '');
  };

  /**
   * Component's Renderable JSX
   *
   * @returns
   * @memberof ViewPrivKeyForAddress
   */
  render() {
    const { handleSubmit, submitting } = this.props;
    return (
      <form onSubmit={handleSubmit}>
        <FieldSet legend={__('View private key for address')}>
          <FormField connectLabel label={__('Address')}>
            {inputId => (
              <InputGroup>
                <Field
                  component={TextField.RF}
                  name="address"
                  id={inputId}
                  placeholder={__('Enter address here')}
                  onChange={this.resetPrivateKey}
                />

                <Button
                  type="submit"
                  skin="primary"
                  fitHeight
                  disabled={submitting}
                  waiting={submitting}
                >
                  {__('View private key')}
                </Button>
              </InputGroup>
            )}
          </FormField>

          <FormField label={__('Private key')}>
            <InputGroup>
              <Field
                component={TextField.RF}
                name="privateKey"
                readOnly
                type="password"
                placeholder={__('Private key will be displayed here')}
                ref={this.privKeyRef}
              />
              <Button fitHeight className="relative" onClick={this.copyPrivkey}>
                <Icon icon={copyIcon} className="space-right" />
                {__('Copy')}
              </Button>
            </InputGroup>
          </FormField>
        </FieldSet>
      </form>
    );
  }
}
export default ViewPrivKeyForAddress;
