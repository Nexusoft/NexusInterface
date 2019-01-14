// External
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { reduxForm, Field, reset } from 'redux-form';
import styled from '@emotion/styled';

// Internal
import * as RPC from 'scripts/rpc';
import getInfo from 'actions/getInfo';
import Text from 'components/Text';
import FormField from 'components/FormField';
import TextField from 'components/TextField';
import Button from 'components/Button';
import FieldSet from 'components/FieldSet';
import UIController from 'components/UIController';
import { rpcErrorHandler } from 'utils/form';
import passwordInvalidChars from './passwordInvalidChars';

const ChangePasswordComponent = styled.form({
  flex: 2,
  marginRight: '1em',
});

const formName = 'changePassword';

@connect(
  null,
  dispatch => ({
    getInfo: () => dispatch(getInfo()),
  })
)
@reduxForm({
  form: formName,
  initialValues: {
    password: '',
    newPassword: '',
    newPasswordRepeat: '',
  },
  validate: ({ password, newPassword, newPasswordRepeat }) => {
    const errors = {};
    if (!password) {
      errors.password = 'Password is required';
    }
    if (passwordInvalidChars.test(newPassword)) {
      errors.newPassword =
        'Password cannot contain these characters: - $ / & * | < >';
    } else if (!newPassword || newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters';
    } else if (newPassword !== newPassword.trim()) {
      errors.newPassword = 'Password cannot start or end with spaces';
    }
    if (newPasswordRepeat !== newPassword) {
      errors.newPasswordRepeat = 'Passwords do not match';
    }
    return errors;
  },
  onSubmit: ({ password, newPassword }) =>
    RPC.PROMISE('walletpassphrasechange', [password, newPassword]),
  onSubmitSuccess: (result, dispatch) => {
    UIController.openSuccessDialog({
      message: <Text id="Alert.PasswordHasBeenChanged" />,
    });
    dispatch(reset(formName));
  },
  onSubmitFail: rpcErrorHandler('Error changing password'),
})
export default class ChangePassword extends Component {
  confirmLockWallet = () => {
    UIController.openConfirmDialog({
      question: 'Are you sure you want to lock your wallet?',
      yesCallback: async () => {
        try {
          await RPC.PROMISE('walletlock', []);
          this.props.getInfo();
        } catch (err) {
          const note = (err & err.error && err.error.message) || err;
          UIController.openErrorDialog({
            message: 'Error locking wallet',
            note,
          });
        }
      },
    });
  };

  render() {
    const { handleSubmit, submitting } = this.props;
    return (
      <ChangePasswordComponent onSubmit={handleSubmit}>
        <FieldSet legend={<Text id="Settings.ChangePassword" />}>
          <Text id="Settings.Password">
            {p => (
              <FormField
                connectLabel
                label={<Text id="Settings.PreviousPassword" />}
              >
                <Field
                  component={TextField.RF}
                  name="password"
                  type="password"
                  placeholder={p}
                />
              </FormField>
            )}
          </Text>
          <Text id="Settings.NewPassword">
            {np => (
              <FormField
                connectLabel
                label={<Text id="Settings.NewPassword" />}
              >
                <Field
                  component={TextField.RF}
                  name="newPassword"
                  type="password"
                  placeholder={np}
                />
              </FormField>
            )}
          </Text>
          <FormField
            connectLabel
            label={<Text id="Settings.ReEnterPassword" />}
          >
            <Field
              component={TextField.RF}
              name="newPasswordRepeat"
              type="password"
              placeholder="Confirm your password"
            />
          </FormField>

          <Button
            type="submit"
            skin="primary"
            wide
            disabled={submitting}
            style={{ marginTop: '2em' }}
          >
            <Text id="Settings.ChangePassword" />
          </Button>
        </FieldSet>

        <Button wide onClick={this.confirmLockWallet}>
          <Text id="Settings.LockWallet" />
        </Button>
      </ChangePasswordComponent>
    );
  }
}
