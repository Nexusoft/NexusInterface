// External
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { reduxForm, Field } from 'redux-form';
import { clipboard } from 'electron';

// Internal
import Icon from 'components/Icon';
import FormField from 'components/FormField';
import TextField from 'components/TextField';
import Button from 'components/Button';
import FieldSet from 'components/FieldSet';
import InputGroup from 'components/InputGroup';
import { openErrorDialog, showNotification } from 'actions/overlays';
import Text from 'components/Text';
import rpc from 'lib/rpc';
import copyIcon from 'images/copy.sprite.svg';
import { rpcErrorHandler } from 'utils/form';

/**
 * View Private Keys for Address JSX
 *
 * @class ViewPrivKeyForAddress
 * @extends {Component}
 */
@connect(
  null,
  { openErrorDialog, showNotification }
)
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
      errors.address = _('Address cannot be empty');
    }
    return errors;
  },
  onSubmit: ({ address }) => rpc('dumpprivkey', [address]),
  onSubmitSuccess: (result, dispatch, props) => {
    props.change('privateKey', result);
  },
  onSubmitFail: rpcErrorHandler(_('Error getting private key')),
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
          this.props.openErrorDialog({ message: e });
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
    this.props.showNotification(_('Copied to clipboard'), 'success');
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
        <FieldSet legend={_('View private key for address')}>
          <FormField connectLabel label={_('Address')}>
            {inputId => (
              <InputGroup>
                <Text id="Settings.EnterAddressHere">
                  {placeholder => (
                    <Field
                      component={TextField.RF}
                      name="address"
                      id={inputId}
                      placeholder={placeholder}
                      onChange={this.resetPrivateKey}
                    />
                  )}
                </Text>

                <Button
                  type="submit"
                  skin="primary"
                  fitHeight
                  disabled={submitting}
                  waiting={submitting}
                >
                  _('View private key')
                </Button>
              </InputGroup>
            )}
          </FormField>

          <FormField label={_('Private key')}>
            <InputGroup>
              <Text id="Settings.KeyDisplayHere">
                {placeholder => (
                  <Field
                    component={TextField.RF}
                    name="privateKey"
                    readOnly
                    type="password"
                    placeholder={placeholder}
                    ref={this.privKeyRef}
                  />
                )}
              </Text>
              <Button fitHeight className="relative" onClick={this.copyPrivkey}>
                <Icon icon={copyIcon} className="space-right" />
                _('Copy')
              </Button>
            </InputGroup>
          </FormField>
        </FieldSet>
      </form>
    );
  }
}
export default ViewPrivKeyForAddress;
