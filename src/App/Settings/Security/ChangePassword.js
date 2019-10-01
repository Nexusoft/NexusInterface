// External
import React, { Component } from 'react';
import { reduxForm, Field } from 'redux-form';
import styled from '@emotion/styled';

// Internal
import rpc from 'lib/rpc';
import { autoFetchCoreInfo } from 'lib/coreInfo';
import FormField from 'components/FormField';
import TextField from 'components/TextField';
import Button from 'components/Button';
import FieldSet from 'components/FieldSet';
import {
  openConfirmDialog,
  openErrorDialog,
  openSuccessDialog,
} from 'lib/overlays';
import { errorHandler } from 'utils/form';
import passwordInvalidChars from './passwordInvalidChars';

const ChangePasswordComponent = styled.form({
  flex: 2,
  marginRight: '1em',
});

/**
 * Change Password Form
 *
 * @class ChangePassword
 * @extends {Component}
 */
@reduxForm({
  form: 'changePassword',
  destroyOnUnmount: false,
  initialValues: {
    password: '',
    newPassword: '',
    newPasswordRepeat: '',
  },
  validate: ({ password, newPassword, newPasswordRepeat }) => {
    const errors = {};
    if (!password) {
      errors.password = __('Password is required');
    }
    if (passwordInvalidChars.test(newPassword)) {
      errors.newPassword =
        __('Password cannot contain these characters:') + ' - $ / & * | < >';
    } else if (!newPassword || newPassword.length < 8) {
      errors.newPassword = __('Password must be at least 8 characters');
    } else if (newPassword !== newPassword.trim()) {
      errors.newPassword = __('Password cannot start or end with spaces');
    }
    if (newPasswordRepeat !== newPassword) {
      errors.newPasswordRepeat = __('Passwords do not match');
    }
    return errors;
  },
  onSubmit: ({ password, newPassword }) =>
    rpc('walletpassphrasechange', [password, newPassword]),
  onSubmitSuccess: (result, dispatch, props) => {
    props.reset();
    openSuccessDialog({
      message: __('Password has been changed.'),
    });
  },
  onSubmitFail: errorHandler(__('Error changing password')),
})
class ChangePassword extends Component {
  /**
   * Confirm Logout
   *
   * @memberof ChangePassword
   */
  confirmLogout = () => {
    openConfirmDialog({
      question: __('Are you sure you want to log out?'),
      callbackYes: async () => {
        try {
          await rpc('walletlock', []);
          autoFetchCoreInfo();
        } catch (err) {
          const note = (err & err.error && err.error.message) || err;
          openErrorDialog({
            message: __('Error logging out'),
            note,
          });
        }
      },
    });
  };

  /**
   * Component's Renderable JSX
   *
   * @returns
   * @memberof ChangePassword
   */
  render() {
    const { handleSubmit, submitting } = this.props;
    return (
      <ChangePasswordComponent onSubmit={handleSubmit}>
        <FieldSet legend={__('Change password')}>
          <FormField connectLabel label={__('Previous password')}>
            <Field
              component={TextField.RF}
              name="password"
              type="password"
              placeholder={__('Password')}
            />
          </FormField>
          <FormField connectLabel label={__('New password')}>
            <Field
              component={TextField.RF}
              name="newPassword"
              type="password"
              placeholder={__('New password')}
            />
          </FormField>
          <FormField connectLabel label={__('Re-enter password:')}>
            <Field
              component={TextField.RF}
              name="newPasswordRepeat"
              type="password"
              placeholder={__('Confirm password')}
            />
          </FormField>

          <Button
            type="submit"
            skin="primary"
            wide
            disabled={submitting}
            style={{ marginTop: '2em' }}
          >
            {__('Change password')}
          </Button>
        </FieldSet>

        <Button wide onClick={this.confirmLogout}>
          {__('Log out')}
        </Button>
      </ChangePasswordComponent>
    );
  }
}
export default ChangePassword;
