// External
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { reduxForm, Field } from 'redux-form';
import styled from '@emotion/styled';

// Internal
import Text from 'components/Text';
import FormField from 'components/FormField';
import TextField from 'components/TextField';
import Button from 'components/Button';
import FieldSet from 'components/FieldSet';
import { openSuccessDialog } from 'actions/overlays';
import rpc from 'lib/rpc';
import { startCore } from 'actions/core';
import { consts } from 'styles';
import { rpcErrorHandler } from 'utils/form';
import passwordInvalidChars from './passwordInvalidChars';

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
@connect(
  null,
  { openSuccessDialog, startCore }
)
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
      errors.password = _('Password is required');
    }
    if (passwordInvalidChars.test(password)) {
      errors.password = _(
        'Password cannot contain these characters: - $ / & * | < >'
      );
    } else if (!password || password.length < 8) {
      errors.password = _('Password must be at least 8 characters');
    } else if (password !== password.trim()) {
      errors.password = _('Password cannot start or end with spaces');
    }
    if (passwordRepeat !== password) {
      errors.passwordRepeat = _('Passwords do not match');
    }
    return errors;
  },
  onSubmit: ({ password }) => rpc('encryptwallet', [password]),
  onSubmitSuccess: (result, dispatch, props) => {
    props.reset();
    props.openSuccessDialog({
      message: _('Wallet has been encrypted.'),
      onClose: () => {
        // In some old version, core stops after wallet is encrypted
        // So start the core here for legacy support
        props.startCore();
      },
    });
  },
  onSubmitFail: rpcErrorHandler(_('Error encrypting wallet')),
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
        <FieldSet legend={_('Encrypt wallet')}>
          <Note>
            {_('Password cannot contain these characters')}
            :<br />
            <Characters>{' -$/&*|<>'}</Characters>
          </Note>
          <FormField connectLabel label={_('Password')}>
            <Field
              component={TextField.RF}
              name="password"
              type="password"
              placeholder={_('New password')}
            />
          </FormField>
          <FormField connectLabel label={_('Re-enter password')}>
            <Field
              component={TextField.RF}
              name="passwordRepeat"
              type="password"
              placeholder={_('Confirm password')}
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
            {_('Encrypt and restart')}
          </Button>
        </FieldSet>
      </EncryptWalletForm>
    );
  }
}
export default EncryptWallet;
