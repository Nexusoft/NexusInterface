import React, { Component } from 'react';
import { reduxForm, Field } from 'redux-form';
import styled from '@emotion/styled';
import { connect } from 'react-redux';

import Modal from 'components/Modal';
import FormField from 'components/FormField';
import TextFieldWithKeyboard from 'components/TextFieldWithKeyboard';
import Button from 'components/Button';
import NewUserModal from 'components/NewUserModal';
import RecoverPasswordPinModal from 'components/RecoverPasswordPinModal';
import Spinner from 'components/Spinner';
import { showNotification, openModal, removeModal } from 'lib/ui';
import { login, unlockUser } from 'lib/user';
import { errorHandler } from 'utils/form';

__ = __context('Login');

const Buttons = styled.div({
  marginTop: '2em',
});

const ExtraSection = styled.div({
  marginTop: '2em',
  display: 'flex',
  justifyContent: 'space-between',
  opacity: 0.9,
});

/**
 * Login Form
 *
 * @class Login
 * @extends {Component}
 */
@connect(({ core: { systemInfo } }) => ({
  syncing: systemInfo.synchronizing,
}))
@reduxForm({
  form: 'login_tritium',
  destroyOnUnmount: true,
  initialValues: {
    username: '',
    password: '',
    pin: '',
  },
  validate: ({ username, password, pin }, props) => {
    const errors = {};
    if (!username) {
      errors.username = __('Username is required');
    }

    if (!password) {
      errors.password = __('Password is required');
    }

    if (!pin) {
      errors.pin = __('PIN is required');
    }

    return errors;
  },
  onSubmit: ({ username, password, pin }) => login({ username, password, pin }),
  onSubmitSuccess: async (result, dispatch, { modalId, reset, values }) => {
    removeModal(modalId);
    reset();
    showNotification(
      __('Logged in as %{username}', { username: values.username }),
      'success'
    );
    unlockUser({ pin: values.pin });
  },
  onSubmitFail: (errors, dispatch, submitError, props) => {
    const error =
      props.syncing && submitError && submitError.code === -139
        ? {
            ...submitError,
            message:
              submitError.message +
              '. ' +
              __('Not being fully synced may have caused this error.'),
          }
        : submitError;
    errorHandler(__('Error logging in'))(errors, dispatch, error);
  },
})
class Login extends Component {
  /**
   * Component's Renderable JSX
   *
   * @returns
   * @memberof Login
   */
  render() {
    const { handleSubmit, submitting } = this.props;

    return (
      <Modal
        maxWidth={500}
        assignClose={(closeModal) => (this.closeModal = closeModal)}
      >
        <Modal.Header>{__('Log in')}</Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit}>
            <FormField
              connectLabel
              label={__('Username')}
              style={{ marginTop: 0 }}
            >
              <Field
                component={TextFieldWithKeyboard.RF}
                name="username"
                placeholder={__('Enter your username')}
                autoFocus
              />
            </FormField>

            <FormField connectLabel label={__('Password')}>
              <Field
                maskable
                component={TextFieldWithKeyboard.RF}
                name="password"
                placeholder={__('Enter your password')}
              />
            </FormField>

            <FormField connectLabel label={__('PIN')}>
              <Field
                maskable
                component={TextFieldWithKeyboard.RF}
                name="pin"
                placeholder={__('Enter your PIN')}
              />
            </FormField>

            <Buttons>
              <Button
                type="submit"
                wide
                uppercase
                skin="primary"
                disabled={submitting}
              >
                {submitting ? (
                  <span>
                    <Spinner className="space-right" />
                    <span className="v-align">{__('Logging in')}...</span>
                  </span>
                ) : (
                  __('Log in')
                )}
              </Button>
            </Buttons>

            <ExtraSection>
              <Button
                skin="hyperlink"
                onClick={() => {
                  this.closeModal();
                  openModal(RecoverPasswordPinModal);
                }}
              >
                {__('Forgot password?')}
              </Button>
              <Button
                skin="hyperlink"
                onClick={() => {
                  this.closeModal();
                  openModal(NewUserModal);
                }}
              >
                {__('Create new user')}
              </Button>
            </ExtraSection>
          </form>
        </Modal.Body>
      </Modal>
    );
  }
}

export default Login;
