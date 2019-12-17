// External
import React, { Component } from 'react';
import { reduxForm, Field } from 'redux-form';
import styled from '@emotion/styled';

// Internal
import FormField from 'components/FormField';
import TextField from 'components/TextField';
import Button from 'components/Button';
import FieldSet from 'components/FieldSet';
import { openSuccessDialog } from 'lib/ui';
import rpc from 'lib/rpc';
import { startCore } from 'lib/core';
import { consts } from 'styles';
import { errorHandler } from 'utils/form';
import passwordInvalidChars from './passwordInvalidChars';

__ = __context('Settings.Security');

const EncryptWalletForm = styled.form({
  flex: 2,
  marginRight: '1em',
});

const Note = styled.div(({ theme }) => ({
  padding: '1em',
  border: `2px dashed ${theme.mixer(0.5)}`,
  color: theme.mixer(0.5),
}));

const Characters = styled.span({
  fontFamily: consts.monoFontFamily,
  letterSpacing: 4,
});

/**
 * Encrypted Wallet
 *
 * @class EncryptWallet
 * @extends {Component}
 */
@reduxForm({
  form: 'encryptWallet',
  destroyOnUnmount: false,
  initialValues: {
    password: '',
    passwordRepeat: '',
  },
  validate: ({ password, passwordRepeat }) => {
    const errors = {};
    if (!password) {
      errors.password = __('Password is required');
    }
    if (passwordInvalidChars.test(password)) {
      errors.password =
        __('Password cannot contain these characters:') + ' - $ / & * | < >';
    } else if (!password || password.length < 8) {
      errors.password = __('Password must be at least 8 characters');
    } else if (password !== password.trim()) {
      errors.password = __('Password cannot start or end with spaces');
    }
    if (passwordRepeat !== password) {
      errors.passwordRepeat = __('Passwords do not match');
    }
    return errors;
  },
  onSubmit: ({ password }) => rpc('encryptwallet', [password]),
  onSubmitSuccess: (result, dispatch, props) => {
    props.reset();
    openSuccessDialog({
      message: __('Wallet has been encrypted.'),
      onClose: () => {
        // In some old version, core stops after wallet is encrypted
        // So start the core here for legacy support
        startCore();
      },
    });
  },
  onSubmitFail: errorHandler(__('Error encrypting wallet')),
})
class EncryptWallet extends Component {
  /**
   * Component's Renderable JSX
   *
   * @returns
   * @memberof EncryptWallet
   */
  render() {
    const { handleSubmit, submitting } = this.props;
    return (
      <EncryptWalletForm onSubmit={handleSubmit}>
        <FieldSet legend={__('Encrypt wallet')}>
          <Note>
            {__('Password cannot contain these characters:')}
            <br />
            <Characters>{' -$/&*|<>'}</Characters>
          </Note>
          <FormField connectLabel label={__('Password')}>
            <Field
              component={TextField.RF}
              name="password"
              type="password"
              placeholder={__('New password')}
            />
          </FormField>
          <FormField connectLabel label={__('Re-enter password')}>
            <Field
              component={TextField.RF}
              name="passwordRepeat"
              type="password"
              placeholder={__('Confirm password')}
            />
          </FormField>

          <Button
            type="submit"
            skin="primary"
            wide
            disabled={submitting}
            waiting={submitting}
            style={{ marginTop: '2em' }}
          >
            {__('Encrypt and restart')}
          </Button>
        </FieldSet>
      </EncryptWalletForm>
    );
  }
}
export default EncryptWallet;
