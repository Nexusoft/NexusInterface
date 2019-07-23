// External
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { reduxForm, Field } from 'redux-form';
import styled from '@emotion/styled';

// Internal
import rpc from 'lib/rpc';
import { getInfo } from 'actions/core';
import FormField from 'components/FormField';
import TextField from 'components/TextField';
import Button from 'components/Button';
import FieldSet from 'components/FieldSet';
import {
  openConfirmDialog,
  openErrorDialog,
  openSuccessDialog,
} from 'actions/overlays';
import { rpcErrorHandler } from 'utils/form';
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
@connect(
  null,
  {
    getInfo,
    openConfirmDialog,
    openErrorDialog,
    openSuccessDialog,
  }
)
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
      errors.password = _('Password is required');
    }
    if (passwordInvalidChars.test(newPassword)) {
      errors.newPassword = _(
        'Password cannot contain these characters: - $ / & * | < >'
      );
    } else if (!newPassword || newPassword.length < 8) {
      errors.newPassword = _('Password must be at least 8 characters');
    } else if (newPassword !== newPassword.trim()) {
      errors.newPassword = _('Password cannot start or end with spaces');
    }
    if (newPasswordRepeat !== newPassword) {
      errors.newPasswordRepeat = _('Passwords do not match');
    }
    return errors;
  },
  onSubmit: ({ password, newPassword }) =>
    rpc('walletpassphrasechange', [password, newPassword]),
  onSubmitSuccess: (result, dispatch, props) => {
    props.reset();
    props.openSuccessDialog({
      message: _('Password has been changed.'),
    });
  },
  onSubmitFail: rpcErrorHandler(_('Error changing password')),
})
class ChangePassword extends Component {
  /**
   * Confirm Logout
   *
   * @memberof ChangePassword
   */
  confirmLogout = () => {
    this.props.openConfirmDialog({
      question: _('Are you sure you want to log out?'),
      callbackYes: async () => {
        try {
          await rpc('walletlock', []);
          this.props.getInfo();
        } catch (err) {
          const note = (err & err.error && err.error.message) || err;
          this.props.openErrorDialog({
            message: _('Error logging out'),
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
        <FieldSet legend={_('Change password')}>
          <FormField connectLabel label={_('Previous password')}>
            <Field
              component={TextField.RF}
              name="password"
              type="password"
              placeholder={_('Password')}
            />
          </FormField>
          <FormField connectLabel label={_('New password')}>
            <Field
              component={TextField.RF}
              name="newPassword"
              type="password"
              placeholder={_('New password')}
            />
          </FormField>
          <FormField connectLabel label={_('Re-enter password:')}>
            <Field
              component={TextField.RF}
              name="newPasswordRepeat"
              type="password"
              placeholder={_('Confirm password')}
            />
          </FormField>

          <Button
            type="submit"
            skin="primary"
            wide
            disabled={submitting}
            style={{ marginTop: '2em' }}
          >
            {_('Change password')}
          </Button>
        </FieldSet>

        <Button wide onClick={this.confirmLogout}>
          {_('Log out')}
        </Button>
      </ChangePasswordComponent>
    );
  }
}
export default ChangePassword;
