// External
import { Component } from 'react';
import { reduxForm, Field } from 'redux-form';
import styled from '@emotion/styled';

// Internal
import rpc from 'lib/rpc';
import { refreshCoreInfo } from 'lib/coreInfo';
import { formSubmit, required, checkAll, regex } from 'lib/form';
import { confirm } from 'lib/dialog';
import Form from 'components/Form';
import FormField from 'components/FormField';
import TextField from 'components/TextField';
import Button from 'components/Button';
import FieldSet from 'components/FieldSet';
import {
  openConfirmDialog,
  openErrorDialog,
  openSuccessDialog,
} from 'lib/dialog';
import { errorHandler } from 'utils/form';
import passwordRegex from './passwordRegex';

__ = __context('Settings.Security');

const ChangePasswordComponent = styled.div({
  flex: 2,
  marginRight: '1em',
});

const initialValues = {
  password: '',
  newPassword: '',
  newPasswordRepeat: '',
};

const passwordMinLength = (value) =>
  value?.length < 8 ? __('Password must be at least 8 characters') : undefined;

const passwordNoSpaces = (value) =>
  value !== value.trim()
    ? __('Password cannot start or end with spaces')
    : undefined;

const passwordsMatch = (newPassword, { password }) =>
  newPassword !== password ? __('Passwords do not match') : undefined;

export default function ChangePassword() {
  const confirmLogout = async () => {
    const confirmed = await confirm({
      question: __('Are you sure you want to log out?'),
    });
    if (!confirmed) return;

    try {
      await rpc('walletlock', []);
      refreshCoreInfo();
    } catch (err) {
      openErrorDialog({
        message: __('Error logging out'),
        note: err?.error?.message || err,
      });
    }
  };

  return (
    <Form
      name="changePassword"
      persistState
      initialValues={initialValues}
      // validate: ({ password, newPassword, newPasswordRepeat }) => {
      //   const errors = {};
      //   if (!password) {
      //     errors.password = __('Password is required');
      //   }
      //   if (passwordInvalidChars.test(newPassword)) {
      //     errors.newPassword =
      //       __('Password cannot contain these characters:') + ' - $ / & * | < >';
      //   } else if (!newPassword || newPassword.length < 8) {
      //     errors.newPassword = __('Password must be at least 8 characters');
      //   } else if (newPassword !== newPassword.trim()) {
      //     errors.newPassword = __('Password cannot start or end with spaces');
      //   }
      //   if (newPasswordRepeat !== newPassword) {
      //     errors.newPasswordRepeat = __('Passwords do not match');
      //   }
      //   return errors;
      // },
      onSubmit={formSubmit({
        submit: ({ password, newPassword }) =>
          rpc('walletpassphrasechange', [password, newPassword]),
        onSuccess: (result, values, form) => {
          form.restart();
          openSuccessDialog({
            message: __('Password has been changed.'),
          });
        },
        errorMessage: __('Error changing password'),
      })}
    >
      <ChangePasswordComponent>
        <FieldSet legend={__('Change password')}>
          <FormField connectLabel label={__('Previous password')}>
            <Form.TextField
              name="password"
              type="password"
              placeholder={__('Password')}
              validate={required()}
            />
          </FormField>
          <FormField connectLabel label={__('New password')}>
            <Form.TextField
              name="newPassword"
              type="password"
              placeholder={__('New password')}
              validate={checkAll(
                regex(
                  passwordRegex,
                  __('Password cannot contain these characters:') +
                    ' - $ / & * | < >'
                ),
                passwordMinLength,
                passwordNoSpaces
              )}
            />
          </FormField>
          <FormField connectLabel label={__('Re-enter password:')}>
            <Form.TextField
              name="newPasswordRepeat"
              type="password"
              placeholder={__('Confirm password')}
              validate={passwordsMatch}
            />
          </FormField>

          <Form.SubmitButton skin="primary" wide style={{ marginTop: '2em' }}>
            {__('Change password')}
          </Form.SubmitButton>
        </FieldSet>

        <Button wide onClick={confirmLogout}>
          {__('Log out')}
        </Button>
      </ChangePasswordComponent>
    </Form>
  );
}
