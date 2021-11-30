// External
import styled from '@emotion/styled';

// Internal
import rpc from 'lib/rpc';
import { refreshCoreInfo } from 'lib/coreInfo';
import { formSubmit, required, checkAll, regex } from 'lib/form';
import Form from 'components/Form';
import FormField from 'components/FormField';
import Button from 'components/Button';
import FieldSet from 'components/FieldSet';
import { openErrorDialog, openSuccessDialog, confirm } from 'lib/dialog';
import {
  passwordRegex,
  passwordMinLength,
  passwordNoSpaces,
  passwordsMatch,
} from './common';

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
