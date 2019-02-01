// External
import React, { Component } from 'react';
import { reduxForm, Field } from 'redux-form';
import styled from '@emotion/styled';
import { remote } from 'electron';

// Internal
import Text from 'components/Text';
import FormField from 'components/FormField';
import TextField from 'components/TextField';
import Button from 'components/Button';
import FieldSet from 'components/FieldSet';
import UIController from 'components/UIController';
import * as RPC from 'scripts/rpc';
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
      errors.password = <Text id="Settings.Errors.PasswordRequired" />;
    }
    if (passwordInvalidChars.test(password)) {
      errors.password = <Text id="Settings.Errors.PasswordInvalidChars" />;
    } else if (!password || password.length < 8) {
      errors.password = <Text id="Settings.Errors.PasswordMinLength" />;
    } else if (password !== password.trim()) {
      errors.password = <Text id="Settings.Errors.PasswordSpaces" />;
    }
    if (passwordRepeat !== password) {
      errors.passwordRepeat = <Text id="Settings.Errors.PasswordsNoMatch" />;
    }
    return errors;
  },
  onSubmit: ({ password }) => RPC.PROMISE('encryptwallet', [password]),
  onSubmitSuccess: (result, dispatch, props) => {
    props.reset();
    UIController.openSuccessDialog({
      message: <Text id="Alert.WalletHasBeenEncrypted" />,
      onClose: () => {
        // this.props.history.push('/');
        // this.props.ResetForEncryptionRestart();
        remote.getGlobal('core').start();
        UIController.showNotification(<Text id="Settings.RestartingDaemon" />);
      },
    });
  },
  onSubmitFail: rpcErrorHandler(<Text id="Settings.Errors.EncryptingWallet" />),
})
class EncryptWallet extends Component {
  /**
   * React Render
   *
   * @returns
   * @memberof EncryptWallet
   */
  render() {
    const { handleSubmit, submitting } = this.props;
    return (
      <EncryptWalletForm onSubmit={handleSubmit}>
        <FieldSet legend={<Text id="Settings.EncryptWallet" />}>
          <Note>
            <Text id="Settings.CannotContain" />
            :<br />
            <Characters>{' -$/&*|<>'}</Characters>
          </Note>
          <Text id="Settings.NewPassword">
            {p => (
              <FormField connectLabel label={<Text id="Settings.Password" />}>
                <Field
                  component={TextField.RF}
                  name="password"
                  type="password"
                  placeholder={p}
                />
              </FormField>
            )}
          </Text>
          <Text id="Settings.ConfirmPassword">
            {text => (
              <FormField connectLabel label={<Text id="Settings.Re-Enter" />}>
                <Field
                  component={TextField.RF}
                  name="passwordRepeat"
                  type="password"
                  placeholder={text}
                />
              </FormField>
            )}
          </Text>

          <Button
            type="submit"
            skin="primary"
            wide
            disabled={submitting}
            waiting={submitting}
            style={{ marginTop: '2em' }}
          >
            <Text id="Settings.EncryptRestart" />
          </Button>
        </FieldSet>
      </EncryptWalletForm>
    );
  }
}
export default EncryptWallet;